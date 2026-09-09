<?php
/**
 * Helpers centrais: defaults de configuração e leitura segura de options.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Utilidades compartilhadas entre os módulos.
 */
class TM_Helpers {

	/**
	 * Todos os defaults do plugin (identidade é a única parte que muda por loja).
	 *
	 * @return array<string,mixed>
	 */
	public static function default_settings() {
		return array(
			'tm_color_base'       => '#FAF8F5',
			'tm_color_secundaria' => '#23201C',
			'tm_color_destaque'   => '#B4552D',
			'tm_color_acento'     => '#C6A15B',
			'tm_color_neutro'     => '#F1ECE5',
			'tm_font_title'       => 'Playfair Display',
			'tm_font_body'        => 'Inter',
			'tm_logo_id'          => 0,
			'tm_whatsapp_number'  => '',
			'tm_whatsapp_message' => __( 'Olá! Vim pelo site da Todday Modas e preciso de ajuda.', 'todday-modas' ),
			'tm_free_shipping_min' => 0,
			'tm_mp_sandbox'       => 'yes',
			'tm_mp_public_key'    => '',
			'tm_mp_access_token'  => '',
			'tm_email_marketing'  => '',
		);
	}

	/**
	 * Lê uma option do plugin com fallback ao default conhecido.
	 *
	 * @param string $key     Nome completo da option (tm_*).
	 * @param mixed  $default Fallback se não houver default registrado.
	 * @return mixed
	 */
	public static function get( $key, $default = '' ) {
		$defaults = self::default_settings();
		if ( array_key_exists( $key, $defaults ) ) {
			$default = $defaults[ $key ];
		}
		return get_option( $key, $default );
	}

	/**
	 * Sanitiza uma cor hexadecimal (#RGB ou #RRGGBB). Retorna fallback se inválida.
	 *
	 * @param string $color    Entrada do usuário.
	 * @param string $fallback Valor de fallback.
	 * @return string
	 */
	public static function sanitize_hex( $color, $fallback = '#FFFFFF' ) {
		$color = sanitize_text_field( (string) $color );
		if ( preg_match( '/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/', $color ) ) {
			return strtoupper( $color );
		}
		return $fallback;
	}

	/**
	 * Sanitiza número de WhatsApp: somente dígitos, com DDI Brasil se faltar.
	 *
	 * @param string $number Entrada do usuário.
	 * @return string
	 */
	public static function sanitize_whatsapp( $number ) {
		$digits = preg_replace( '/\D/', '', (string) $number );
		if ( strlen( $digits ) >= 10 && strlen( $digits ) <= 11 ) {
			$digits = '55' . $digits;
		}
		if ( strlen( $digits ) < 12 || strlen( $digits ) > 13 ) {
			return '';
		}
		return $digits;
	}
}
