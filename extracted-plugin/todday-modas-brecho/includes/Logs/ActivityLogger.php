<?php
namespace ToddayModasBrecho\Logs;

if (!defined('ABSPATH')) {
    exit;
}

use ToddayModasBrecho\Database\ActivityLogRepository;

class ActivityLogger {
    public static function register_hooks(): void {
        // Log de login bem sucedido
        add_action('wp_login', function ($user_login, $user) {
            ActivityLogRepository::log('auth_login', 'user', (string) $user->ID, [
                'user_email' => $user->user_email,
                'roles' => $user->roles,
            ]);
        }, 10, 2);

        // Log de alteração de status de pedido WooCommerce
        add_action('woocommerce_order_status_changed', function ($order_id, $old_status, $new_status, $order) {
            ActivityLogRepository::log('order_status_change', 'order', (string) $order_id, [
                'old_status' => $old_status,
                'new_status' => $new_status,
                'total' => $order ? $order->get_total() : '0',
            ]);
        }, 10, 4);
    }
}
