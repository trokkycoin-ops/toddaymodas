<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Elementor {
    public static function init() {
        add_action( 'elementor/elements/categories_registered', array( __CLASS__, 'register_category' ) );
        add_action( 'elementor/widgets/register', array( __CLASS__, 'register_widgets' ) );
    }

    public static function register_category( $elements_manager ) {
        $elements_manager->add_category(
            'todday-modas',
            array(
                'title' => __( 'Todday Modas', 'todday-modas' ),
                'icon'  => 'fa fa-plug',
            )
        );
    }

    public static function register_widgets( $widgets_manager ) {
        if ( class_exists( 'TM_Widget_Produto_Destaque' ) ) {
            $widgets_manager->register( new TM_Widget_Produto_Destaque() );
        }
        if ( class_exists( 'TM_Widget_Grade_Categorias' ) ) {
            $widgets_manager->register( new TM_Widget_Grade_Categorias() );
        }
        if ( class_exists( 'TM_Widget_Cupons' ) ) {
            $widgets_manager->register( new TM_Widget_Cupons() );
        }
        if ( class_exists( 'TM_Widget_Banners' ) ) {
            $widgets_manager->register( new TM_Widget_Banners() );
        }
        if ( class_exists( 'TM_Widget_Banner_CTA' ) ) {
            $widgets_manager->register( new TM_Widget_Banner_CTA() );
        }
    }
}
