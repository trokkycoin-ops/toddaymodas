<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Ofertas {
    public static function init() {
        add_action( 'init', array( __CLASS__, 'registra' ) );
    }

    public static function registra() {
        // Regras especiais de ofertas e relampago
    }
}
