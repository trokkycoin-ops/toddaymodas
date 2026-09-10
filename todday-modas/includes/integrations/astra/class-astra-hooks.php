<?php
namespace ToddayModas\Integrations\Astra;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Integração e Compatibilidade com o Tema Astra / Astra Pro
 */
class AstraHooks {
    private static $instance = null;

    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {}

    public function init() {
        // Alinhamento com o grid e variáveis do Astra sem conflito de CSS
        add_filter('astra_theme_defaults', [$this, 'theme_defaults']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_astra_compat_css'], 20);
    }

    public function theme_defaults($defaults) {
        // Respeita tipografia e espaçamentos globais do Astra
        return $defaults;
    }

    public function enqueue_astra_compat_css() {
        // Enfileira pequenos ajustes de coerência visual se o Astra estiver ativo
    }
}
