<?php
namespace ToddayModasBrecho\Ajax;

if (!defined('ABSPATH')) {
    exit;
}

use ToddayModasBrecho\Integrations\ViaCep;
use ToddayModasBrecho\Integrations\MelhorEnvio;

class AjaxHandler {
    public static function register(): void {
        add_action('wp_ajax_tdm_lookup_cep', [self::class, 'lookup_cep']);
        add_action('wp_ajax_nopriv_tdm_lookup_cep', [self::class, 'lookup_cep']);

        add_action('wp_ajax_tdm_calculate_shipping', [self::class, 'calculate_shipping']);
        add_action('wp_ajax_nopriv_tdm_calculate_shipping', [self::class, 'calculate_shipping']);
    }

    public static function lookup_cep(): void {
        check_ajax_referer('tdm_ajax_nonce', 'nonce');

        $cep = sanitize_text_field($_POST['cep'] ?? '');
        $result = ViaCep::lookup_cep($cep);

        if ($result['success']) {
            wp_send_json_success($result['data']);
        } else {
            wp_send_json_error(['message' => $result['message']]);
        }
    }

    public static function calculate_shipping(): void {
        check_ajax_referer('tdm_ajax_nonce', 'nonce');

        $cep = sanitize_text_field($_POST['cep'] ?? '');
        $result = MelhorEnvio::calculate_shipping($cep);

        wp_send_json_success($result);
    }
}
