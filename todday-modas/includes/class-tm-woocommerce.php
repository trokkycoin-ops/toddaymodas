<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_WooCommerce {
    public static function init() {
        add_filter( 'woocommerce_add_to_cart_validation', array( __CLASS__, 'validate_unique_item' ), 10, 3 );
        add_action( 'woocommerce_cart_calculate_fees', array( __CLASS__, 'apply_custom_shipping_rule' ) );
    }

    public static function validate_unique_item( $passed, $product_id, $quantity ) {
        // Assegurar que pecas de brecho sejam adicionadas com quantidade maxima 1
        if ( $quantity > 1 ) {
            wc_add_notice( __( 'Esta peca e unica em nosso acervo e so pode ser adquirida uma unidade.', 'todday-modas' ), 'error' );
            return false;
        }
        return $passed;
    }

    public static function apply_custom_shipping_rule( $cart ) {
        if ( is_admin() && ! defined( 'DOING_AJAX' ) ) { return; }
        // Regra adicional caso configurada
    }
}
