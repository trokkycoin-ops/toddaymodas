<?php
/**
 * Registro dos 8 painéis administrativos do plugin.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Menu e submenus do wp-admin + handlers de salvamento.
 */
class TM_Admin_Menu {

	const CAP = 'manage_woocommerce';

	/**
	 * Slugs dos painéis na ordem do PRD.
	 *
	 * @return array<string,string> slug => título.
	 */
	public static function panels() {
		return array(
			'tm-dashboard'   => __( 'Dashboard', 'todday-modas' ),
			'tm-branding'    => __( 'Configurações da Marca', 'todday-modas' ),
			'tm-banners'     => __( 'Gestão de Banners', 'todday-modas' ),
			'tm-promocoes'   => __( 'Cupons e Promoções', 'todday-modas' ),
			'tm-relatorios'  => __( 'Relatórios', 'todday-modas' ),
			'tm-frete'       => __( 'Configurações de Frete', 'todday-modas' ),
			'tm-integracoes' => __( 'Integrações', 'todday-modas' ),
			'tm-logs'        => __( 'Logs & Segurança', 'todday-modas' ),
		);
	}

	/**
	 * Registra hooks do admin.
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'register' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'assets' ) );

		// Handlers de salvamento (cada um verifica nonce + capability internamente).
		add_action( 'admin_post_tm_save_branding', array( __CLASS__, 'save_branding' ) );
		add_action( 'admin_post_tm_save_frete', array( __CLASS__, 'save_frete' ) );
		add_action( 'admin_post_tm_clear_logs', array( __CLASS__, 'clear_logs' ) );
	}

	/**
	 * Cria o menu principal e os submenus.
	 */
	public static function register() {
		add_menu_page(
			__( 'Todday Modas', 'todday-modas' ),
			__( 'Todday Modas', 'todday-modas' ),
			self::CAP,
			'tm-dashboard',
			array( __CLASS__, 'render' ),
			'dashicons-store',
			56
		);

		foreach ( self::panels() as $slug => $title ) {
			add_submenu_page(
				'tm-dashboard',
				$title,
				$title,
				self::CAP,
				$slug,
				array( __CLASS__, 'render' )
			);
		}
	}

	/**
	 * Enfileira assets apenas nas telas do plugin.
	 *
	 * @param string $hook_suffix Hook da tela atual.
	 */
	public static function assets( $hook_suffix ) {
		if ( false === strpos( (string) $hook_suffix, 'tm-' ) ) {
			return;
		}

		wp_enqueue_media();

		wp_enqueue_style(
			'tm-admin',
			TM_PLUGIN_URL . 'admin/assets/tm-admin.css',
			array(),
			(string) filemtime( TM_PLUGIN_DIR . 'admin/assets/tm-admin.css' )
		);

		wp_enqueue_script(
			'tm-admin',
			TM_PLUGIN_URL . 'admin/assets/tm-admin.js',
			array(),
			(string) filemtime( TM_PLUGIN_DIR . 'admin/assets/tm-admin.js' ),
			true
		);
	}

	/**
	 * Renderiza a view do painel solicitado (com capability check).
	 */
	public static function render() {
		if ( ! current_user_can( self::CAP ) ) {
			wp_die( esc_html__( 'Você não tem permissão para acessar esta página.', 'todday-modas' ) );
		}

		$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : 'tm-dashboard';
		$slug = preg_replace( '/^tm-/', '', $page );
		$file = TM_PLUGIN_DIR . 'admin/views/' . $slug . '.php';

		if ( ! array_key_exists( $page, self::panels() ) || ! file_exists( $file ) ) {
			wp_die( esc_html__( 'Painel não encontrado.', 'todday-modas' ) );
		}

		echo '<div class="wrap tm-wrap">';
		require $file;
		echo '</div>';
	}

	/**
	 * Redireciona de volta ao painel com flag de status.
	 *
	 * @param string $panel  Slug do painel.
	 * @param string $status Código de status (ok|error|...).
	 */
	private static function redirect_back( $panel, $status = 'ok' ) {
		wp_safe_redirect(
			add_query_arg(
				array( 'page' => $panel, 'tm_status' => sanitize_key( $status ) ),
				admin_url( 'admin.php' )
			)
		);
		exit;
	}

	/**
	 * Guarda comum para handlers admin_post.
	 *
	 * @param string $action Nome da ação do nonce.
	 */
	private static function guard( $action ) {
		if ( ! current_user_can( self::CAP ) ) {
			wp_die( esc_html__( 'Sem permissão.', 'todday-modas' ) );
		}
		check_admin_referer( $action );
	}

	/**
	 * Salva Configurações da Marca (logo, cores, fontes).
	 */
	public static function save_branding() {
		self::guard( 'tm_save_branding' );

		$fields = array(
			'tm_color_base'       => '#FAF8F5',
			'tm_color_secundaria' => '#23201C',
			'tm_color_destaque'   => '#B4552D',
			'tm_color_acento'     => '#C6A15B',
			'tm_color_neutro'     => '#F1ECE5',
		);
		foreach ( $fields as $option => $fallback ) {
			$value = isset( $_POST[ $option ] ) ? wp_unslash( $_POST[ $option ] ) : '';
			update_option( $option, TM_Helpers::sanitize_hex( $value, $fallback ) );
		}

		$font_title = isset( $_POST['tm_font_title'] ) ? sanitize_text_field( wp_unslash( $_POST['tm_font_title'] ) ) : '';
		$font_body  = isset( $_POST['tm_font_body'] ) ? sanitize_text_field( wp_unslash( $_POST['tm_font_body'] ) ) : '';
		if ( $font_title ) {
			update_option( 'tm_font_title', $font_title );
		}
		if ( $font_body ) {
			update_option( 'tm_font_body', $font_body );
		}

		$logo_id = isset( $_POST['tm_logo_id'] ) ? absint( $_POST['tm_logo_id'] ) : 0;
		update_option( 'tm_logo_id', $logo_id );

		TM_Logger::add( 'info', __( 'Configurações da marca atualizadas.', 'todday-modas' ) );
		self::redirect_back( 'tm-branding' );
	}

	/**
	 * Salva configurações de frete da loja (badge de frete grátis).
	 */
	public static function save_frete() {
		self::guard( 'tm_save_frete' );

		$min = isset( $_POST['tm_free_shipping_min'] ) ? (float) wc_clean( wp_unslash( $_POST['tm_free_shipping_min'] ) ) : 0;
		update_option( 'tm_free_shipping_min', max( 0, $min ) );

		TM_Logger::add( 'info', __( 'Configurações de frete atualizadas.', 'todday-modas' ) );
		self::redirect_back( 'tm-frete' );
	}

	/**
	 * Limpa o log de eventos.
	 */
	public static function clear_logs() {
		self::guard( 'tm_clear_logs' );
		TM_Logger::clear();
		self::redirect_back( 'tm-logs' );
	}
}
