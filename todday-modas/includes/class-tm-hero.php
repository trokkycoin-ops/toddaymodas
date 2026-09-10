<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Hero {
    public static function init() {
        add_filter( 'the_content', array( __CLASS__, 'filter_content_hero' ), 8 );
    }

    public static function filter_content_hero( $content ) {
        return $content;
    }

    public static function render_hero_section() {
        ob_start();
        $shop_url = function_exists( 'wc_get_page_id' ) ? get_permalink( wc_get_page_id( 'shop' ) ) : home_url( '/loja' );
        ?>
        <section class="tm-hero-editorial" id="tm-hero">
            <div class="tm-hero-overlay"></div>
            <div class="tm-container tm-hero-inner">
                <div class="tm-hero-content">
                    <span class="tm-hero-kicker"><?php esc_html_e( 'Acervo Selecionado a Dedo', 'todday-modas' ); ?></span>
                    <h1 class="tm-hero-heading"><?php esc_html_e( 'Elegancia Consciente em Cada Detalhe', 'todday-modas' ); ?></h1>
                    <p class="tm-hero-sub"><?php esc_html_e( 'Pecas unicas de marcas consagradas, higienizadas e prontas para viverem novas memorias com voce.', 'todday-modas' ); ?></p>
                    <div class="tm-hero-buttons">
                        <a href="<?php echo esc_url( $shop_url ); ?>" class="tm-btn-primary">
                            <?php esc_html_e( 'Ver Pecas Disponiveis', 'todday-modas' ); ?>
                        </a>
                        <a href="#tm-categorias" class="tm-btn-outline">
                            <?php esc_html_e( 'Explorar Departamentos', 'todday-modas' ); ?>
                        </a>
                    </div>
                </div>
            </div>
        </section>
        <?php
        return ob_get_clean();
    }
}
