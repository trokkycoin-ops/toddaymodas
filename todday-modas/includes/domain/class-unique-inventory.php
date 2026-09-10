<?php
namespace ToddayModas\Domain;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Gestão de Estoque e Concorrência de Peças Únicas para o Brechó
 */
class UniqueInventory {
    private static $instance = null;

    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {}

    public function init() {
        // Validação ao tentar adicionar ao carrinho
        add_filter('woocommerce_add_to_cart_validation', [$this, 'validate_add_to_cart'], 10, 3);
        
        // Bloqueio temporário (soft lock) ao adicionar ao carrinho
        add_action('woocommerce_add_to_cart', [$this, 'lock_item_in_cart'], 10, 6);
        
        // Remoção da trava quando o item sai do carrinho
        add_action('woocommerce_cart_item_removed', [$this, 'release_item_from_cart'], 10, 2);
        
        // Limpeza de travas expiradas via WP-Cron
        add_action('todday_clean_expired_locks', [$this, 'purge_expired_locks']);
        
        // Forçar quantidade máxima = 1 para peças únicas
        add_filter('woocommerce_is_sold_individually', [$this, 'force_sold_individually'], 10, 2);
    }

    /**
     * Verifica se o produto é classificado como peça única
     */
    public function is_unique_piece($product_id) {
        return (bool) get_post_meta($product_id, '_todday_is_unique_piece', true);
    }

    /**
     * Impede que múltiplos clientes adicionem a mesma peça única ao mesmo tempo
     */
    public function validate_add_to_cart($passed, $product_id, $quantity) {
        if (!$this->is_unique_piece($product_id)) {
            return $passed;
        }

        $current_cart_hash = $this->get_current_cart_hash();
        $lock = $this->get_active_lock($product_id);

        if ($lock && $lock->cart_hash !== $current_cart_hash) {
            wc_add_notice(
                __('Esta peça é única e está temporariamente reservada no carrinho de outro cliente. Aguarde alguns instantes.', 'todday-modas'),
                'error'
            );
            return false;
        }

        return $passed;
    }

    /**
     * Registra o lock de 15 minutos na tabela customizada
     */
    public function lock_item_in_cart($cart_item_key, $product_id, $quantity, $variation_id, $variation, $cart_item_data) {
        if (!$this->is_unique_piece($product_id)) {
            return;
        }

        global $wpdb;
        $table = $wpdb->prefix . 'todday_stock_locks';
        $cart_hash = $this->get_current_cart_hash();
        $user_id = get_current_user_id() ?: null;
        $minutes = (int) get_option('todday_modas_lock_duration_minutes', 15);
        $expires = gmdate('Y-m-d H:i:s', time() + ($minutes * 60));

        $wpdb->replace(
            $table,
            [
                'product_id' => $product_id,
                'cart_hash'  => $cart_hash,
                'user_id'    => $user_id,
                'locked_at'  => current_time('mysql', 1),
                'expires_at' => $expires,
            ],
            ['%d', '%s', '%d', '%s', '%s']
        );
    }

    /**
     * Libera o lock quando o usuário remove o item do carrinho
     */
    public function release_item_from_cart($cart_item_key, $cart) {
        $item = $cart->removed_cart_contents[$cart_item_key] ?? null;
        if (!$item) return;

        $product_id = $item['product_id'];
        if (!$this->is_unique_piece($product_id)) return;

        global $wpdb;
        $table = $wpdb->prefix . 'todday_stock_locks';
        $cart_hash = $this->get_current_cart_hash();

        $wpdb->delete($table, [
            'product_id' => $product_id,
            'cart_hash'  => $cart_hash,
        ], ['%d', '%s']);
    }

    /**
     * Busca o lock ativo se ainda não tiver expirado
     */
    public function get_active_lock($product_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'todday_stock_locks';
        $now = current_time('mysql', 1);

        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE product_id = %d AND expires_at > %s",
            $product_id,
            $now
        ));
    }

    /**
     * Remove travas cujo tempo limite expirou
     */
    public function purge_expired_locks() {
        global $wpdb;
        $table = $wpdb->prefix . 'todday_stock_locks';
        $now = current_time('mysql', 1);

        $wpdb->query($wpdb->prepare(
            "DELETE FROM $table WHERE expires_at <= %s AND order_id IS NULL",
            $now
        ));
    }

    public function force_sold_individually($sold_individually, $product) {
        if ($this->is_unique_piece($product->get_id())) {
            return true;
        }
        return $sold_individually;
    }

    private function get_current_cart_hash() {
        if (WC()->session) {
            return md5(WC()->session->get_customer_id());
        }
        return md5($_SERVER['REMOTE_ADDR'] ?? 'guest');
    }
}
