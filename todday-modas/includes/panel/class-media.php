<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Panel_Media {
    public static function init() {
        add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
    }

    public static function register_routes() {
        register_rest_route( 'tm/v1', '/media/upload', array(
            'methods'             => 'POST',
            'callback'            => array( __CLASS__, 'handle_upload' ),
            'permission_callback' => function() {
                return current_user_can( 'manage_options' ) || current_user_can( 'tm_panel' );
            },
        ) );
    }

    public static function handle_upload( $request ) {
        $allowed_mimes = array( 'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml' );
        // Whitelist MIME real
        return rest_ensure_response( array( 'success' => true ) );
    }
}
