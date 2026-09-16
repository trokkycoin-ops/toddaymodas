<?php
namespace ToddayModasBrecho\Api;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Request;
use WP_REST_Response;

class CartController {
    public static function register_routes(): void {
        register_rest_route(RestController::NAMESPACE, '/cart', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_cart'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route(RestController::NAMESPACE, '/cart/add', [
            'methods' => 'POST',
            'callback' => [self::class, 'add_to_cart'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route(RestController::NAMESPACE, '/cart/update', [
            'methods' => 'POST',
            'callback' => [self::class, 'update_cart'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route(RestController::NAMESPACE, '/cart/remove', [
            'methods' => 'POST',
            'callback' => [self::class, 'remove_from_cart'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route(RestController::NAMESPACE, '/cart/apply-coupon', [
            'methods' => 'POST',
            'callback' => [self::class, 'apply_coupon'],
            'permission_callback' => '__return_true',
        ]);
    }

    private static function ensure_wc_cart_loaded(): bool {
        if (!function_exists('WC') || !WC()) {
            return false;
        }
        if (null === WC()->session) {
            WC()->initialize_session();
        }
        if (null === WC()->customer) {
            WC()->customer = new \WC_Customer(get_current_user_id(), true);
        }
        if (null === WC()->cart) {
            WC()->cart = new \WC_Cart();
        }
        return true;
    }

    public static function get_cart(): WP_REST_Response {
        if (!self::ensure_wc_cart_loaded()) {
            return new WP_REST_Response(['success' => false, 'message' => 'Sessão do carrinho indisponível.'], 500);
        }

        $items = [];
        foreach (WC()->cart->get_cart() as $cart_item_key => $cart_item) {
            $product = $cart_item['data'];
            $items[] = [
                'key' => $cart_item_key,
                'product_id' => $cart_item['product_id'],
                'name' => $product->get_name(),
                'price' => (float) $product->get_price(),
                'quantity' => (int) $cart_item['quantity'],
                'subtotal' => (float) $cart_item['line_subtotal'],
                'total' => (float) $cart_item['line_total'],
                'image' => $product->get_image_id() ? wp_get_attachment_url($product->get_image_id()) : '',
                'condition' => get_post_meta($product->get_id(), '_todday_condition', true) ?: 'Estado de Novo',
            ];
        }

        $coupons = WC()->cart->get_applied_coupons();

        return new WP_REST_Response([
            'success' => true,
            'data' => [
                'items' => $items,
                'item_count' => WC()->cart->get_cart_contents_count(),
                'subtotal' => (float) WC()->cart->get_subtotal(),
                'discount_total' => (float) WC()->cart->get_discount_total(),
                'shipping_total' => (float) WC()->cart->get_shipping_total(),
                'total' => (float) WC()->cart->get_total('edit'),
                'coupons' => $coupons,
            ],
        ]);
    }

    public static function add_to_cart(WP_REST_Request $request): WP_REST_Response {
        if (!self::ensure_wc_cart_loaded()) {
            return new WP_REST_Response(['success' => false, 'message' => 'Carrinho indisponível.'], 500);
        }

        $product_id = (int) $request->get_param('product_id');
        $quantity = (int) ($request->get_param('quantity') ?? 1);

        if ($product_id <= 0) {
            return new WP_REST_Response(['success' => false, 'message' => 'Produto inválido.'], 400);
        }

        $cart_item_key = WC()->cart->add_to_cart($product_id, $quantity);

        if (!$cart_item_key) {
            return new WP_REST_Response(['success' => false, 'message' => 'Não foi possível adicionar ao carrinho. Verifique o estoque.'], 400);
        }

        return self::get_cart();
    }

    public static function update_cart(WP_REST_Request $request): WP_REST_Response {
        if (!self::ensure_wc_cart_loaded()) {
            return new WP_REST_Response(['success' => false, 'message' => 'Carrinho indisponível.'], 500);
        }

        $key = sanitize_text_field($request->get_param('key') ?? '');
        $quantity = (int) $request->get_param('quantity');

        if (empty($key)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Chave do item obrigatória.'], 400);
        }

        if ($quantity <= 0) {
            WC()->cart->remove_cart_item($key);
        } else {
            WC()->cart->set_quantity($key, $quantity);
        }

        return self::get_cart();
    }

    public static function remove_from_cart(WP_REST_Request $request): WP_REST_Response {
        if (!self::ensure_wc_cart_loaded()) {
            return new WP_REST_Response(['success' => false, 'message' => 'Carrinho indisponível.'], 500);
        }

        $key = sanitize_text_field($request->get_param('key') ?? '');
        if (empty($key)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Chave do item obrigatória.'], 400);
        }

        WC()->cart->remove_cart_item($key);
        return self::get_cart();
    }

    public static function apply_coupon(WP_REST_Request $request): WP_REST_Response {
        if (!self::ensure_wc_cart_loaded()) {
            return new WP_REST_Response(['success' => false, 'message' => 'Carrinho indisponível.'], 500);
        }

        $code = sanitize_text_field($request->get_param('code') ?? '');
        if (empty($code)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Informe o código do cupom.'], 400);
        }

        $applied = WC()->cart->apply_coupon($code);
        if (!$applied) {
            return new WP_REST_Response(['success' => false, 'message' => 'Cupom inválido ou expirado.'], 400);
        }

        return self::get_cart();
    }
}
