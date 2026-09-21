<?php
namespace ToddayModasBrecho\Api;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Request;
use WP_REST_Response;
use ToddayModasBrecho\Security\Security;
use ToddayModasBrecho\Database\ActivityLogRepository;

class SettingsController {
    public static function register_routes(): void {
        register_rest_route(RestController::NAMESPACE, '/settings', [
            [
                'methods' => 'GET',
                'callback' => [self::class, 'get_settings'],
                'permission_callback' => [self::class, 'check_admin_permission'],
            ],
            [
                'methods' => 'POST',
                'callback' => [self::class, 'save_settings'],
                'permission_callback' => [self::class, 'check_admin_permission'],
            ],
        ]);

        register_rest_route(RestController::NAMESPACE, '/settings/test-notification', [
            'methods' => 'POST',
            'callback' => [self::class, 'test_notification'],
            'permission_callback' => [self::class, 'check_admin_permission'],
        ]);
    }

    public static function check_admin_permission(): bool {
        return \ToddayModasBrecho\Security\CapabilityMatrix::can_manage_store();
    }

    public static function get_settings(): WP_REST_Response {
        $mp = get_option('todday_settings_mercadopago', []);
        $me = get_option('todday_settings_melhorenvio', []);
        $wa = get_option('todday_settings_whatsapp', []);

        return new WP_REST_Response([
            'success' => true,
            'data' => [
                'mercadopago' => [
                    'enabled' => $mp['enabled'] ?? 'no',
                    'environment' => $mp['environment'] ?? 'sandbox',
                    'public_key' => $mp['public_key'] ?? '',
                    'has_access_token' => !empty($mp['access_token']),
                    'webhook_secret' => !empty($mp['webhook_secret']) ? '••••••••' : '',
                ],
                'melhorenvio' => [
                    'enabled' => $me['enabled'] ?? 'no',
                    'environment' => $me['environment'] ?? 'sandbox',
                    'sender_cep' => $me['sender_cep'] ?? '01001-000',
                    'fallback_flat_rate' => $me['fallback_flat_rate'] ?? '22.00',
                    'has_token' => !empty($me['api_token']),
                ],
                'whatsapp' => [
                    'enabled' => $wa['enabled'] ?? 'yes',
                        'phone' => $wa['phone'] ?? '5535991759960',
                        'default_message' => $wa['default_message'] ?? 'Olá, Sebastiana! Gostaria de saber mais sobre as peças do Todday Modas!',
                ],
            ],
        ]);
    }

    public static function save_settings(WP_REST_Request $request): WP_REST_Response {
        $params = $request->get_json_params() ?: $request->get_params();

        if (isset($params['mercadopago'])) {
            $mp = get_option('todday_settings_mercadopago', []);
            $new_secret_raw = sanitize_text_field($params['mercadopago']['webhook_secret'] ?? $mp['webhook_secret'] ?? '');
            // O placeholder devolvido pela tela significa "não alterado": preserva o valor atual.
            if ($new_secret_raw === '••••••••' || $new_secret_raw === '') {
                $webhook_secret = $mp['webhook_secret'] ?? '';
            } else {
                $webhook_secret = Security::encrypt_secret($new_secret_raw);
            }
            $new_mp = [
                'enabled' => sanitize_text_field($params['mercadopago']['enabled'] ?? $mp['enabled'] ?? 'no'),
                'environment' => sanitize_text_field($params['mercadopago']['environment'] ?? $mp['environment'] ?? 'sandbox'),
                'public_key' => sanitize_text_field($params['mercadopago']['public_key'] ?? $mp['public_key'] ?? ''),
                'access_token' => !empty($params['mercadopago']['access_token'])
                    ? Security::encrypt_secret($params['mercadopago']['access_token'])
                    : ($mp['access_token'] ?? ''),
                'webhook_secret' => $webhook_secret,
            ];
            update_option('todday_settings_mercadopago', $new_mp);
        }

        if (isset($params['melhorenvio'])) {
            $me = get_option('todday_settings_melhorenvio', []);
            $new_me = [
                'enabled' => sanitize_text_field($params['melhorenvio']['enabled'] ?? $me['enabled'] ?? 'no'),
                'environment' => sanitize_text_field($params['melhorenvio']['environment'] ?? $me['environment'] ?? 'sandbox'),
                'sender_cep' => sanitize_text_field($params['melhorenvio']['sender_cep'] ?? $me['sender_cep'] ?? '01001-000'),
                'fallback_flat_rate' => sanitize_text_field($params['melhorenvio']['fallback_flat_rate'] ?? $me['fallback_flat_rate'] ?? '22.00'),
                'api_token' => !empty($params['melhorenvio']['api_token'])
                    ? Security::encrypt_secret($params['melhorenvio']['api_token'])
                    : ($me['api_token'] ?? ''),
            ];
            update_option('todday_settings_melhorenvio', $new_me);
        }

        if (isset($params['whatsapp'])) {
            $new_wa = [
                'enabled' => sanitize_text_field($params['whatsapp']['enabled'] ?? 'yes'),
                'phone' => sanitize_text_field($params['whatsapp']['phone'] ?? '5535991759960'),
                'default_message' => sanitize_text_field($params['whatsapp']['default_message'] ?? ''),
            ];
            update_option('todday_settings_whatsapp', $new_wa);
        }

        ActivityLogRepository::log('settings_updated', 'settings', 'all');

        return self::get_settings();
    }

    public static function test_notification(WP_REST_Request $request): WP_REST_Response {
        $email = sanitize_email($request->get_param('email') ?? get_option('admin_email'));
        $subject = 'Teste de Notificação — Todday Modas Brechó';
        $message = '<p>Este é um teste de disparo de notificação transacional do plugin Todday Modas Brechó.</p>';
        $headers = ['Content-Type: text/html; charset=UTF-8'];

        $sent = wp_mail($email, $subject, $message, $headers);

        return new WP_REST_Response([
            'success' => $sent,
            'message' => $sent ? "E-mail de teste enviado para {$email}." : "Falha ao enviar e-mail. Verifique o servidor SMTP.",
        ]);
    }
}
