<?php
namespace ToddayModasBrecho\Api;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Request;
use WP_REST_Response;
use ToddayModasBrecho\Security\CapabilityMatrix;
use ToddayModasBrecho\Security\Security;

class AuthController {
    public static function can_read_current_user(WP_REST_Request $request): bool {
        return is_user_logged_in() && Security::verify_rest_nonce($request);
    }

    public static function register_routes(): void {
        register_rest_route(RestController::NAMESPACE, '/auth/login', [
            'methods' => 'POST',
            'callback' => [self::class, 'login'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route(RestController::NAMESPACE, '/auth/register', [
            'methods' => 'POST',
            'callback' => [self::class, 'register'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route(RestController::NAMESPACE, '/auth/lost-password', [
            'methods' => 'POST',
            'callback' => [self::class, 'lost_password'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route(RestController::NAMESPACE, '/auth/me', [
            'methods' => 'GET',
            'callback' => [self::class, 'me'],
            'permission_callback' => [self::class, 'can_read_current_user'],
        ]);
    }

    public static function login(WP_REST_Request $request): WP_REST_Response {
        $raw_username = sanitize_text_field($request->get_param('username') ?? '');
        $username = is_email($raw_username) ? sanitize_email($raw_username) : sanitize_user($raw_username);
        $password = (string) ($request->get_param('password') ?? '');

        if (empty($username) || empty($password)) {
            return new WP_REST_Response([
                'success' => false,
                'code' => 'missing_fields',
                'message' => 'Informe usuário/e-mail e senha.',
            ], 400);
        }

        // Rate limit de tentativas (10 falhas / 15 min por IP) contra força bruta.
        $rl_key = 'tdm_auth_rl_' . md5(sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'] ?? '0')));
        if ((int) get_transient($rl_key) >= 10) {
            return new WP_REST_Response([
                'success' => false,
                'code' => 'too_many_attempts',
                'message' => 'Muitas tentativas de login. Tente novamente em alguns minutos.',
            ], 429);
        }

        $creds = [
            'user_login' => $username,
            'user_password' => $password,
            'remember' => true,
        ];

        $user = wp_signon($creds, is_ssl());

        if (is_wp_error($user)) {
            set_transient($rl_key, (int) get_transient($rl_key) + 1, 15 * MINUTE_IN_SECONDS);
            return new WP_REST_Response([
                'success' => false,
                'code' => $user->get_error_code(),
                'message' => $user->get_error_message(),
            ], 401);
        }

        delete_transient($rl_key);
        wp_set_current_user($user->ID);

        return new WP_REST_Response([
            'success' => true,
            'data' => self::format_user($user),
        ]);
    }

    public static function register(WP_REST_Request $request): WP_REST_Response {
        // Rate limit de criação de contas (5 por hora por IP).
        $rl_key = 'tdm_reg_rl_' . md5(sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'] ?? '0')));
        if ((int) get_transient($rl_key) >= 5) {
            return new WP_REST_Response([
                'success' => false,
                'code' => 'too_many_accounts',
                'message' => 'Muitas contas criadas a partir deste endereço. Tente novamente mais tarde.',
            ], 429);
        }

        $email = sanitize_email($request->get_param('email') ?? '');
        $password = (string) ($request->get_param('password') ?? '');
        $name = sanitize_text_field($request->get_param('name') ?? '');

        if (!is_email($email) || empty($password)) {
            return new WP_REST_Response([
                'success' => false,
                'code' => 'invalid_input',
                'message' => 'Informe um e-mail válido e uma senha.',
            ], 400);
        }

        if (email_exists($email)) {
            return new WP_REST_Response([
                'success' => false,
                'code' => 'email_exists',
                'message' => 'Este e-mail já está cadastrado.',
            ], 400);
        }

        $username = sanitize_user(current(explode('@', $email)));
        $base_username = $username;
        $i = 1;
        while (username_exists($username)) {
            $username = $base_username . $i;
            $i++;
        }

        $user_id = wp_create_user($username, $password, $email);

        if (is_wp_error($user_id)) {
            return new WP_REST_Response([
                'success' => false,
                'code' => $user_id->get_error_code(),
                'message' => $user_id->get_error_message(),
            ], 500);
        }

        // Define papel como customer e salva nome
        $user = get_user_by('id', $user_id);
        $user->set_role('customer');
        if (!empty($name)) {
            wp_update_user(['ID' => $user_id, 'display_name' => $name]);
            update_user_meta($user_id, 'first_name', $name);
        }

        // Login automático da sessão
        set_transient($rl_key, (int) get_transient($rl_key) + 1, HOUR_IN_SECONDS);
        wp_set_current_user($user_id);
        wp_set_auth_cookie($user_id, true, is_ssl());

        return new WP_REST_Response([
            'success' => true,
            'data' => self::format_user($user),
        ], 201);
    }

    public static function lost_password(WP_REST_Request $request): WP_REST_Response {
        $user_login = sanitize_text_field($request->get_param('user_login') ?? '');
        if (empty($user_login)) {
            return new WP_REST_Response([
                'success' => false,
                'code' => 'empty_username',
                'message' => 'Informe seu usuário ou e-mail.',
            ], 400);
        }

        $result = retrieve_password($user_login);
        if (is_wp_error($result)) {
            return new WP_REST_Response([
                'success' => false,
                'code' => $result->get_error_code(),
                'message' => $result->get_error_message(),
            ], 400);
        }

        return new WP_REST_Response([
            'success' => true,
            'data' => ['message' => 'Instruções para redefinição enviadas ao seu e-mail.'],
        ]);
    }

    public static function me(): WP_REST_Response {
        $user = wp_get_current_user();
        return new WP_REST_Response([
            'success' => true,
            'data' => self::format_user($user),
        ]);
    }

    private static function format_user(\WP_User $user): array {
        return [
            'id' => $user->ID,
            'name' => $user->display_name,
            'email' => $user->user_email,
            'roles' => $user->roles,
            'is_admin' => current_user_can('manage_options'),
            'can_manage' => CapabilityMatrix::can_manage_store(),
            'is_vendor' => in_array('todday_vendedor', $user->roles, true),
        ];
    }
}
