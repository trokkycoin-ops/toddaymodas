<?php
/**
 * Interface simplificada de cupons sobre WC_Coupon.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Cupons e Promoções: criação rápida + listagem.
 */
class TM_Promocoes {

	/**
	 * Hooks.
	 */
	public static function init() {
		add_action( 'admin_post_tm_coupon_save', array( __CLASS__, 'save' ) );
		add_action( 'admin_post_tm_coupon_delete', array( __CLASS__, 'delete' ) );
	}

	/**
	 * Cria um cupom via WC_Coupon.
	 */
	public static function save() {
		if ( ! current_user_can( TM_Admin_Menu::CAP ) ) {
			wp_die( esc_html__( 'Sem permissão.', 'todday-modas' ) );
		}
		check_admin_referer( 'tm_coupon_save' );

		$code      = isset( $_POST['coupon_code'] ) ? sanitize_text_field( wp_unslash( $_POST['coupon_code'] ) ) : '';
		$type      = isset( $_POST['coupon_type'] ) ? sanitize_key( wp_unslash( $_POST['coupon_type'] ) ) : 'percent';
		$amount    = isset( $_POST['coupon_amount'] ) ? (float) wc_clean( wp_unslash( $_POST['coupon_amount'] ) ) : 0;
		$min_spend = isset( $_POST['coupon_min_spend'] ) ? (float) wc_clean( wp_unslash( $_POST['coupon_min_spend'] ) ) : 0;
		$expiry    = isset( $_POST['coupon_expiry'] ) ? sanitize_text_field( wp_unslash( $_POST['coupon_expiry'] ) ) : '';

		$code = strtoupper( preg_replace( '/[^A-Za-z0-9_-]/', '', $code ) );

		if ( '' === $code || $amount <= 0 || wc_get_coupon_id_by_code( $code ) ) {
			TM_Logger::add( 'warning', __( 'Cupom inválido ou código já existente.', 'todday-modas' ) );
			wp_safe_redirect( admin_url( 'admin.php?page=tm-promocoes&tm_status=error' ) );
			exit;
		}

		if ( ! in_array( $type, array( 'percent', 'fixed_cart' ), true ) ) {
			$type = 'percent';
		}

		$coupon = new WC_Coupon();
		$coupon->set_code( $code );
		$coupon->set_discount_type( $type );
		$coupon->set_amount( $amount );
		if ( $min_spend > 0 ) {
			$coupon->set_minimum_amount( $min_spend );
		}
		if ( $expiry ) {
			$ts = strtotime( $expiry );
			if ( $ts ) {
				$coupon->set_date_expires( $ts );
			}
		}
		$coupon->save();

		TM_Logger::add(
			'info',
			sprintf(
				/* translators: %s: código do cupom */
				__( 'Cupom %s criado.', 'todday-modas' ),
				$code
			)
		);
		wp_safe_redirect( admin_url( 'admin.php?page=tm-promocoes&tm_status=ok' ) );
		exit;
	}

	/**
	 * Exclui um cupom.
	 */
	public static function delete() {
		if ( ! current_user_can( TM_Admin_Menu::CAP ) ) {
			wp_die( esc_html__( 'Sem permissão.', 'todday-modas' ) );
		}
		$coupon_id = isset( $_GET['coupon_id'] ) ? absint( $_GET['coupon_id'] ) : 0;
		check_admin_referer( 'tm_coupon_delete_' . $coupon_id );

		if ( $coupon_id && 'shop_coupon' === get_post_type( $coupon_id ) ) {
			wp_delete_post( $coupon_id, true );
			TM_Logger::add( 'info', __( 'Cupom excluído.', 'todday-modas' ) );
		}
		wp_safe_redirect( admin_url( 'admin.php?page=tm-promocoes&tm_status=ok' ) );
		exit;
	}
}
