<?php
namespace ToddayModasBrecho\Api;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Request;
use WP_REST_Response;
use ToddayModasBrecho\Security\Security;

class ReviewsController {
    public static function can_submit_review(WP_REST_Request $request): bool {
        return is_user_logged_in() && Security::verify_rest_nonce($request);
    }

    public static function register_routes(): void {
        register_rest_route(RestController::NAMESPACE, '/reviews', [
            [
                'methods' => 'GET',
                'callback' => [self::class, 'get_reviews'],
                'permission_callback' => '__return_true',
            ],
            [
                'methods' => 'POST',
                'callback' => [self::class, 'submit_review'],
                'permission_callback' => [self::class, 'can_submit_review'],
            ],
        ]);
    }

    public static function get_reviews(WP_REST_Request $request): WP_REST_Response {
        $product_id = (int) $request->get_param('product_id');

        $args = [
            'status' => 'approve',
            'type' => 'review',
            'number' => 20,
        ];

        if ($product_id > 0) {
            $args['post_id'] = $product_id;
        }

        $comments = get_comments($args);
        $formatted = [];

        foreach ($comments as $comment) {
            $rating = (int) get_comment_meta($comment->comment_ID, 'rating', true) ?: 5;
            $formatted[] = [
                'id' => $comment->comment_ID,
                'author' => $comment->comment_author,
                'content' => $comment->comment_content,
                'rating' => $rating,
                'date' => $comment->comment_date,
                'product_id' => $comment->comment_post_ID,
            ];
        }

        return new WP_REST_Response(['success' => true, 'data' => $formatted]);
    }

    public static function submit_review(WP_REST_Request $request): WP_REST_Response {
        $product_id = (int) $request->get_param('product_id');
        $rating = (int) ($request->get_param('rating') ?? 5);
        $content = sanitize_textarea_field($request->get_param('content') ?? '');

        if ($product_id <= 0 || empty($content)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Informe o produto e o comentário.'], 400);
        }

        // Nota válida obrigatoriamente entre 1 e 5.
        $rating = min(5, max(1, $rating));

        $product = wc_get_product($product_id);
        if (!$product || $product->get_status() !== 'publish') {
            return new WP_REST_Response(['success' => false, 'message' => 'Produto não encontrado.'], 404);
        }

        $user = wp_get_current_user();

        // Uma avaliação por usuário por produto (evita spam e votos múltiplos).
        $existing = get_comments([
            'user_id' => $user->ID,
            'post_id' => $product_id,
            'type' => 'review',
            'count' => true,
        ]);
        if ($existing > 0) {
            return new WP_REST_Response(['success' => false, 'message' => 'Você já avaliou este produto.'], 409);
        }

        // Aprovação imediata apenas para compradores verificados; do contrário,
        // a avaliação passa por moderação antes de aparecer publicamente.
        $bought = function_exists('wc_customer_bought_product')
            && wc_customer_bought_product($user->user_email, $user->ID, $product_id);
        $approved = $bought ? 1 : 0;

        $comment_id = wp_insert_comment([
            'comment_post_ID' => $product_id,
            'comment_author' => $user->display_name,
            'comment_author_email' => $user->user_email,
            'comment_content' => $content,
            'comment_type' => 'review',
            'user_id' => $user->ID,
            'comment_approved' => $approved,
        ]);

        if (!$comment_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Erro ao salvar avaliação.'], 500);
        }

        update_comment_meta($comment_id, 'rating', $rating);

        return new WP_REST_Response([
            'success' => true,
            'data' => [
                'id' => $comment_id,
                'rating' => $rating,
                'content' => $content,
                'approved' => (bool) $approved,
            ],
        ], 201);
    }
}
