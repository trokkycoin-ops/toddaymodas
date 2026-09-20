<?php
namespace ToddayModasBrecho\Api;

if (!defined('ABSPATH')) {
    exit;
}

use ToddayModasBrecho\Database\ActivityLogRepository;
use ToddayModasBrecho\Security\CapabilityMatrix;
use WP_REST_Request;
use WP_REST_Response;

class MediaController {
    public static function register_routes(): void {
        register_rest_route(RestController::NAMESPACE, '/media/upload', [
            'methods' => 'POST',
            'callback' => [self::class, 'upload'],
            'permission_callback' => [CapabilityMatrix::class, 'can_manage_store_rest'],
        ]);
    }

    public static function upload(WP_REST_Request $request): WP_REST_Response {
        $files = $request->get_file_params();
        $file = $files['file'] ?? null;

        if (!is_array($file) || !empty($file['error'])) {
            return new WP_REST_Response(['success' => false, 'message' => 'Selecione uma imagem ou vídeo válido.'], 400);
        }

        if ((int) ($file['size'] ?? 0) > 50 * MB_IN_BYTES) {
            return new WP_REST_Response(['success' => false, 'message' => 'O arquivo deve ter no máximo 50 MB.'], 413);
        }

        $allowed = [
            'jpg|jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'webp' => 'image/webp',
            'gif' => 'image/gif',
            'mp4' => 'video/mp4',
            'webm' => 'video/webm',
            'mov' => 'video/quicktime',
        ];
        $mime = sanitize_mime_type($file['type'] ?? '');
        if (!in_array($mime, array_values($allowed), true)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Formato não permitido. Use JPG, PNG, WebP, GIF, MP4, WebM ou MOV.'], 415);
        }

        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';

        $upload = wp_handle_upload($file, ['test_form' => false, 'mimes' => $allowed]);
        if (isset($upload['error'])) {
            return new WP_REST_Response(['success' => false, 'message' => sanitize_text_field($upload['error'])], 400);
        }

        $attachment_id = wp_insert_attachment([
            'post_mime_type' => $mime,
            'post_title' => sanitize_text_field(pathinfo($file['name'], PATHINFO_FILENAME)),
            'post_status' => 'inherit',
        ], $upload['file']);

        if (is_wp_error($attachment_id)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Não foi possível registrar o arquivo na Biblioteca de Mídia.'], 500);
        }

        $metadata = wp_generate_attachment_metadata($attachment_id, $upload['file']);
        if (!empty($metadata)) {
            wp_update_attachment_metadata($attachment_id, $metadata);
        }

        ActivityLogRepository::log('media_uploaded', 'attachment', (string) $attachment_id, ['mime' => $mime]);

        return new WP_REST_Response([
            'success' => true,
            'data' => [
                'id' => (int) $attachment_id,
                'url' => esc_url_raw($upload['url']),
                'mime' => $mime,
                'type' => str_starts_with($mime, 'video/') ? 'video' : 'image',
            ],
        ], 201);
    }
}
