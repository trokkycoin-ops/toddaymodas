<?php
namespace ToddayModasBrecho\Api;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Request;
use WP_REST_Response;
use ToddayModasBrecho\Services\PedidosService;
use ToddayModasBrecho\Services\PdfService;
use ToddayModasBrecho\Services\NotificacaoService;
use ToddayModasBrecho\Security\CapabilityMatrix;

class OrdersController {
    public static function register_routes(): void {
        register_rest_route(RestController::NAMESPACE, '/orders', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_orders'],
            'permission_callback' => [CapabilityMatrix::class, 'can_access_orders_rest'],
        ]);

        register_rest_route(RestController::NAMESPACE, '/orders/(?P<id>\d+)', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_order'],
            'permission_callback' => [CapabilityMatrix::class, 'can_access_orders_rest'],
        ]);

        register_rest_route(RestController::NAMESPACE, '/orders/(?P<id>\d+)/status', [
            'methods' => 'PUT',
            'callback' => [self::class, 'update_status'],
            'permission_callback' => [CapabilityMatrix::class, 'can_manage_store_rest'],
        ]);

        register_rest_route(RestController::NAMESPACE, '/orders/(?P<id>\d+)/pdf', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_pdf'],
            'permission_callback' => [CapabilityMatrix::class, 'can_access_orders_rest'],
        ]);

        register_rest_route(RestController::NAMESPACE, '/orders/(?P<id>\d+)/notify', [
            'methods' => 'POST',
            'callback' => [self::class, 'notify_order'],
            'permission_callback' => [CapabilityMatrix::class, 'can_manage_store_rest'],
        ]);
    }

    public static function get_orders(WP_REST_Request $request): WP_REST_Response {
        $user = wp_get_current_user();
        $is_manager = CapabilityMatrix::can_manage_store();
        $is_vendor = in_array('todday_vendedor', $user->roles, true);

        $params = [
            'limit' => (int) ($request->get_param('limit') ?? 20),
            'page' => (int) ($request->get_param('page') ?? 1),
            'status' => sanitize_text_field($request->get_param('status') ?? 'any'),
            'search' => sanitize_text_field($request->get_param('search') ?? ''),
        ];

        // Matriz de permissão obrigatória aplicada no servidor
        if ($is_manager) {
            // Gerente e Admin veem todos
        } elseif ($is_vendor) {
            // Vendedor vê somente os atribuídos a ele
            $params['vendor_id'] = $user->ID;
        } else {
            // Cliente vê somente os próprios
            $params['customer_id'] = $user->ID;
        }

        $results = PedidosService::get_orders($params);
        return new WP_REST_Response(['success' => true, 'data' => $results]);
    }

    public static function get_order(WP_REST_Request $request): WP_REST_Response {
        $id = (int) $request->get_param('id');
        $order = PedidosService::get_order_by_id($id);

        if (!$order) {
            return new WP_REST_Response(['success' => false, 'message' => 'Pedido não encontrado.'], 404);
        }

        // Validação de acesso por dono/papel
        $user_id = get_current_user_id();
        if (!CapabilityMatrix::can_manage_store() && (int) $order['customer_id'] !== $user_id && (int) $order['vendor_id'] !== $user_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Acesso não autorizado a este pedido.'], 403);
        }

        return new WP_REST_Response(['success' => true, 'data' => $order]);
    }

    public static function update_status(WP_REST_Request $request): WP_REST_Response {
        $id = (int) $request->get_param('id');
        $status = sanitize_text_field($request->get_param('status') ?? '');
        $note = sanitize_text_field($request->get_param('note') ?? '');

        if (empty($status)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Status não informado.'], 400);
        }

        $success = PedidosService::update_order_status($id, $status, $note);
        if (!$success) {
            return new WP_REST_Response(['success' => false, 'message' => 'Falha ao atualizar pedido.'], 500);
        }

        // Dispara e-mail transacional caso configurado
        NotificacaoService::send_order_status_email($id);

        return new WP_REST_Response(['success' => true, 'data' => PedidosService::get_order_by_id($id)]);
    }

    public static function get_pdf(WP_REST_Request $request): void {
        $id = (int) $request->get_param('id');
        $order = PedidosService::get_order_by_id($id);

        if (!$order) {
            wp_die('Pedido não encontrado.');
        }

        $user_id = get_current_user_id();
        if (!CapabilityMatrix::can_manage_store() && (int) $order['customer_id'] !== $user_id) {
            wp_die('Sem permissão.');
        }

        PdfService::output_order_pdf($id);
    }

    public static function notify_order(WP_REST_Request $request): WP_REST_Response {
        $id = (int) $request->get_param('id');
        $channel = sanitize_text_field($request->get_param('channel') ?? 'whatsapp');

        if ($channel === 'whatsapp') {
            $url = NotificacaoService::get_order_whatsapp_url($id);
            return new WP_REST_Response(['success' => true, 'data' => ['whatsapp_url' => $url]]);
        }

        $sent = NotificacaoService::send_order_status_email($id);
        return new WP_REST_Response(['success' => $sent, 'data' => ['email_sent' => $sent]]);
    }
}
