<?php
/**
 * View: Configurações da Marca — logo, cores, fontes.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$logo_id  = (int) TM_Helpers::get( 'tm_logo_id', 0 );
$logo_url = $logo_id ? wp_get_attachment_image_url( $logo_id, 'medium' ) : '';

$cores = array(
	'tm_color_base'       => array( __( 'Linho Clara (base)', 'todday-modas' ), '#FAF8F5', __( 'Fundo principal, cards', 'todday-modas' ) ),
	'tm_color_secundaria' => array( __( 'Expresso (secundária)', 'todday-modas' ), '#23201C', __( 'Textos, header, footer', 'todday-modas' ) ),
	'tm_color_destaque'   => array( __( 'Terracota (destaque)', 'todday-modas' ), '#B4552D', __( 'Botões de compra, badges, hover', 'todday-modas' ) ),
	'tm_color_acento'     => array( __( 'Champagne Envelhecido (acento)', 'todday-modas' ), '#C6A15B', __( 'Detalhes premium, selos', 'todday-modas' ) ),
	'tm_color_neutro'     => array( __( 'Areia (neutro)', 'todday-modas' ), '#F1ECE5', __( 'Fundos alternados, divisores', 'todday-modas' ) ),
);

$fontes_titulo = array( 'Playfair Display', 'Lora', 'Merriweather', 'Cormorant Garamond', 'DM Serif Display' );
$fontes_corpo  = array( 'Inter', 'Poppins', 'Montserrat', 'Nunito Sans', 'Open Sans' );

$font_title_atual = TM_Helpers::get( 'tm_font_title' );
$font_body_atual  = TM_Helpers::get( 'tm_font_body' );
?>
<h1><?php esc_html_e( 'Configurações da Marca', 'todday-modas' ); ?></h1>

<?php if ( isset( $_GET['tm_status'] ) && 'ok' === sanitize_key( wp_unslash( $_GET['tm_status'] ) ) ) : ?>
	<div class="notice notice-success is-dismissible"><p><?php esc_html_e( 'Configurações salvas.', 'todday-modas' ); ?></p></div>
<?php endif; ?>

<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="tm-form">
	<input type="hidden" name="action" value="tm_save_branding" />
	<?php wp_nonce_field( 'tm_save_branding' ); ?>

	<h2><?php esc_html_e( 'Logo', 'todday-modas' ); ?></h2>
	<div class="tm-logo-box">
		<div class="tm-logo-preview">
			<?php if ( $logo_url ) : ?>
				<img src="<?php echo esc_url( $logo_url ); ?>" alt="<?php esc_attr_e( 'Logo atual', 'todday-modas' ); ?>" />
			<?php else : ?>
				<span class="tm-logo-vazio"><?php esc_html_e( 'Nenhuma logo definida', 'todday-modas' ); ?></span>
			<?php endif; ?>
		</div>
		<input type="hidden" name="tm_logo_id" id="tm_logo_id" value="<?php echo esc_attr( (string) $logo_id ); ?>" />
		<button type="button" class="button" id="tm-logo-upload"><?php esc_html_e( 'Escolher imagem', 'todday-modas' ); ?></button>
		<button type="button" class="button" id="tm-logo-remove" <?php disabled( ! $logo_id ); ?>><?php esc_html_e( 'Remover', 'todday-modas' ); ?></button>
	</div>

	<h2><?php esc_html_e( 'Paleta de cores', 'todday-modas' ); ?></h2>
	<p class="description"><?php esc_html_e( 'Estas cores viram variáveis CSS (--tm-*) aplicadas em toda a loja.', 'todday-modas' ); ?></p>
	<table class="form-table">
		<?php foreach ( $cores as $option => $info ) : ?>
			<tr>
				<th scope="row"><label for="<?php echo esc_attr( $option ); ?>"><?php echo esc_html( $info[0] ); ?></label></th>
				<td>
					<input type="color" id="<?php echo esc_attr( $option ); ?>" name="<?php echo esc_attr( $option ); ?>" value="<?php echo esc_attr( TM_Helpers::get( $option ) ); ?>" />
					<p class="description"><?php echo esc_html( $info[2] ); ?></p>
				</td>
			</tr>
		<?php endforeach; ?>
	</table>

	<h2><?php esc_html_e( 'Tipografia', 'todday-modas' ); ?></h2>
	<table class="form-table">
		<tr>
			<th scope="row"><label for="tm_font_title"><?php esc_html_e( 'Fonte dos títulos (serifada)', 'todday-modas' ); ?></label></th>
			<td>
				<select id="tm_font_title" name="tm_font_title">
					<?php foreach ( $fontes_titulo as $f ) : ?>
						<option value="<?php echo esc_attr( $f ); ?>" <?php selected( $font_title_atual, $f ); ?>><?php echo esc_html( $f ); ?></option>
					<?php endforeach; ?>
				</select>
			</td>
		</tr>
		<tr>
			<th scope="row"><label for="tm_font_body"><?php esc_html_e( 'Fonte do corpo (sem serifa)', 'todday-modas' ); ?></label></th>
			<td>
				<select id="tm_font_body" name="tm_font_body">
					<?php foreach ( $fontes_corpo as $f ) : ?>
						<option value="<?php echo esc_attr( $f ); ?>" <?php selected( $font_body_atual, $f ); ?>><?php echo esc_html( $f ); ?></option>
					<?php endforeach; ?>
				</select>
			</td>
		</tr>
	</table>

	<?php submit_button( __( 'Salvar identidade', 'todday-modas' ) ); ?>
</form>
