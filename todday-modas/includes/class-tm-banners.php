<?php
/**
 * CPT tm_banner + CRUD do painel Gestão de Banners.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Banners da Home/Loja: upload de imagem, link, ordem e agendamento.
 */
class TM_Banners {

	const CPT    = 'tm_banner';
	const NONCE  = 'tm_banner_save';

	/**
	 * Hooks.
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_cpt' ) );
		add_action( 'admin_post_tm_banner_save', array( __CLASS__, 'save' ) );
		add_action( 'admin_post_tm_banner_delete', array( __CLASS__, 'delete' ) );
	}

	/**
	 * CPT privado (sem tela pública própria).
	 */
	public static function register_cpt() {
		register_post_type(
			self::CPT,
			array(
				'labels'       => array(
					'name'          => __( 'Banners', 'todday-modas' ),
					'singular_name' => __( 'Banner', 'todday-modas' ),
				),
				'public'       => false,
				'show_ui'      => false,
				'show_in_menu' => false,
				'supports'     => array( 'title', 'thumbnail' ),
			)
		);
	}

	/**
	 * Salva (cria/edita) um banner. Upload via media_handle_upload com validação de MIME.
	 */
	public static function save() {
		if ( ! current_user_can( TM_Admin_Menu::CAP ) ) {
			wp_die( esc_html__( 'Sem permissão.', 'todday-modas' ) );
		}
		check_admin_referer( self::NONCE );

		$banner_id = isset( $_POST['banner_id'] ) ? absint( $_POST['banner_id'] ) : 0;
		$titulo    = isset( $_POST['banner_title'] ) ? sanitize_text_field( wp_unslash( $_POST['banner_title'] ) ) : '';
		$link      = isset( $_POST['banner_link'] ) ? esc_url_raw( wp_unslash( $_POST['banner_link'] ) ) : '';
		$ordem     = isset( $_POST['banner_order'] ) ? absint( $_POST['banner_order'] ) : 0;
		$inicio    = isset( $_POST['banner_start'] ) ? sanitize_text_field( wp_unslash( $_POST['banner_start'] ) ) : '';
		$fim       = isset( $_POST['banner_end'] ) ? sanitize_text_field( wp_unslash( $_POST['banner_end'] ) ) : '';

		if ( '' === $titulo ) {
			TM_Logger::add( 'warning', __( 'Tentativa de salvar banner sem título.', 'todday-modas' ) );
			wp_safe_redirect( admin_url( 'admin.php?page=tm-banners&tm_status=error' ) );
			exit;
		}

		$postarr = array(
			'post_type'   => self::CPT,
			'post_title'  => $titulo,
			'post_status' => 'publish',
			'menu_order'  => $ordem,
		);
		if ( $banner_id && get_post_type( $banner_id ) === self::CPT ) {
			$postarr['ID'] = $banner_id;
		}
		$banner_id = wp_insert_post( wp_slash( $postarr ), true );
		if ( is_wp_error( $banner_id ) ) {
			TM_Logger::add( 'error', __( 'Falha ao salvar banner.', 'todday-modas' ) );
			wp_safe_redirect( admin_url( 'admin.php?page=tm-banners&tm_status=error' ) );
			exit;
		}

		// Upload da imagem (opcional na edição).
		if ( ! empty( $_FILES['banner_image']['name'] ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';

			$attachment_id = media_handle_upload( 'banner_image', $banner_id );
			if ( is_wp_error( $attachment_id ) ) {
				TM_Logger::add( 'warning', __( 'Upload de imagem de banner rejeitado.', 'todday-modas' ) );
			} else {
				set_post_thumbnail( $banner_id, $attachment_id );
			}
		}

		update_post_meta( $banner_id, '_tm_banner_link', $link );
		update_post_meta( $banner_id, '_tm_banner_start', self::sanitize_datetime( $inicio ) );
		update_post_meta( $banner_id, '_tm_banner_end', self::sanitize_datetime( $fim ) );

		TM_Logger::add( 'info', __( 'Banner salvo.', 'todday-modas' ) );
		wp_safe_redirect( admin_url( 'admin.php?page=tm-banners&tm_status=ok' ) );
		exit;
	}

	/**
	 * Exclui um banner (e a imagem destacada).
	 */
	public static function delete() {
		if ( ! current_user_can( TM_Admin_Menu::CAP ) ) {
			wp_die( esc_html__( 'Sem permissão.', 'todday-modas' ) );
		}
		$banner_id = isset( $_GET['banner_id'] ) ? absint( $_GET['banner_id'] ) : 0;
		check_admin_referer( 'tm_banner_delete_' . $banner_id );

		if ( $banner_id && get_post_type( $banner_id ) === self::CPT ) {
			wp_delete_post( $banner_id, true );
			TM_Logger::add( 'info', __( 'Banner excluído.', 'todday-modas' ) );
		}
		wp_safe_redirect( admin_url( 'admin.php?page=tm-banners&tm_status=ok' ) );
		exit;
	}

	/**
	 * Normaliza datetime-local ("2026-09-01T14:30") para "Y-m-d H:i:s" ou vazio.
	 *
	 * @param string $raw Entrada do usuário.
	 * @return string
	 */
	private static function sanitize_datetime( $raw ) {
		$raw = str_replace( 'T', ' ', trim( $raw ) );
		if ( '' === $raw ) {
			return '';
		}
		$ts = strtotime( $raw );
		return $ts ? gmdate( 'Y-m-d H:i:s', $ts ) : '';
	}

	/**
	 * Lista banners (mais recentes/ordem).
	 *
	 * @return WP_Post[]
	 */
	public static function get_all() {
		return get_posts(
			array(
				'post_type'      => self::CPT,
				'posts_per_page' => 50,
				'orderby'        => array( 'menu_order' => 'ASC', 'date' => 'DESC' ),
			)
		);
	}

	/**
	 * Banners ativos AGORA (respeitando agendamento), ordenados.
	 *
	 * @return WP_Post[]
	 */
	public static function get_active() {
		$now    = current_time( 'mysql' );
		$active = array();
		foreach ( self::get_all() as $banner ) {
			$start = get_post_meta( $banner->ID, '_tm_banner_start', true );
			$end   = get_post_meta( $banner->ID, '_tm_banner_end', true );
			if ( $start && $now < $start ) {
				continue;
			}
			if ( $end && $now > $end ) {
				continue;
			}
			$active[] = $banner;
		}
		return $active;
	}
}
