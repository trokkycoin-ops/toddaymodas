<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Banners {
    public static function init() {
        add_action( 'init', array( __CLASS__, 'registra_cpt' ) );
        add_action( 'rest_api_init', array( __CLASS__, 'registra_rest' ) );
    }

    public static function registra_cpt() {
        $labels = array(
            'name'               => __( 'Banners Todday', 'todday-modas' ),
            'singular_name'      => __( 'Banner', 'todday-modas' ),
            'add_new'            => __( 'Adicionar Banner', 'todday-modas' ),
            'add_new_item'       => __( 'Novo Banner Promocional', 'todday-modas' ),
            'edit_item'          => __( 'Editar Banner', 'todday-modas' ),
            'all_items'          => __( 'Todos os Banners', 'todday-modas' ),
        );

        $args = array(
            'labels'              => $labels,
            'public'              => false,
            'show_ui'             => true,
            'show_in_menu'        => 'todday-modas',
            'supports'            => array( 'title', 'thumbnail' ),
            'show_in_rest'        => true,
        );

        register_post_type( 'tm_banner', $args );
    }

    public static function registra_rest() {
        register_rest_route( 'tm/v1', '/banners', array(
            'methods'             => 'GET',
            'callback'            => array( __CLASS__, 'get_banners_rest' ),
            'permission_callback' => '__return_true',
        ) );
    }

    public static function get_banners_rest() {
        $posts = get_posts( array(
            'post_type'      => 'tm_banner',
            'posts_per_page' => 10,
            'post_status'    => 'publish',
        ) );

        $data = array();
        foreach ( $posts as $p ) {
            $data[] = array(
                'id'    => $p->ID,
                'title' => get_the_title( $p ),
                'image' => get_the_post_thumbnail_url( $p, 'full' ),
            );
        }
        return rest_ensure_response( $data );
    }
}
