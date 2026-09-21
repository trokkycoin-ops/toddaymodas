<?php
namespace ToddayModasBrecho\Security;

if (!defined('ABSPATH')) {
    exit;
}

class Security {
    public static function verify_rest_nonce(\WP_REST_Request $request): bool {
        $nonce = $request->get_header('x-wp-nonce');
        if (is_string($nonce) && $nonce !== '' && (bool) wp_verify_nonce($nonce, 'wp_rest')) {
            return true;
        }

        $panel_nonce = $request->get_header('x-tdm-panel-nonce');
        return GestaoSession::is_valid()
            && is_string($panel_nonce)
            && hash_equals(hash_hmac('sha256', 'tdm_panel_rest', wp_salt('auth')), $panel_nonce);
    }

    public static function encrypt_secret(string $plain_text): string {
        if (empty($plain_text)) {
            return '';
        }
        $key = substr(hash('sha256', wp_salt('auth')), 0, 32);
        $iv = openssl_random_pseudo_bytes(16);
        $cipher = openssl_encrypt($plain_text, 'AES-256-CBC', $key, 0, $iv);
        return base64_encode($iv . '::' . $cipher);
    }

    public static function decrypt_secret(string $encrypted): string {
        if (empty($encrypted)) {
            return '';
        }
        $decoded = base64_decode($encrypted, true);
        if (!$decoded || !str_contains($decoded, '::')) {
            return $encrypted; // fallback para textos antigos não criptografados
        }
        [$iv, $cipher] = explode('::', $decoded, 2);
        $key = substr(hash('sha256', wp_salt('auth')), 0, 32);
        $decrypted = openssl_decrypt($cipher, 'AES-256-CBC', $key, 0, $iv);
        return $decrypted !== false ? $decrypted : '';
    }

    public static function sanitize_deep($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitize_deep'], $data);
        }
        return is_string($data) ? sanitize_text_field($data) : $data;
    }

    public static function verify_mp_webhook_signature(string $signature_header, string $resource_id, string $request_id, string $secret_key): bool {
        if (empty($signature_header) || empty($secret_key)) {
            return false;
        }

        // Mercado Pago formato ts=...,v1=...
        $parts = explode(',', $signature_header);
        $ts = '';
        $v1 = '';
        foreach ($parts as $part) {
            $item = explode('=', trim($part), 2);
            if (count($item) === 2) {
                if ($item[0] === 'ts') {
                    $ts = $item[1];
                } elseif ($item[0] === 'v1') {
                    $v1 = $item[1];
                }
            }
        }

        if (empty($ts) || empty($v1)) {
            return false;
        }

        // Manifesto conforme documentação oficial do Mercado Pago:
        // "id:;<resource_id>;request-id:<request_id>;ts:<ts>;"
        $manifest = sprintf('id:%s;request-id:%s;ts:%s;', $resource_id, $request_id, $ts);
        $computed = hash_hmac('sha256', $manifest, $secret_key);
        return hash_equals($computed, $v1);
    }
}
