<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! current_user_can( 'manage_options' ) && ! current_user_can( 'tm_panel' ) ) {
    wp_die( esc_html__( 'Acesso nao autorizado.', 'todday-modas' ) );
}
?>
<div class="wrap tm-admin-wrap">
    <h1><?php esc_html_e( 'Relatorios de Vendas', 'todday-modas' ); ?></h1>
    <p><?php esc_html_e( 'Desempenho por categorias e pecas unicas.', 'todday-modas' ); ?></p>
</div>
