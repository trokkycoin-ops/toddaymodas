<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Crypto {
    public static function init() {
        add_action( 'init', array( __CLASS__, 'registra' ) );
    }

    public static function registra() {
        // Inicializacao de modulos de seguranca
    }

    public static function encrypt( $value ) {
        if ( empty( $value ) ) {
            return '';
        }
        $key = wp_salt( 'auth' );
        $iv = substr( wp_salt( 'secure_auth' ), 0, 16 );
        $encrypted = openssl_encrypt( (string) $value, 'AES-256-CBC', $key, 0, $iv );
        return base64_encode( $encrypted );
    }

    public static function decrypt( $value ) {
        if ( empty( $value ) ) {
            return '';
        }
        $key = wp_salt( 'auth' );
        $iv = substr( wp_salt( 'secure_auth' ), 0, 16 );
        $decoded = base64_decode( (string) $value );
        return openssl_decrypt( $decoded, 'AES-256-CBC', $key, 0, $iv );
    }
}
