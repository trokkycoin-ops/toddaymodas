<?php
/**
 * Experiencia de produto para moda: swatches de cor/tamanho, tabela de
 * medidas por categoria e ficha tecnica (composicao, dimensoes, peso, lavagem).
 *
 * Tambem gerencia o atributo global "Cor" e a conversao de acessorios
 * em produtos variaveis (upgrade idempotente por versao).
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Extensoes de produto focadas em moda.
 */
class TM_Produto {

	/** Versao desta rotina de upgrade. */
	const UPGRADE_VER = '1.0.14';

	/** Mapas de cores por produto (upgrade). */
	const CORES_ACESSORIOS = array(
		179 => array(
			'cores'      => array( 'caramelo', 'preto', 'nude' ),
			'prefixo_sku' => 'BOLSA-TOTE',
		),
		181 => array(
			'cores'      => array( 'dourado', 'preto' ),
			'prefixo_sku' => 'CINTO-FINO',
		),
		183 => array(
			'cores'      => array( 'tartaruga', 'preto' ),
			'prefixo_sku' => 'OCULOS-RETRO',
		),
		185 => array(
			'cores'      => array( 'vermelho', 'azul' ),
			'prefixo_sku' => 'LENCO-SEDA',
		),
	);

	/** Hex por termo do atributo cor. */
	const HEX_CORES = array(
		'caramelo'  => '#C68A4E',
		'preto'     => '#1C1A17',
		'nude'      => '#E3C9A6',
		'dourado'   => '#C4A35A',
		'tartaruga' => '#6B4F3A',
		'vermelho'  => '#A63A3A',
		'azul'      => '#3A5E8C',
	);

	/**
	 * Hooks.
	 */
	public static function init() {
		add_action( 'admin_init', array( __CLASS__, 'upgrade' ) );
		add_action( 'add_meta_boxes', array( __CLASS__, 'ficha_meta_box' ), 30, 2 );
		add_action( 'save_post_product', array( __CLASS__, 'salvar_ficha' ), 20, 2 );

		add_filter( 'woocommerce_dropdown_variation_attribute_options_html', array( __CLASS__, 'swatches_html' ), 10, 2 );
		add_action( 'woocommerce_before_add_to_cart_button', array( __CLASS__, 'link_tamanho' ) );
		add_action( 'woocommerce_single_product_summary', array( __CLASS__, 'bloco_ficha' ), 60 );
		add_action( 'woocommerce_before_single_product', array( __CLASS__, 'modal_tamanhos' ) );

		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'estilos_admin_unico' ) );
	}

	/**
	 * CSS extra para o admin (swatch placeholder no meta box).
	 */
	public static function estilos_admin_unico() {
		if ( is_admin() && function_exists( 'get_current_screen' ) ) {
			$screen = get_current_screen();
			if ( $screen && 'product' === $screen->post_type && 'post' === $screen->base ) {
				wp_add_inline_style( 'wp-admin', '.tm-ficha-campo{margin:.5em 0}.tm-ficha-campo label{display:block;font-weight:600;margin-bottom:4px}.tm-ficha-campo input[type=text]{width:100%}' );
			}
		}
	}

	/**
	 * Upgrade idempotente: cria atributo Cor e converte acessorios exemplo
	 * em produtos variaveis com swatch de cor.
	 */
	public static function upgrade() {
		$feito = get_option( '_tm_produto_upgrade' );
		if ( $feito === self::UPGRADE_VER ) {
			return;
		}
		self::criar_atributo_cor();
		self::converter_acessorios();
		update_option( '_tm_produto_upgrade', self::UPGRADE_VER );
	}

	/**
	 * Cria o atributo global pa_cor (so se ainda nao existir) com os termos
	 * da marca e o hex de cada um.
	 */
	private static function criar_atributo_cor() {
		global $wpdb;
		$tax = wc_attribute_taxonomy_name( 'cor' );

		$existe = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT attribute_id FROM {$wpdb->prefix}woocommerce_attribute_taxonomies WHERE attribute_name = %s LIMIT 1",
				'cor'
			)
		);
		if ( ! $existe ) {
			$inseriu = $wpdb->insert(
				$wpdb->prefix . 'woocommerce_attribute_taxonomies',
				array(
					'attribute_name'    => 'cor',
					'attribute_label'   => 'Cor',
					'attribute_type'    => 'select',
					'attribute_orderby' => 'menu_order',
					'attribute_public'  => 0,
				)
			);
			if ( ! $inseriu ) {
				TM_Logger::add( 'error', 'Falha ao criar atributo Cor no banco.' );
				return;
			}
			delete_transient( 'wc_attribute_taxonomies' );
			WC_Cache_Helper::invalidate_cache_group( 'woocommerce-attributes' );
			flush_rewrite_rules();
		}

		foreach ( self::HEX_CORES as $slug => $hex ) {
			if ( ! term_exists( $slug, $tax ) ) {
				$novo = wp_insert_term( ucfirst( $slug ), $tax, array( 'slug' => $slug ) );
				if ( ! is_wp_error( $novo ) ) {
					update_term_meta( $novo['term_id'], '_tm_cor_hex', $hex );
				}
			} else {
				$termo = get_term_by( 'slug', $slug, $tax );
				if ( $termo ) {
					update_term_meta( $termo->term_id, '_tm_cor_hex', $hex );
				}
			}
		}
	}

	/**
	 * Converte os acessorios (simple) em produtos variaveis por cor.
	 */
	private static function converter_acessorios() {
		$tax = wc_attribute_taxonomy_name( 'cor' );
		if ( ! taxonomy_exists( $tax ) ) {
			return;
		}
		foreach ( self::CORES_ACESSORIOS as $produto_id => $cfg ) {
			$produto = wc_get_product( $produto_id );
			if ( ! $produto || 'simple' !== $produto->get_type() ) {
				continue;
			}
			$preco      = (float) $produto->get_regular_price( 'edit' );
			$estoque    = (int) $produto->get_stock_quantity( 'edit' );
			$estoque_pc = max( 1, (int) floor( $estoque / count( $cfg['cores'] ) ) );
			if ( $preco <= 0 ) {
				TM_Logger::add( 'warning', "Acessorio $produto_id sem preco; pulando conversao." );
				continue;
			}

			$thumb   = get_post_thumbnail_id( $produto_id );
			$galeria = get_post_meta( $produto_id, '_product_image_gallery', true );
			$peso    = $produto->get_weight( 'edit' );
			$len     = $produto->get_length( 'edit' );
			$wid     = $produto->get_width( 'edit' );
			$hei     = $produto->get_height( 'edit' );

			$attr = new WC_Product_Attribute();
			$attr->set_id( wc_attribute_taxonomy_id_by_name( 'cor' ) );
			$attr->set_name( $tax );
			$attr->set_options( $cfg['cores'] );
			$attr->set_position( 0 );
			$attr->set_visible( true );
			$attr->set_variation( true );

			$produto->set_attributes( array( $tax => $attr ) );
			$produto->set_regular_price( '' );
			$produto->save();

			wp_set_object_terms( $produto_id, $cfg['cores'], $tax );
			wp_remove_object_terms( $produto_id, 'simple', 'product_type' );
			delete_post_meta( $produto_id, '_price' );
			delete_post_meta( $produto_id, '_regular_price' );
			delete_post_meta( $produto_id, '_manage_stock' );
			wp_set_object_terms( $produto_id, 'variable', 'product_type' );

			$produto = wc_get_product( $produto_id );

			$i = 0;
			foreach ( $cfg['cores'] as $cor_slug ) {
				$i++;
				$variacao = new WC_Product_Variation();
				$variacao->set_parent_id( $produto_id );
				$variacao->set_attributes( array( $tax => $cor_slug ) );
				$variacao->set_regular_price( (string) wc_format_decimal( $preco, wc_get_price_decimals() ) );
				$variacao->set_sku( $cfg['prefixo_sku'] . '-' . strtoupper( $cor_slug ) . '-X' . $i );
				$variacao->set_manage_stock( true );
				$variacao->set_stock_quantity( $estoque_pc );
				$variacao->set_weight( (string) $peso );
				$variacao->set_length( (string) $len );
				$variacao->set_width( (string) $wid );
				$variacao->set_height( (string) $hei );
				if ( $thumb ) {
					$variacao->set_image_id( $thumb );
				}
				$variacao->save();
				TM_Logger::add( 'info', "Variacao $produto_id/$cor_slug criada." );
			}

			if ( $galeria ) {
				update_post_meta( $produto_id, '_product_image_gallery', $galeria );
			}
			WC_Product_Variable::sync( $produto_id );
			wc_delete_product_transients( $produto_id );
			clean_post_cache( $produto_id );
			TM_Logger::add( 'info', "Acessorio $produto_id convertido em produto variavel." );
		}
	}

	/**
	 * Meta box "Ficha tecnica" no painel do produto.
	 *
	 * @param string $post_type Tipo do post.
	 * @param WP_Post $post     Post atual.
	 */
	public static function ficha_meta_box( $post_type, $post ) {
		if ( ! function_exists( 'get_product' ) && function_exists( 'wc_get_product' ) ) {
			$produto = wc_get_product( $post->ID );
			if ( ! $produto ) {
				return;
			}
		}
		add_meta_box(
			'tm_ficha_tecnica',
			__( 'Ficha técnica', 'todday-modas' ),
			array( __CLASS__, 'render_ficha_meta_box' ),
			'product',
			'normal',
			'default'
		);
	}

	/**
	 * Renderiza os campos da ficha tecnica.
	 *
	 * @param WP_Post $post Post do produto.
	 */
	public static function render_ficha_meta_box( $post ) {
		wp_nonce_field( 'tm_ficha_save', 'tm_ficha_nonce' );
		$campos = array(
			'tm_ficha_composicao' => __( 'Composição', 'todday-modas' ),
			'tm_ficha_lavagem'    => __( 'Instruções de lavagem', 'todday-modas' ),
			'tm_ficha_acabamento' => __( 'Acabamento / modelagem', 'todday-modas' ),
		);
		$medidas = __( 'Preencha dimensões e peso no painel "Dados do produto" (também alimentam o frete).', 'todday-modas' );
		echo '<div style="padding:8px 0">';
		echo '<p style="margin:0 0 10px;color:#646970">' . esc_html( $medidas ) . '</p>';
		foreach ( $campos as $meta => $label ) {
			$valor = get_post_meta( $post->ID, '_' . $meta, true );
			echo '<div class="tm-ficha-campo">';
			echo '<label for="' . esc_attr( $meta ) . '">' . esc_html( $label ) . '</label>';
			echo '<input type="text" id="' . esc_attr( $meta ) . '" name="' . esc_attr( $meta ) . '" value="' . esc_attr( $valor ) . '" placeholder="' . esc_attr__( 'Ex.: 100% algodão, couro sintético…', 'todday-modas' ) . '">';
			echo '</div>';
		}
		echo '<p style="margin:10px 0 0;color:#646970;font-size:12px">' . esc_html__( 'Esses campos aparecem no bloco "Ficha técnica" na página do produto.', 'todday-modas' ) . '</p>';
		echo '</div>';
	}

	/**
	 * Salva a ficha tecnica.
	 *
	 * @param int      $post_id ID do produto.
	 * @param WP_Post  $post    Post.
	 */
	public static function salvar_ficha( $post_id, $post ) {
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}
		if ( ! isset( $_POST['tm_ficha_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['tm_ficha_nonce'] ), 'tm_ficha_save' ) ) {
			return;
		}
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
		$metas = array( 'tm_ficha_composicao', 'tm_ficha_lavagem', 'tm_ficha_acabamento' );
		foreach ( $metas as $meta ) {
			$valor = isset( $_POST[ $meta ] ) ? sanitize_text_field( wp_unslash( $_POST[ $meta ] ) ) : '';
			if ( '' === $valor ) {
				delete_post_meta( $post_id, '_' . $meta );
			} else {
				update_post_meta( $post_id, '_' . $meta, $valor );
			}
		}
	}

	/**
	 * Substitui o seletor padrao do Woo por swatches visuais.
	 * - Cor: circulos com o hex do termo.
	 * - Tamanho/numeração: etiquetas (pills).
	 *
	 * @param string $html HTML do select padrao.
	 * @param array  $args Argumentos do dropdown.
	 * @return string
	 */
	public static function swatches_html( $html, $args ) {
		global $product;
		if ( is_admin() || empty( $args['attribute'] ) || empty( $args['options'] ) ) {
			return $html;
		}
		$tax = $args['attribute']; // WC já passa o nome completo (pa_cor).
		if ( ! taxonomy_exists( $tax ) ) {
			return $html;
		}
		$eh_cor = ( 'pa_cor' === $tax );
		$name   = wc_variation_attribute_name( $args['attribute'] );
		$selecionada = isset( $args['selected'] ) ? $args['selected'] : '';

		$botoes = '';
		$count  = 0;
		foreach ( $args['options'] as $option ) {
			$termo = get_term_by( 'slug', $option, $tax );
			if ( ! $termo ) {
				continue;
			}
			$count++;
			$hex  = get_term_meta( $termo->term_id, '_tm_cor_hex', true );
			$rotulo = $termo->name;
			$classe = 'tm-swatch';
			if ( $eh_cor ) {
				$classe .= ' tm-swatch--cor';
			}
			if ( strval( $option ) === strval( $selecionada ) ) {
				$classe .= ' is-selecionado';
			}
			$botoes .= '<button type="button" class="' . esc_attr( $classe ) . '" data-tm-valor="' . esc_attr( $option ) . '" role="radio" aria-checked="false" aria-label="' . esc_attr( $rotulo ) . '"'
				. ( $eh_cor && $hex ? ' style="--tm-swatch-cor:' . esc_attr( $hex ) . '"' : '' )
				. '><span class="tm-swatch-nucleo">' . esc_html( $rotulo ) . '</span></button>';
		}
		if ( 0 === $count ) {
			return $html;
		}

		$rotulo_attr = $eh_cor ? __( 'Cor', 'todday-modas' ) : __( 'Opção', 'todday-modas' );
		if ( 'pa_tamanho' === $tax || 'pa_numeracao' === $tax ) {
			$rotulo_attr = __( 'Tamanho', 'todday-modas' );
		}

		$oculta = 'tm-swatch-select';
		$novo   = '<span class="tm-swatches" data-destino="' . esc_attr( $name ) . '" role="radiogroup" aria-label="' . esc_attr( $rotulo_attr ) . '">' . $botoes . '</span>';
		$novo  .= '<span class="' . esc_attr( $oculta ) . '">' . $html . '</span>';
		return $novo;
	}

	/**
	 * Link "Qual é o meu tamanho?" para produtos com numeracao/tamanho.
	 */
	public static function link_tamanho() {
		global $product;
		if ( ! is_a( $product, 'WC_Product' ) || 'variable' !== $product->get_type() ) {
			return;
		}
		$tem_tamanho = false;
		foreach ( $product->get_variation_attributes() as $tax => $opcoes ) {
			if ( 'pa_tamanho' === $tax || 'pa_numeracao' === $tax ) {
				$tem_tamanho = true;
				break;
			}
		}
		if ( ! $tem_tamanho ) {
			return;
		}
		$cats = wp_get_post_terms( $product->get_id(), 'product_cat', array( 'fields' => 'slugs' ) );
		if ( empty( array_intersect( $cats, array( 'camisetas', 'calcas', 'vestidos', 'calcados' ) ) ) ) {
			return;
		}
		echo '<button type="button" class="tm-btn-medidas" data-tm-abre-medidas="' . esc_attr( (string) $product->get_id() ) . '">';
		echo '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h3l2 4 4-8 4 8 3-6h2"/><path d="M3 12h18"/></svg>';
		echo esc_html__( 'Qual é o meu tamanho?', 'todday-modas' );
		echo '</button>';
	}

	/**
	 * Formata uma medida em cm a partir do valor bruto (WC 11 não tem wc_format_dimension).
	 */
	private static function dimensionar( $valor ) {
		$unidade = get_option( 'woocommerce_dimension_unit', 'cm' );
		$valor   = wc_format_decimal( $valor, 1 );
		return $valor . ( $unidade ? ' ' . $unidade : '' );
	}

	/**
	 * Bloco "Ficha técnica" no resumo do produto (single).
	 */
	public static function bloco_ficha() {
		global $product;
		if ( ! is_a( $product, 'WC_Product' ) ) {
			return;
		}
		$linhas = array();
		$comp   = get_post_meta( $product->get_id(), '_tm_ficha_composicao', true );
		$lav    = get_post_meta( $product->get_id(), '_tm_ficha_lavagem', true );
		$acab   = get_post_meta( $product->get_id(), '_tm_ficha_acabamento', true );
		if ( $comp ) {
			$linhas[ __( 'Composição', 'todday-modas' ) ] = $comp;
		}
		if ( $acab ) {
			$linhas[ __( 'Acabamento', 'todday-modas' ) ] = $acab;
		}

		$dims = array_filter(
			array(
				$product->get_length() ? self::dimensionar( $product->get_length() ) : '',
				$product->get_width()  ? self::dimensionar( $product->get_width() ) : '',
				$product->get_height() ? self::dimensionar( $product->get_height() ) : '',
			)
		);
		if ( $dims ) {
			$linhas[ __( 'Dimensões (L×C×A)', 'todday-modas' ) ] = implode( ' × ', $dims );
		}
		if ( $product->get_weight() ) {
			$linhas[ __( 'Peso', 'todday-modas' ) ] = wc_format_weight( $product->get_weight() );
		}
		if ( $lav ) {
			$linhas[ __( 'Lavagem', 'todday-modas' ) ] = $lav;
		}
		if ( empty( $linhas ) ) {
			return;
		}

		echo '<div class="tm-ficha" id="tm-ficha">';
		echo '<h3 class="tm-ficha-titulo">' . esc_html__( 'Ficha técnica', 'todday-modas' ) . '</h3>';
		echo '<dl class="tm-ficha-lista">';
		foreach ( $linhas as $rotulo => $valor ) {
			echo '<div class="tm-ficha-linha"><dt>' . esc_html( $rotulo ) . '</dt><dd>' . esc_html( $valor ) . '</dd></div>';
		}
		echo '</dl></div>';
	}

	/**
	 * Renderiza o modal de tabela de medidas no footer do single product
	 * (somente quando houver link para abrir).
	 */
	public static function modal_tamanhos() {
		global $product;
		if ( ! is_a( $product, 'WC_Product' ) || 'variable' !== $product->get_type() ) {
			return;
		}
		$cats = wp_get_post_terms( $product->get_id(), 'product_cat', array( 'fields' => 'slugs' ) );
		$tabela = self::tabela_medidas( $cats );
		if ( ! $tabela ) {
			return;
		}
		?>
		<div class="tm-modal-medidas" id="tm-modal-medidas" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Tabela de medidas', 'todday-modas' ); ?>" hidden>
			<button type="button" class="tm-modal-medidas-bg" data-tm-fecha-medidas aria-label="<?php esc_attr_e( 'Fechar', 'todday-modas' ); ?>"></button>
			<div class="tm-modal-medidas-card">
				<button type="button" class="tm-modal-medidas-fechar" data-tm-fecha-medidas aria-label="<?php esc_attr_e( 'Fechar', 'todday-modas' ); ?>">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
				</button>
				<h3 class="tm-modal-medidas-titulo"><?php esc_html_e( 'Qual é o meu tamanho?', 'todday-modas' ); ?></h3>
				<div class="tm-modal-medidas-tabela"><?php echo wp_kses_post( $tabela['html'] ); ?></div>
				<?php if ( ! empty( $tabela['obs'] ) ) : ?>
					<p class="tm-modal-medidas-obs"><?php echo esc_html( $tabela['obs'] ); ?></p>
				<?php endif; ?>
			</div>
		</div>
		<?php
	}

	/**
	 * Monta a tabela de medidas por categoria (pecas do corpo, como as marcas grandes).
	 *
	 * @param array $cats Slugs de categoria.
	 * @return array|null ['html'=>string, 'obs'=>string]
	 */
	public static function tabela_medidas( $cats ) {
		$mapa = require TM_PLUGIN_DIR . 'includes/data-tabelas-medidas.php';
		foreach ( $cats as $cat ) {
			if ( isset( $mapa[ $cat ] ) ) {
				$linhas = $mapa[ $cat ]['linhas'];
				$html   = '<table class="tm-tabela-medidas"><thead><tr><th>' . esc_html__( 'Tamanho', 'todday-modas' ) . '</th>';
				foreach ( $mapa[ $cat ]['colunas'] as $coluna ) {
					$html .= '<th>' . esc_html( $coluna ) . '</th>';
				}
				$html .= '</tr></thead><tbody>';
				foreach ( $linhas as $tam => $medidas ) {
					$html .= '<tr><td><strong>' . esc_html( $tam ) . '</strong></td>';
					foreach ( $medidas as $medida ) {
						$html .= '<td>' . esc_html( $medida ) . '</td>';
					}
					$html .= '</tr>';
				}
				$html .= '</tbody></table>';
				return array(
					'html' => $html,
					'obs'  => isset( $mapa[ $cat ]['obs'] ) ? $mapa[ $cat ]['obs'] : __( 'Medidas aproximadas da peça em repouso; cada modelagem pode variar. Na dúvida, meça uma peça sua que vista bem.', 'todday-modas' ),
				);
			}
		}
		return null;
	}
}