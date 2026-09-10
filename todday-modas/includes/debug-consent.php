<?php
/**
 * Diagnóstico de Consentimento LGPD - Todday Modas
 * SOMENTE LEITURA - Proibido DELETE, UPDATE ou INSERT neste arquivo em produção.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Debug_Consent {
    public static function run_diagnostic() {
        if ( ! current_user_can( 'manage_options' ) ) {
            return array( 'status' => 'error', 'message' => 'Sem permissão.' );
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'tm_consent_log';

        $table_exists = $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $table_name ) );
        if ( ! $table_exists ) {
            return array(
                'table_exists' => false,
                'total_records' => 0,
                'recent_logs' => array()
            );
        }

        $total = (int) $wpdb->get_var( "SELECT COUNT(*) FROM `{$table_name}`" ); // phpcs:ignore
        $recent = $wpdb->get_results( "SELECT id, ip_hash, user_agent, consent_categories, created_at FROM `{$table_name}` ORDER BY id DESC LIMIT 10", ARRAY_A ); // phpcs:ignore

        return array(
            'table_exists'  => true,
            'total_records' => $total,
            'recent_logs'   => $recent,
            'db_version'    => get_option( 'tm_db_version', 'não instalada' )
        );
    }
}
