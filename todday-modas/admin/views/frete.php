<?php
/**
 * View: Configurações de Frete — wrapper amigável das zonas do WooCommerce.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$zonas  = WC_Shipping_Zones::get_zones();
$min    = (float) TM_Helpers::get( 'tm_free_shipping_min', 0 );
$status = isset( $_GET['tm_status'] ) ? sanitize_key( wp_unslash( $_GET['tm_status'] ) ) : '';
?>
<h1><?php esc_html_e( 'Configurações de Frete', 'todday-modas' ); ?></h1>

<?php if ( 'ok' === $status ) : ?>
	<div class="notice notice-success is-dismissible"><p><?php esc_html_e( 'Configurações salvas.', 'todday-modas' ); ?></p></div>
<?php endif; ?>

<div class="tm-duas-colunas">
	<div>
		<h2><?php esc_html_e( 'Frete grátis', 'todday-modas' ); ?></h2>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="tm-form">
			<input type="hidden" name="action" value="tm_save_frete" />
			<?php wp_nonce_field( 'tm_save_frete' ); ?>
			<table class="form-table">
				<tr>
					<th><label for="tm_free_shipping_min"><?php esc_html_e( 'Frete grátis acima de (R$)', 'todday-modas' ); ?></label></th>
					<td>
						<input type="number" id="tm_free_shipping_min" name="tm_free_shipping_min" min="0" step="0.01" value="<?php echo esc_attr( $min ? (string) $min : '' ); ?>" placeholder="199.90" />
						<p class="description"><?php esc_html_e( 'Exibe um aviso na loja e no carrinho. Deixe 0 ou vazio para desativar o aviso.', 'todday-modas' ); ?></p>
					</td>
				</tr>
			</table>
			<?php submit_button( __( 'Salvar', 'todday-modas' ) ); ?>
		</form>
	</div>

	<div>
		<h2><?php esc_html_e( 'Zonas de entrega', 'todday-modas' ); ?></h2>
		<?php if ( empty( $zonas ) ) : ?>
			<p><?php esc_html_e( 'Nenhuma zona de entrega configurada.', 'todday-modas' ); ?></p>
		<?php else : ?>
			<table class="widefat striped">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Zona', 'todday-modas' ); ?></th>
						<th><?php esc_html_e( 'Métodos', 'todday-modas' ); ?></th>
						<th><?php esc_html_e( 'Ações', 'todday-modas' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( $zonas as $zona ) : ?>
						<?php
						$zone    = new WC_Shipping_Zone( $zona['zone_id'] );
						$methods = $zone->get_shipping_methods( true );
						$nomes   = array();
						foreach ( $methods as $m ) {
							$nomes[] = $m->get_title();
						}
						?>
						<tr>
							<td><?php echo esc_html( $zona['zone_name'] ); ?></td>
							<td><?php echo $nomes ? esc_html( implode( ', ', $nomes ) ) : esc_html__( 'Nenhum método ativo', 'todday-modas' ); ?></td>
							<td>
								<a href="<?php echo esc_url( admin_url( 'admin.php?page=wc-settings&tab=shipping&zone_id=' . (int) $zona['zone_id'] ) ); ?>">
									<?php esc_html_e( 'Configurar', 'todday-modas' ); ?>
								</a>
							</td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		<?php endif; ?>
		<p>
			<a class="button button-primary" href="<?php echo esc_url( admin_url( 'admin.php?page=wc-settings&tab=shipping' ) ); ?>">
				<?php esc_html_e( 'Gerenciar todas as zonas', 'todday-modas' ); ?>
			</a>
		</p>
	</div>
</div>
