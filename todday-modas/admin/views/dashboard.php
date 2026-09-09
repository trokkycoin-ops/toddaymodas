<?php
/**
 * View: Dashboard — visão geral da loja.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Vendas de hoje.
$hoje_inicio = gmdate( 'Y-m-d 00:00:00', strtotime( current_time( 'mysql' ) ) );
$pedidos_hoje = wc_get_orders(
	array(
		'limit'        => -1,
		'status'       => array( 'wc-processing', 'wc-completed' ),
		'date_created' => '>=' . strtotime( $hoje_inicio ),
		'return'       => 'objects',
	)
);
$total_hoje = 0;
foreach ( $pedidos_hoje as $pedido ) {
	$total_hoje += (float) $pedido->get_total();
}

// Pedidos pendentes (aguardando pagamento/processando).
$pendentes = wc_get_orders(
	array(
		'limit'  => -1,
		'status' => array( 'wc-pending', 'wc-on-hold', 'wc-processing' ),
		'return' => 'ids',
	)
);

// Estoque baixo.
$estoque_baixo = wc_get_products(
	array(
		'status'       => 'publish',
		'limit'        => 20,
		'stock_status' => 'instock',
		'orderby'      => 'meta_value_num',
		'meta_key'     => '_stock',
		'order'        => 'ASC',
	)
);
$baixos = array();
foreach ( $estoque_baixo as $p ) {
	if ( $p->managing_stock() && (int) $p->get_stock_quantity() <= 3 ) {
		$baixos[] = $p;
	}
}

// Últimos pedidos.
$ultimos = wc_get_orders(
	array(
		'limit'   => 5,
		'orderby' => 'date',
		'order'   => 'DESC',
	)
);
?>
<h1><?php esc_html_e( 'Todday Modas — Dashboard', 'todday-modas' ); ?></h1>

<div class="tm-cards">
	<div class="tm-card">
		<span class="tm-card-label"><?php esc_html_e( 'Vendas de hoje', 'todday-modas' ); ?></span>
		<strong class="tm-card-numero"><?php echo wp_kses_post( wc_price( $total_hoje ) ); ?></strong>
		<span class="tm-card-detalhe">
			<?php
			/* translators: %d: quantidade de pedidos */
			printf( esc_html( _n( '%d pedido pago', '%d pedidos pagos', count( $pedidos_hoje ), 'todday-modas' ) ), count( $pedidos_hoje ) );
			?>
		</span>
	</div>
	<div class="tm-card">
		<span class="tm-card-label"><?php esc_html_e( 'Pedidos pendentes', 'todday-modas' ); ?></span>
		<strong class="tm-card-numero"><?php echo esc_html( (string) count( $pendentes ) ); ?></strong>
		<span class="tm-card-detalhe"><?php esc_html_e( 'aguardando pagamento ou preparação', 'todday-modas' ); ?></span>
	</div>
	<div class="tm-card">
		<span class="tm-card-label"><?php esc_html_e( 'Estoque baixo', 'todday-modas' ); ?></span>
		<strong class="tm-card-numero"><?php echo esc_html( (string) count( $baixos ) ); ?></strong>
		<span class="tm-card-detalhe"><?php esc_html_e( 'produtos com 3 unidades ou menos', 'todday-modas' ); ?></span>
	</div>
</div>

<h2><?php esc_html_e( 'Últimos pedidos', 'todday-modas' ); ?></h2>
<table class="widefat striped">
	<thead>
		<tr>
			<th><?php esc_html_e( 'Pedido', 'todday-modas' ); ?></th>
			<th><?php esc_html_e( 'Data', 'todday-modas' ); ?></th>
			<th><?php esc_html_e( 'Cliente', 'todday-modas' ); ?></th>
			<th><?php esc_html_e( 'Status', 'todday-modas' ); ?></th>
			<th><?php esc_html_e( 'Total', 'todday-modas' ); ?></th>
		</tr>
	</thead>
	<tbody>
		<?php if ( empty( $ultimos ) ) : ?>
			<tr><td colspan="5"><?php esc_html_e( 'Nenhum pedido ainda — a loja está pronta para a primeira venda.', 'todday-modas' ); ?></td></tr>
		<?php else : ?>
			<?php foreach ( $ultimos as $pedido ) : ?>
				<tr>
					<td>
						<a href="<?php echo esc_url( admin_url( 'post.php?post=' . $pedido->get_id() . '&action=edit' ) ); ?>">
							#<?php echo esc_html( $pedido->get_order_number() ); ?>
						</a>
					</td>
					<td><?php echo esc_html( wc_format_datetime( $pedido->get_date_created(), 'd/m/Y H:i' ) ); ?></td>
					<td><?php echo esc_html( $pedido->get_billing_first_name() . ' ' . $pedido->get_billing_last_name() ); ?></td>
					<td><span class="tm-status tm-status-<?php echo esc_attr( $pedido->get_status() ); ?>"><?php echo esc_html( wc_get_order_status_name( $pedido->get_status() ) ); ?></span></td>
					<td><?php echo wp_kses_post( $pedido->get_formatted_order_total() ); ?></td>
				</tr>
			<?php endforeach; ?>
		<?php endif; ?>
	</tbody>
</table>

<?php if ( ! empty( $baixos ) ) : ?>
	<h2><?php esc_html_e( 'Produtos com estoque baixo', 'todday-modas' ); ?></h2>
	<ul class="tm-lista">
		<?php foreach ( $baixos as $p ) : ?>
			<li>
				<a href="<?php echo esc_url( get_edit_post_link( $p->get_id() ) ); ?>"><?php echo esc_html( $p->get_name() ); ?></a>
				—
				<?php
				/* translators: %d: unidades em estoque */
				printf( esc_html__( '%d em estoque', 'todday-modas' ), (int) $p->get_stock_quantity() );
				?>
			</li>
		<?php endforeach; ?>
	</ul>
<?php endif; ?>
