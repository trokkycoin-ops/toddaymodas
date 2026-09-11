<?php
namespace ToddayModasBrecho\Api;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Request;
use WP_REST_Response;

class CatalogController {
    public static function register_routes(): void {
        register_rest_route(RestController::NAMESPACE, '/catalog', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_products'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route(RestController::NAMESPACE, '/catalog/taxonomies', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_taxonomies'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route(RestController::NAMESPACE, '/catalog/products/(?P<id>\d+)', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_product'],
            'permission_callback' => '__return_true',
        ]);
    }

    public static function get_products(WP_REST_Request $request): WP_REST_Response {
        if (!function_exists('wc_get_products')) {
            return new WP_REST_Response(['success' => false, 'message' => 'WooCommerce não ativo.'], 500);
        }

        $page = (int) ($request->get_param('page') ?? 1);
        $limit = (int) ($request->get_param('limit') ?? 12);
        $category = sanitize_text_field($request->get_param('category') ?? '');
        $search = sanitize_text_field($request->get_param('search') ?? '');
        $min_price = $request->get_param('min_price');
        $max_price = $request->get_param('max_price');
        $orderby = sanitize_text_field($request->get_param('orderby') ?? 'date');
        $order = sanitize_text_field($request->get_param('order') ?? 'DESC');
        $condition = sanitize_text_field($request->get_param('condition') ?? '');

        $query_args = [
            'status' => 'publish',
            'limit' => $limit,
            'page' => $page,
            'paginate' => true,
            'order' => strtoupper($order) === 'ASC' ? 'ASC' : 'DESC',
        ];

        // Ordenação
        switch ($orderby) {
            case 'price':
            case 'price-asc':
                $query_args['orderby'] = 'price';
                $query_args['order'] = 'ASC';
                break;
            case 'price-desc':
                $query_args['orderby'] = 'price';
                $query_args['order'] = 'DESC';
                break;
            case 'popularity':
                $query_args['orderby'] = 'total_sales';
                break;
            case 'rating':
                $query_args['orderby'] = 'rating';
                break;
            default:
                $query_args['orderby'] = 'date';
                break;
        }

        if (!empty($category)) {
            $query_args['category'] = [$category];
        }

        if (!empty($search)) {
            $query_args['s'] = $search;
        }

        if ($min_price !== null || $max_price !== null) {
            $query_args['price_filter'] = true;
            if ($min_price !== null) $query_args['min_price'] = (float) $min_price;
            if ($max_price !== null) $query_args['max_price'] = (float) $max_price;
        }

        $results = wc_get_products($query_args);
        $items = [];

        foreach ($results->products as $product) {
            $prod_condition = get_post_meta($product->get_id(), '_todday_condition', true) ?: 'Estado de Novo';
            if (!empty($condition) && $prod_condition !== $condition) {
                continue;
            }
            $items[] = self::format_product($product);
        }

        return new WP_REST_Response([
            'success' => true,
            'data' => [
                'products' => $items,
                'total' => $results->total,
                'max_num_pages' => $results->max_num_pages,
                'page' => $page,
            ],
        ]);
    }

    public static function get_taxonomies(): WP_REST_Response {
        $categories = get_terms([
            'taxonomy' => 'product_cat',
            'hide_empty' => false,
        ]);

        $formatted_cats = [];
        if (!is_wp_error($categories)) {
            foreach ($categories as $cat) {
                $formatted_cats[] = [
                    'id' => $cat->term_id,
                    'name' => $cat->name,
                    'slug' => $cat->slug,
                    'count' => $cat->count,
                ];
            }
        }

        return new WP_REST_Response([
            'success' => true,
            'data' => [
                'categories' => $formatted_cats,
                'conditions' => [
                    'Estado de Novo',
                    'Sem marcas de uso',
                    'Vintage Exclusivo',
                    'Peça Única',
                    'Com leve desgaste',
                ],
            ],
        ]);
    }

    public static function get_product(WP_REST_Request $request): WP_REST_Response {
        $id = (int) $request->get_param('id');
        $product = function_exists('wc_get_product') ? wc_get_product($id) : null;

        if (!$product) {
            return new WP_REST_Response(['success' => false, 'message' => 'Produto não encontrado.'], 404);
        }

        $formatted = self::format_product($product, true);
        return new WP_REST_Response(['success' => true, 'data' => $formatted]);
    }

    public static function format_product($product, bool $full_details = false): array {
        $id = $product->get_id();
        $gallery_ids = $product->get_gallery_image_ids();
        $gallery_urls = [];
        foreach ($gallery_ids as $gid) {
            $url = wp_get_attachment_url($gid);
            if ($url) $gallery_urls[] = $url;
        }

        $image_id = $product->get_image_id();
        $main_image = $image_id ? wp_get_attachment_url($image_id) : '';

        $cats = wp_get_post_terms($id, 'product_cat', ['fields' => 'names']);
        $tags = wp_get_post_terms($id, 'product_tag', ['fields' => 'names']);

        $condition = get_post_meta($id, '_todday_condition', true) ?: 'Estado de Novo';
        $size = get_post_meta($id, '_todday_size', true) ?: 'M';

        $data = [
            'id' => $id,
            'name' => $product->get_name(),
            'slug' => $product->get_slug(),
            'price' => (float) $product->get_price(),
            'regular_price' => (float) $product->get_regular_price(),
            'sale_price' => $product->get_sale_price() ? (float) $product->get_sale_price() : null,
            'on_sale' => $product->is_on_sale(),
            'image' => $main_image,
            'categories' => is_array($cats) ? $cats : [],
            'rating' => (float) $product->get_average_rating(),
            'rating_count' => (int) $product->get_rating_count(),
            'in_stock' => $product->is_in_stock(),
            'stock_quantity' => $product->get_stock_quantity(),
            'condition' => $condition,
            'size' => $size,
        ];

        if ($full_details) {
            $data['description'] = $product->get_description();
            $data['short_description'] = $product->get_short_description();
            $data['gallery'] = $gallery_urls;
            $data['tags'] = is_array($tags) ? $tags : [];
        }

        return $data;
    }
}
