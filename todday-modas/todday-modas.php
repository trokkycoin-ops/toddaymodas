<?php
/**
 * Plugin Name:       Todday Modas
 * Plugin URI:        https://toddaymodas.oficinas.online
 * Description:       Painéis administrativos, identidade visual e integrações da loja Todday Modas. Estende o WooCommerce e integra com Elementor e Mercado Pago.
 * Version:           1.0.28
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
 * WC tested up to:      11.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Bloqueio de acesso direto.
}

define( 'TM_VERSION', '1.0.28' );
define( 'TM_PLUGIN_FILE', __FILE__ );
define( 'TM_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'TM_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'TM_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Declara compatibilidade com HPOS (High-Performance Order Storage) do WooCommerce.
 */
add_action( 'before_woocommerce_init', function () {
	if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
	}
} );

/**
 * Carrega as classes do plugin.
 */
require_once TM_PLUGIN_DIR . 'includes/class-tm-crypto.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-logger.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-helpers.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-admin-menu.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-banners.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-promocoes.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-produto.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-consent.php';
require_once TM_PLUGIN_DIR . 'includes/debug-consent.php'; // Script de debug para consentimentos
require_once TM_PLUGIN_DIR . 'includes/class-tm-integrations.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-hero.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-ofertas.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-woocommerce.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-setup.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-public.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-elementor.php';
require_once TM_PLUGIN_DIR . 'includes/class-tm-panel.php';

/**
 * Inicialização: cada módulo registra seus próprios hooks no topo, de forma incondicional.
 */
function tm_init() {
	if ( ! class_exists( 'WooCommerce' ) ) {
		add_action( 'admin_notices', function () {
			echo '<div class="notice notice-error"><p>';
			echo esc_html__( 'Todday Modas: o plugin WooCommerce é obrigatório e não está ativo.', 'todday-modas' );
			echo '</p></div>';
		} );
		return;
	}

	TM_Logger::init();
	TM_Admin_Menu::init();
	TM_Banners::init();
	TM_Promocoes::init();
	TM_Produto::init();
	TM_Consent::init();
	TM_Integrations::init();
	TM_Hero::init();
	TM_Ofertas::init();
	TM_WooCommerce::init();
	TM_Setup::init();
	TM_Public::init();
	TM_Elementor::init();
	TM_Panel::init();
}
add_action( 'plugins_loaded', 'tm_init' );

/**
 * Load textdomain.
 */
add_action( 'init', function () {
	load_plugin_textdomain( 'todday-modas', false, dirname( TM_PLUGIN_BASENAME ) . '/languages' );
} );

/**
 * Ao ativar: registra CPT, grava defaults e faz flush de rewrite.
 */
register_activation_hook( __FILE__, function () {
	TM_Banners::register_cpt();
	// Defaults de identidade (somente se ainda não existirem).
	$defaults = TM_Helpers::default_settings();
	foreach ( $defaults as $key => $value ) {
		if ( false === get_option( $key, false ) ) {
			add_option( $key, $value );
		}
	}
	TM_Logger::add( 'info', __( 'Plugin ativado.', 'todday-modas' ) );
	flush_rewrite_rules();
} );

register_deactivation_hook( __FILE__, function () {
	TM_Logger::add( 'info', __( 'Plugin desativado.', 'todday-modas' ) );
	flush_rewrite_rules();
} );
