<?php
namespace Zaya\AdminPanel;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Log de atividades do painel — ” registra toda acao relevante (quem, o que, quando).
 */
class Activity_Log {

	public static function table() {
		global $wpdb;
		return $wpdb->prefix . 'tm_activity_log';
	}

	public static function ensure_table() {
		global $wpdb;
		$table = self::table();
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) ) === $table ) {
			return;
		}
		$charset = $wpdb->get_charset_collate();
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( "CREATE TABLE {$table} (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			user_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
			user_name VARCHAR(191) NOT NULL DEFAULT '',
			action VARCHAR(64) NOT NULL DEFAULT '',
			object_type VARCHAR(32) NOT NULL DEFAULT '',
			object_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
			details TEXT NULL,
			created_at DATETIME NOT NULL,
			PRIMARY KEY (id),
			KEY created_at (created_at)
		) {$charset};" );
	}

	public static function log( $action, $object_type = '', $object_id = 0, $details = '' ) {
		global $wpdb;
		self::ensure_table();
		$user = wp_get_current_user();
		$wpdb->insert(
			self::table(),
			array(
				'user_id'     => get_current_user_id(),
				'user_name'   => $user->exists() ? $user->display_name : 'sistema',
				'action'      => substr( sanitize_key( $action ), 0, 64 ),
				'object_type' => sanitize_key( $object_type ),
				'object_id'   => (int) $object_id,
				'details'     => wp_kses_post( $details ),
				'created_at'  => current_time( 'mysql' ),
			),
			array( '%d', '%s', '%s', '%s', '%d', '%s', '%s' )
		);

		// Mantem a tabela enxuta: apaga registros muito antigos ocasionalmente.
		if ( mt_rand( 1, 50 ) === 1 ) {
			$wpdb->query( $wpdb->prepare( 'DELETE FROM ' . self::table() . ' WHERE created_at < %s', gmdate( 'Y-m-d H:i:s', strtotime( '-90 days' ) ) ) );
		}
		return (int) $wpdb->insert_id;
	}

	public static function recent( $limit = 20 ) {
		global $wpdb;
		self::ensure_table();
		return $wpdb->get_results(
			$wpdb->prepare( 'SELECT * FROM ' . self::table() . ' ORDER BY id DESC LIMIT %d', min( 100, max( 1, (int) $limit ) ) ),
			ARRAY_A
		);
	}
}
