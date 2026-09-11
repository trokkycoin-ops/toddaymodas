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

        $settings = get_option('todday_settings_mercadopago', []);
        $webhook_secret = $settings['webhook_secret'] ?? '';

        // Se houver chave secreta de webhook configurada, valida a assinatura HMAC
        if (!empty($webhook_secret) && !empty($signature)) {
            $valid = Security::verify_mp_webhook_signature($signature, $body, $webhook_secret);
            if (!$valid) {
                ActivityLogRepository::log('webhook_mp_invalid_signature', 'webhook', '', ['ip' => $_SERVER['REMOTE_ADDR'] ?? '']);
                return new WP_REST_Response(['success' => false, 'message' => 'Assinatura inválida.'], 403);
            }
        }

        $params = $request->get_json_params() ?: $request->get_params();
        $type = $params['type'] ?? $params['topic'] ?? '';
        $resource_id = $params['data']['id'] ?? $params['id'] ?? '';

        if ($type === 'payment' && !empty($resource_id)) {
            $processed = MercadoPago::process_webhook_notification('payment', (string) $resource_id);
            return new WP_REST_Response(['success' => $processed]);
        }

        return new WP_REST_Response(['success' => true, 'message' => 'Notificação recebida com sucesso.']);
    }

    public static function handle_melhorenvio(WP_REST_Request $request): WP_REST_Response {
        $settings = get_option('todday_settings_melhorenvio', []);
        $webhook_secret = $settings['webhook_secret'] ?? '';

        // Sem secret configurado, o webhook NÃO processa (fail-closed).
        if (empty($webhook_secret)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Webhook não configurado.'], 403);
        }

        // Valida assinatura HMAC-SHA256 do corpo com o secret.
        $signature = $request->get_header('x-todday-signature') ?? $request->get_header('x-signature') ?? '';
        if (empty($signature)) {
            ActivityLogRepository::log('me_webhook_missing_signature', 'webhook', '', ['ip' => $_SERVER['REMOTE_ADDR'] ?? '']);
            return new WP_REST_Response(['success' => false, 'message' => 'Assinatura ausente.'], 403);
        }

        $computed = hash_hmac('sha256', $request->get_body(), $webhook_secret);
        if (!hash_equals($computed, $signature)) {
            ActivityLogRepository::log('me_webhook_invalid_signature', 'webhook', '', ['ip' => $_SERVER['REMOTE_ADDR'] ?? '']);
            return new WP_REST_Response(['success' => false, 'message' => 'Assinatura inválida.'], 403);
        }

        $params = $request->get_json_params() ?: $request->get_params();
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
