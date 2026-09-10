<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Panel_Activity_Log {
    public static function init() {
        add_action( 'init', array( __CLASS__, 'registra' ) );
    }

    public static function registra() {
        // Inicializa observadores
    }

    public static function create_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'tm_activity_logs';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE {$table_name} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned DEFAULT 0,
            action varchar(100) NOT NULL DEFAULT '',
            object_type varchar(50) NOT NULL DEFAULT '',
            object_id bigint(20) unsigned DEFAULT 0,
            details text,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY user_id (user_id)
        ) {$charset_collate};";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta( $sql );
    }

    public static function record( $action, $object_type = '', $object_id = 0, $details = '' ) {
        global $wpdb;
        $table = $wpdb->prefix . 'tm_activity_logs';

        $wpdb->insert(
            $table,
            array(
                'user_id'     => get_current_user_id(),
                'action'      => sanitize_text_field( $action ),
                'object_type' => sanitize_text_field( $object_type ),
                'object_id'   => absint( $object_id ),
                'details'     => sanitize_textarea_field( $details ),
                'created_at'  => current_time( 'mysql' ),
            ),
            array( '%d', '%s', '%s', '%d', '%s', '%s' )
        );
    }
}
