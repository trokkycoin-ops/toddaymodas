<?php
namespace ToddayModasBrecho\Database;

if (!defined('ABSPATH')) {
    exit;
}

class ActivityLogRepository {
    public static function log(string $action, string $object_type = '', string $object_id = '', array $meta_data = []): bool {
        global $wpdb;
        $table_name = $wpdb->prefix . 'todday_activity_log';

        $current_user = wp_get_current_user();
        $user_id = $current_user->ID ?? 0;
        $user_login = $current_user->user_login ?? 'system';
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

        $result = $wpdb->insert(
            $table_name,
            [
                'user_id' => $user_id,
                'user_login' => sanitize_text_field($user_login),
                'action' => sanitize_text_field($action),
                'object_type' => sanitize_text_field($object_type),
                'object_id' => sanitize_text_field($object_id),
                'meta_data' => wp_json_encode($meta_data),
                'ip_address' => sanitize_text_field($ip),
                'created_at' => current_time('mysql'),
            ],
            ['%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s']
        );

        return $result !== false;
    }

    public static function get_logs(int $limit = 50, int $offset = 0, string $search = ''): array {
        global $wpdb;
        $table_name = $wpdb->prefix . 'todday_activity_log';

        // Verifica existência da tabela
        if ($wpdb->get_var("SHOW TABLES LIKE '{$table_name}'") !== $table_name) {
            return [];
        }

        $where = "WHERE 1=1";
        $params = [];

        if (!empty($search)) {
            $like = '%' . $wpdb->esc_like($search) . '%';
            $where .= " AND (action LIKE %s OR user_login LIKE %s OR object_type LIKE %s OR object_id LIKE %s)";
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
        }

        $query = "SELECT * FROM {$table_name} {$where} ORDER BY created_at DESC LIMIT %d OFFSET %d";
        $params[] = $limit;
        $params[] = $offset;

        $prepared = $wpdb->prepare($query, $params);
        return $wpdb->get_results($prepared, ARRAY_A) ?: [];
    }

    public static function count_logs(string $search = ''): int {
        global $wpdb;
        $table_name = $wpdb->prefix . 'todday_activity_log';

        if ($wpdb->get_var("SHOW TABLES LIKE '{$table_name}'") !== $table_name) {
            return 0;
        }

        $where = "WHERE 1=1";
        $params = [];

        if (!empty($search)) {
            $like = '%' . $wpdb->esc_like($search) . '%';
            $where .= " AND (action LIKE %s OR user_login LIKE %s OR object_type LIKE %s OR object_id LIKE %s)";
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
        }

        $query = "SELECT COUNT(*) FROM {$table_name} {$where}";
        if (!empty($params)) {
            $query = $wpdb->prepare($query, $params);
        }

        return (int) $wpdb->get_var($query);
    }
}
