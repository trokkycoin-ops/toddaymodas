<?php
namespace ToddayModasBrecho\Integrations;

if (!defined('ABSPATH')) {
    exit;
}

use ToddayModasBrecho\Security\Security;
use ToddayModasBrecho\Database\ActivityLogRepository;

class MercadoPago {
    public static function create_payment(array $payment_data): array {
        $settings = get_option('todday_settings_mercadopago', []);
        $access_token = Security::decrypt_secret($settings['access_token'] ?? '');

        if (empty($access_token)) {
            return [
                'success' => false,
                'message' => 'Credenciais do Mercado Pago não configuradas. Acesse as Configurações do Todday Modas.',
            ];
        }

        $idempotency_key = wp_generate_uuid4();
        $endpoint = 'https://api.mercadopago.com/v1/payments';

        $response = wp_remote_post($endpoint, [
            'timeout' => 15,
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $access_token,
                'X-Idempotency-Key' => $idempotency_key,
            ],
            'body' => wp_json_encode($payment_data),
        ]);

        if (is_wp_error($response)) {
            ActivityLogRepository::log('mp_payment_error', 'payment', '', [
                'error' => $response->get_error_message(),
            ]);
            return [
                'success' => false,
                'message' => 'Erro de conexão com Mercado Pago: ' . $response->get_error_message(),
            ];
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        $status_code = wp_remote_retrieve_response_code($response);

        if ($status_code >= 400 || isset($data['error'])) {
            ActivityLogRepository::log('mp_payment_rejected', 'payment', (string) ($data['id'] ?? ''), [
                'error' => $data['message'] ?? 'Erro desconhecido',
            ]);
            return [
                'success' => false,
                'message' => $data['message'] ?? 'Pagamento recusado pelo Mercado Pago.',
                'details' => $data,
            ];
        }

        ActivityLogRepository::log('mp_payment_created', 'payment', (string) ($data['id'] ?? ''), [
            'status' => $data['status'] ?? '',
            'method' => $payment_data['payment_method_id'] ?? '',
        ]);

        return [
            'success' => true,
            'payment_id' => $data['id'] ?? null,
            'status' => $data['status'] ?? '',
            'status_detail' => $data['status_detail'] ?? '',
            'point_of_interaction' => $data['point_of_interaction'] ?? null,
        ];
    }

    public static function process_webhook_notification(string $topic, string $resource_id): bool {
        if ($topic !== 'payment') {
            return false;
        }

        $settings = get_option('todday_settings_mercadopago', []);
        $access_token = Security::decrypt_secret($settings['access_token'] ?? '');

        if (empty($access_token)) {
            return false;
        }

        $endpoint = "https://api.mercadopago.com/v1/payments/{$resource_id}";
        $response = wp_remote_get($endpoint, [
            'headers' => [
                'Authorization' => 'Bearer ' . $access_token,
            ],
        ]);

        if (is_wp_error($response)) {
            return false;
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (!isset($data['external_reference'])) {
            return false;
        }

        $order_id = (int) $data['external_reference'];
        $order = function_exists('wc_get_order') ? wc_get_order($order_id) : null;

        if (!$order) {
            return false;
        }

        // Idempotência: verifica se o pagamento já foi registrado
        $recorded_payment_id = $order->get_meta('_todday_mp_payment_id');
        if ($recorded_payment_id === (string) $resource_id && $order->is_paid()) {
            return true;
        }

        $status = $data['status'] ?? '';
        $order->update_meta_data('_todday_mp_payment_id', (string) $resource_id);
        $order->update_meta_data('_todday_mp_status', $status);

        if ($status === 'approved') {
            $order->payment_complete($resource_id);
            $order->add_order_note("Pagamento aprovado via Mercado Pago (ID: {$resource_id})");
        } elseif ($status === 'rejected' || $status === 'cancelled') {
            $order->update_status('failed', "Pagamento recusado ou cancelado via Mercado Pago (ID: {$resource_id})");
        } elseif ($status === 'refunded') {
            $order->update_status('refunded', "Pagamento reembolsado via Mercado Pago (ID: {$resource_id})");
        }

        $order->save();
        return true;
    }
}
