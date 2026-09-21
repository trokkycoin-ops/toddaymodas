<?php
namespace ToddayModasBrecho\Integrations;

if (!defined('ABSPATH')) {
    exit;
}

class ViaCep {
    public static function lookup_cep(string $cep): array {
        $clean_cep = preg_replace('/\D/', '', $cep);

        if (strlen($clean_cep) !== 8) {
            return ['success' => false, 'message' => 'CEP inválido. Deve conter 8 dígitos.'];
        }

        $cache_key = 'todday_viacep_' . $clean_cep;
        $cached = get_transient($cache_key);
        if ($cached !== false) {
            return ['success' => true, 'data' => $cached];
        }

        $url = "https://viacep.com.br/ws/{$clean_cep}/json/";
        $response = wp_remote_get($url, ['timeout' => 5]);

        if (is_wp_error($response)) {
            return [
                'success' => false,
                'message' => 'Falha ao consultar CEP no ViaCEP: ' . $response->get_error_message(),
            ];
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (isset($data['erro']) && $data['erro'] === true) {
            return ['success' => false, 'message' => 'CEP não encontrado.'];
        }

        $result = [
            'cep' => $data['cep'] ?? $clean_cep,
            'street' => $data['logradouro'] ?? '',
            'neighborhood' => $data['bairro'] ?? '',
            'city' => $data['localidade'] ?? '',
            'state' => $data['uf'] ?? '',
        ];

        // Cache de 7 dias
        set_transient($cache_key, $result, 7 * DAY_IN_SECONDS);

        return ['success' => true, 'data' => $result];
    }
}
