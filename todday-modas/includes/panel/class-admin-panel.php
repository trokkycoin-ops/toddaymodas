<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Panel_Admin {
    public static function init() {
        add_action( 'admin_init', array( __CLASS__, 'registra' ) );
    }

    public static function registra() {
        // Roteamento interno do painel
    }
}
