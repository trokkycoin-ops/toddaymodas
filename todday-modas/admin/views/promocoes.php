<?php
/**
 * View: Cupons e Promoções.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$cupons = get_posts(
	array(
		'post_type'      => 'shop_coupon',
		'posts_per_page' => 50,
		'post_status'    => 'publish',
		'orderby'        => 'date',
		'order'          => 'DESC',
	)
);

$status = isset( $_GET['tm_status'] ) ? sanitize_key( wp_unslash( $_GET['tm_status'] ) ) : '';
?>
<h1><?php esc_html_e( 'Cupons e Promoções', 'todday-modas' ); ?></h1>

<?php if ( 'ok' === $status ) : ?>
	<div class="notice notice-success is-dismissible"><p><?php esc_html_e( 'Cupom salvo.', 'todday-modas' ); ?></p></div>
<?php elseif ( 'error' === $status ) : ?>
	<div class="notice notice-error is-dismissible"><p><?php esc_html_e( 'Não foi possível criar o cupom (código vazio, valor inválido ou código já existente).', 'todday-modas' ); ?></p></div>
<?php endif; ?>

<div class="tm-duas-colunas">
	<div>
		<h2><?php esc_html_e( 'Criar cupom', 'todday-modas' ); ?></h2>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="tm-form">
			<input type="hidden" name="action" value="tm_coupon_save" />
			<?php wp_nonce_field( 'tm_coupon_save' ); ?>

			<table class="form-table">
				<tr>
					<th><label for="coupon_code"><?php esc_html_e( 'Código', 'todday-modas' ); ?></label></th>
					<td><input type="text" id="coupon_code" name="coupon_code" class="regular-text" placeholder="BEMVINDA10" required /></td>
				</tr>
				<tr>
					<th><label for="coupon_type"><?php esc_html_e( 'Tipo de desconto', 'todday-modas' ); ?></label></th>
					<td>
						<select id="coupon_type" name="coupon_type">
							<option value="percent"><?php esc_html_e( 'Porcentagem (%)', 'todday-modas' ); ?></option>
							<option value="fixed_cart"><?php esc_html_e( 'Valor fixo (R$)', 'todday-modas' ); ?></option>
						</select>
					</td>
				</tr>
				<tr>
					<th><label for="coupon_amount"><?php esc_html_e( 'Valor do desconto', 'todday-modas' ); ?></label></th>
					<td><input type="number" id="coupon_amount" name="coupon_amount" min="0.01" step="0.01" required /></td>
				</tr>
				<tr>
					<th><label for="coupon_min_spend"><?php esc_html_e( 'Compra mínima (opcional)', 'todday-modas' ); ?></label></th>
					<td><input type="number" id="coupon_min_spend" name="coupon_min_spend" min="0" step="0.01" placeholder="0.00" /></td>
				</tr>
				<tr>
					<th><label for="coupon_expiry"><?php esc_html_e( 'Válido até (opcional)', 'todday-modas' ); ?></label></th>
					<td><input type="date" id="coupon_expiry" name="coupon_expiry" /></td>
				</tr>
			</table>

			<?php submit_button( __( 'Criar cupom', 'todday-modas' ) ); ?>
		</form>
	</div>

	<div>
		<h2><?php esc_html_e( 'Cupons ativos', 'todday-modas' ); ?></h2>
		<?php if ( empty( $cupons ) ) : ?>
			<p><?php esc_html_e( 'Nenhum cupom criado ainda.', 'todday-modas' ); ?></p>
		<?php else : ?>
			<table class="widefat striped">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Código', 'todday-modas' ); ?></th>
						<th><?php esc_html_e( 'Desconto', 'todday-modas' ); ?></th>
						<th><?php esc_html_e( 'Validade', 'todday-modas' ); ?></th>
						<th><?php esc_html_e( 'Ações', 'todday-modas' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( $cupons as $post_cupom ) : ?>
						<?php
						$coupon = new WC_Coupon( $post_cupom->ID );
						$valor  = 'percent' === $coupon->get_discount_type()
							? $coupon->get_amount() . '%'
							: wc_price( $coupon->get_amount() );
						$expira = $coupon->get_date_expires() ? $coupon->get_date_expires()->date( 'd/m/Y' ) : __( 'Sem validade', 'todday-modas' );
						$delete_url = wp_nonce_url(
							admin_url( 'admin-post.php?action=tm_coupon_delete&coupon_id=' . $coupon->get_id() ),
							'tm_coupon_delete_' . $coupon->get_id()
						);
						?>
						<tr>
							<td><strong><?php echo esc_html( $coupon->get_code() ); ?></strong></td>
							<td><?php echo wp_kses_post( $valor ); ?></td>
							<td><?php echo esc_html( $expira ); ?></td>
							<td>
								<a href="<?php echo esc_url( $delete_url ); ?>" onclick="return confirm('<?php esc_attr_e( 'Excluir este cupom?', 'todday-modas' ); ?>');"><?php esc_html_e( 'Excluir', 'todday-modas' ); ?></a>
							</td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		<?php endif; ?>
	</div>
</div>
