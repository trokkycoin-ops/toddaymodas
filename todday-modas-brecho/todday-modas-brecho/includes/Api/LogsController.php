<?php
namespace ToddayModasBrecho\Api;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Request;
use WP_REST_Response;
use ToddayModasBrecho\Security\CapabilityMatrix;
use ToddayModasBrecho\Database\ActivityLogRepository;

class LogsController {
    public static function register_routes(): void {
        register_rest_route(RestController::NAMESPACE, '/logs', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_logs'],
            'permission_callback' => [CapabilityMatrix::class, 'can_manage_store_rest'],
        ]);
    }

    public static function get_logs(WP_REST_Request $request): WP_REST_Response {
        $limit = (int) ($request->get_param('limit') ?? 50);
        $page = (int) ($request->get_param('page') ?? 1);
        $search = sanitize_text_field($request->get_param('search') ?? '');

        $offset = ($page - 1) * $limit;
        $logs = ActivityLogRepository::get_logs($limit, $offset, $search);
        $total = ActivityLogRepository::count_logs($search);

        return new WP_REST_Response([
            'success' => true,
            'data' => [
                'logs' => $logs,
                'total' => $total,
                'pages' => ceil($total / $limit),
            ],
        ]);
    }
}
