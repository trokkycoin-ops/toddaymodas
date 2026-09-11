<?php
namespace ToddayModasBrecho\Api;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Request;
use WP_REST_Response;
use ToddayModasBrecho\Security\CapabilityMatrix;

class AuthController {
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
            'permission_callback' => 'is_user_logged_in',
        ]);
    }

    public static function login(WP_REST_Request $request): WP_REST_Response {
        $username = sanitize_user($request->get_param('username') ?? '');
        $password = (string) ($request->get_param('password') ?? '');

        if (empty($username) || empty($password)) {
            return new WP_REST_Response([
                'success' => false,
                'code' => 'missing_fields',
                'message' => 'Informe usuário/e-mail e senha.',
            ], 400);
        }

        $creds = [
            'user_login' => $username,
            'user_password' => $password,
            'remember' => true,
        ];

        $user = wp_signon($creds, is_ssl());

        if (is_wp_error($user)) {
            return new WP_REST_Response([
                'success' => false,
                'code' => $user->get_error_code(),
                'message' => $user->get_error_message(),
            ], 401);
        }

        wp_set_current_user($user->ID);

        return new WP_REST_Response([
            'success' => true,
            'data' => self::format_user($user),
        ]);
    }

    public static function register(WP_REST_Request $request): WP_REST_Response {
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

        retrieve_password($user_login);

        // Resposta genérica em ambos os casos para evitar enumeração de usuários.
        return new WP_REST_Response([
            'success' => true,
            'data' => ['message' => 'Se o usuário/e-mail estiver cadastrado, você receberá as instruções de redefinição.'],
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
