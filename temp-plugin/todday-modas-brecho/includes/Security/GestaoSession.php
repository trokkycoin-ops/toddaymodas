<?php
namespace ToddayModasBrecho\Security;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Sessão autônoma do Painel de Gestão.
 *
 * Permite ao dono da loja acessar o painel com apenas uma senha,
 * SEM precisar estar logado no WordPress. O acesso é protegido por:
 *  - cookie HttpOnly assinado com HMAC (wp_salt 'auth');
 *  - senha armazenada com hash (wp_hash_password);
 *  - limite de tentativas por IP contra força bruta.
 */
class GestaoSession {
    public const COOKIE = 'tdm_gestao';
    public const COOKIE_TTL = 7 * DAY_IN_SECONDS;
    public const OPTION_HASH = 'todday_gestao_password_hash';
    public const OPTION_OWNER_CHANGED = 'todday_gestao_password_owner_changed';
    public const TRANSIENT_PLAIN = 'tdm_gestao_pw_once';
    public const MAX_ATTEMPTS = 5;
    public const BLOCK_SECONDS = 15 * MINUTE_IN_SECONDS;

    public static function has_password(): bool {
        return !empty(get_option(self::OPTION_HASH, ''));
    }

    public static function is_owner_changed(): bool {
        return (bool) get_option(self::OPTION_OWNER_CHANGED, false);
    }

    /**
     * Gera uma senha forte automaticamente (primeira visita / regeneração).
     * Retorna o texto puro apenas para exibição imediata.
     */
    public static function generate(): string {
        $plain = wp_generate_password(16, true, true);
        update_option(self::OPTION_HASH, wp_hash_password($plain));
        update_option(self::OPTION_OWNER_CHANGED, false);
        set_transient(self::TRANSIENT_PLAIN, $plain, self::COOKIE_TTL);
        return $plain;
    }

    public static function ensure_password(): string {
        if (!self::has_password()) {
            return self::generate();
        }
        return (string) (self::get_auto_password() ?? '');
    }

    /** Senha automática ainda exibível (antes do dono definir a própria). */
    public static function get_auto_password(): ?string {
        if (self::is_owner_changed()) {
            return null;
        }
        $plain = get_transient(self::TRANSIENT_PLAIN);
        if (is_string($plain) && $plain !== '' && self::has_password()) {
            return $plain;
        }
        return null;
    }

    public static function change_password(string $plain): bool {
        $plain = trim($plain);
        if (strlen($plain) < 8) {
            return false;
        }
        update_option(self::OPTION_HASH, wp_hash_password($plain));
        update_option(self::OPTION_OWNER_CHANGED, true);
        delete_transient(self::TRANSIENT_PLAIN);
        return true;
    }

    public static function is_blocked(): bool {
        $key = self::rate_limit_key();
        return (int) get_transient($key) >= self::MAX_ATTEMPTS;
    }

    public static function login(string $senha): bool {
        if ($senha === '' || !self::has_password()) {
            return false;
        }
        if (self::is_blocked()) {
            return false;
        }
        if (!wp_check_password($senha, (string) get_option(self::OPTION_HASH, ''))) {
            set_transient(self::rate_limit_key(), (int) get_transient(self::rate_limit_key()) + 1, self::BLOCK_SECONDS);
            return false;
        }
        delete_transient(self::rate_limit_key());
        // A senha gerada automaticamente só é exibida até o primeiro acesso com sucesso.
        if (!self::is_owner_changed()) {
            delete_transient(self::TRANSIENT_PLAIN);
        }
        self::issue_cookie();
        return true;
    }

    public static function is_valid(): bool {
        if (!self::has_password()) {
            return false;
        }
        $raw = isset($_COOKIE[self::COOKIE]) ? (string) $_COOKIE[self::COOKIE] : '';
        if ($raw === '') {
            return false;
        }
        $decoded = base64_decode($raw, true);
        if (!$decoded || !str_contains($decoded, '|')) {
            return false;
        }
        [$exp, $sig] = explode('|', $decoded, 2);
        if (!is_numeric($exp) || (int) $exp < time()) {
            return false;
        }
        $expected = hash_hmac('sha256', (string) $exp, wp_salt('auth'));
        return hash_equals($expected, $sig);
    }

    public static function logout(): void {
        self::set_cookie('', time() - 3600);
    }

    private static function issue_cookie(): void {
        $exp = time() + self::COOKIE_TTL;
        $token = base64_encode($exp . '|' . hash_hmac('sha256', (string) $exp, wp_salt('auth')));
        self::set_cookie($token, $exp);
    }

    private static function set_cookie(string $value, int $expires): void {
        $secure = is_ssl();
        $options = [
            'expires' => $expires,
            'path' => defined('COOKIEPATH') ? COOKIEPATH : '/',
            'domain' => defined('COOKIE_DOMAIN') ? COOKIE_DOMAIN : '',
            'secure' => $secure,
            'httponly' => true,
            'samesite' => 'Lax',
        ];
        setcookie(self::COOKIE, $value, $options);
    }

    private static function rate_limit_key(): string {
        $ip = sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'));
        return 'tdm_gestao_rl_' . md5($ip);
    }
}