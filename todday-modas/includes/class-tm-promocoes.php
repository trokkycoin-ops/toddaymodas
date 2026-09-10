<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Promocoes {
    public static function init() {
        add_action( 'init', array( __CLASS__, 'registra' ) );
    }

    public static function registra() {
        // Gerenciamento de promocoes e regras de cupons
    }

    public static function get_promocoes_ativas() {
        return get_option( 'tm_active_coupons', array() );
    }
}
