<?php
namespace ToddayModasBrecho\Elementor;

if (!defined('ABSPATH')) {
    exit;
}

use ToddayModasBrecho\Elementor\Widgets\VitrineWidget;
use ToddayModasBrecho\Elementor\Widgets\CarrinhoWidget;
use ToddayModasBrecho\Elementor\Widgets\CheckoutWidget;
use ToddayModasBrecho\Elementor\Widgets\WhatsAppWidget;

class ElementorInit {
    public static function register(): void {
        add_action('elementor/widgets/register', [self::class, 'register_widgets']);
        add_action('elementor/elements/categories_registered', [self::class, 'add_category']);
    }

    public static function add_category($elements_manager): void {
        $elements_manager->add_category(
            'todday-modas',
            [
                'title' => esc_html__('Todday Modas Brechó', 'todday-modas-brecho'),
                'icon' => 'fa fa-plug',
            ]
        );
    }

    public static function register_widgets($widgets_manager): void {
        if (!class_exists('\Elementor\Widget_Base')) {
            return;
        }

        $widgets_manager->register(new VitrineWidget());
        $widgets_manager->register(new CarrinhoWidget());
        $widgets_manager->register(new CheckoutWidget());
        $widgets_manager->register(new WhatsAppWidget());
    }
}
