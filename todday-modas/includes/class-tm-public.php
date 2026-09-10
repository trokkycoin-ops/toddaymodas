<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Public {
    public static function init() {
        add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_assets' ) );
        add_action( 'wp_head', array( __CLASS__, 'inject_css_variables' ) );
        add_action( 'wp_footer', array( __CLASS__, 'render_floating_whatsapp' ) );
        add_action( 'wp_footer', array( __CLASS__, 'render_professional_footer' ) );

        // Registro de TODOS os shortcodes obrigatorios
        add_shortcode( 'tm_home', array( __CLASS__, 'render_home' ) );
        add_shortcode( 'tm_hero', array( __CLASS__, 'render_hero' ) );
        add_shortcode( 'tm_categorias', array( __CLASS__, 'render_categorias' ) );
        add_shortcode( 'tm_banners', array( __CLASS__, 'render_banners' ) );
        add_shortcode( 'tm_cupons', array( __CLASS__, 'render_cupons' ) );
        add_shortcode( 'tm_kids', array( __CLASS__, 'render_kids' ) );
        add_shortcode( 'tm_contato', array( __CLASS__, 'render_contato' ) );

        add_filter( 'script_loader_tag', array( __CLASS__, 'filter_script_module' ), 10, 3 );
    }

    public static function filter_script_module( $tag, $handle, $src ) {
        if ( 'tm-front-script' === $handle ) {
            return '<script type="module" src="' . esc_url( $src ) . '"></script>';
        }
        return $tag;
    }

    public static function enqueue_assets() {
        $css_file = TM_PLUGIN_DIR . 'public/assets/css/tm-front.css';
        $js_file  = TM_PLUGIN_DIR . 'public/assets/js/tm-front.js';

        $css_ver = file_exists( $css_file ) ? filemtime( $css_file ) : TM_VERSION;
        $js_ver  = file_exists( $js_file ) ? filemtime( $js_file ) : TM_VERSION;

        wp_enqueue_style( 'tm-front-style', TM_PLUGIN_URL . 'public/assets/css/tm-front.css', array(), $css_ver );
        wp_enqueue_script( 'tm-front-script', TM_PLUGIN_URL . 'public/assets/js/tm-front.js', array(), $js_ver, true );

        wp_localize_script( 'tm-front-script', 'tm_front_params', array(
            'ajax_url' => admin_url( 'admin-ajax.php' ),
            'nonce'    => wp_create_nonce( 'tm_public_nonce' ),
            'is_wp'    => true,
        ) );
    }

    public static function inject_css_variables() {
        $settings = get_option( 'tm_branding_settings', TM_Helpers::get_default_settings() );
        $primary   = ! empty( $settings['primary_color'] ) ? sanitize_hex_color( $settings['primary_color'] ) : '#C86D51';
        $secondary = ! empty( $settings['secondary_color'] ) ? sanitize_hex_color( $settings['secondary_color'] ) : '#1A1918';
        $accent    = ! empty( $settings['accent_color'] ) ? sanitize_hex_color( $settings['accent_color'] ) : '#FAF4ED';
        ?>
        <style id="tm-css-vars">
            :root {
                --tm-primary: <?php echo esc_attr( $primary ); ?>;
                --tm-secondary: <?php echo esc_attr( $secondary ); ?>;
                --tm-accent: <?php echo esc_attr( $accent ); ?>;
                --tm-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            }
        </style>
        <?php
    }

    public static function render_home( $atts ) {
        $atts = shortcode_atts( array(
            'show_hero'       => 'yes',
            'show_categorias' => 'yes',
            'show_banners'    => 'yes',
            'show_cupons'     => 'yes',
            'show_kids'       => 'yes',
        ), $atts, 'tm_home' );

        ob_start();
        ?>
        <div class="tm-home-master-container" id="tm-home">
            <div id="tm-storefront-root">
                <div class="tm-storefront-loading" style="text-align:center; padding: 60px 20px; color: #78716c;">
                    <p style="font-size: 18px; font-weight: 600; color: #1A1918; margin-bottom: 8px;">Todday Modas &bull; Boutique & Brechó</p>
                    <p style="font-size: 14px;">Carregando vitrine e acervo editorial...</p>
                </div>
            </div>
            <noscript>
                <div class="tm-noscript-content">
                    <?php
                    if ( 'yes' === $atts['show_hero'] ) {
                        echo do_shortcode( '[tm_hero]' );
                    }
                    if ( 'yes' === $atts['show_categorias'] ) {
                        echo do_shortcode( '[tm_categorias]' );
                    }
                    if ( 'yes' === $atts['show_banners'] ) {
                        echo do_shortcode( '[tm_banners]' );
                    }
                    if ( 'yes' === $atts['show_cupons'] ) {
                        echo do_shortcode( '[tm_cupons]' );
                    }
                    if ( 'yes' === $atts['show_kids'] ) {
                        echo do_shortcode( '[tm_kids]' );
                    }
                    ?>
                </div>
            </noscript>
        </div>
        <script>
            window.TM_WORDPRESS = true;
        </script>
        <?php
        return ob_get_clean();
    }

    public static function render_hero( $atts ) {
        return TM_Hero::render_hero_section();
    }

    public static function render_categorias( $atts ) {
        ob_start();
        $terms = get_terms( array(
            'taxonomy'   => 'product_cat',
            'hide_empty' => false,
            'number'     => 6,
        ) );
        ?>
        <section class="tm-section tm-categorias-section" id="tm-categorias">
            <div class="tm-container">
                <div class="tm-section-header">
                    <span class="tm-badge"><?php esc_html_e( 'Curadoria por Departamento', 'todday-modas' ); ?></span>
                    <h2 class="tm-section-title"><?php esc_html_e( 'Explore Nossas Categorias', 'todday-modas' ); ?></h2>
                </div>
                <div class="tm-grid-categorias">
                    <?php if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) : ?>
                        <?php foreach ( $terms as $term ) : ?>
                            <a href="<?php echo esc_url( get_term_link( $term ) ); ?>" class="tm-card-categoria">
                                <div class="tm-card-cat-content">
                                    <h3 class="tm-cat-title"><?php echo esc_html( $term->name ); ?></h3>
                                    <span class="tm-cat-count"><?php echo esc_html( $term->count ); ?> <?php esc_html_e( 'pecas unicas', 'todday-modas' ); ?></span>
                                </div>
                            </a>
                        <?php endforeach; ?>
                    <?php else : ?>
                        <div class="tm-empty-box"><p><?php esc_html_e( 'Categorias sendo atualizadas.', 'todday-modas' ); ?></p></div>
                    <?php endif; ?>
                </div>
            </div>
        </section>
        <?php
        return ob_get_clean();
    }

    public static function render_banners( $atts ) {
        ob_start();
        ?>
        <section class="tm-section tm-banners-section" id="tm-banners">
            <div class="tm-container">
                <div class="tm-banner-editorial">
                    <div class="tm-banner-text">
                        <span class="tm-badge-light"><?php esc_html_e( 'Moda Circular Premium', 'todday-modas' ); ?></span>
                        <h2><?php esc_html_e( 'Roupas com Historia & Qualidade Selecionada', 'todday-modas' ); ?></h2>
                        <p><?php esc_html_e( 'Cada peca passa por higienizacao profissional e rigoroso controle de autenticidade.', 'todday-modas' ); ?></p>
                        <a href="<?php echo esc_url( get_permalink( wc_get_page_id( 'shop' ) ) ); ?>" class="tm-btn-primary">
                            <?php esc_html_e( 'Ver Colecao Completa', 'todday-modas' ); ?>
                        </a>
                    </div>
                </div>
            </div>
        </section>
        <?php
        return ob_get_clean();
    }

    public static function render_cupons( $atts ) {
        ob_start();
        $cupons = get_option( 'tm_active_coupons', array(
            array( 'codigo' => 'BEMVINDA10', 'desconto' => '10% OFF', 'descricao' => 'Na primeira compra no brecho' ),
            array( 'codigo' => 'CIRCULAR15', 'desconto' => '15% OFF', 'descricao' => 'Em pedidos acima de R$ 200' )
        ) );
        ?>
        <section class="tm-section tm-cupons-section" id="tm-cupons">
            <div class="tm-container">
                <div class="tm-section-header">
                    <span class="tm-badge"><?php esc_html_e( 'Descontos Ativos', 'todday-modas' ); ?></span>
                    <h2 class="tm-section-title"><?php esc_html_e( 'Cupons Exclusivos', 'todday-modas' ); ?></h2>
                </div>
                <div class="tm-grid-cupons">
                    <?php foreach ( $cupons as $cupom ) : ?>
                        <div class="tm-cupom-ticket">
                            <div class="tm-cupom-top">
                                <span class="tm-cupom-discount"><?php echo esc_html( $cupom['desconto'] ); ?></span>
                                <p class="tm-cupom-desc"><?php echo esc_html( $cupom['descricao'] ); ?></p>
                            </div>
                            <div class="tm-cupom-bottom">
                                <code class="tm-cupom-code"><?php echo esc_html( $cupom['codigo'] ); ?></code>
                                <button class="tm-btn-copy" data-code="<?php echo esc_attr( $cupom['codigo'] ); ?>">
                                    <?php esc_html_e( 'Copiar', 'todday-modas' ); ?>
                                </button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>
        <?php
        return ob_get_clean();
    }

    public static function render_kids( $atts ) {
        ob_start();
        ?>
        <section class="tm-section tm-kids-section" id="tm-kids">
            <div class="tm-container">
                <div class="tm-kids-highlight">
                    <div class="tm-kids-info">
                        <span class="tm-badge-kids"><?php esc_html_e( 'Moda Infantil Sustentavel', 'todday-modas' ); ?></span>
                        <h2><?php esc_html_e( 'Espaco Todday Kids', 'todday-modas' ); ?></h2>
                        <p><?php esc_html_e( 'Pecas infantis semi-novas em estado de novas para vestir com estilo e sustentabilidade.', 'todday-modas' ); ?></p>
                        <a href="<?php echo esc_url( home_url( '/categoria-produto/infantil/' ) ); ?>" class="tm-btn-kids">
                            <?php esc_html_e( 'Descobrir Pecas Kids', 'todday-modas' ); ?>
                        </a>
                    </div>
                </div>
            </div>
        </section>
        <?php
        return ob_get_clean();
    }

    public static function render_contato( $atts ) {
        ob_start();
        $nonce = wp_create_nonce( 'tm_contato_action' );
        ?>
        <div class="tm-contato-box" id="tm-contato">
            <h3><?php esc_html_e( 'Fale Conosco', 'todday-modas' ); ?></h3>
            <form id="tm-form-contato" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
                <input type="hidden" name="action" value="tm_submit_contato" />
                <input type="hidden" name="tm_contato_nonce" value="<?php echo esc_attr( $nonce ); ?>" />
                <div class="tm-form-row">
                    <label><?php esc_html_e( 'Seu Nome:', 'todday-modas' ); ?></label>
                    <input type="text" name="nome" required class="tm-input" />
                </div>
                <div class="tm-form-row">
                    <label><?php esc_html_e( 'Seu WhatsApp / E-mail:', 'todday-modas' ); ?></label>
                    <input type="text" name="contato" required class="tm-input" />
                </div>
                <div class="tm-form-row">
                    <label><?php esc_html_e( 'Mensagem ou Duvida sobre Peca:', 'todday-modas' ); ?></label>
                    <textarea name="mensagem" required class="tm-textarea" rows="4"></textarea>
                </div>
                <button type="submit" class="tm-btn-primary"><?php esc_html_e( 'Enviar Mensagem', 'todday-modas' ); ?></button>
            </form>
        </div>
        <?php
        return ob_get_clean();
    }

    public static function render_floating_whatsapp() {
        $settings = get_option( 'tm_branding_settings', TM_Helpers::get_default_settings() );
        $number = ! empty( $settings['whatsapp_number'] ) ? TM_Helpers::clean_phone( $settings['whatsapp_number'] ) : '5511999999999';
        $link = 'https://wa.me/' . esc_attr( $number ) . '?text=' . rawurlencode( 'Ola! Vim pelo site da Todday Modas e gostaria de tirar uma duvida.' );
        ?>
        <a href="<?php echo esc_url( $link ); ?>" target="_blank" rel="noopener noreferrer" class="tm-floating-whatsapp" aria-label="<?php esc_attr_e( 'Atendimento WhatsApp', 'todday-modas' ); ?>">
            <span class="tm-wa-text"><?php esc_html_e( 'Atendimento', 'todday-modas' ); ?></span>
            <svg class="tm-wa-icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/>
            </svg>
        </a>
        <?php
    }

    public static function render_professional_footer() {
        ?>
        <div class="tm-site-footer-bar">
            <div class="tm-container tm-footer-content">
                <div class="tm-footer-brand">
                    <strong><?php esc_html_e( 'Todday Modas', 'todday-modas' ); ?></strong>
                    <span><?php esc_html_e( 'Moda Circular & Brecho Boutique', 'todday-modas' ); ?></span>
                </div>
                <div class="tm-footer-security">
                    <span><?php esc_html_e( 'Ambiente 100% Seguro com Certificado SSL', 'todday-modas' ); ?></span>
                </div>
            </div>
        </div>
        <?php
    }
}
