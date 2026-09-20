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
            [
                'methods' => 'GET',
                'callback' => [self::class, 'get_products'],
                'permission_callback' => [CapabilityMatrix::class, 'can_manage_store_rest'],
            ],
            [
                'methods' => 'POST',
                'callback' => [self::class, 'save_product'],
                'permission_callback' => [CapabilityMatrix::class, 'can_manage_store_rest'],
            ],
        ]);

        register_rest_route(RestController::NAMESPACE, '/products/(?P<id>\d+)', [
            'methods' => 'DELETE',
            'callback' => [self::class, 'delete_product'],
            'permission_callback' => [CapabilityMatrix::class, 'can_manage_store_rest'],
        ]);

        register_rest_route(RestController::NAMESPACE, '/products/(?P<id>\d+)/inventory', [
            'methods' => 'PUT',
            'callback' => [self::class, 'update_inventory'],
            'permission_callback' => [CapabilityMatrix::class, 'can_manage_store_rest'],
        ]);

        register_rest_route(RestController::NAMESPACE, '/products/import', [
            'methods' => 'POST',
            'callback' => [self::class, 'import_csv'],
            'permission_callback' => [CapabilityMatrix::class, 'can_manage_store_rest'],
        ]);

        register_rest_route(RestController::NAMESPACE, '/products/export', [
            'methods' => 'GET',
            'callback' => [self::class, 'export_csv'],
            'permission_callback' => [CapabilityMatrix::class, 'can_manage_store_rest'],
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
                    'image' => $p->get_image_id() ? wp_get_attachment_url($p->get_image_id()) : (get_post_meta($p->get_id(), '_todday_image_url', true) ?: ''),
                    'video' => get_post_meta($p->get_id(), '_todday_video_url', true) ?: '',
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
            $stock = max(0, (int) $request->get_param('stock'));
            $product->set_manage_stock(true);
            $product->set_stock_quantity($stock);
            $product->set_stock_status($stock > 0 ? 'instock' : 'outofstock');
        }

        if ($request->has_param('price')) {
            $price = max(0.0, (float) $request->get_param('price'));
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

    public static function save_product(WP_REST_Request $request): WP_REST_Response {
        if (!function_exists('wc_get_product')) {
            return new WP_REST_Response(['success' => false, 'message' => 'WooCommerce não ativo.'], 500);
        }

        $data = $request->get_json_params() ?: $request->get_params();
        $id = (int) ($data['id'] ?? 0);

        $name = sanitize_text_field($data['name'] ?? '');
        if ($name === '') {
            return new WP_REST_Response(['success' => false, 'message' => 'O nome do produto é obrigatório.'], 400);
        }

        $parse_price = static function ($value): float {
            return (float) str_replace(',', '.', (string) $value);
        };

        // O campo "Preço Venda" é o preço final; o preço original só vira
        // preço normal quando for maior que o preço final.
        $price = max(0.0, $parse_price($data['price'] ?? 0));
        $regular_input = isset($data['regular_price']) && $data['regular_price'] !== ''
            ? max(0.0, $parse_price($data['regular_price']))
            : 0.0;
        $regular = $regular_input > $price ? $regular_input : $price;

        $sku = sanitize_text_field($data['sku'] ?? '');
        if ($sku !== '') {
            $existing_id = wc_get_product_id_by_sku($sku);
            if ($existing_id && $existing_id !== $id) {
                return new WP_REST_Response(['success' => false, 'message' => 'Já existe um produto com este SKU.'], 409);
            }
        }

        if ($id > 0) {
            $product = wc_get_product($id);
            if (!$product) {
                return new WP_REST_Response(['success' => false, 'message' => 'Produto não encontrado.'], 404);
            }
        } else {
            $product = new \WC_Product_Simple();
        }

        $product->set_name($name);
        $product->set_description(wp_kses_post($data['description'] ?? ''));
        $product->set_short_description(wp_kses_post($data['short_description'] ?? wp_trim_words((string) ($data['description'] ?? ''), 20)));
        $product->set_status((($data['status'] ?? 'publish') === 'draft') ? 'draft' : 'publish');
        $product->set_manage_stock(true);
        $product->set_stock_quantity(max(0, (int) ($data['stock'] ?? 0)));
        $product->set_stock_status(max(0, (int) ($data['stock'] ?? 0)) > 0 ? 'instock' : 'outofstock');

        if ($regular > 0) {
            $product->set_regular_price((string) $regular);
            $product->set_sale_price(($price > 0 && $price < $regular) ? (string) $price : '');
        } else {
            $product->set_regular_price((string) $price);
            $product->set_sale_price('');
        }

        if ($sku !== '') {
            $product->set_sku($sku);
        }

        try {
            $product->set_regular_price((string) $regular);
            $product->set_sale_price($regular_input > $price ? (string) $price : '');
            $product->set_price((string) $price);
            $product->save();
            update_post_meta($product->get_id(), '_price', wc_format_decimal($price));
            wc_delete_product_transients($product->get_id());
        } catch (\Throwable $e) {
            return new WP_REST_Response(['success' => false, 'message' => 'Falha ao salvar produto: ' . $e->getMessage()], 500);
        }

        $id = $product->get_id();

        $image_id = absint($data['image_id'] ?? 0);
        if ($image_id > 0 && get_post_type($image_id) === 'attachment') {
            $product->set_image_id($image_id);
        }

        $gallery_ids = array_values(array_filter(array_map('absint', (array) ($data['gallery_ids'] ?? []))));
        if ($gallery_ids) {
            $product->set_gallery_image_ids($gallery_ids);
        }
        if ($image_id > 0 || $gallery_ids) {
            $product->save();
        }

        // Categoria (cria se não existir)
        $category = sanitize_text_field($data['category'] ?? '');
        if ($category !== '') {
            $term = get_term_by('name', $category, 'product_cat');
            if ($term) {
                wp_set_object_terms($id, [(int) $term->term_id], 'product_cat');
            } else {
                $created = wp_insert_term($category, 'product_cat');
                if (!is_wp_error($created)) {
                    wp_set_object_terms($id, [(int) $created['term_id']], 'product_cat');
                }
            }
        }

        // Metadados de brechó
        $meta = [
            '_todday_condition' => sanitize_text_field($data['condition'] ?? ''),
            '_todday_size' => sanitize_text_field($data['size'] ?? ''),
            '_todday_brand' => sanitize_text_field($data['brand'] ?? ''),
            '_todday_fabric' => sanitize_text_field($data['fabric'] ?? ''),
            '_todday_image_url' => esc_url_raw($data['image'] ?? ''),
            '_todday_video_url' => esc_url_raw($data['video_url'] ?? ''),
            '_todday_available_sizes' => wp_json_encode(array_map('sanitize_text_field', (array) ($data['available_sizes'] ?? []))),
            '_todday_colors' => wp_json_encode($data['available_colors'] ?? []),
            '_todday_measurements' => wp_json_encode($data['measurements'] ?? []),
        ];
        foreach ($meta as $key => $value) {
            update_post_meta($id, $key, $value);
        }

        ActivityLogRepository::log('product_saved', 'product', (string) $id, [
            'name' => $name,
            'price' => $product->get_price(),
            'regular_price' => $product->get_regular_price(),
            'sale_price' => $product->get_sale_price(),
        ]);

        return new WP_REST_Response([
            'success' => true,
            'data' => [
                'id' => $id,
                'price' => (float) $product->get_price(),
                'regular_price' => (float) $product->get_regular_price(),
                'sale_price' => (float) $product->get_sale_price(),
            ],
        ]);
    }

    public static function delete_product(WP_REST_Request $request): WP_REST_Response {
        if (!function_exists('wc_get_product')) {
            return new WP_REST_Response(['success' => false, 'message' => 'WooCommerce não ativo.'], 500);
        }

        $id = (int) $request->get_param('id');
        $product = wc_get_product($id);
        if (!$product) {
            return new WP_REST_Response(['success' => false, 'message' => 'Produto não encontrado.'], 404);
        }

        $product->delete(true);
        ActivityLogRepository::log('product_deleted', 'product', (string) $id, []);

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
