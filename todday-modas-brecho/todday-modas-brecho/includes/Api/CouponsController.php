<?php
namespace ToddayModasBrecho\Api;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Request;
use WP_REST_Response;
use ToddayModasBrecho\Security\CapabilityMatrix;
use ToddayModasBrecho\Database\ActivityLogRepository;

class CouponsController {
    public static function register_routes(): void {
        register_rest_route(RestController::NAMESPACE, '/coupons', [
            [
                'methods' => 'GET',
                'callback' => [self::class, 'get_coupons'],
                'permission_callback' => [CapabilityMatrix::class, 'can_manage_store'],
            ],
            [
                'methods' => 'POST',
                'callback' => [self::class, 'create_coupon'],
                'permission_callback' => [CapabilityMatrix::class, 'can_manage_store'],
            ],
        ]);

        register_rest_route(RestController::NAMESPACE, '/coupons/(?P<id>\d+)', [
            [
                'methods' => 'PUT',
                'callback' => [self::class, 'update_coupon'],
                'permission_callback' => [CapabilityMatrix::class, 'can_manage_store'],
            ],
            [
                'methods' => 'DELETE',
                'callback' => [self::class, 'delete_coupon'],
                'permission_callback' => [CapabilityMatrix::class, 'can_manage_store'],
            ],
        ]);
    }

    public static function get_coupons(WP_REST_Request $request): WP_REST_Response {
        $posts = get_posts([
            'post_type' => 'shop_coupon',
            'post_status' => 'publish',
            'posts_per_page' => -1,
        ]);

        $coupons = [];
        foreach ($posts as $post) {
            $coupon = new \WC_Coupon($post->ID);
            $coupons[] = [
                'id' => $post->ID,
                'code' => $coupon->get_code(),
                'amount' => (float) $coupon->get_amount(),
                'discount_type' => $coupon->get_discount_type(),
                'usage_count' => (int) $coupon->get_usage_count(),
                'usage_limit' => (int) $coupon->get_usage_limit(),
                'date_expires' => $coupon->get_date_expires() ? $coupon->get_date_expires()->date('Y-m-d') : null,
            ];
        }

        return new WP_REST_Response(['success' => true, 'data' => $coupons]);
    }

    public static function create_coupon(WP_REST_Request $request): WP_REST_Response {
        $code = sanitize_text_field($request->get_param('code') ?? '');
        $amount = (float) ($request->get_param('amount') ?? 0);
        $discount_type = sanitize_text_field($request->get_param('discount_type') ?? 'percent'); // percent ou fixed_cart

        if (empty($code) || $amount <= 0) {
            return new WP_REST_Response(['success' => false, 'message' => 'Informe o código e valor do cupom.'], 400);
        }

        $coupon = new \WC_Coupon();
        $coupon->set_code($code);
        $coupon->set_discount_type($discount_type);
        $coupon->set_amount($amount);
        $coupon->set_individual_use(true);
        $coupon_id = $coupon->save();

        ActivityLogRepository::log('coupon_created', 'coupon', (string) $coupon_id, [
            'code' => $code,
            'amount' => $amount,
        ]);

        return new WP_REST_Response([
            'success' => true,
            'data' => [
                'id' => $coupon_id,
                'code' => $code,
                'amount' => $amount,
                'discount_type' => $discount_type,
            ],
        ], 201);
    }

    public static function update_coupon(WP_REST_Request $request): WP_REST_Response {
        $id = (int) $request->get_param('id');
        $coupon = new \WC_Coupon($id);
        if (!$coupon->get_id()) {
            return new WP_REST_Response(['success' => false, 'message' => 'Cupom não encontrado.'], 404);
        }

        if ($request->has_param('amount')) {
            $coupon->set_amount((float) $request->get_param('amount'));
        }
        if ($request->has_param('discount_type')) {
            $coupon->set_discount_type(sanitize_text_field($request->get_param('discount_type')));
        }
        $coupon->save();

        return new WP_REST_Response(['success' => true, 'data' => ['id' => $id]]);
    }

    public static function delete_coupon(WP_REST_Request $request): WP_REST_Response {
        $id = (int) $request->get_param('id');
        $deleted = wp_delete_post($id, true);

        if (!$deleted) {
            return new WP_REST_Response(['success' => false, 'message' => 'Falha ao excluir cupom.'], 400);
        }

        ActivityLogRepository::log('coupon_deleted', 'coupon', (string) $id);
        return new WP_REST_Response(['success' => true, 'data' => ['deleted' => true]]);
    }
}
