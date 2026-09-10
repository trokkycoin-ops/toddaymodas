<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Panel_Rest_Api {
    public static function init() {
        add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
    }

    public static function register_routes() {
        register_rest_route( 'tm/v1', '/stats', array(
            'methods'             => 'GET',
            'callback'            => array( __CLASS__, 'get_stats' ),
            'permission_callback' => array( __CLASS__, 'check_permission' ),
        ) );
    }

    public static function check_permission() {
        return current_user_can( 'manage_options' ) || current_user_can( 'tm_panel' );
    }

    public static function get_stats() {
        $orders_count = function_exists( 'wc_orders_count' ) ? wc_orders_count( 'processing' ) : 0;
        $products_count = wp_count_posts( 'product' );

        return rest_ensure_response( array(
            'pedidos_pendentes' => $orders_count,
            'produtos_ativos'   => isset( $products_count->publish ) ? $products_count->publish : 0,
            'versao'            => TM_VERSION,
        ) );
    }
}
