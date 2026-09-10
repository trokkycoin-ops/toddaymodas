<?php
/**
 * Plugin Name:       Todday Modas
 * Plugin URI:        https://toddaymodas.oficinas.online
 * Description:       Paineis administrativos, identidade visual e integracoes da loja Todday Modas (brecho de moda circular). Estende o WooCommerce e integra com Elementor e Mercado Pago.
 * Version:           1.0.35
 * Requires at least: 6.4
 * Requires PHP:      8.1
 * Requires Plugins:  woocommerce
 * Author:            Tselak Solutions
 * Author URI:        https://tselak.exemplo.br
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       todday-modas
 * Domain Path:       /languages
 * WC requires at least: 8.0
 * WC tested up to:   11.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'TM_VERSION', '1.0.35' );
define( 'TM_PLUGIN_FILE', __FILE__ );
define( 'TM_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'TM_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'TM_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

// Declarar compatibilidade HPOS (High-Performance Order Storage)
add_action( 'before_woocommerce_init', function() {
    if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
    }
} );

// Includes dos modulos principais
require_once TM_PLUGIN_DIR . 'includes/class-tm-helpers.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-logger.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-crypto.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-admin-menu.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-public.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-hero.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-banners.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-promocoes.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-produto.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-consent.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-integrations.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-ofertas.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-woocommerce.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-elementor.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-panel.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-setup.php';
require_once TM_PLUGIN_DIR . 'includes/data-tabelas-medidas.php';

// Includes do painel de gestao
require_once TM_PLUGIN_DIR . 'includes/panel/class-rest-api.php';
require_once TM_PLUGIN_DIR . 'includes/panel/class-media.php';
require_once TM_PLUGIN_DIR . 'includes/panel/class-agents.php';
require_once TM_PLUGIN_DIR . 'includes/panel/class-activity-log.php';
require_once TM_PLUGIN_DIR . 'includes/panel/class-admin-panel.php';

// Widgets Elementor
require_once TM_PLUGIN_DIR . 'includes/widgets/class-tm-widget-produto-destaque.php';
require_once TM_PLUGIN_DIR . 'includes/widgets/class-tm-widget-grade-categorias.php';
require_once TM_PLUGIN_DIR . 'includes/widgets/class-tm-widget-cupons.php';
require_once TM_PLUGIN_DIR . 'includes/widgets/class-tm-widget-banners.php';
require_once TM_PLUGIN_DIR . 'includes/widgets/class-tm-widget-banner-cta.php';

// Ativacao e Desativacao
register_activation_hook( __FILE__, 'tm_activate' );
register_deactivation_hook( __FILE__, 'tm_deactivate' );

function tm_activate() {
    TM_Consent::check_schema();
    TM_Panel_Activity_Log::create_table();
    flush_rewrite_rules();
}

function tm_deactivate() {
    flush_rewrite_rules();
}

// Inicializacao unificada no hook plugins_loaded
add_action( 'plugins_loaded', 'tm_init' );

function tm_init() {
    load_plugin_textdomain( 'todday-modas', false, dirname( TM_PLUGIN_BASENAME ) . '/languages' );

    if ( ! class_exists( 'WooCommerce' ) ) {
        add_action( 'admin_notices', 'tm_woocommerce_missing_notice' );
        return;
    }

    TM_Helpers::init();
    TM_Logger::init();
    TM_Crypto::init();
    TM_Consent::init();
    TM_Admin_Menu::init();
    TM_Public::init();
    TM_Hero::init();
    TM_Banners::init();
    TM_Promocoes::init();
    TM_Produto::init();
    TM_Integrations::init();
    TM_Ofertas::init();
    TM_WooCommerce::init();
    TM_Elementor::init();
    TM_Panel::init();
    TM_Setup::init();
    TM_Panel_Rest_Api::init();
    TM_Panel_Media::init();
    TM_Panel_Agents::init();
    TM_Panel_Activity_Log::init();
    TM_Panel_Admin::init();
}

function tm_woocommerce_missing_notice() {
    ?>
    <div class="notice notice-error is-dismissible">
        <p><?php esc_html_e( 'O plugin Todday Modas requer o WooCommerce instalado e ativado para operar.', 'todday-modas' ); ?></p>
    </div>
    <?php
}
