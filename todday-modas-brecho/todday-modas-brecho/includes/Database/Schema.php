<?php
namespace ToddayModasBrecho\Database;

if (!defined('ABSPATH')) {
    exit;
}

class Schema {
    public static function create_tables(): void {
        global $wpdb;

        $table_name = $wpdb->prefix . 'todday_activity_log';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE {$table_name} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned DEFAULT 0,
            user_login varchar(60) NOT NULL DEFAULT '',
            action varchar(100) NOT NULL,
            object_type varchar(50) NOT NULL DEFAULT '',
            object_id varchar(50) NOT NULL DEFAULT '',
            meta_data longtext DEFAULT NULL,
            ip_address varchar(45) NOT NULL DEFAULT '',
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY user_id (user_id),
            KEY action (action),
            KEY created_at (created_at)
        ) {$charset_collate};";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
