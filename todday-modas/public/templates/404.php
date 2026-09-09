<?php
/**
 * Template 404 da marca: mensagem amigável + CTA para voltar à loja.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>
<main id="primary" class="site-main">
	<section class="tm-404">
		<p class="tm-404-codigo">404</p>
		<h1><?php esc_html_e( 'Ops! Essa página saiu de linha.', 'todday-modas' ); ?></h1>
		<p><?php esc_html_e( 'O endereço que você procurou não existe mais — mas a coleção nova continua esperando por você.', 'todday-modas' ); ?></p>
		<a class="tm-404-cta" href="<?php echo esc_url( get_permalink( wc_get_page_id( 'shop' ) ) ); ?>">
			<?php esc_html_e( 'Voltar para a loja', 'todday-modas' ); ?>
		</a>
	</section>
</main>
<?php
get_footer();
