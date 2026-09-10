<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<div class="tm-container tm-404-wrap" style="text-align:center; padding: 80px 20px;">
    <h1 style="font-size: 64px; color: var(--tm-primary, #C86D51); margin-bottom: 10px;">404</h1>
    <h2><?php esc_html_e( 'Peca Nao Encontrada', 'todday-modas' ); ?></h2>
    <p><?php esc_html_e( 'Essa peca unica pode ja ter sido adquirida por outra pessoa ou a pagina foi movida.', 'todday-modas' ); ?></p>
    <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="tm-btn-primary" style="display:inline-block; margin-top:20px;">
        <?php esc_html_e( 'Voltar para a Vitrine', 'todday-modas' ); ?>
    </a>
</div>
<?php
get_footer();
