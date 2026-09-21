<?php
namespace ToddayModasBrecho\Api;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Request;
use WP_REST_Response;
use ToddayModasBrecho\Integrations\MercadoPago;
use ToddayModasBrecho\Security\Security;
use ToddayModasBrecho\Database\ActivityLogRepository;

class WebhooksController {
    public static function register_routes(): void {
        register_rest_route(RestController::NAMESPACE, '/webhooks/mp', [
            'methods' => 'POST',
            'callback' => [self::class, 'handle_mercadopago'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route(RestController::NAMESPACE, '/webhooks/me', [
            'methods' => 'POST',
            'callback' => [self::class, 'handle_melhorenvio'],
            'permission_callback' => '__return_true',
        ]);
    }

    public static function handle_mercadopago(WP_REST_Request $request): WP_REST_Response {
        $body = $request->get_body();
        $signature = $request->get_header('x-signature') ?? '';
        $request_id = $request->get_header('x-request-id') ?? '';

        $params = $request->get_json_params() ?: [];
        $resource_id = (string) ($params['data']['id'] ?? $params['id'] ?? '');
        $type = (string) ($params['type'] ?? $params['topic'] ?? '');

        $settings = get_option('todday_settings_mercadopago', []);
        $stored_secret = $settings['webhook_secret'] ?? '';
        $webhook_secret = Security::decrypt_secret($stored_secret);

        // Se houver chave secreta de webhook configurada, a assinatura é OBRIGATÓRIA.
        if (!empty($webhook_secret)) {
            $valid = Security::verify_mp_webhook_signature($signature, $resource_id, $request_id, $webhook_secret);
            if (!$valid) {
                ActivityLogRepository::log('webhook_mp_invalid_signature', 'webhook', '', [
                    'ip' => sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'] ?? '')),
                    'type' => $type,
                ]);
                return new WP_REST_Response(['success' => false, 'message' => 'Assinatura inválida.'], 403);
            }
        } else {
            ActivityLogRepository::log('webhook_mp_missing_secret', 'webhook', '', [
                'ip' => sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'] ?? '')),
            ]);
            return new WP_REST_Response(['success' => false, 'message' => 'Webhook não configurado.'], 503);
        }

        if ($type === 'payment' && !empty($resource_id)) {
            $processed = MercadoPago::process_webhook_notification('payment', (string) $resource_id);
            return new WP_REST_Response(['success' => $processed]);
        }

        return new WP_REST_Response(['success' => true, 'message' => 'Notificação recebida com sucesso.']);
    }

    public static function handle_melhorenvio(WP_REST_Request $request): WP_REST_Response {
        $settings = get_option('todday_settings_melhorenvio', []);
        $expected_token = Security::decrypt_secret($settings['api_token'] ?? '');

        // Sem token configurado não há entrega via Melhor Envio para atualizar.
        if (empty($expected_token)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Webhook não habilitado.'], 403);
        }

        // Autenticação obrigatória via Bearer token da integração.
        $auth_header = $request->get_header('authorization') ?? '';
        if (preg_match('/^Bearer\s+(.+)$/i', $auth_header, $m) !== 1) {
            return new WP_REST_Response(['success' => false, 'message' => 'Autenticação ausente.'], 401);
        }
        if (!hash_equals($expected_token, $m[1])) {
            return new WP_REST_Response(['success' => false, 'message' => 'Autenticação inválida.'], 401);
        }

        $params = $request->get_json_params() ?: [];
        $tracking_code = sanitize_text_field($params['tracking_code'] ?? '');
        $status = sanitize_text_field($params['status'] ?? '');
        $order_id = (int) ($params['order_id'] ?? 0);

        if ($order_id > 0 && function_exists('wc_get_order')) {
            $order = wc_get_order($order_id);
            if ($order) {
                if (!empty($tracking_code)) {
                    $order->update_meta_data('_todday_tracking_code', $tracking_code);
                }
                if ($status === 'delivered') {
                    $order->update_status('completed', 'Entrega confirmada pela transportadora.');
                } elseif ($status === 'posted') {
                    $order->update_status('shipped', 'Objeto postado na transportadora.');
                }
                $order->save();
            }
        }

        return new WP_REST_Response(['success' => true]);
    }
}
