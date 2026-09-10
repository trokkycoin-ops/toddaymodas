<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! current_user_can( 'manage_options' ) && ! current_user_can( 'tm_panel' ) ) {
    wp_die( esc_html__( 'Acesso nao autorizado.', 'todday-modas' ) );
}
?>
<div class="wrap tm-admin-wrap">
    <h1><?php esc_html_e( 'Todday Modas - Painel de Controle', 'todday-modas' ); ?></h1>
    <div class="tm-admin-card">
        <h2><?php esc_html_e( 'Status do Sistema', 'todday-modas' ); ?></h2>
        <p><?php esc_html_e( 'Versao instalada: ', 'todday-modas' ); ?><strong><?php echo esc_html( TM_VERSION ); ?></strong></p>
        <p><?php esc_html_e( 'Shortcode principal da Home:', 'todday-modas' ); ?> <code>[tm_home]</code></p>
    </div>
</div>
