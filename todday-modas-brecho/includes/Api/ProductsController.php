<?php
namespace ToddayModasBrecho\Api;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Request;
use WP_REST_Response;
use ToddayModasBrecho\Security\CapabilityMatrix;
use ToddayModasBrecho\Services\ImportExportService;
use ToddayModasBrecho\Database\ActivityLogRepository;

class ProductsController {
    public static function register_routes(): void {
        register_rest_route(RestController::NAMESPACE, '/products', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_products'],
            'permission_callback' => [CapabilityMatrix::class, 'can_manage_store'],
        ]);

        register_rest_route(RestController::NAMESPACE, '/products/(?P<id>\d+)/inventory', [
            'methods' => 'PUT',
            'callback' => [self::class, 'update_inventory'],
            'permission_callback' => [CapabilityMatrix::class, 'can_manage_store'],
        ]);

        register_rest_route(RestController::NAMESPACE, '/products/import', [
            'methods' => 'POST',
            'callback' => [self::class, 'import_csv'],
            'permission_callback' => [CapabilityMatrix::class, 'can_manage_store'],
        ]);

        register_rest_route(RestController::NAMESPACE, '/products/export', [
            'methods' => 'GET',
            'callback' => [self::class, 'export_csv'],
            'permission_callback' => [CapabilityMatrix::class, 'can_manage_store'],
        ]);
    }

    public static function get_products(WP_REST_Request $request): WP_REST_Response {
        $params = [
            'limit' => (int) ($request->get_param('limit') ?? 20),
            'page' => (int) ($request->get_param('page') ?? 1),
            'search' => sanitize_text_field($request->get_param('search') ?? ''),
            'orderby' => 'date',
            'order' => 'DESC',
            'paginate' => true,
        ];

        if (!empty($params['search'])) {
            $params['s'] = $params['search'];
        }

        $results = function_exists('wc_get_products') ? wc_get_products($params) : (object) ['products' => [], 'total' => 0, 'max_num_pages' => 0];

        $items = [];
        if (isset($results->products)) {
            foreach ($results->products as $p) {
                $items[] = [
                    'id' => $p->get_id(),
                    'name' => $p->get_name(),
                    'sku' => $p->get_sku(),
                    'price' => (float) $p->get_price(),
                    'regular_price' => (float) $p->get_regular_price(),
                    'stock' => $p->get_stock_quantity(),
                    'in_stock' => $p->is_in_stock(),
                    'condition' => get_post_meta($p->get_id(), '_todday_condition', true) ?: 'Estado de Novo',
                    'image' => $p->get_image_id() ? wp_get_attachment_url($p->get_image_id()) : '',
                ];
            }
        }

        return new WP_REST_Response([
            'success' => true,
            'data' => [
                'products' => $items,
                'total' => $results->total ?? 0,
                'pages' => $results->max_num_pages ?? 0,
            ],
        ]);
    }

    public static function update_inventory(WP_REST_Request $request): WP_REST_Response {
        $id = (int) $request->get_param('id');
        $product = function_exists('wc_get_product') ? wc_get_product($id) : null;

        if (!$product) {
            return new WP_REST_Response(['success' => false, 'message' => 'Produto não encontrado.'], 404);
        }

        if ($request->has_param('stock')) {
            $stock = (int) $request->get_param('stock');
            $product->set_manage_stock(true);
            $product->set_stock_quantity($stock);
            $product->set_stock_status($stock > 0 ? 'instock' : 'outofstock');
        }

        if ($request->has_param('price')) {
            $price = (float) $request->get_param('price');
            $product->set_regular_price($price);
            $product->set_price($price);
        }

        if ($request->has_param('condition')) {
            update_post_meta($id, '_todday_condition', sanitize_text_field($request->get_param('condition')));
        }

        $product->save();

        ActivityLogRepository::log('product_inventory_updated', 'product', (string) $id, [
            'stock' => $product->get_stock_quantity(),
            'price' => $product->get_price(),
        ]);

        return new WP_REST_Response(['success' => true, 'data' => ['id' => $id]]);
    }

    public static function import_csv(WP_REST_Request $request): WP_REST_Response {
        $files = $request->get_file_params();

        if (empty($files['file'])) {
            return new WP_REST_Response(['success' => false, 'message' => 'Envie um arquivo CSV.'], 400);
        }

        $file = $files['file'];
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        if (strtolower($ext) !== 'csv') {
            return new WP_REST_Response(['success' => false, 'message' => 'O arquivo precisa ser .CSV.'], 400);
        }

        $result = ImportExportService::import_products_csv($file['tmp_name']);
        return new WP_REST_Response($result);
    }

    public static function export_csv(): void {
        ImportExportService::export_products_csv();
    }
}
