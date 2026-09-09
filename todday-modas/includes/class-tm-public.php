<?php
/**
 * Camada pública: variáveis CSS no wp_head, assets, botão de WhatsApp, template 404.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Front-end do plugin.
 */
class TM_Public {

	/**
	 * Hooks.
	 */
	public static function init() {
		add_action( 'wp_head', array( __CLASS__, 'css_variables' ), 1 );
		add_action( 'wp_head', array( __CLASS__, 'head_meta' ), 2 );
		add_action( 'wp_head', array( __CLASS__, 'seo_head' ), 5 );
		add_action( 'template_redirect', array( __CLASS__, 'no_cache_html' ), 1 );
		add_action( 'wp_body_open', array( __CLASS__, 'top_strip' ) );
		add_action( 'init', array( __CLASS__, 'serve_pwa_files' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'assets' ) );
		add_action( 'wp_footer', array( __CLASS__, 'whatsapp_button' ) );
		add_action( 'wp_footer', array( __CLASS__, 'app_bar' ), 20 );
		add_action( 'wp_footer', array( __CLASS__, 'popup_cupom' ), 30 );
		add_action( 'wp_footer', array( __CLASS__, 'consent_banner' ), 40 );
		add_action( 'wp_footer', array( __CLASS__, 'seo_jsonld_store' ), 1 );
		add_action( 'admin_init', array( __CLASS__, 'upgrade' ) );
		add_filter( '404_template', array( __CLASS__, 'template_404' ) );
		add_filter( 'image_editor_output_format', array( __CLASS__, 'prefer_webp' ) );
		add_shortcode( 'tm_cupons', array( __CLASS__, 'shortcode_cupons' ) );
		add_shortcode( 'tm_categorias', array( __CLASS__, 'shortcode_categorias' ) );
		add_shortcode( 'tm_banners', array( __CLASS__, 'shortcode_banners' ) );
		add_shortcode( 'tm_kids', array( __CLASS__, 'shortcode_kids' ) );
		add_shortcode( 'tm_contato', array( __CLASS__, 'shortcode_contato' ) );
		add_action( 'admin_post_tm_contato', array( __CLASS__, 'handle_contato' ) );
		add_action( 'admin_post_nopriv_tm_contato', array( __CLASS__, 'handle_contato' ) );
		add_filter( 'wp_nav_menu_items', array( __CLASS__, 'menu_add_categorias' ), 20, 2 );

		// Rodapé profissional: hook do Astra, com fallback genérico para outros temas.
		if ( 'astra' === get_template() ) {
			add_action( 'astra_footer_before', array( __CLASS__, 'footer' ) );
		} else {
			add_action( 'wp_footer', array( __CLASS__, 'footer' ), 5 );
		}
	}

	/**
	 * Rodapé profissional da marca: colunas de links, formas de pagamento e selos.
	 */
	public static function footer() {
		static $ja_imprimiu = false;
		if ( $ja_imprimiu ) {
			return;
		}
		$ja_imprimiu = true;

		$whatsapp = TM_Helpers::get( 'tm_whatsapp_number', '' );
		$ano      = gmdate( 'Y' );

		$pagamentos = array(
			'pix'        => __( 'Pix — aprovação imediata', 'todday-modas' ),
			'visa'       => __( 'Visa — crédito', 'todday-modas' ),
			'mastercard' => __( 'Mastercard — crédito', 'todday-modas' ),
			'elo'        => __( 'Elo — crédito', 'todday-modas' ),
			'amex'       => __( 'American Express — crédito', 'todday-modas' ),
			'hipercard'  => __( 'Hipercard — crédito', 'todday-modas' ),
			'boleto'     => __( 'Boleto bancário — à vista', 'todday-modas' ),
		);
		?>
		<footer class="tm-footer" role="contentinfo">
			<div class="tm-footer-cols">
				<div class="tm-footer-col">
					<h4><?php esc_html_e( 'Todday Modas', 'todday-modas' ); ?></h4>
					<p><?php esc_html_e( 'Moda com seleção própria: peças versáteis, tecidos selecionados e preço justo — do trabalho ao fim de semana.', 'todday-modas' ); ?></p>
				</div>
				<div class="tm-footer-col">
					<h4><?php esc_html_e( 'Institucional', 'todday-modas' ); ?></h4>
					<ul>
						<li><a href="<?php echo esc_url( home_url( '/sobre/' ) ); ?>"><?php esc_html_e( 'Sobre nós', 'todday-modas' ); ?></a></li>
						<li><a href="<?php echo esc_url( home_url( '/termos-e-condicoes/' ) ); ?>"><?php esc_html_e( 'Termos e condições', 'todday-modas' ); ?></a></li>
						<li><a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>"><?php esc_html_e( 'Política de privacidade', 'todday-modas' ); ?></a></li>
					</ul>
				</div>
				<div class="tm-footer-col">
					<h4><?php esc_html_e( 'Ajuda', 'todday-modas' ); ?></h4>
					<ul>
						<li><a href="<?php echo esc_url( home_url( '/faq/' ) ); ?>"><?php esc_html_e( 'Perguntas frequentes', 'todday-modas' ); ?></a></li>
						<li><a href="<?php echo esc_url( home_url( '/trocas-e-devolucoes/' ) ); ?>"><?php esc_html_e( 'Trocas e devoluções', 'todday-modas' ); ?></a></li>
						<li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>"><?php esc_html_e( 'Contato', 'todday-modas' ); ?></a></li>
						<li><a href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) ); ?>"><?php esc_html_e( 'Minha conta', 'todday-modas' ); ?></a></li>
					</ul>
				</div>
				<div class="tm-footer-col">
					<h4><?php esc_html_e( 'Atendimento', 'todday-modas' ); ?></h4>
					<ul>
						<?php if ( $whatsapp ) : ?>
							<li><a href="<?php echo esc_url( 'https://wa.me/' . $whatsapp ); ?>" target="_blank" rel="noopener noreferrer"><?php esc_html_e( 'WhatsApp da loja', 'todday-modas' ); ?></a></li>
						<?php endif; ?>
						<li><span class="tm-footer-email" title="<?php esc_attr_e( 'E-mail de atendimento', 'todday-modas' ); ?>">contato@toddaymodas.com.br</span></li>
						<li><?php esc_html_e( 'Seg. a sáb., 9h às 18h', 'todday-modas' ); ?></li>
					</ul>
				</div>
			</div>

			<div class="tm-footer-pag">
				<span class="tm-footer-pag-titulo"><?php esc_html_e( 'Pagamento 100% seguro via Mercado Pago', 'todday-modas' ); ?></span>
				<span class="tm-footer-pag-chips">
					<?php foreach ( $pagamentos as $slug => $desc ) : ?>
						<?php
						$svg = TM_PLUGIN_URL . 'public/assets/img/payments/' . $slug . '.svg';
						?>
						<span class="tm-chip-pag tm-chip-pag--icon" title="<?php echo esc_attr( $desc ); ?>">
							<img src="<?php echo esc_url( $svg ); ?>" alt="<?php echo esc_attr( $desc ); ?>" loading="lazy" />
						</span>
					<?php endforeach; ?>
				</span>
				<span class="tm-footer-selos">
					<span class="tm-selo">🔒 <?php esc_html_e( 'Site seguro (SSL)', 'todday-modas' ); ?></span>
					<span class="tm-selo">↩️ <?php esc_html_e( '7 dias para troca', 'todday-modas' ); ?></span>
				</span>
			</div>

			<div class="tm-footer-copy">
				<?php
				printf(
					/* translators: %d: ano atual */
					esc_html__( '© %d Todday Modas — Todos os direitos reservados.', 'todday-modas' ),
					(int) $ano
				);
				?>
				<span class="tm-footer-versao" aria-hidden="true">· v<?php echo esc_html( TM_VERSION ); ?></span>
			</div>
		</footer>
		<?php
	}

	/**
	 * Injeta o item "Categorias" (dropdown) no menu primario do tema.
	 *
	 * Sempre sincronizado com as categorias de produto reais: cria uma categoria
	 * no WooCommerce e ela aparece no menu automaticamente (sem editar o menu).
	 * Compatível com o markup de submenu do Astra (seta + toggle mobile).
	 *
	 * @param string   $items HTML dos itens do menu.
	 * @param stdClass $args  Argumentos do wp_nav_menu.
	 * @return string
	 */
	public static function menu_add_categorias( $items, $args ) {
		if ( empty( $args->theme_location ) || ! in_array( $args->theme_location, array( 'primary', 'mobile_menu' ), true ) ) {
			return $items;
		}
		if ( ! taxonomy_exists( 'product_cat' ) ) {
			return $items;
		}
		// Nunca duplica caso um dia exista item fixo com a mesma marca.
		if ( false !== strpos( $items, 'tm-menu-categorias' ) ) {
			return $items;
		}

		$terms = get_terms(
			array(
				'taxonomy'   => 'product_cat',
				'hide_empty' => false,
				'exclude'    => array( (int) get_option( 'default_product_cat' ) ),
				'orderby'    => 'name',
				'order'      => 'ASC',
			)
		);
		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			return $items;
		}

		$loja = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/loja/' );

		// Seta usada pelo Astra nos itens com filhos (mesmo SVG do tema).
		$arrow  = '<svg class="ast-arrow-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="26px" height="16.043px" viewBox="57 35.171 26 16.043" enable-background="new 57 35.171 26 16.043" xml:space="preserve"><path d="M57.5,38.193l12.5,12.5l12.5-12.5l-2.5-2.5l-10,10l-10-10L57.5,38.193z"/></svg>';
		$rotulo = __( 'Categorias', 'todday-modas' );

		$html  = '<li class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children tm-menu-categorias">';
		$html .= '<a href="' . esc_url( $loja ) . '" class="menu-link">' . esc_html( $rotulo )
				. '<span role="button" class="dropdown-menu-toggle ast-header-navigation-arrow" tabindex="0" aria-expanded="false" aria-haspopup="true">' . $arrow . '</span></a>';
		$html .= '<button class="ast-menu-toggle" aria-expanded="false" aria-haspopup="true" aria-label="' . esc_attr( __( 'Toggle menu', 'todday-modas' ) ) . '">' . $arrow . '</button>';
		$html .= '<ul class="sub-menu">';
		foreach ( $terms as $term ) {
			$link = get_term_link( $term );
			if ( is_wp_error( $link ) ) {
				continue;
			}
			$html .= '<li class="menu-item menu-item-type-taxonomy menu-item-object-product_cat"><a href="' . esc_url( $link ) . '" class="menu-link">' . esc_html( $term->name ) . '</a></li>';
		}
		$html .= '</ul></li>';

		// Entra logo apos o item "Loja" (fallback: fim do menu).
		$marca = 'href="' . esc_url( $loja ) . '"';
		$pos   = strpos( $items, $marca );
		if ( false !== $pos ) {
			$fim = strpos( $items, '</li>', $pos );
			if ( false !== $fim ) {
				return substr( $items, 0, $fim + 5 ) . $html . substr( $items, $fim + 5 );
			}
		}
		return $items . $html;
	}

	/**
	 * Formulário de contato (shortcode [tm_contato]) — com nonce, honeypot e rate-limit.
	 *
	 * @return string
	 */
	public static function shortcode_contato() {
		$status = isset( $_GET['tm_contato'] ) ? sanitize_key( wp_unslash( $_GET['tm_contato'] ) ) : '';

		ob_start();
		if ( 'ok' === $status ) {
			echo '<div class="tm-form-ok">' . esc_html__( 'Mensagem enviada! Responderemos em até 1 dia útil.', 'todday-modas' ) . '</div>';
		} elseif ( 'erro' === $status ) {
			echo '<div class="tm-form-erro">' . esc_html__( 'Não foi possível enviar. Tente novamente ou fale conosco pelo WhatsApp.', 'todday-modas' ) . '</div>';
		}
		?>
		<form class="tm-form-contato" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="tm_contato" />
			<?php wp_nonce_field( 'tm_contato_envio' ); ?>
			<label for="tm_c_nome"><?php esc_html_e( 'Seu nome', 'todday-modas' ); ?></label>
			<input type="text" id="tm_c_nome" name="tm_nome" required maxlength="100" />
			<label for="tm_c_email"><?php esc_html_e( 'Seu e-mail', 'todday-modas' ); ?></label>
			<input type="email" id="tm_c_email" name="tm_email" required maxlength="120" />
			<label for="tm_c_msg"><?php esc_html_e( 'Mensagem', 'todday-modas' ); ?></label>
			<textarea id="tm_c_msg" name="tm_mensagem" rows="5" required maxlength="2000"></textarea>
			<p style="display:none;visibility:hidden;height:0;margin:0;" aria-hidden="true">
				<label><?php esc_html_e( 'Deixe em branco', 'todday-modas' ); ?> <input type="text" name="tm_site" tabindex="-1" autocomplete="off" /></label>
			</p>
			<button type="submit"><?php esc_html_e( 'Enviar mensagem', 'todday-modas' ); ?></button>
		</form>
		<?php
		return ob_get_clean();
	}

	/**
	 * Recebe o formulário de contato (front, com ou sem login).
	 */
	public static function handle_contato() {
		// Nonce.
		if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['_wpnonce'] ) ), 'tm_contato_envio' ) ) {
			wp_safe_redirect( home_url( '/contato/?tm_contato=erro' ) );
			exit;
		}

		// Honeypot.
		if ( ! empty( $_POST['tm_site'] ) ) {
			wp_safe_redirect( home_url( '/contato/?tm_contato=ok' ) ); // finge sucesso para bots
			exit;
		}

		// Rate-limit por IP: 1 mensagem a cada 60s.
		$ip        = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'sem-ip';
		$transient = 'tm_contato_' . md5( $ip );
		if ( get_transient( $transient ) ) {
			wp_safe_redirect( home_url( '/contato/?tm_contato=erro' ) );
			exit;
		}
		set_transient( $transient, 1, MINUTE_IN_SECONDS );

		$nome     = isset( $_POST['tm_nome'] ) ? sanitize_text_field( wp_unslash( $_POST['tm_nome'] ) ) : '';
		$email    = isset( $_POST['tm_email'] ) ? sanitize_email( wp_unslash( $_POST['tm_email'] ) ) : '';
		$mensagem = isset( $_POST['tm_mensagem'] ) ? sanitize_textarea_field( wp_unslash( $_POST['tm_mensagem'] ) ) : '';

		if ( '' === $nome || ! is_email( $email ) || '' === $mensagem ) {
			wp_safe_redirect( home_url( '/contato/?tm_contato=erro' ) );
			exit;
		}

		$enviado = wp_mail(
			get_option( 'admin_email' ),
			'[Todday Modas] Contato do site — ' . $nome,
			"Nome: {$nome}\nE-mail: {$email}\n\nMensagem:\n{$mensagem}",
			array( 'Reply-To: ' . $nome . ' <' . $email . '>' )
		);

		TM_Logger::add( $enviado ? 'info' : 'warning', __( 'Formulário de contato recebido.', 'todday-modas' ) );
		wp_safe_redirect( home_url( '/contato/?tm_contato=' . ( $enviado ? 'ok' : 'erro' ) ) );
		exit;
	}

	/**
	 * Renderiza a grade de categorias de produto (shortcode + widget Elementor).
	 *
	 * @param array $args { 'colunas' => int, 'limit' => int, 'contagem' => bool }
	 */
	public static function render_categorias( $args = array() ) {
		$colunas  = isset( $args['colunas'] ) ? absint( $args['colunas'] ) : 4;
		$limite   = isset( $args['limit'] ) ? absint( $args['limit'] ) : 6;
		$contagem = ! empty( $args['contagem'] );
		if ( $colunas < 2 || $colunas > 6 ) {
			$colunas = 4;
		}

		$terms = get_terms(
			array(
				'taxonomy'   => 'product_cat',
				'hide_empty' => true,
				'number'     => $limite,
				'orderby'    => 'count',
				'order'      => 'DESC',
				'exclude'    => array( (int) get_option( 'default_product_cat' ) ),
			)
		);
		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			return;
		}

		echo '<div class="tm-grade-categorias" style="grid-template-columns:repeat(' . esc_attr( (string) $colunas ) . ',1fr);">';
		foreach ( $terms as $term ) {
			$thumb_id = get_term_meta( $term->term_id, 'thumbnail_id', true );
			$img      = $thumb_id ? wp_get_attachment_image( $thumb_id, 'medium' ) : '';
			if ( '' === $img ) {
				// Fallback elegante: foto do primeiro produto publicado da categoria.
				$first = wc_get_products(
					array(
						'status'   => 'publish',
						'limit'    => 1,
						'category' => array( $term->slug ),
					)
				);
				if ( ! empty( $first ) && $first[0]->get_image_id() ) {
					$img = $first[0]->get_image( 'medium' );
				}
			}
			if ( '' === $img ) {
				$img = wc_placeholder_img( 'medium' );
			}
			$link = get_term_link( $term );

			echo '<a class="tm-cat-card" href="' . esc_url( $link ) . '">';
			echo '<span class="tm-cat-foto">' . wp_kses_post( $img ) . '</span>';
			echo '<span class="tm-cat-nome">' . esc_html( $term->name ) . '</span>';
			if ( $contagem ) {
				/* translators: %d: quantidade de produtos */
				echo '<span class="tm-cat-qtd">' . esc_html( sprintf( _n( '%d produto', '%d produtos', (int) $term->count, 'todday-modas' ), (int) $term->count ) ) . '</span>';
			}
			echo '</a>';
		}
		echo '</div>';
	}

	/**
	 * Shortcode [tm_categorias colunas="4" limit="6" contagem="0"].
	 *
	 * @param array $atts Atributos.
	 * @return string
	 */
	public static function shortcode_categorias( $atts ) {
		$atts = shortcode_atts(
			array(
				'colunas'  => 4,
				'limit'    => 6,
				'contagem' => 0,
			),
			$atts,
			'tm_categorias'
		);
		ob_start();
		self::render_categorias( $atts );
		return ob_get_clean();
	}

	/**
	 * Retorna os cupons ativos e vigentes (publicados, não expirados, sem esgotar uso).
	 *
	 * @param int $limit Limite de cupons.
	 * @return WC_Coupon[]
	 */
	public static function get_active_coupons( $limit = 3 ) {
		$posts = get_posts(
			array(
				'post_type'      => 'shop_coupon',
				'post_status'    => 'publish',
				'posts_per_page' => 50,
				'orderby'        => 'date',
				'order'          => 'DESC',
			)
		);

		$ativos = array();
		foreach ( $posts as $p ) {
			$coupon = new WC_Coupon( $p->ID );

			$expira = $coupon->get_date_expires();
			if ( $expira && $expira->getTimestamp() < time() ) {
				continue;
			}

			$limite_uso = (int) $coupon->get_usage_limit();
			if ( $limite_uso > 0 && (int) $coupon->get_usage_count() >= $limite_uso ) {
				continue;
			}

			$ativos[] = $coupon;
			if ( count( $ativos ) >= $limit ) {
				break;
			}
		}
		return $ativos;
	}

	/**
	 * Renderiza a vitrine de cupons (usada pelo shortcode e pelo widget Elementor).
	 *
	 * @param array $args { 'title' => string, 'limit' => int }
	 */
	public static function render_cupons( $args = array() ) {
		$title  = isset( $args['title'] ) ? $args['title'] : __( 'Cupons para você economizar', 'todday-modas' );
		$limit  = isset( $args['limit'] ) ? absint( $args['limit'] ) : 3;
		$cupons = self::get_active_coupons( $limit );

		if ( empty( $cupons ) ) {
			return;
		}

		echo '<section class="tm-cupons">';
		if ( $title ) {
			echo '<h2 class="tm-cupons-titulo">' . esc_html( $title ) . '</h2>';
		}
		echo '<div class="tm-cupons-grade">';
		foreach ( $cupons as $coupon ) {
			$descricao = $coupon->get_description();
			if ( '' === $descricao ) {
				$descricao = 'percent' === $coupon->get_discount_type()
					/* translators: %s: percentual de desconto */
					? sprintf( __( '%s%% de desconto', 'todday-modas' ), wc_format_decimal( $coupon->get_amount(), 0 ) )
					/* translators: %s: valor de desconto */
					: sprintf( __( '%s de desconto', 'todday-modas' ), wp_strip_all_tags( wc_price( $coupon->get_amount() ) ) );
			}

			$detalhes = array();
			if ( $coupon->get_minimum_amount() > 0 ) {
				/* translators: %s: valor mínimo do pedido */
				$detalhes[] = sprintf( __( 'pedidos acima de %s', 'todday-modas' ), wp_strip_all_tags( wc_price( $coupon->get_minimum_amount() ) ) );
			}
			if ( $coupon->get_date_expires() ) {
				/* translators: %s: data de validade */
				$detalhes[] = sprintf( __( 'válido até %s', 'todday-modas' ), $coupon->get_date_expires()->date_i18n( 'd/m/Y' ) );
			}

			echo '<div class="tm-cupom">';
			echo '<span class="tm-cupom-tarja">' . esc_html__( 'CUPOM', 'todday-modas' ) . '</span>';
			echo '<span class="tm-cupom-descricao">' . esc_html( $descricao ) . '</span>';
			if ( $detalhes ) {
				echo '<span class="tm-cupom-detalhes">' . esc_html( implode( ' · ', $detalhes ) ) . '</span>';
			}
			echo '<button type="button" class="tm-cupom-copiar" data-codigo="' . esc_attr( $coupon->get_code() ) . '">';
			echo '<code>' . esc_html( $coupon->get_code() ) . '</code>';
			echo '<span class="tm-cupom-copiar-label">' . esc_html__( 'Copiar', 'todday-modas' ) . '</span>';
			echo '</button>';
			echo '</div>';
		}
		echo '</div></section>';
	}

	/**
	 * Shortcode [tm_cupons title="..." limit="3"].
	 *
	 * @param array $atts Atributos.
	 * @return string
	 */
	public static function shortcode_cupons( $atts ) {
		$atts = shortcode_atts(
			array(
				'title' => __( 'Cupons para você economizar', 'todday-modas' ),
				'limit' => 3,
			),
			$atts,
			'tm_cupons'
		);
		ob_start();
		self::render_cupons( $atts );
		return ob_get_clean();
	}

	/**
	 * Popup de cupom de boas-vindas (aparece 1x por sessao no front).
	 * Reaproveita o handler de copiar (.tm-cupom-copiar) do shortcode.
	 */
	public static function popup_cupom() {
		if ( is_admin() || is_feed() || wp_doing_ajax() ) {
			return;
		}
		$cupons = self::get_active_coupons( 1 );
		if ( empty( $cupons ) ) {
			return;
		}
		$coupon = $cupons[0];
		$codigo = $coupon->get_code();
		$desc   = $coupon->get_description();
		if ( '' === $desc ) {
			$desc = 'percent' === $coupon->get_discount_type()
				/* translators: %s: percentual */
				? sprintf( __( '%s%% de desconto', 'todday-modas' ), wc_format_decimal( $coupon->get_amount(), 0 ) )
				/* translators: %s: valor */
				: sprintf( __( '%s de desconto', 'todday-modas' ), wp_strip_all_tags( wc_price( $coupon->get_amount() ) ) );
		}
		$loja = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/loja/' );
		?>
		<div class="tm-popup" id="tm-popup-cupom" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Cupom de boas-vindas', 'todday-modas' ); ?>" hidden>
			<button type="button" class="tm-popup-bg" data-tm-popup-fechar aria-label="<?php esc_attr_e( 'Fechar', 'todday-modas' ); ?>"></button>
			<div class="tm-popup-card">
				<div class="tm-popup-card-in">
					<button type="button" class="tm-popup-fechar" data-tm-popup-fechar aria-label="<?php esc_attr_e( 'Fechar', 'todday-modas' ); ?>">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
					</button>
					<span class="tm-popup-selo" aria-hidden="true">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8"/><path d="M3 8h18v4H3z"/><path d="M12 8v13"/><path d="M12 8S10.6 3 8.4 3 4.6 6.6 8 8h4z"/><path d="M12 8s1.4-5 3.6-5S19.4 6.6 16 8h-4z"/></svg>
					</span>
					<h2 class="tm-popup-titulo"><?php esc_html_e( 'Bem-vinda a', 'todday-modas' ); ?> <em><?php esc_html_e( 'Todday', 'todday-modas' ); ?></em></h2>
					<p class="tm-popup-sub"><?php printf( esc_html__( 'Ganhe %s.', 'todday-modas' ), '<strong>' . esc_html( $desc ) . '</strong>' ); ?></p>
					<div class="tm-popup-cupom-box">
						<span class="tm-popup-cupom-box-titulo"><?php esc_html_e( 'Seu cupom', 'todday-modas' ); ?></span>
						<div class="tm-popup-cupom-linha">
							<code class="tm-popup-codigo"><?php echo esc_html( $codigo ); ?></code>
							<button type="button" class="tm-cupom-copiar tm-popup-copiar" data-codigo="<?php echo esc_attr( $codigo ); ?>">
								<span class="tm-cupom-copiar-label"><?php esc_html_e( 'Copiar', 'todday-modas' ); ?></span>
							</button>
						</div>
					</div>
					<p class="tm-popup-uso"><?php esc_html_e( 'Use o cupom na hora de finalizar a compra.', 'todday-modas' ); ?></p>
					<a class="tmv-btn tmv-btn--primario tm-popup-cta" href="<?php echo esc_url( $loja ); ?>">
						<?php esc_html_e( 'Ir às compras', 'todday-modas' ); ?>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
					</a>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Banner de consentimento de cookies (LGPD), oculto por padrão até o JS
	 * confirmar que o visitante ainda não escolheu (localStorage + cookie).
	 */
	public static function consent_banner() {
		if ( is_admin() || is_feed() || wp_doing_ajax() || function_exists( 'is_checkout' ) && is_checkout() || function_exists( 'is_account_page' ) && is_account_page() ) {
			return;
		}
		$priv    = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'privacy_policy' ) : home_url( '/politica-de-privacidade/' );
		$priv    = $priv ? $priv : home_url( '/politica-de-privacidade/' );
		?>
		<div class="tm-cookie" id="tm-consent-banner" role="region" aria-label="<?php esc_attr_e( 'Aviso de cookies', 'todday-modas' ); ?>" data-nosnippet hidden>
			<div class="tm-cookie-inner">
				<p class="tm-cookie-texto">
					<?php esc_html_e( 'Usamos cookies para melhorar sua navegação, medir audiência e exibir ofertas.', 'todday-modas' ); ?>
					<a href="<?php echo esc_url( $priv ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'Política de privacidade', 'todday-modas' ); ?></a>.
				</p>
				<div class="tm-cookie-acoes">
					<button type="button" class="tm-cookie-botao" data-tm-consent="somente_essenciais"><?php esc_html_e( 'Somente essenciais', 'todday-modas' ); ?></button>
					<button type="button" class="tm-cookie-botao is-primario" data-tm-consent="aceitar_todos"><?php esc_html_e( 'Aceitar todos', 'todday-modas' ); ?></button>
				</div>
				<button type="button" class="tm-cookie-fechar" data-tm-consent="fechar" aria-label="<?php esc_attr_e( 'Fechar aviso de cookies', 'todday-modas' ); ?>">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
				</button>
			</div>
		</div>
		<?php
	}

	/**
	 * Renderiza o slider de banners ativos (respeita agendamento e ordem).
	 *
	 * @param array $args { 'titulo' => string, 'limit' => int, 'autoplay' => int(segundos) }
	 */
	public static function render_banners( $args = array() ) {
		$banners  = TM_Banners::get_active();
		if ( empty( $banners ) ) {
			return;
		}

		$titulo   = isset( $args['titulo'] ) ? $args['titulo'] : '';
		$limit    = isset( $args['limit'] ) ? absint( $args['limit'] ) : 0;
		$autoplay = isset( $args['autoplay'] ) ? absint( $args['autoplay'] ) : 0;
		if ( $limit > 0 ) {
			$banners = array_slice( $banners, 0, $limit );
		}
		if ( 1 === count( $banners ) ) {
			$autoplay = 0; // sem giro com slide único.
		}

		echo '<section class="tm-banners" aria-roledescription="carrossel" aria-label="' . esc_attr__( 'Banners da loja', 'todday-modas' ) . '" data-autoplay="' . esc_attr( (string) $autoplay ) . '">';
		if ( $titulo ) {
			echo '<h2 class="tm-banners-titulo">' . esc_html( $titulo ) . '</h2>';
		}
		echo '<div class="tm-banners-viewport">';
		echo '<div class="tm-banners-track">';
		$i = 0;
		foreach ( $banners as $banner ) {
			$img  = get_the_post_thumbnail( $banner->ID, 'full', array( 'loading' => 0 === $i ? 'eager' : 'lazy', 'decoding' => 'async' ) );
			if ( '' === $img ) {
				continue; // banner sem imagem não é exibido.
			}
			$link = get_post_meta( $banner->ID, '_tm_banner_link', true );
			$thumb_id = get_post_thumbnail_id( $banner->ID );
			$alt = get_the_title( $banner->ID );
			if ( $thumb_id ) {
				$thumb_alt = (string) get_post_meta( $thumb_id, '_wp_attachment_image_alt', true );
				if ( '' !== $thumb_alt ) {
					$alt = $thumb_alt;
				}
			}
			echo '<figure class="tm-banner-slide" role="group" aria-roledescription="slide" aria-label="' . esc_attr( sprintf( /* translators: 1: posição do slide, 2: total de slides */ __( 'Banner %1$d de %2$d', 'todday-modas' ), $i + 1, count( $banners ) ) ) . '">';
			if ( $link ) {
				echo '<a href="' . esc_url( $link ) . '">';
				echo wp_kses_post( $img );
				echo '</a>';
			} else {
				echo wp_kses_post( $img );
			}
			echo '</figure>';
			$i++;
		}
		echo '</div></div>';

		if ( count( $banners ) > 1 ) {
			echo '<button type="button" class="tm-banners-nav tm-banners-prev" aria-label="' . esc_attr__( 'Banner anterior', 'todday-modas' ) . '">';
			echo '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>';
			echo '</button>';
			echo '<button type="button" class="tm-banners-nav tm-banners-next" aria-label="' . esc_attr__( 'Próximo banner', 'todday-modas' ) . '">';
			echo '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9.5 5.5 6.5 6.5-6.5 6.5"/></svg>';
			echo '</button>';
			echo '<div class="tm-banners-dots" role="tablist" aria-label="' . esc_attr__( 'Selecionar banner', 'todday-modas' ) . '">';
			foreach ( $banners as $j => $banner ) {
				echo '<button type="button" class="tm-banners-dot' . ( 0 === $j ? ' is-active' : '' ) . '" data-slide="' . esc_attr( (string) $j ) . '" role="tab" aria-selected="' . ( 0 === $j ? 'true' : 'false' ) . '" aria-label="' . esc_attr( sprintf( /* translators: %d: número do banner */ __( 'Banner %d', 'todday-modas' ), $j + 1 ) ) . '"></button>';
			}
			echo '</div>';
		}
		echo '</section>';
	}

	/**
	 * Shortcode [tm_banners titulo="..." limit="3" autoplay="5"].
	 *
	 * @param array $atts Atributos.
	 * @return string
	 */
	public static function shortcode_banners( $atts ) {
		$atts = shortcode_atts(
			array(
				'titulo'   => '',
				'limit'    => 0,
				'autoplay' => 0,
			),
			$atts,
			'tm_banners'
		);
		ob_start();
		self::render_banners( $atts );
		return ob_get_clean();
	}

	/**
	 * Shortcode [tm_kids] — produtos da categoria Kids.
	 * Exibe um cartão "Em breve" elegante enquanto não houver produtos publicados.
	 *
	 * @param array $atts Atributos.
	 * @return string
	 */
	public static function shortcode_kids( $atts ) {
		$atts = shortcode_atts(
			array(
				'limit' => 4,
			),
			$atts,
			'tm_kids'
		);

		$products = array();
		if ( taxonomy_exists( 'product_cat' ) && term_exists( 'kids', 'product_cat' ) ) {
			$products = wc_get_products(
				array(
					'status'   => 'publish',
					'limit'    => absint( $atts['limit'] ),
					'category' => array( 'kids' ),
					'orderby'  => 'date',
					'order'    => 'DESC',
				)
			);
		}

		$kids_link = taxonomy_exists( 'product_cat' ) ? get_term_link( 'kids', 'product_cat' ) : '';
		if ( is_wp_error( $kids_link ) || '' === $kids_link ) {
			$kids_link = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/loja/' );
		}

		ob_start();
		if ( empty( $products ) ) {
			echo '<div class="tmv-kids-embreve">';
			echo '<span class="tmv-kids-icone" aria-hidden="true">';
			echo '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1.6 2 3.6 3.2 5.5 4.6 1.8 1.3 2.8 2.7 2.8 4.9 0 3.4-2.4 5.5-4.9 5.9 1.3.8 2.6 1.3 3.6 2H5c1-.7 2.3-1.2 3.6-2C6.1 18 3.7 15.9 3.7 12.5c0-2.2 1-3.6 2.8-4.9C8.4 6.2 10.4 5 12 3z"/><circle cx="9" cy="11.5" r="1"/><circle cx="15" cy="11.5" r="1"/></svg>';
			echo '</span>';
			echo '<h3>' . esc_html__( 'Coleção Kids em breve', 'todday-modas' ) . '</h3>';
			echo '<p>' . esc_html__( 'Estamos preparando peças infantis com a mesma seleção — conforto e estilo para os pequenos.', 'todday-modas' ) . '</p>';
			echo '<a class="tmv-btn tmv-btn--primario" href="' . esc_url( $kids_link ) . '">' . esc_html__( 'Conhecer a categoria Kids', 'todday-modas' ) . '</a>';
			echo '</div>';
		} else {
			echo do_shortcode( '[products limit="' . absint( $atts['limit'] ) . '" columns="4" category="kids" orderby="date" order="DESC"]' );
		}
		return ob_get_clean();
	}

	/**
	 * Injeta as variáveis CSS da marca SEMPRE a partir das options (nunca hex solto).
	 */
	public static function css_variables() {
		$destaque = TM_Helpers::sanitize_hex( TM_Helpers::get( 'tm_color_destaque' ), '#B4552D' );

		$vars = array(
			'--tm-base'          => TM_Helpers::sanitize_hex( TM_Helpers::get( 'tm_color_base' ) ),
			'--tm-secundaria'    => TM_Helpers::sanitize_hex( TM_Helpers::get( 'tm_color_secundaria' ), '#23201C' ),
			'--tm-destaque'      => $destaque,
			'--tm-destaque-rgb'  => self::hex_to_rgb_csv( $destaque ),
			'--tm-acento'        => TM_Helpers::sanitize_hex( TM_Helpers::get( 'tm_color_acento' ), '#C6A15B' ),
			'--tm-neutro'        => TM_Helpers::sanitize_hex( TM_Helpers::get( 'tm_color_neutro' ), '#F1ECE5' ),
			'--tm-font-title'    => TM_Helpers::get( 'tm_font_title' ),
			'--tm-font-body'     => TM_Helpers::get( 'tm_font_body' ),
		);

		echo '<style id="tm-variables">:root{';
		foreach ( $vars as $name => $value ) {
			printf( '%s:%s;', esc_html( $name ), esc_attr( $value ) );
		}
		echo '}</style>' . "\n";
	}

	/**
	 * Converte #RRGGBB em "R, G, B" para uso em rgba() no CSS.
	 *
	 * @param string $hex Cor #RRGGBB (já sanitizada).
	 * @return string
	 */
	public static function hex_to_rgb_csv( $hex ) {
		$h = ltrim( $hex, '#' );
		if ( 3 === strlen( $h ) ) {
			$h = $h[0] . $h[0] . $h[1] . $h[1] . $h[2] . $h[2];
		}
		if ( 6 !== strlen( $h ) ) {
			return '180, 85, 45';
		}
		return hexdec( substr( $h, 0, 2 ) ) . ', ' . hexdec( substr( $h, 2, 2 ) ) . ', ' . hexdec( substr( $h, 4, 2 ) );
	}

	/**
	 * Migração de versão: sobe a paleta antiga para a identidade brechó (v1.0.3)
	 * somente quando as cores salvas ainda são os defaults antigos (nunca pisa
	 * em personalização do cliente).
	 */
	public static function upgrade() {
		if ( TM_VERSION === get_option( 'tm_version_saved' ) ) {
			return;
		}

		$antiga = array(
			'tm_color_base'       => '#FFFFFF',
			'tm_color_secundaria' => '#1A1A1A',
			'tm_color_destaque'   => '#FF7A20',
			'tm_color_acento'     => '#D4AF37',
			'tm_color_neutro'     => '#F0F0F0',
		);
		foreach ( $antiga as $key => $antigo ) {
			if ( self::is_paleta_antiga( $key, $antigo ) ) {
				$defaults = TM_Helpers::default_settings();
				update_option( $key, $defaults[ $key ] );
			}
		}
		update_option( 'tm_version_saved', TM_VERSION );
	}

	/**
	 * Verifica se a option de cor aplica o valor antigo (ou nunca foi salva)
	 * indicando que pode migrar sem perder personalização.
	 *
	 * @param string $key    Option.
	 * @param string $antigo Valor da paleta pré-v1.0.3.
	 * @return bool
	 */
	private static function is_paleta_antiga( $key, $antigo ) {
		$atual = get_option( $key );
		if ( false === $atual || '' === $atual ) {
			return true;
		}
		return strtoupper( (string) $atual ) === strtoupper( $antigo );
	}

	/**
	 * Metas PWA no <head>: manifest, theme-color, Apple, toque visual de app.
	 */
	public static function head_meta() {
		if ( is_admin() ) {
			return;
		}
		$icons = TM_PLUGIN_URL . 'public/assets/img/pwa/';
		?>
<meta name="theme-color" content="#23201C" id="tm-theme-color">
<link rel="manifest" href="<?php echo esc_url( home_url( '/tm-manifest.webmanifest' ) ); ?>">
<?php if ( ! has_site_icon() ) : ?>
<link rel="icon" type="image/png" sizes="32x32" href="<?php echo esc_url( $icons . 'icon-32.png' ); ?>">
<link rel="icon" type="image/png" sizes="192x192" href="<?php echo esc_url( $icons . 'icon-192.png' ); ?>">
<link rel="apple-touch-icon" href="<?php echo esc_url( $icons . 'icon-180.png' ); ?>">
<?php endif; ?>
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Todday">
		<?php
	}

	/**
	 * Serve o manifest e o service worker na RAIZ do domínio (escopo "/" exige root),
	 * sem depender de rewrite/permalink.
	 */
	public static function serve_pwa_files() {
		$uri  = isset( $_SERVER['REQUEST_URI'] ) ? strtok( sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ), '?' ) : '';
		$path = rtrim( $uri, '/' );

		if ( preg_match( '#/tm-manifest\.webmanifest$#', $path ) ) {
			$manifest = array(
				'name'             => 'Todday Modas — Brechó & Seleção',
				'short_name'       => 'Todday',
				'description'      => __( 'Brechó online com peças selecionadas: peças únicas, moda circular e preço justo.', 'todday-modas' ),
				'id'               => '/',
				'start_url'        => home_url( '/' ),
				'scope'            => home_url( '/' ),
				'display'          => 'standalone',
				'display_override' => array( 'standalone', 'browser' ),
				'orientation'      => 'portrait',
				'lang'             => 'pt-BR',
				'background_color' => '#FAF8F5',
				'theme_color'      => '#23201C',
				'categories'       => array( 'shopping', 'fashion' ),
				'icons'            => array(
					array(
						'src'     => TM_PLUGIN_URL . 'public/assets/img/pwa/icon-192.png',
						'sizes'   => '192x192',
						'type'    => 'image/png',
						'purpose' => 'any',
					),
					array(
						'src'     => TM_PLUGIN_URL . 'public/assets/img/pwa/icon-512.png',
						'sizes'   => '512x512',
						'type'    => 'image/png',
						'purpose' => 'any',
					),
					array(
						'src'     => TM_PLUGIN_URL . 'public/assets/img/pwa/icon-512.png',
						'sizes'   => '512x512',
						'type'    => 'image/png',
						'purpose' => 'maskable',
					),
				),
			);

			status_header( 200 );
			header( 'Content-Type: application/manifest+json; charset=utf-8' );
			header( 'Cache-Control: no-cache' );
			echo wp_json_encode( $manifest );
			exit;
		}

		if ( preg_match( '#/tm-sw\.js$#', $path ) ) {
			$sw = TM_PLUGIN_DIR . 'public/pwa/tm-sw.js';
			if ( file_exists( $sw ) ) {
				status_header( 200 );
				header( 'Content-Type: text/javascript; charset=utf-8' );
				header( 'Service-Worker-Allowed: /' );
				header( 'Cache-Control: no-cache' );
				readfile( $sw ); // phpcs:ignore WordPress.WP.AlternativeFunctions
			}
			exit;
		}
	}

	/**
	 * Garante que o HTML do front nunca fique preso em cache de navegador/CDN
	 * (sempre revalida; CSS/JS usam cache-busting por filemtime).
	 */
	public static function no_cache_html() {
		if ( is_admin() || is_feed() || wp_doing_ajax() ) {
			return;
		}
		if ( headers_sent() ) {
			return;
		}
		header( 'Cache-Control: no-cache, must-revalidate, max-age=0' );
	}

	/**
	 * Faixa superior animada (marquee) — identidade brechó. CSS liga/desliga.
	 */
	public static function top_strip() {
		$msg = __( 'Brechó com peças selecionadas ✦ Peças únicas ✦ Moda circular ✦ Nova seleção toda semana', 'todday-modas' );
		echo '<div class="tm-topstrip" role="marquee" aria-label="' . esc_attr( $msg ) . '">';
		echo '<div class="tm-topstrip-marq">';
		for ( $i = 0; $i < 4; $i++ ) {
			echo '<span aria-hidden="true">' . esc_html( $msg ) . '&nbsp;&nbsp;✦&nbsp;&nbsp;</span>';
		}
		echo '</div></div>';
	}

	/**
	 * Barra de app inferior (mobile) + overlay de busca. Só renderiza no front.
	 */
	public static function app_bar() {
		if ( is_admin() ) {
			return;
		}

		$carrinho_qtd = 0;
		$carrinho_url = function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/' );
		if ( function_exists( 'WC' ) && WC()->cart ) {
			$carrinho_qtd = (int) WC()->cart->get_cart_contents_count();
		}

		$itens = array(
			array(
				'rotulo' => __( 'Início', 'todday-modas' ),
				'url'    => home_url( '/' ),
				'ativo'  => is_front_page(),
				'icone'  => '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
			),
			array(
				'rotulo' => __( 'Loja', 'todday-modas' ),
				'url'    => function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/loja/' ),
				'ativo'  => function_exists( 'is_shop' ) && is_shop(),
				'icone'  => '<path d="M4 3h13l3 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z"/><path d="M8 10a4 4 0 0 0 8 0"/>',
			),
			array(
				'rotulo' => __( 'Buscar', 'todday-modas' ),
				'url'    => '#buscar',
				'ativo'  => false,
				'icone'  => '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.2 15.2 5 5"/>',
				'busca'  => true,
			),
			array(
				'rotulo' => __( 'Sacola', 'todday-modas' ),
				'url'    => $carrinho_url,
				'ativo'  => function_exists( 'is_cart' ) && is_cart(),
				'icone'  => '<path d="M6 8h12l-1 12H7z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
				'badge'  => $carrinho_qtd,
			),
			array(
				'rotulo' => __( 'Conta', 'todday-modas' ),
				'url'    => function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/minha-conta/' ),
				'ativo'  => function_exists( 'is_account_page' ) && is_account_page(),
				'icone'  => '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 21c1.5-4 5-5.5 7.5-5.5s6 1.5 7.5 5.5"/>',
			),
		);
		?>
		<nav class="tm-appbar" aria-label="<?php esc_attr_e( 'Navegação principal', 'todday-modas' ); ?>">
			<?php foreach ( $itens as $item ) : ?>
				<?php if ( ! empty( $item['busca'] ) ) : ?>
					<button type="button" class="tm-appbar-item" id="tm-busca-open" aria-haspopup="dialog">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><?php echo $item['icone']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- path SVG estático do código, sem input do usuário. ?></svg>
						<span><?php echo esc_html( $item['rotulo'] ); ?></span>
					</button>
				<?php else : ?>
					<a class="tm-appbar-item<?php echo $item['ativo'] ? ' is-active' : ''; ?>" href="<?php echo esc_url( $item['url'] ); ?>"<?php echo $item['ativo'] ? ' aria-current="page"' : ''; ?>>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><?php echo $item['icone']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- path SVG estático do código, sem input do usuário. ?></svg>
						<span><?php echo esc_html( $item['rotulo'] ); ?></span>
						<?php if ( ! empty( $item['badge'] ) ) : ?>
							<em class="tm-appbar-badge" aria-label="<?php echo esc_attr( $item['badge'] . ' ' . __( 'itens na sacola', 'todday-modas' ) ); ?>"><?php echo esc_html( (string) min( 99, $item['badge'] ) ); ?></em>
						<?php endif; ?>
					</a>
				<?php endif; ?>
			<?php endforeach; ?>
		</nav>

		<div class="tm-busca-overlay" id="tm-busca-overlay" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Buscar na loja', 'todday-modas' ); ?>" hidden>
			<button type="button" class="tm-busca-fechar" id="tm-busca-close" aria-label="<?php esc_attr_e( 'Fechar busca', 'todday-modas' ); ?>">&times;</button>
			<form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" class="tm-busca-form">
				<label class="screen-reader-text" for="tm-busca-campo"><?php esc_html_e( 'Buscar peças', 'todday-modas' ); ?></label>
				<input type="search" id="tm-busca-campo" name="s" placeholder="<?php esc_attr_e( 'O que você procura hoje?', 'todday-modas' ); ?>" autocomplete="off">
				<input type="hidden" name="post_type" value="product">
				<button type="submit"><?php esc_html_e( 'Buscar', 'todday-modas' ); ?></button>
			</form>
		</div>
		<?php
	}

	/**
	 * Botão flutuante de WhatsApp (só aparece se configurado).
	 */
	public static function assets() {
		// Google Fonts (somente as famílias configuradas no painel).
		$title = TM_Helpers::get( 'tm_font_title' );
		$body  = TM_Helpers::get( 'tm_font_body' );
		$fonts = array_unique( array_filter( array( $title, $body ) ) );
		if ( $fonts ) {
			$families = array();
			foreach ( $fonts as $f ) {
				$families[] = 'family=' . rawurlencode( $f . ':wght@400;600;700' );
			}
			wp_enqueue_style(
				'tm-google-fonts',
				'https://fonts.googleapis.com/css2?' . implode( '&', $families ) . '&display=swap',
				array(),
				null // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion -- URL externa versionada pelo Google.
			);
		}

		wp_enqueue_style(
			'tm-variables',
			TM_PLUGIN_URL . 'public/assets/css/tm-variables.css',
			array(),
			(string) filemtime( TM_PLUGIN_DIR . 'public/assets/css/tm-variables.css' )
		);

		wp_enqueue_style(
			'tm-public',
			TM_PLUGIN_URL . 'public/assets/css/tm-public.css',
			array( 'tm-variables' ),
			(string) filemtime( TM_PLUGIN_DIR . 'public/assets/css/tm-public.css' )
		);

		wp_enqueue_script(
			'tm-public',
			TM_PLUGIN_URL . 'public/assets/js/tm-public.js',
			array(),
			(string) filemtime( TM_PLUGIN_DIR . 'public/assets/js/tm-public.js' ),
			true
		);

		// Dados para o header desktop (carrinho/conta/busca) e refresh do badge.
		$cart_qtd = 0;
		if ( function_exists( 'WC' ) && WC()->cart ) {
			$cart_qtd = (int) WC()->cart->get_cart_contents_count();
		}
		wp_localize_script(
			'tm-public',
			'TMDados',
			array(
				'carrinhoQtd' => $cart_qtd,
				'carrinhoUrl' => function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/carrinho/' ),
				'contaUrl'    => function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/minha-conta/' ),
				'rotuloCarrinho' => esc_attr__( 'Sacola de compras', 'todday-modas' ),
				'rotuloConta'    => esc_attr__( 'Minha conta', 'todday-modas' ),
				'restUrl'     => esc_url_raw( rest_url() ),
			)
		);
	}

	/**
	 * Botão flutuante de WhatsApp (só aparece se configurado).
	 */
	public static function whatsapp_button() {
		$number = (string) TM_Helpers::get( 'tm_whatsapp_number', '' );
		if ( '' === $number ) {
			return;
		}
		$message = rawurlencode( (string) TM_Helpers::get( 'tm_whatsapp_message', '' ) );
		$url     = 'https://wa.me/' . $number . ( $message ? '?text=' . $message : '' );

		printf(
			'<a class="tm-whatsapp-float" href="%s" target="_blank" rel="noopener noreferrer" aria-label="%s">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true" width="28" height="28" fill="currentColor"><title>WhatsApp</title><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.186 8.186 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.32a8.19 8.19 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24M8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.86-.87 2.07 0 1.22.89 2.39 1 2.56.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.27-.25-.14-1.47-.74-1.69-.82-.23-.08-.37-.12-.56.12-.16.25-.64.81-.78.97-.15.17-.29.19-.53.07-.26-.13-1.06-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.12-.24-.01-.39.11-.5.11-.11.27-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.11-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43-.14 0-.3-.01-.47-.01"/></svg>
			</a>',
			esc_url( $url ),
			esc_attr__( 'Falar no WhatsApp', 'todday-modas' )
		);
	}

	/**
	 * Usa o template 404 do plugin (estilizado com a marca + CTA para a loja).
	 *
	 * @param string $template Template atual.
	 * @return string
	 */
	public static function template_404( $template ) {
		$tmpl = TM_PLUGIN_DIR . 'public/templates/404.php';
		return file_exists( $tmpl ) ? $tmpl : $template;
	}

	/**
	 * Pede WebP ao editor de imagens quando o servidor suporta.
	 *
	 * @param array $formats Mapa mime => mime.
	 * @return array
	 */
	public static function prefer_webp( $formats ) {
		if ( function_exists( 'imagewebp' ) ) {
			$formats['image/jpeg'] = 'image/webp';
			$formats['image/png']  = 'image/webp';
		}
		return $formats;
	}

	/**
	 * SEO ativo no site? (Yoast/RankMath/SEOPress/AIOSEO) — se sim, o plugin não
	 * emite meta/OG para não duplicar.
	 *
	 * @return bool
	 */
	private static function seo_plugin_active() {
		return defined( 'WPSEO_VERSION' )
			|| defined( 'RANK_MATH_VERSION' )
			|| defined( 'SEOPRESS_VERSION' )
			|| defined( 'AIOSEOP_VERSION' );
	}

	/**
	 * Meta description padrão da marca para a página atual (<= 158 chars).
	 *
	 * @return string
	 */
	private static function seo_description() {
		$desc = '';

		if ( is_front_page() ) {
			$desc = __( 'Moda com seleção própria: peças versáteis, tecidos selecionados e preço justo. Nova coleção disponível — do trabalho ao fim de semana.', 'todday-modas' );
		} elseif ( is_singular( 'product' ) ) {
			$product = wc_get_product( get_queried_object_id() );
			if ( $product ) {
				$desc = $product->get_short_description() ? $product->get_short_description() : $product->get_description();
			}
		} elseif ( is_singular() ) {
			$post = get_queried_object();
			if ( $post instanceof WP_Post ) {
				$desc = has_excerpt( $post ) ? get_the_excerpt( $post ) : wp_strip_all_tags( $post->post_content );
			}
		} elseif ( is_shop() || is_product_category() || is_product_tag() ) {
			$desc = __( 'Loja Todday Modas: roupas, calçados e acessórios com seleção, tecidos selecionados e preço justo. Envio para todo o Brasil.', 'todday-modas' );
		}

		$desc = trim( preg_replace( '/\s+/', ' ', wp_strip_all_tags( (string) $desc ) ) );
		return function_exists( 'mb_substr' ) ? mb_substr( $desc, 0, 158 ) : substr( $desc, 0, 158 );
	}

	/**
	 * Imagem padrão para Open Graph (logo da marca ou fallback do PWA).
	 *
	 * @return string
	 */
	private static function seo_image_url() {
		$logo_id = (int) TM_Helpers::get( 'tm_logo_id', 0 );
		if ( $logo_id ) {
			$url = wp_get_attachment_image_url( $logo_id, 'full' );
			if ( $url ) {
				return $url;
			}
		}
		if ( has_custom_logo() ) {
			$logo = wp_get_attachment_image_url( get_theme_mod( 'custom_logo' ), 'full' );
			if ( $logo ) {
				return $logo;
			}
		}
		return TM_PLUGIN_URL . 'public/assets/img/pwa/icon-512.png';
	}

	/**
	 * Emite Open Graph, Twitter Card e meta description (somente sem plugin de SEO).
	 */
	public static function seo_head() {
		if ( is_admin() || self::seo_plugin_active() ) {
			return;
		}

		$title = wp_get_document_title();
		$desc  = self::seo_description();
		$img   = self::seo_image_url();
		$url = is_singular() ? get_permalink() : home_url( '/' );

		$og_type     = 'website';
		$product     = null;
		$extra       = array();
		if ( is_singular( 'product' ) ) {
			$og_type = 'product';
			$product = wc_get_product( get_queried_object_id() );
			if ( $product ) {
				$price = wc_format_decimal( $product->get_price(), wc_get_price_decimals() );
				if ( $price ) {
					$extra['product:price:amount']   = $price;
					$extra['product:price:currency'] = get_woocommerce_currency();
				}
				$extra['product:availability'] = $product->is_in_stock() ? 'instock' : 'out of stock';
			}
		}

		echo "\n<!-- Todday Modas SEO -->\n";
		echo '<meta name="description" content="' . esc_attr( $desc ) . '">' . "\n";
		echo '<meta property="og:type" content="' . esc_attr( $og_type ) . '">' . "\n";
		echo '<meta property="og:site_name" content="' . esc_attr( get_bloginfo( 'name' ) ) . '">' . "\n";
		echo '<meta property="og:locale" content="pt_BR">' . "\n";
		echo '<meta property="og:title" content="' . esc_attr( $title ) . '">' . "\n";
		if ( $desc ) {
			echo '<meta property="og:description" content="' . esc_attr( $desc ) . '">' . "\n";
		}
		if ( $img ) {
			echo '<meta property="og:image" content="' . esc_url( $img ) . '">' . "\n";
		}
		echo '<meta property="og:url" content="' . esc_url( $url ) . '">' . "\n";
		foreach ( $extra as $prop => $val ) {
			echo '<meta property="' . esc_attr( $prop ) . '" content="' . esc_attr( (string) $val ) . '">' . "\n";
		}
		echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
		echo '<meta name="twitter:title" content="' . esc_attr( $title ) . '">' . "\n";
		if ( $desc ) {
			echo '<meta name="twitter:description" content="' . esc_attr( $desc ) . '">' . "\n";
		}
		if ( $img ) {
			echo '<meta name="twitter:image" content="' . esc_url( $img ) . '">' . "\n";
		}
		echo "<!-- /Todday Modas SEO -->\n";
	}

	/**
	 * JSON-LD de loja na home (evita duplicar quando há plugin de SEO).
	 */
	public static function seo_jsonld_store() {
		if ( is_admin() || ! is_front_page() || self::seo_plugin_active() ) {
			return;
		}

		$store = array(
			'@context'          => 'https://schema.org',
			'@type'             => 'Store',
			'name'              => 'Todday Modas',
			'url'               => home_url( '/' ),
			'logo'              => self::seo_image_url(),
			'description'       => get_bloginfo( 'description' ),
			'currenciesAccepted' => 'BRL',
			'paymentAccepted'   => 'Pix, Cartão de crédito, Boleto',
			'priceRange'        => '$$',
		);
		echo "\n<script type=\"application/ld+json\">\n" . wp_json_encode( $store, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . "\n</script>\n";
	}
}
