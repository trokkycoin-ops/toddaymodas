<?php
/**
 * Integração com Elementor: registra os 3 widgets da marca.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registra widgets próprios no Elementor (se estiver ativo).
 */
class TM_Elementor {

	/**
	 * Hooks.
	 */
	public static function init() {
		// Elementor >= 3.5 usa elementor/widgets/register.
		add_action( 'elementor/widgets/register', array( __CLASS__, 'register_widgets' ) );
	}

	/**
	 * Instancia os widgets.
	 *
	 * @param \Elementor\Widgets_Manager $widgets_manager Gerenciador.
	 */
	public static function register_widgets( $widgets_manager ) {
		require_once TM_PLUGIN_DIR . 'includes/widgets/class-tm-widget-produto-destaque.php';
		require_once TM_PLUGIN_DIR . 'includes/widgets/class-tm-widget-banner-cta.php';
		require_once TM_PLUGIN_DIR . 'includes/widgets/class-tm-widget-grade-categorias.php';
		require_once TM_PLUGIN_DIR . 'includes/widgets/class-tm-widget-cupons.php';
		require_once TM_PLUGIN_DIR . 'includes/widgets/class-tm-widget-banners.php';

		$widgets_manager->register( new TM_Widget_Produto_Destaque() );
		$widgets_manager->register( new TM_Widget_Banner_CTA() );
		$widgets_manager->register( new TM_Widget_Grade_Categorias() );
		$widgets_manager->register( new TM_Widget_Cupons() );
		$widgets_manager->register( new TM_Widget_Banners() );
	}
}
