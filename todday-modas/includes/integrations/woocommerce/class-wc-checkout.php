<?php
namespace ToddayModas\Integrations\WooCommerce;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Validação Atômica de Estoque Concorrente no Checkout WooCommerce
 */
class WcCheckout {
    private static $instance = null;

    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {}

    public function init() {
        // Validação estrita antes de finalizar o pedido
        add_action('woocommerce_before_checkout_process', [$this, 'validate_unique_pieces_before_order']);
        
        // Associação da ordem com o lock para rastreamento
        add_action('woocommerce_checkout_order_processed', [$this, 'assign_lock_to_order'], 10, 3);
        
        // Se o pedido for cancelado ou falhar, liberar o lock
        add_action('woocommerce_order_status_cancelled', [$this, 'release_order_lock']);
        add_action('woocommerce_order_status_failed', [$this, 'release_order_lock']);
    }

    public function validate_unique_pieces_before_order() {
        if (!WC()->cart) return;

        global $wpdb;
        $table = $wpdb->prefix . 'todday_stock_locks';
        $now = current_time('mysql', 1);
        $current_cart_hash = md5(WC()->session ? WC()->session->get_customer_id() : $_SERVER['REMOTE_ADDR']);

        foreach (WC()->cart->get_cart() as $cart_item) {
            $product_id = $cart_item['product_id'];
            $is_unique = get_post_meta($product_id, '_todday_is_unique_piece', true);

            if ($is_unique) {
                // Query com FOR UPDATE simulado ou verificação rígida
                $existing_lock = $wpdb->get_row($wpdb->prepare(
                    "SELECT * FROM $table WHERE product_id = %d AND expires_at > %s",
                    $product_id,
                    $now
                ));

                if ($existing_lock && $existing_lock->cart_hash !== $current_cart_hash) {
                    throw new \Exception(sprintf(
                        __('A peça única "%s" acabou de ser garantida por outro comprador.', 'todday-modas'),
                        get_the_title($product_id)
                    ));
                }
            }
        }
    }

    public function assign_lock_to_order($order_id, $posted_data, $order) {
        global $wpdb;
        $table = $wpdb->prefix . 'todday_stock_locks';

        foreach ($order->get_items() as $item) {
            $product_id = $item->get_product_id();
            if (get_post_meta($product_id, '_todday_is_unique_piece', true)) {
                $wpdb->update(
                    $table,
                    ['order_id' => $order_id],
                    ['product_id' => $product_id],
                    ['%d'],
                    ['%d']
                );
            }
        }
    }

    public function release_order_lock($order_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'todday_stock_locks';
        $wpdb->delete($table, ['order_id' => $order_id], ['%d']);
    }
}
