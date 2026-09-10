<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! current_user_can( 'manage_options' ) ) {
    wp_die( esc_html__( 'Acesso nao autorizado.', 'todday-modas' ) );
}
?>
<div class="wrap tm-admin-wrap">
    <h1><?php esc_html_e( 'Banners Promocionais', 'todday-modas' ); ?></h1>
    <p><?php esc_html_e( 'Utilize o menu lateral Todday Modas > Todos os Banners para criar novos banners.', 'todday-modas' ); ?></p>
</div>
