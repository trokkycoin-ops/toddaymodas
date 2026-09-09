<?php
/**
 * View: Logs & Segurança.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$logs   = TM_Logger::get_all();
$status = isset( $_GET['tm_status'] ) ? sanitize_key( wp_unslash( $_GET['tm_status'] ) ) : '';
?>
<h1><?php esc_html_e( 'Logs & Segurança', 'todday-modas' ); ?></h1>

<?php if ( 'ok' === $status ) : ?>
	<div class="notice notice-success is-dismissible"><p><?php esc_html_e( 'Log limpo.', 'todday-modas' ); ?></p></div>
<?php endif; ?>

<div class="tm-dicas-seguranca">
	<h2><?php esc_html_e( 'Checklist de segurança ativo', 'todday-modas' ); ?></h2>
	<ul>
		<li>✅ <?php esc_html_e( 'Credenciais do Mercado Pago criptografadas no banco', 'todday-modas' ); ?></li>
		<li>✅ <?php esc_html_e( 'Todos os formulários protegidos por nonce e permissão de usuário', 'todday-modas' ); ?></li>
		<li>✅ <?php esc_html_e( 'Saídas escapadas e entradas sanitizadas em todo o plugin', 'todday-modas' ); ?></li>
		<li>✅ <?php esc_html_e( 'Acesso direto aos arquivos do plugin bloqueado', 'todday-modas' ); ?></li>
		<li>✅ <?php esc_html_e( 'Compatível com HPOS (armazenamento de pedidos de alto desempenho)', 'todday-modas' ); ?></li>
	</ul>
</div>

<h2><?php esc_html_e( 'Eventos recentes', 'todday-modas' ); ?></h2>
<?php if ( empty( $logs ) ) : ?>
	<p><?php esc_html_e( 'Nenhum evento registrado ainda.', 'todday-modas' ); ?></p>
<?php else : ?>
	<table class="widefat striped">
		<thead>
			<tr>
				<th style="width:160px;"><?php esc_html_e( 'Data/hora', 'todday-modas' ); ?></th>
				<th style="width:90px;"><?php esc_html_e( 'Nível', 'todday-modas' ); ?></th>
				<th><?php esc_html_e( 'Evento', 'todday-modas' ); ?></th>
			</tr>
		</thead>
		<tbody>
			<?php foreach ( $logs as $l ) : ?>
				<tr>
					<td><?php echo esc_html( $l['at'] ); ?></td>
					<td>
						<?php
						$mapa = array(
							'info'    => __( 'Info', 'todday-modas' ),
							'warning' => __( 'Aviso', 'todday-modas' ),
							'error'   => __( 'Erro', 'todday-modas' ),
						);
						$nivel = isset( $mapa[ $l['level'] ] ) ? $mapa[ $l['level'] ] : $mapa['info'];
						?>
						<span class="tm-log tm-log-<?php echo esc_attr( $l['level'] ); ?>"><?php echo esc_html( $nivel ); ?></span>
					</td>
					<td><?php echo esc_html( $l['msg'] ); ?></td>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>

	<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="margin-top:16px;">
		<input type="hidden" name="action" value="tm_clear_logs" />
		<?php wp_nonce_field( 'tm_clear_logs' ); ?>
		<button type="submit" class="button" onclick="return confirm('<?php esc_attr_e( 'Limpar todo o log?', 'todday-modas' ); ?>');"><?php esc_html_e( 'Limpar log', 'todday-modas' ); ?></button>
	</form>
<?php endif; ?>
