<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Helpers {
    public static function init() {
        add_action( 'init', array( __CLASS__, 'registra' ) );
    }

    public static function registra() {
        // Inicializacao de helpers e defaults
    }

    public static function get_default_settings() {
        return array(
            'primary_color'   => '#C86D51',
            'secondary_color' => '#1A1918',
            'accent_color'    => '#FAF4ED',
            'lock_time'       => 15,
            'whatsapp_number' => '5511999999999',
            'free_shipping'   => 250,
        );
    }

    public static function format_price( $value ) {
        if ( function_exists( 'wc_price' ) ) {
            return wc_price( $value );
        }
        return 'R$ ' . number_format( (float) $value, 2, ',', '.' );
    }

    public static function clean_phone( $phone ) {
        return preg_replace( '/[^0-9]/', '', (string) $phone );
    }

    public static function sanitize_text_field_deep( $data ) {
        if ( is_array( $data ) ) {
            return array_map( array( __CLASS__, 'sanitize_text_field_deep' ), $data );
        }
        return sanitize_text_field( (string) $data );
    }
}
