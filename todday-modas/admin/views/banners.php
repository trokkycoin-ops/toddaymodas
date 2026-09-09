<?php
/**
 * View: Gestão de Banners — criar, listar, excluir, agendar.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$banners   = TM_Banners::get_all();
$editando  = null;
if ( isset( $_GET['editar'] ) ) {
	$candidate = get_post( absint( $_GET['editar'] ) );
	if ( $candidate && TM_Banners::CPT === $candidate->post_type ) {
		$editando = $candidate;
	}
}

$status = isset( $_GET['tm_status'] ) ? sanitize_key( wp_unslash( $_GET['tm_status'] ) ) : '';
?>
<h1><?php esc_html_e( 'Gestão de Banners', 'todday-modas' ); ?></h1>

<?php if ( 'ok' === $status ) : ?>
	<div class="notice notice-success is-dismissible"><p><?php esc_html_e( 'Banner salvo.', 'todday-modas' ); ?></p></div>
<?php elseif ( 'error' === $status ) : ?>
	<div class="notice notice-error is-dismissible"><p><?php esc_html_e( 'Não foi possível salvar. Verifique o título e tente novamente.', 'todday-modas' ); ?></p></div>
<?php endif; ?>

<div class="tm-duas-colunas">
	<div>
		<h2><?php echo $editando ? esc_html__( 'Editar banner', 'todday-modas' ) : esc_html__( 'Novo banner', 'todday-modas' ); ?></h2>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" enctype="multipart/form-data" class="tm-form">
			<input type="hidden" name="action" value="tm_banner_save" />
			<input type="hidden" name="banner_id" value="<?php echo esc_attr( $editando ? (string) $editando->ID : '0' ); ?>" />
			<?php wp_nonce_field( TM_Banners::NONCE ); ?>

			<table class="form-table">
				<tr>
					<th><label for="banner_title"><?php esc_html_e( 'Título (uso interno)', 'todday-modas' ); ?></label></th>
					<td><input type="text" id="banner_title" name="banner_title" class="regular-text" required value="<?php echo esc_attr( $editando ? $editando->post_title : '' ); ?>" /></td>
				</tr>
				<tr>
					<th><label for="banner_image"><?php esc_html_e( 'Imagem', 'todday-modas' ); ?></label></th>
					<td>
						<input type="file" id="banner_image" name="banner_image" accept="image/*" />
						<?php if ( $editando && has_post_thumbnail( $editando->ID ) ) : ?>
							<p class="description"><?php esc_html_e( 'Já existe imagem — envie outra apenas para substituir.', 'todday-modas' ); ?></p>
							<?php echo get_the_post_thumbnail( $editando->ID, 'medium', array( 'class' => 'tm-banner-preview' ) ); ?>
						<?php endif; ?>
					</td>
				</tr>
				<tr>
					<th><label for="banner_link"><?php esc_html_e( 'Link (para onde o banner aponta)', 'todday-modas' ); ?></label></th>
					<td><input type="url" id="banner_link" name="banner_link" class="regular-text" placeholder="<?php echo esc_attr( home_url( '/loja' ) ); ?>" value="<?php echo esc_attr( $editando ? get_post_meta( $editando->ID, '_tm_banner_link', true ) : '' ); ?>" /></td>
				</tr>
				<tr>
					<th><label for="banner_order"><?php esc_html_e( 'Ordem (menor aparece primeiro)', 'todday-modas' ); ?></label></th>
					<td><input type="number" id="banner_order" name="banner_order" min="0" step="1" value="<?php echo esc_attr( $editando ? (string) $editando->menu_order : '0' ); ?>" /></td>
				</tr>
				<tr>
					<th><label for="banner_start"><?php esc_html_e( 'Exibir a partir de', 'todday-modas' ); ?></label></th>
					<td>
						<input type="datetime-local" id="banner_start" name="banner_start"
							value="<?php echo esc_attr( $editando && get_post_meta( $editando->ID, '_tm_banner_start', true ) ? gmdate( 'Y-m-d\TH:i', strtotime( get_post_meta( $editando->ID, '_tm_banner_start', true ) ) ) : '' ); ?>" />
						<p class="description"><?php esc_html_e( 'Deixe vazio para exibir imediatamente.', 'todday-modas' ); ?></p>
					</td>
				</tr>
				<tr>
					<th><label for="banner_end"><?php esc_html_e( 'Exibir até', 'todday-modas' ); ?></label></th>
					<td>
						<input type="datetime-local" id="banner_end" name="banner_end"
							value="<?php echo esc_attr( $editando && get_post_meta( $editando->ID, '_tm_banner_end', true ) ? gmdate( 'Y-m-d\TH:i', strtotime( get_post_meta( $editando->ID, '_tm_banner_end', true ) ) ) : '' ); ?>" />
						<p class="description"><?php esc_html_e( 'Deixe vazio para não expirar.', 'todday-modas' ); ?></p>
					</td>
				</tr>
			</table>

			<?php submit_button( $editando ? __( 'Salvar alterações', 'todday-modas' ) : __( 'Publicar banner', 'todday-modas' ) ); ?>
			<?php if ( $editando ) : ?>
				<a class="button" href="<?php echo esc_url( admin_url( 'admin.php?page=tm-banners' ) ); ?>"><?php esc_html_e( 'Cancelar edição', 'todday-modas' ); ?></a>
			<?php endif; ?>
		</form>
	</div>

	<div>
		<h2><?php esc_html_e( 'Banners cadastrados', 'todday-modas' ); ?></h2>
		<?php if ( empty( $banners ) ) : ?>
			<p><?php esc_html_e( 'Nenhum banner cadastrado ainda.', 'todday-modas' ); ?></p>
		<?php else : ?>
			<table class="widefat striped">
				<thead>
					<tr>
						<th></th>
						<th><?php esc_html_e( 'Título', 'todday-modas' ); ?></th>
						<th><?php esc_html_e( 'Ordem', 'todday-modas' ); ?></th>
						<th><?php esc_html_e( 'Agendamento', 'todday-modas' ); ?></th>
						<th><?php esc_html_e( 'Ações', 'todday-modas' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( $banners as $banner ) : ?>
						<?php
						$inicio = get_post_meta( $banner->ID, '_tm_banner_start', true );
						$fim    = get_post_meta( $banner->ID, '_tm_banner_end', true );
						$agenda = array();
						if ( $inicio ) {
							/* translators: %s: data de início */
							$agenda[] = sprintf( __( 'de %s', 'todday-modas' ), gmdate( 'd/m/Y H:i', strtotime( $inicio ) ) );
						}
						if ( $fim ) {
							/* translators: %s: data de fim */
							$agenda[] = sprintf( __( 'até %s', 'todday-modas' ), gmdate( 'd/m/Y H:i', strtotime( $fim ) ) );
						}
						$delete_url = wp_nonce_url(
							admin_url( 'admin-post.php?action=tm_banner_delete&banner_id=' . $banner->ID ),
							'tm_banner_delete_' . $banner->ID
						);
						?>
						<tr>
							<td><?php echo get_the_post_thumbnail( $banner->ID, array( 60, 60 ) ); ?></td>
							<td><?php echo esc_html( $banner->post_title ); ?></td>
							<td><?php echo esc_html( (string) $banner->menu_order ); ?></td>
							<td><?php echo $agenda ? esc_html( implode( ' ', $agenda ) ) : esc_html__( 'Sempre visível', 'todday-modas' ); ?></td>
							<td>
								<a href="<?php echo esc_url( admin_url( 'admin.php?page=tm-banners&editar=' . $banner->ID ) ); ?>"><?php esc_html_e( 'Editar', 'todday-modas' ); ?></a>
								|
								<a href="<?php echo esc_url( $delete_url ); ?>" onclick="return confirm('<?php esc_attr_e( 'Excluir este banner?', 'todday-modas' ); ?>');"><?php esc_html_e( 'Excluir', 'todday-modas' ); ?></a>
							</td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		<?php endif; ?>
	</div>
</div>
