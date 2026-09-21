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

        $idempotency_key = sanitize_text_field($payment_data['_idempotency_key'] ?? wp_generate_uuid4());
        unset($payment_data['_idempotency_key']);
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
            ActivityLogRepository::log('mp_webhook_no_ref', 'webhook', (string) $resource_id, []);
            return false;
        }

        // O pagamento precisa ser identificável: moeda brasileira e pedido existente.
        if (isset($data['currency_id']) && $data['currency_id'] !== 'BRL') {
            ActivityLogRepository::log('mp_webhook_wrong_currency', 'webhook', (string) $resource_id, [
                'currency' => $data['currency_id'] ?? '',
            ]);
            return false;
        }

        $order_id = (int) $data['external_reference'];
        $order = function_exists('wc_get_order') ? wc_get_order($order_id) : null;

        if (!$order) {
            ActivityLogRepository::log('mp_webhook_no_order', 'webhook', (string) $resource_id, [
                'order_id' => $order_id,
            ]);
            return false;
        }

        // Idempotência: verifica se o pagamento já foi registrado
        $recorded_payment_id = $order->get_meta('_todday_mp_payment_id');
        if ($recorded_payment_id === (string) $resource_id && $order->is_paid()) {
            return true;
        }

        $status = $data['status'] ?? '';

        // Anti-fraude de valor: aprovação só vale se o valor pago bate com o total
        // do pedido (tolerância de centavos). Um pagamento de valor divergente
        // NUNCA marca um pedido como pago.
        if ($status === 'approved') {
            $paid_amount = (float) ($data['transaction_amount'] ?? $data['transaction_details']['total_paid_amount'] ?? 0);
            $order_total = (float) $order->get_total();
            if (abs($paid_amount - $order_total) > 0.02) {
                ActivityLogRepository::log('mp_webhook_amount_mismatch', 'webhook', (string) $resource_id, [
                    'order_id' => $order_id,
                    'paid' => $paid_amount,
                    'total' => $order_total,
                ]);
                return false;
            }
        }

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
