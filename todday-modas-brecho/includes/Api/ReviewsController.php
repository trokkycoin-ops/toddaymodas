<?php
namespace ToddayModasBrecho\Api;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Request;
use WP_REST_Response;

class ReviewsController {
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
                'permission_callback' => 'is_user_logged_in',
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

        $user = wp_get_current_user();
        $comment_id = wp_insert_comment([
            'comment_post_ID' => $product_id,
            'comment_author' => $user->display_name,
            'comment_author_email' => $user->user_email,
            'comment_content' => $content,
            'comment_type' => 'review',
            'user_id' => $user->ID,
            'comment_approved' => 1,
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
            ],
        ], 201);
    }
}
