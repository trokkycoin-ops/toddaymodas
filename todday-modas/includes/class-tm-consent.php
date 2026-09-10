<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Consent {
    public static function init() {
        add_action( 'init', array( __CLASS__, 'check_schema' ) );
        add_action( 'wp_footer', array( __CLASS__, 'render_consent_banner' ) );
        add_action( 'wp_ajax_tm_save_consent', array( __CLASS__, 'ajax_save_consent' ) );
        add_action( 'wp_ajax_nopriv_tm_save_consent', array( __CLASS__, 'ajax_save_consent' ) );
    }

    public static function check_schema() {
        $current_version = get_option( 'tm_db_version', '0' );
        if ( version_compare( $current_version, TM_VERSION, '<' ) ) {
            self::create_tables();
            update_option( 'tm_db_version', TM_VERSION );
        }
    }

    public static function create_tables() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'tm_consent_logs';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE {$table_name} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned DEFAULT 0,
            ip_address varchar(45) NOT NULL DEFAULT '',
            consent_type varchar(50) NOT NULL DEFAULT 'all',
            status varchar(20) NOT NULL DEFAULT 'accepted',
            user_agent text,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY ip_address (ip_address)
        ) {$charset_collate};";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta( $sql );
    }

    public static function render_consent_banner() {
        ?>
        <div id="tm-lgpd-banner" class="tm-consent-banner" style="display:none;">
            <div class="tm-consent-inner">
                <p>
                    <?php esc_html_e( 'Utilizamos cookies e tecnologia analitica para aprimorar sua experiencia editorial e garantir a seguranca das reservas de pecas unicas.', 'todday-modas' ); ?>
                </p>
                <div class="tm-consent-buttons">
                    <button id="tm-accept-consent" class="tm-btn-consent-accept"><?php esc_html_e( 'Aceitar e Continuar', 'todday-modas' ); ?></button>
                </div>
            </div>
        </div>
        <?php
    }

    public static function ajax_save_consent() {
        check_ajax_referer( 'tm_public_nonce', 'nonce' );

        global $wpdb;
        $table = $wpdb->prefix . 'tm_consent_logs';
        $ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
        $ua = isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ) : '';

        $wpdb->insert(
            $table,
            array(
                'user_id'      => get_current_user_id(),
                'ip_address'   => $ip,
                'consent_type' => 'all',
                'status'       => 'accepted',
                'user_agent'   => $ua,
                'created_at'   => current_time( 'mysql' ),
            ),
            array( '%d', '%s', '%s', '%s', '%s', '%s' )
        );

        wp_send_json_success( array( 'message' => __( 'Consentimento registrado.', 'todday-modas' ) ) );
    }
}
