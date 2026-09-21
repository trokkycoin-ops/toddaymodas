<?php
namespace ToddayModasBrecho\Api;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Request;
use WP_REST_Response;
use ToddayModasBrecho\Security\CapabilityMatrix;
use ToddayModasBrecho\Services\RelatoriosService;
use ToddayModasBrecho\Services\ImportExportService;

class ReportsController {
    public static function register_routes(): void {
        register_rest_route(RestController::NAMESPACE, '/reports/summary', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_summary'],
            'permission_callback' => [CapabilityMatrix::class, 'can_manage_store'],
        ]);

        register_rest_route(RestController::NAMESPACE, '/reports/export', [
            'methods' => 'GET',
            'callback' => [self::class, 'export_orders'],
            'permission_callback' => [CapabilityMatrix::class, 'can_manage_store'],
        ]);
    }

    public static function get_summary(WP_REST_Request $request): WP_REST_Response {
        $from = sanitize_text_field($request->get_param('from') ?? '');
        $to = sanitize_text_field($request->get_param('to') ?? '');

        $summary = RelatoriosService::get_summary($from, $to);
        return new WP_REST_Response(['success' => true, 'data' => $summary]);
    }

    public static function export_orders(): void {
        ImportExportService::export_orders_csv();
    }
}
