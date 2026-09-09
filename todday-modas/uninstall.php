<?php
/**
 * Desinstalação do Todday Modas: remove options e dados do plugin.
 *
 * Os CPTs de banner e seus attachments são removidos. As páginas do
 * WooCommerce e os cupons NÃO são removidos (pertencem ao WooCommerce).
 *
 * @package Todday_Modas
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Options do plugin (prefixo tm_).
$options = array(
	'tm_color_base',
	'tm_color_secundaria',
	'tm_color_destaque',
	'tm_color_acento',
	'tm_color_neutro',
	'tm_font_title',
	'tm_font_body',
	'tm_logo_id',
	'tm_whatsapp_number',
	'tm_whatsapp_message',
	'tm_free_shipping_min',
	'tm_mp_sandbox',
	'tm_mp_public_key',
	'tm_mp_access_token',
	'tm_email_marketing',
	'tm_logs',
	'tm_version_saved',
);
foreach ( $options as $option ) {
	delete_option( $option );
}

// Banners (CPT) + imagens destacadas associadas.
$banners = get_posts(
	array(
		'post_type'      => 'tm_banner',
		'posts_per_page' => -1,
		'post_status'    => 'any',
		'fields'         => 'ids',
	)
);
foreach ( $banners as $banner_id ) {
	$thumb_id = get_post_thumbnail_id( $banner_id );
	if ( $thumb_id ) {
		wp_delete_attachment( $thumb_id, true );
	}
	wp_delete_post( $banner_id, true );
}
