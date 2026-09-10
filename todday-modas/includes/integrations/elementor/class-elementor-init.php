<?php
namespace ToddayModas\Integrations\Elementor;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Registro de Widgets e Categorias para o Elementor & Elementor Pro
 */
class ElementorInit {
    private static $instance = null;

    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {}

    public function init() {
        // Registro da categoria de widgets
        add_action('elementor/elements/categories_registered', [$this, 'register_category']);
        
        // Registro dos widgets próprios
        add_action('elementor/widgets/register', [$this, 'register_widgets']);
    }

    public function register_category($elements_manager) {
        $elements_manager->add_category(
            'todday-modas',
            [
                'title' => __('Todday Modas - Boutique', 'todday-modas'),
                'icon'  => 'fa fa-tshirt',
            ]
        );
    }

    public function register_widgets($widgets_manager) {
        // Carrega classes de widgets quando requisitadas
        // Ex: Todday Hero Slider, Peças Únicas, Vitrine Editorial, etc.
    }
}
