<?php
namespace ToddayModas\Frontend;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Enqueue Condicional de Estilos e Scripts Otimizados
 */
class Assets {
    private static $instance = null;

    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {}

    public function init() {
        add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts']);
    }

    public function enqueue_scripts() {
        // Enfileira folha de estilo principal isolada do plugin
        wp_enqueue_style(
            'todday-modas-frontend',
            TODDAY_MODAS_PLUGIN_URL . 'assets/css/frontend.css',
            [],
            TODDAY_MODAS_VERSION
        );

        // Scripts específicos de produto único apenas quando necessário
        if (is_product()) {
            wp_enqueue_style(
                'todday-modas-product-page',
                TODDAY_MODAS_PLUGIN_URL . 'assets/css/product-page.css',
                ['todday-modas-frontend'],
                TODDAY_MODAS_VERSION
            );
        }

        // Script global para microinterações e wishlist
        wp_enqueue_script(
            'todday-modas-frontend-js',
            TODDAY_MODAS_PLUGIN_URL . 'assets/js/frontend.js',
            ['jquery'],
            TODDAY_MODAS_VERSION,
            true
        );

        wp_localize_script('todday-modas-frontend-js', 'todday_vars', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce'    => wp_create_nonce('todday_frontend_nonce')
        ]);
    }
}
