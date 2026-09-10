<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! current_user_can( 'manage_options' ) ) {
    wp_die( esc_html__( 'Acesso nao autorizado.', 'todday-modas' ) );
}
?>
<div class="wrap tm-admin-wrap">
    <h1><?php esc_html_e( 'Auditoria & Logs', 'todday-modas' ); ?></h1>
    <p><?php esc_html_e( 'Registro de atividades do sistema e consentimento LGPD.', 'todday-modas' ); ?></p>
</div>
