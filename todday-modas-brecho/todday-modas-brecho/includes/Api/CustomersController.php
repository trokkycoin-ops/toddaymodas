<?php
namespace ToddayModasBrecho\Api;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Request;
use WP_REST_Response;
use ToddayModasBrecho\Services\ClientesService;
use ToddayModasBrecho\Services\PedidosService;
use ToddayModasBrecho\Security\CapabilityMatrix;

class CustomersController {
    public static function register_routes(): void {
        register_rest_route(RestController::NAMESPACE, '/customers', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_customers'],
            'permission_callback' => [CapabilityMatrix::class, 'can_access_vendor_rest'],
        ]);

        register_rest_route(RestController::NAMESPACE, '/customers/(?P<id>\d+)', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_customer'],
            'permission_callback' => [self::class, 'can_access_customer_rest'],
        ]);

        register_rest_route(RestController::NAMESPACE, '/customers/(?P<id>\d+)/orders', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_customer_orders'],
            'permission_callback' => [self::class, 'can_access_customer_rest'],
        ]);
    }

    public static function can_access_customer_rest(WP_REST_Request $request): bool {
        return is_user_logged_in()
            && \ToddayModasBrecho\Security\Security::verify_rest_nonce($request);
    }

    public static function get_customers(WP_REST_Request $request): WP_REST_Response {
        $params = [
            'limit' => (int) ($request->get_param('limit') ?? 20),
            'page' => (int) ($request->get_param('page') ?? 1),
            'search' => sanitize_text_field($request->get_param('search') ?? ''),
        ];

        $results = ClientesService::get_customers($params);
        return new WP_REST_Response(['success' => true, 'data' => $results]);
    }

    public static function get_customer(WP_REST_Request $request): WP_REST_Response {
        $id = (int) $request->get_param('id');
        $user_id = get_current_user_id();

        if (!CapabilityMatrix::can_manage_store() && $user_id !== $id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Acesso negado.'], 403);
        }

        $customer = ClientesService::get_customer_by_id($id);
        if (!$customer) {
            return new WP_REST_Response(['success' => false, 'message' => 'Cliente não encontrado.'], 404);
        }

        return new WP_REST_Response(['success' => true, 'data' => $customer]);
    }

    public static function get_customer_orders(WP_REST_Request $request): WP_REST_Response {
        $id = (int) $request->get_param('id');
        $user_id = get_current_user_id();

        if (!CapabilityMatrix::can_manage_store() && $user_id !== $id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Acesso negado.'], 403);
        }

        $results = PedidosService::get_orders([
            'customer_id' => $id,
            'limit' => (int) ($request->get_param('limit') ?? 20),
            'page' => (int) ($request->get_param('page') ?? 1),
        ]);

        return new WP_REST_Response(['success' => true, 'data' => $results]);
    }
}
