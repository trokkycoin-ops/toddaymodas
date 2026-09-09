<?php
/**
 * Criptografia reversível para segredos (Public Key / Access Token do Mercado Pago).
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Classe de criptografia. Chave derivada dos salts únicos do wp-config.
 */
class TM_Crypto {

	const CIPHER = 'aes-256-ctr';

	/**
	 * Deriva a chave simétrica a partir dos salts do WordPress (nunca armazenada).
	 *
	 * @return string Chave binária de 32 bytes.
	 */
	private static function key() {
		return hash( 'sha256', wp_salt( 'auth' ) . wp_salt( 'secure_auth' ), true );
	}

	/**
	 * Criptografa um valor. Retorna base64(iv . ciphertext) ou string vazia.
	 *
	 * @param string $plain Valor em texto puro.
	 * @return string
	 */
	public static function encrypt( $plain ) {
		if ( '' === $plain || null === $plain ) {
			return '';
		}
		$iv_len = openssl_cipher_iv_length( self::CIPHER );
		if ( false === $iv_len ) {
			return '';
		}
		$iv = random_bytes( $iv_len );
		$enc = openssl_encrypt( $plain, self::CIPHER, self::key(), OPENSSL_RAW_DATA, $iv );
		if ( false === $enc ) {
			return '';
		}
		return base64_encode( $iv . $enc );
	}

	/**
	 * Descriptografa um valor gerado por encrypt(). String vazia em caso de falha.
	 *
	 * @param string $encoded Valor armazenado (base64).
	 * @return string
	 */
	public static function decrypt( $encoded ) {
		if ( '' === $encoded || null === $encoded ) {
			return '';
		}
		$raw = base64_decode( $encoded, true );
		if ( false === $raw ) {
			return '';
		}
		$iv_len = openssl_cipher_iv_length( self::CIPHER );
		if ( false === $iv_len || strlen( $raw ) <= $iv_len ) {
			return '';
		}
		$iv  = substr( $raw, 0, $iv_len );
		$dec = openssl_decrypt( substr( $raw, $iv_len ), self::CIPHER, self::key(), OPENSSL_RAW_DATA, $iv );
		return false === $dec ? '' : $dec;
	}

	/**
	 * Exibe versão mascarada do segredo para o admin (4 primeiros + 4 últimos).
	 *
	 * @param string $encoded Valor armazenado.
	 * @return string
	 */
	public static function mask( $encoded ) {
		$plain = self::decrypt( $encoded );
		if ( strlen( $plain ) < 9 ) {
			return $plain ? '••••••' : '';
		}
		return substr( $plain, 0, 4 ) . str_repeat( '•', 8 ) . substr( $plain, -4 );
	}
}
