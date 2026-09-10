<?php
namespace ToddayModas\Core;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Orquestrador central do plugin Todday Modas (Singleton)
 */
class Plugin {
    private static $instance = null;

    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {}

    public function init() {
        $this->init_domain();
        $this->init_integrations();

        if (is_admin()) {
            $this->init_admin();
        } else {
            $this->init_frontend();
        }
    }

    private function init_domain() {
        \ToddayModas\Domain\UniqueInventory::instance()->init();
        \ToddayModas\Domain\Condition::instance()->init();
        \ToddayModas\Domain\Measurements::instance()->init();
    }

    private function init_integrations() {
        // Integração WooCommerce (HPOS, Estoque, Checkout)
        \ToddayModas\Integrations\WooCommerce\WcSetup::instance()->init();
        \ToddayModas\Integrations\WooCommerce\WcCheckout::instance()->init();

        // Integração Mercado Pago Gateway
        \ToddayModas\Integrations\MercadoPago\MpGateway::register();

        // Integração Elementor (se o Elementor estiver ativo)
        if (did_action('elementor/loaded')) {
            \ToddayModas\Integrations\Elementor\ElementorInit::instance()->init();
        }

        // Integração Astra Theme
        add_action('after_setup_theme', function () {
            if (defined('ASTRA_THEME_VERSION')) {
                \ToddayModas\Integrations\Astra\AstraHooks::instance()->init();
            }
        });
    }

    private function init_admin() {
        \ToddayModas\Admin\ProductMetabox::instance()->init();
        \ToddayModas\Admin\BannerManager::instance()->init();
        \ToddayModas\Admin\Settings::instance()->init();
    }

    private function init_frontend() {
        \ToddayModas\Frontend\Assets::instance()->init();
        \ToddayModas\Frontend\ProductSingle::instance()->init();
        \ToddayModas\Frontend\Homepage::instance()->init();
    }
}
