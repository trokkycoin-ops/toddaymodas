<?php
/**
 * View: Relatórios — vendas dos últimos 30 dias (barras CSS, sem libs externas).
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Vendas por dia nos últimos 30 dias.
$inicio = strtotime( '-29 days', strtotime( gmdate( 'Y-m-d' ) ) );
$pedidos = wc_get_orders(
	array(
		'limit'        => -1,
		'status'       => array( 'wc-processing', 'wc-completed' ),
		'date_created' => '>=' . $inicio,
	)
);

$por_dia = array();
for ( $i = 0; $i < 30; $i++ ) {
	$dia = gmdate( 'Y-m-d', strtotime( "+{$i} days", $inicio ) );
	$por_dia[ $dia ] = 0;
}
foreach ( $pedidos as $pedido ) {
	$dia = $pedido->get_date_paid() ? $pedido->get_date_paid()->format( 'Y-m-d' ) : $pedido->get_date_created()->format( 'Y-m-d' );
	if ( isset( $por_dia[ $dia ] ) ) {
		$por_dia[ $dia ] += (float) $pedido->get_total();
	}
}

$total_30d  = array_sum( $por_dia );
$max_dia    = max( 1, max( $por_dia ) );
$num_pedidos = count( $pedidos );
$ticket     = $num_pedidos ? $total_30d / $num_pedidos : 0;

// Top 5 produtos (por unidades vendidas no período).
$top = array();
foreach ( $pedidos as $pedido ) {
	foreach ( $pedido->get_items() as $item ) {
		$pid = $item->get_product_id();
		if ( ! isset( $top[ $pid ] ) ) {
			$top[ $pid ] = array( 'nome' => $item->get_name(), 'qtd' => 0, 'total' => 0 );
		}
		$top[ $pid ]['qtd']   += $item->get_quantity();
		$top[ $pid ]['total'] += (float) $item->get_total();
	}
}
uasort( $top, fn( $a, $b ) => $b['qtd'] <=> $a['qtd'] );
$top = array_slice( $top, 0, 5, true );
?>
<h1><?php esc_html_e( 'Relatórios', 'todday-modas' ); ?></h1>

<div class="tm-cards">
	<div class="tm-card">
		<span class="tm-card-label"><?php esc_html_e( 'Vendas (30 dias)', 'todday-modas' ); ?></span>
		<strong class="tm-card-numero"><?php echo wp_kses_post( wc_price( $total_30d ) ); ?></strong>
	</div>
	<div class="tm-card">
		<span class="tm-card-label"><?php esc_html_e( 'Pedidos (30 dias)', 'todday-modas' ); ?></span>
		<strong class="tm-card-numero"><?php echo esc_html( (string) $num_pedidos ); ?></strong>
	</div>
	<div class="tm-card">
		<span class="tm-card-label"><?php esc_html_e( 'Ticket médio', 'todday-modas' ); ?></span>
		<strong class="tm-card-numero"><?php echo wp_kses_post( wc_price( $ticket ) ); ?></strong>
	</div>
</div>

<h2><?php esc_html_e( 'Vendas por dia (últimos 30 dias)', 'todday-modas' ); ?></h2>
<div class="tm-grafico" role="img" aria-label="<?php esc_attr_e( 'Gráfico de vendas dos últimos 30 dias', 'todday-modas' ); ?>">
	<?php foreach ( $por_dia as $dia => $valor ) : ?>
		<?php $altura = $valor > 0 ? max( 2, (int) round( ( $valor / $max_dia ) * 160 ) ) : 2; ?>
		<div class="tm-barra" style="height:<?php echo esc_attr( (string) $altura ); ?>px;" title="<?php echo esc_attr( gmdate( 'd/m', strtotime( $dia ) ) . ' — ' . wp_strip_all_tags( wc_price( $valor ) ) ); ?>"></div>
	<?php endforeach; ?>
</div>

<h2><?php esc_html_e( 'Top 5 produtos (30 dias)', 'todday-modas' ); ?></h2>
<?php if ( empty( $top ) ) : ?>
	<p><?php esc_html_e( 'Ainda não há vendas no período.', 'todday-modas' ); ?></p>
<?php else : ?>
	<table class="widefat striped">
		<thead>
			<tr>
				<th><?php esc_html_e( 'Produto', 'todday-modas' ); ?></th>
				<th><?php esc_html_e( 'Unidades', 'todday-modas' ); ?></th>
				<th><?php esc_html_e( 'Faturamento', 'todday-modas' ); ?></th>
			</tr>
		</thead>
		<tbody>
			<?php foreach ( $top as $item ) : ?>
				<tr>
					<td><?php echo esc_html( $item['nome'] ); ?></td>
					<td><?php echo esc_html( (string) $item['qtd'] ); ?></td>
					<td><?php echo wp_kses_post( wc_price( $item['total'] ) ); ?></td>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
<?php endif; ?>

<p>
	<a class="button" href="<?php echo esc_url( admin_url( 'admin.php?page=wc-reports' ) ); ?>">
		<?php esc_html_e( 'Abrir relatórios completos do WooCommerce', 'todday-modas' ); ?>
	</a>
</p>
