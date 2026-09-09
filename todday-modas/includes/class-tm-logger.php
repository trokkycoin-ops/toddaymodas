<?php
/**
 * Log de eventos do plugin: erros, tentativas de login falhas, alterações críticas.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Logger simples baseado em option (capped). Nada de dados sensíveis vai para o log.
 */
class TM_Logger {

	const OPTION     = 'tm_logs';
	const MAX_LINES  = 300;

	/**
	 * Registra hooks de observação.
	 */
	public static function init() {
		add_action( 'wp_login_failed', array( __CLASS__, 'log_login_failed' ) );
		add_action( 'activated_plugin', array( __CLASS__, 'log_plugin_toggle' ), 10, 1 );
		add_action( 'deactivated_plugin', array( __CLASS__, 'log_plugin_toggle' ), 10, 1 );
	}

	/**
	 * Adiciona uma linha ao log.
	 *
	 * @param string $level   info|warning|error.
	 * @param string $message Mensagem (sem dados sensíveis).
	 */
	public static function add( $level, $message ) {
		$level   = in_array( $level, array( 'info', 'warning', 'error' ), true ) ? $level : 'info';
		$message = wp_strip_all_tags( (string) $message );
		if ( '' === $message ) {
			return;
		}

		$logs = get_option( self::OPTION, array() );
		if ( ! is_array( $logs ) ) {
			$logs = array();
		}

		$logs[] = array(
			'at'    => current_time( 'mysql' ),
			'level' => $level,
			'msg'   => mb_substr( $message, 0, 300 ),
			'user'  => get_current_user_id(),
		);

		if ( count( $logs ) > self::MAX_LINES ) {
			$logs = array_slice( $logs, -self::MAX_LINES );
		}

		update_option( self::OPTION, $logs, false );
	}

	/**
	 * Loga tentativa de login malsucedida (sem registrar a senha).
	 *
	 * @param string $username Login tentado.
	 */
	public static function log_login_failed( $username ) {
		self::add(
			'warning',
			sprintf(
				/* translators: %s: nome de usuário tentado */
				__( 'Tentativa de login falhou para o usuário "%s".', 'todday-modas' ),
				sanitize_user( (string) $username )
			)
		);
	}

	/**
	 * Loga ativação/desativação de plugins (alteração crítica).
	 *
	 * @param string $plugin Plugin basename.
	 */
	public static function log_plugin_toggle( $plugin ) {
		$acao = doing_action( 'activated_plugin' ) ? __( 'ativado', 'todday-modas' ) : __( 'desativado', 'todday-modas' );
		self::add(
			'info',
			sprintf(
				/* translators: 1: plugin, 2: ação (ativado/desativado) */
				__( 'Plugin %1$s %2$s.', 'todday-modas' ),
				sanitize_text_field( (string) $plugin ),
				$acao
			)
		);
	}

	/**
	 * Retorna o log (mais recentes primeiro).
	 *
	 * @return array
	 */
	public static function get_all() {
		$logs = get_option( self::OPTION, array() );
		return is_array( $logs ) ? array_reverse( $logs ) : array();
	}

	/**
	 * Limpa o log.
	 */
	public static function clear() {
		update_option( self::OPTION, array(), false );
	}
}
