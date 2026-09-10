<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Integrations {
    public static function init() {
        add_action( 'init', array( __CLASS__, 'registra' ) );
    }

    public static function registra() {
        // Configuracoes de Mercado Pago e Webhooks
    }

    public static function get_mp_settings() {
        $settings = get_option( 'tm_integracoes_settings', array() );
        return array(
            'public_key'   => isset( $settings['mp_public_key'] ) ? $settings['mp_public_key'] : '',
            'access_token' => isset( $settings['mp_access_token'] ) ? TM_Crypto::decrypt( $settings['mp_access_token'] ) : '',
            'sandbox'      => ! empty( $settings['mp_sandbox'] ),
        );
    }
}
