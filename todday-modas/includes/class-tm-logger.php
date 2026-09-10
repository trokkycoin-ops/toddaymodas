<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Logger {
    public static function init() {
        add_action( 'init', array( __CLASS__, 'registra' ) );
    }

    public static function registra() {
        // Inicializa observadores de log
    }

    public static function log( $message, $level = 'info' ) {
        if ( function_exists( 'wc_get_logger' ) ) {
            $logger = wc_get_logger();
            $context = array( 'source' => 'todday-modas' );
            if ( method_exists( $logger, $level ) ) {
                $logger->$level( $message, $context );
                return;
            }
            $logger->info( $message, $context );
        } else {
            error_log( '[Todday Modas] [' . strtoupper( $level ) . '] ' . $message );
        }
    }
}
