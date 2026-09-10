<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Panel {
    public static function init() {
        add_action( 'init', array( __CLASS__, 'registra' ) );
    }

    public static function registra() {
        // Inicializacao do painel de gestao
    }

    public static function can_access_panel() {
        return current_user_can( 'manage_options' ) || current_user_can( 'tm_panel' );
    }
}
