<?php
namespace ToddayModas\Core;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Procedimentos executados na ativação do plugin
 */
class Activator {
    public static function activate() {
        self::create_tables();
        self::set_default_options();
        self::schedule_cron();
    }

    private static function create_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

        // 1. Tabela de Travas de Estoque Concorrente (Peças Únicas)
        $table_locks = $wpdb->prefix . 'todday_stock_locks';
        $sql_locks = "CREATE TABLE $table_locks (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            product_id bigint(20) unsigned NOT NULL,
            cart_hash varchar(64) NOT NULL,
            user_id bigint(20) unsigned DEFAULT NULL,
            locked_at datetime NOT NULL,
            expires_at datetime NOT NULL,
            order_id bigint(20) unsigned DEFAULT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY idx_product_lock (product_id),
            KEY idx_expires (expires_at)
        ) $charset_collate;";
        dbDelta($sql_locks);

        // 2. Tabela de Banners do Hero
        $table_banners = $wpdb->prefix . 'todday_banners';
        $sql_banners = "CREATE TABLE $table_banners (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            subtitle varchar(255) DEFAULT '',
            complement_text text DEFAULT NULL,
            button_text varchar(100) DEFAULT '',
            button_link varchar(500) DEFAULT '',
            image_desktop varchar(500) NOT NULL,
            image_mobile varchar(500) DEFAULT '',
            overlay_color varchar(50) DEFAULT 'rgba(0,0,0,0.35)',
            text_color varchar(20) DEFAULT '#ffffff',
            position_alignment varchar(50) DEFAULT 'center-left',
            order_index int(11) DEFAULT 0,
            is_active tinyint(1) DEFAULT 1,
            start_date datetime DEFAULT NULL,
            end_date datetime DEFAULT NULL,
            created_at datetime NOT NULL,
            PRIMARY KEY  (id),
            KEY idx_order (order_index)
        ) $charset_collate;";
        dbDelta($sql_banners);

        // 3. Tabela de Favoritos (Wishlist)
        $table_wishlist = $wpdb->prefix . 'todday_wishlist';
        $sql_wishlist = "CREATE TABLE $table_wishlist (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned DEFAULT NULL,
            session_token varchar(64) DEFAULT NULL,
            product_id bigint(20) unsigned NOT NULL,
            added_at datetime NOT NULL,
            PRIMARY KEY  (id),
            KEY idx_user_product (user_id, product_id),
            KEY idx_session_product (session_token, product_id)
        ) $charset_collate;";
        dbDelta($sql_wishlist);
    }

    private static function set_default_options() {
        if (!get_option('todday_modas_version')) {
            update_option('todday_modas_version', TODDAY_MODAS_VERSION);
        }

        if (!get_option('todday_modas_lock_duration_minutes')) {
            update_option('todday_modas_lock_duration_minutes', 15);
        }

        if (!get_option('todday_modas_branding_settings')) {
            update_option('todday_modas_branding_settings', [
                'primary_color'   => '#1A1918',
                'accent_color'    => '#C86D51', // Ocre terracota vintage
                'botanical_color' => '#556B2F', // Verde oliva sustentável
                'light_bg'        => '#FDFBF9', // Off-white seda
                'editorial_font'  => 'Playfair Display',
                'body_font'       => 'Plus Jakarta Sans'
            ]);
        }
    }

    private static function schedule_cron() {
        if (!wp_next_scheduled('todday_clean_expired_locks')) {
            wp_schedule_event(time(), 'hourly', 'todday_clean_expired_locks');
        }
    }
}
