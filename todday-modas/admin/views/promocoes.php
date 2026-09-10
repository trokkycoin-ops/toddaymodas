<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! current_user_can( 'manage_options' ) ) {
    wp_die( esc_html__( 'Acesso nao autorizado.', 'todday-modas' ) );
}
?>
<div class="wrap tm-admin-wrap">
    <h1><?php esc_html_e( 'Cupons & Promocoes', 'todday-modas' ); ?></h1>
    <p><?php esc_html_e( 'Gerencie os cupons exibidos no shortcode [tm_cupons].', 'todday-modas' ); ?></p>
</div>
