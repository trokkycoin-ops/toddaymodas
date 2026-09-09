<?php
/**
 * Bootstrap do painel de gestao (fork do painel Zaya, adaptado para Todday).
 *
 * Painel fora do wp-admin: URL /painel-todday/, login com a marca,
 * papel "Gerente Todday" (sem acesso ao wp-admin).
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Painel de gestao dedicado.
 */
class TM_Panel {

	/**
	 * Carrega as classes do painel e instancia o app (somente com WooCommerce).
	 */
	public static function init() {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return;
		}
		$base = TM_PLUGIN_DIR . 'includes/panel/';
		require_once $base . 'class-activity-log.php';
		require_once $base . 'class-media.php';
		require_once $base . 'class-agents.php';
		require_once $base . 'class-rest-api.php';
		require_once $base . 'class-admin-panel.php';

		new \Zaya\AdminPanel\Admin_Panel();
	}

	/**
	 * URL publica do painel.
	 *
	 * @return string
	 */
	public static function url() {
		if ( class_exists( '\Zaya\AdminPanel\Admin_Panel' ) ) {
			return \Zaya\AdminPanel\Admin_Panel::url();
		}
		return home_url( '/painel-todday/' );
	}
}
