<?php
namespace ToddayModasBrecho\Integrations;

if (!defined('ABSPATH')) {
    exit;
}

use ToddayModasBrecho\Security\Security;

class MelhorEnvio {
    public static function test_connection(string $api_token = '', string $environment = 'sandbox'): array {
        if ($api_token === '') {
            $settings = get_option('todday_settings_melhorenvio', []);
            $api_token = Security::decrypt_secret($settings['api_token'] ?? '');
            $environment = $settings['environment'] ?? $environment;
        }

        if ($api_token === '') {
            return ['success' => false, 'message' => 'Informe o token do Melhor Envio.'];
        }

        $endpoint = $environment === 'production'
            ? 'https://melhorenvio.com.br/api/v2/me'
            : 'https://sandbox.melhorenvio.com.br/api/v2/me';
        $response = wp_remote_get($endpoint, [
            'timeout' => 10,
            'headers' => [
                'Accept' => 'application/json',
                'Authorization' => 'Bearer ' . $api_token,
                'User-Agent' => 'ToddayModasBrecho/' . TODDAY_MODAS_VERSION . ' (contato@tselak.com.br)',
            ],
        ]);

        if (is_wp_error($response)) {
            return ['success' => false, 'message' => 'Não foi possível conectar ao Melhor Envio: ' . $response->get_error_message()];
        }

        $status_code = wp_remote_retrieve_response_code($response);
        $data = json_decode(wp_remote_retrieve_body($response), true);
        if ($status_code >= 400 || !is_array($data)) {
            return ['success' => false, 'message' => $data['message'] ?? 'Token do Melhor Envio inválido ou recusado.'];
        }

        return [
            'success' => true,
            'message' => 'Melhor Envio conectado com sucesso.',
            'data' => ['name' => sanitize_text_field($data['name'] ?? $data['user']['name'] ?? '')],
        ];
    }

    public static function calculate_shipping(string $destination_cep, array $items = []): array {
        $settings = get_option('todday_settings_melhorenvio', []);
        $enabled = ($settings['enabled'] ?? 'no') === 'yes';
        $token = Security::decrypt_secret($settings['api_token'] ?? '');
        $env = $settings['environment'] ?? 'sandbox';
        $sender_cep = preg_replace('/\D/', '', $settings['sender_cep'] ?? '01001000');
        $clean_dest_cep = preg_replace('/\D/', '', $destination_cep);

        if (empty($clean_dest_cep) || strlen($clean_dest_cep) !== 8) {
            return [
                'success' => false,
                'message' => 'CEP de destino inválido.',
                'quotes' => self::get_fallback_quotes($settings),
            ];
        }

        // Se Melhor Envio não estiver ativo ou sem token, usa fallback gracioso imediatamente
        if (!$enabled || empty($token)) {
            return [
                'success' => true,
                'provider' => 'fallback_woocommerce',
                'quotes' => self::get_fallback_quotes($settings),
            ];
        }

        $endpoint = $env === 'production'
            ? 'https://melhorenvio.com.br/api/v2/me/shipment/calculate'
            : 'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate';

        // Prepara pacotes padrão para peças de brechó
        $payload = [
            'from' => ['postal_code' => $sender_cep],
            'to' => ['postal_code' => $clean_dest_cep],
            'package' => [
                'height' => 10,
                'width' => 20,
                'length' => 25,
                'weight' => 0.6,
            ],
            'options' => [
                'receipt' => false,
                'own_hand' => false,
            ],
        ];

        $response = wp_remote_post($endpoint, [
            'timeout' => 8,
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $token,
                'User-Agent' => 'ToddayModasBrecho/' . TODDAY_MODAS_VERSION . ' (contato@tselak.com.br)',
            ],
            'body' => wp_json_encode($payload),
        ]);

        if (is_wp_error($response)) {
            return [
                'success' => true,
                'provider' => 'fallback_woocommerce',
                'message' => 'Melhor Envio offline, utilizando contingência local.',
                'quotes' => self::get_fallback_quotes($settings),
            ];
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (!is_array($data) || empty($data)) {
            return [
                'success' => true,
                'provider' => 'fallback_woocommerce',
                'quotes' => self::get_fallback_quotes($settings),
            ];
        }

        $quotes = [];
        foreach ($data as $service) {
            if (isset($service['error']) && !empty($service['error'])) {
                continue;
            }
            if (isset($service['price'])) {
                $quotes[] = [
                    'id' => $service['id'] ?? 'me_' . sanitize_title($service['name'] ?? 'envio'),
                    'name' => $service['name'] ?? 'Entrega',
                    'company' => $service['company']['name'] ?? 'Transportadora',
                    'price' => (float) $service['price'],
                    'delivery_time' => (int) ($service['delivery_time'] ?? 3),
                    'currency' => 'BRL',
                ];
            }
        }

        if (empty($quotes)) {
            $quotes = self::get_fallback_quotes($settings);
        }

        return [
            'success' => true,
            'provider' => 'melhorenvio',
            'quotes' => $quotes,
        ];
    }

    private static function get_fallback_quotes(array $settings): array {
        $flat_rate = (float) ($settings['fallback_flat_rate'] ?? 22.00);

        return [
            [
                'id' => 'correios_pac',
                'name' => 'Correios PAC (Econômico)',
                'company' => 'Correios',
                'price' => $flat_rate,
                'delivery_time' => 6,
                'currency' => 'BRL',
            ],
            [
                'id' => 'correios_sedex',
                'name' => 'Correios SEDEX (Expresso)',
                'company' => 'Correios',
                'price' => round($flat_rate * 1.6, 2),
                'delivery_time' => 2,
                'currency' => 'BRL',
            ],
            [
                'id' => 'retirada_loja',
                'name' => 'Retirar no Brechó Todday Modas',
                'company' => 'Loja Física',
                'price' => 0.00,
                'delivery_time' => 1,
                'currency' => 'BRL',
            ]
        ];
    }
}
