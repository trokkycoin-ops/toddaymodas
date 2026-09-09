<?php
/**
 * Integrações: Mercado Pago (orquestração do plugin oficial), WhatsApp, e-mail marketing.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Salva credenciais criptografadas e sincroniza com o plugin oficial do Mercado Pago.
 */
class TM_Integrations {

	/**
	 * Hooks.
	 */
	public static function init() {
		add_action( 'admin_post_tm_save_integracoes', array( __CLASS__, 'save' ) );
		add_action( 'admin_post_tm_mp_test', array( __CLASS__, 'test_connection' ) );
	}

	/**
	 * O plugin oficial do Mercado Pago está ativo?
	 *
	 * @return bool
	 */
	public static function mp_plugin_active() {
		return class_exists( 'WoocommerceMercadoPago' ) || defined( 'WC_MERCADOPAGO_VERSION' ) || function_exists( 'woocommerce_mercadopago_init' ) || is_plugin_active( 'woocommerce-mercadopago/woocommerce-mercadopago.php' );
	}

	/**
	 * Salva integrações: credenciais MP (criptografadas), sandbox, WhatsApp, e-mail marketing.
	 */
	public static function save() {
		if ( ! current_user_can( TM_Admin_Menu::CAP ) ) {
			wp_die( esc_html__( 'Sem permissão.', 'todday-modas' ) );
		}
		check_admin_referer( 'tm_save_integracoes' );

		// Sandbox toggle.
		$sandbox = isset( $_POST['tm_mp_sandbox'] ) && 'yes' === $_POST['tm_mp_sandbox'] ? 'yes' : 'no';
		update_option( 'tm_mp_sandbox', $sandbox );

		// Credenciais: só atualiza se vier valor novo (senão mantém a existente).
		$public_key   = isset( $_POST['tm_mp_public_key'] ) ? trim( sanitize_text_field( wp_unslash( $_POST['tm_mp_public_key'] ) ) ) : '';
		$access_token = isset( $_POST['tm_mp_access_token'] ) ? trim( sanitize_text_field( wp_unslash( $_POST['tm_mp_access_token'] ) ) ) : '';

		if ( '' !== $public_key ) {
			update_option( 'tm_mp_public_key', TM_Crypto::encrypt( $public_key ) );
		}
		if ( '' !== $access_token ) {
			if ( strpos( $access_token, 'APP_USR-' ) !== 0 && strpos( $access_token, 'TEST-' ) !== 0 ) {
				TM_Logger::add( 'warning', __( 'Access Token do Mercado Pago com formato inesperado (não começa com APP_USR- ou TEST-).', 'todday-modas' ) );
			}
			update_option( 'tm_mp_access_token', TM_Crypto::encrypt( $access_token ) );
		}

		// WhatsApp + e-mail marketing.
		$whatsapp = isset( $_POST['tm_whatsapp_number'] ) ? TM_Helpers::sanitize_whatsapp( wp_unslash( $_POST['tm_whatsapp_number'] ) ) : '';
		update_option( 'tm_whatsapp_number', $whatsapp );

		$wa_msg = isset( $_POST['tm_whatsapp_message'] ) ? sanitize_text_field( wp_unslash( $_POST['tm_whatsapp_message'] ) ) : '';
		if ( '' !== $wa_msg ) {
			update_option( 'tm_whatsapp_message', $wa_msg );
		}

		$email_mk = isset( $_POST['tm_email_marketing'] ) ? esc_url_raw( wp_unslash( $_POST['tm_email_marketing'] ) ) : '';
		update_option( 'tm_email_marketing', $email_mk );

		// Sincroniza com o plugin oficial do Mercado Pago (se estiver ativo).
		self::sync_mercadopago();

		TM_Logger::add( 'info', __( 'Integrações atualizadas.', 'todday-modas' ) );
		wp_safe_redirect( admin_url( 'admin.php?page=tm-integracoes&tm_status=ok' ) );
		exit;
	}

	/**
	 * Espelha as credenciais nas options do plugin oficial do Mercado Pago.
	 * Normaliza por prefixo: APP_USR-* = produção, TEST-* = teste (não importa o campo).
	 */
	public static function sync_mercadopago() {
		if ( ! self::mp_plugin_active() ) {
			return;
		}

		$public_key   = TM_Crypto::decrypt( (string) get_option( 'tm_mp_public_key', '' ) );
		$access_token = TM_Crypto::decrypt( (string) get_option( 'tm_mp_access_token', '' ) );
		$sandbox      = get_option( 'tm_mp_sandbox', 'yes' );

		update_option( 'checkbox_checkout_test_mode', 'yes' === $sandbox ? 'yes' : 'no' );
		update_option( 'checkout_country', 'BR' );

		if ( '' !== $access_token ) {
			if ( strpos( $access_token, 'APP_USR-' ) === 0 ) {
				update_option( '_mp_access_token_prod', $access_token );
			} elseif ( strpos( $access_token, 'TEST-' ) === 0 ) {
				update_option( '_mp_access_token_test', $access_token );
			}
		}
		if ( '' !== $public_key ) {
			if ( strpos( $public_key, 'APP_USR-' ) === 0 ) {
				update_option( '_mp_public_key_prod', $public_key );
			} elseif ( strpos( $public_key, 'TEST-' ) === 0 ) {
				update_option( '_mp_public_key_test', $public_key );
			}
		}
	}

	/**
	 * Testa a conexão com a API do Mercado Pago (GET /users/me).
	 */
	public static function test_connection() {
		if ( ! current_user_can( TM_Admin_Menu::CAP ) ) {
			wp_die( esc_html__( 'Sem permissão.', 'todday-modas' ) );
		}
		check_admin_referer( 'tm_mp_test' );

		$token = TM_Crypto::decrypt( (string) get_option( 'tm_mp_access_token', '' ) );
		if ( '' === $token ) {
			wp_safe_redirect( admin_url( 'admin.php?page=tm-integracoes&tm_status=mp_no_token' ) );
			exit;
		}

		$response = wp_remote_get(
			'https://api.mercadopago.com/users/me',
			array(
				'timeout' => 15,
				'headers' => array( 'Authorization' => 'Bearer ' . $token ),
			)
		);

		if ( is_wp_error( $response ) ) {
			TM_Logger::add( 'error', __( 'Falha de rede ao testar Mercado Pago.', 'todday-modas' ) );
			wp_safe_redirect( admin_url( 'admin.php?page=tm-integracoes&tm_status=mp_network_error' ) );
			exit;
		}

		$code = wp_remote_retrieve_response_code( $response );
		if ( 200 === $code ) {
			TM_Logger::add( 'info', __( 'Teste de conexão com Mercado Pago: OK.', 'todday-modas' ) );
			wp_safe_redirect( admin_url( 'admin.php?page=tm-integracoes&tm_status=mp_ok' ) );
		} else {
			TM_Logger::add(
				'error',
				sprintf(
					/* translators: %d: código HTTP */
					__( 'Teste de conexão com Mercado Pago falhou (HTTP %d). Verifique o Access Token.', 'todday-modas' ),
					(int) $code
				)
			);
			wp_safe_redirect( admin_url( 'admin.php?page=tm-integracoes&tm_status=mp_auth_error' ) );
		}
		exit;
	}
}
