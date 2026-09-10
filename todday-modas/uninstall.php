<?php
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

global $wpdb;

// Limpeza de options
$options = array(
    'tm_db_version',
    'tm_branding_settings',
    'tm_frete_settings',
    'tm_integracoes_settings',
    'tm_consent_settings',
    'tm_active_coupons',
    'tm_banner_settings'
);

foreach ( $options as $option ) {
    delete_option( $option );
}

// Limpeza de Custom Post Types
$banners = get_posts( array(
    'post_type'      => 'tm_banner',
    'posts_per_page' => -1,
    'post_status'    => 'any',
    'fields'         => 'ids',
) );

foreach ( $banners as $banner_id ) {
    wp_delete_post( $banner_id, true );
}

// Dropar tabelas criadas
$table_consent = $wpdb->prefix . 'tm_consent_logs';
$table_activity = $wpdb->prefix . 'tm_activity_logs';

$wpdb->query( "DROP TABLE IF EXISTS {$table_consent}" );
$wpdb->query( "DROP TABLE IF EXISTS {$table_activity}" );
