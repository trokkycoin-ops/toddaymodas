<?php
/**
 * Ofertas de checkout: order bump (checkbox na finalização) e upsell (pós-compra).
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Gerencia o order bump e o upsell a partir do painel de gestão da Todday.
 *
 * - Order bump: checkbox exibido no checkout que adiciona/remove um produto do
 *   carrinho sem sair da página. O item entra na mesma ordem e no mesmo pagamento.
 * - Upsell: card exibido na página de "Pedido recebido" que cria um novo pedido
 *   com o produto escolhido e leva o cliente direto ao pagamento.
 *
 * Configuração guardada em '_tm_ofertas_config' (option), editada pelo painel via
 * REST (zaya/v1/ofertas-config) — mesmo padrão do hero (TM_Hero).
 */
class TM_Ofertas {

	const OPTION = '_tm_ofertas_config';

	/**
	 * Hooks. Todos registrados de forma incondicional (regra do projeto).
	 */
	public static function init() {
		// AJAX público (bump no checkout e upsell pós-compra).
		add_action( 'wp_ajax_tm_bump_toggle', array( __CLASS__, 'ajax_bump_toggle' ) );
		add_action( 'wp_ajax_nopriv_tm_bump_toggle', array( __CLASS__, 'ajax_bump_toggle' ) );
		add_action( 'wp_ajax_tm_upsell_order', array( __CLASS__, 'ajax_upsell_order' ) );
		add_action( 'wp_ajax_nopriv_tm_upsell_order', array( __CLASS__, 'ajax_upsell_order' ) );

		// Bump no checkout (antes dos métodos de pagamento).
		add_action( 'woocommerce_review_order_before_payment', array( __CLASS__, 'render_bump' ), 20 );

		// Upsell na página de obrigado (depois da nota de status, prioridade 5).
		add_action( 'woocommerce_thankyou', array( __CLASS__, 'render_upsell' ), 30, 1 );

		// Preço promocional do bump no cálculo do carrinho.
		add_action( 'woocommerce_before_calculate_totals', array( __CLASS__, 'apply_bump_price' ), 10, 1 );

		// JS público precisa do endereço AJAX + nonce (handle `tm-public` já está enfileirado).
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'localize_front' ), 30 );
	}

	/**
	 * Configuração padrão (ofertas desativadas até o painel ativar).
	 *
	 * @return array
	 */
	public static function defaults() {
		return array(
			'bump'   => array(
				'on'        => false,
				'product_id' => 0,
				'titulo'    => 'Adicione também ao seu pedido',
				'preco'     => '',
			),
			'upsell' => array(
				'on'        => false,
				'product_id' => 0,
				'titulo'    => 'Aproveite e leve junto',
				'sub'       => 'Escolha um item especial para acompanhar sua compra.',
				'botao'     => 'Sim, quero este item',
				'preco'     => '',
			),
		);
	}

	/**
	 * Configuração atual (option sobre defaults).
	 *
	 * @return array
	 */
	public static function get_config() {
		$saved  = get_option( self::OPTION, array() );
		$saved  = is_array( $saved ) ? $saved : array();
		$d      = self::defaults();
		$merged = array_merge( $d, $saved );

		foreach ( array( 'bump', 'upsell' ) as $sec ) {
			$raw = ( isset( $saved[ $sec ] ) && is_array( $saved[ $sec ] ) ) ? $saved[ $sec ] : $d[ $sec ];
			$raw = array_merge( $d[ $sec ], $raw );
			$merged[ $sec ] = array(
				'on'         => ! empty( $raw['on'] ),
				'product_id' => absint( $raw['product_id'] ?? 0 ),
				'titulo'     => (string) ( $raw['titulo'] ?? $d[ $sec ]['titulo'] ),
				'preco'      => isset( $raw['preco'] ) && $raw['preco'] !== '' ? (string) $raw['preco'] : '',
			);
			if ( 'upsell' === $sec ) {
				$merged[ $sec ]['sub']   = (string) ( $raw['sub'] ?? $d[ $sec ]['sub'] );
				$merged[ $sec ]['botao'] = (string) ( $raw['botao'] ?? $d[ $sec ]['botao'] );
			}
			// Preview do produto para o painel (nome, imagem, preço atual).
			$merged[ $sec ]['product'] = self::product_preview( $merged[ $sec ]['product_id'] );
		}

		return $merged;
	}

	/**
	 * Preview de um produto para exibição no painel/ofertas.
	 *
	 * @param int $id ID do produto WooCommerce.
	 * @return array|null
	 */
	public static function product_preview( $id ) {
		$id = absint( $id );
		if ( ! $id || ! function_exists( 'wc_get_product' ) ) {
			return null;
		}
		$p = wc_get_product( $id );
		if ( ! $p || 'publish' !== $p->get_status() ) {
			return null;
		}
		$thumb = $p->get_image_id();
		return array(
			'id'    => $p->get_id(),
			'name'  => $p->get_name(),
			'image' => $thumb ? wp_get_attachment_image_url( $thumb, 'woocommerce_thumbnail' ) : '',
			'price' => (float) $p->get_price(),
		);
	}

	/**
	 * Valida e grava a configuração vinda do painel (REST).
	 *
	 * @param array $body Payload (un-slashed).
	 * @return array Configuração limpa.
	 */
	public static function save_config( $body ) {
		$body  = is_array( $body ) ? $body : array();
		$clean = self::defaults();

		foreach ( array( 'bump', 'upsell' ) as $sec ) {
			$raw = ( isset( $body[ $sec ] ) && is_array( $body[ $sec ] ) ) ? $body[ $sec ] : array();
			$clean[ $sec ]['on']         = ! empty( $raw['on'] ) || ! empty( $raw['on_'] );
			$clean[ $sec ]['product_id'] = absint( $raw['product_id'] ?? 0 );
			$clean[ $sec ]['titulo']     = sanitize_text_field( $raw['titulo'] ?? $clean[ $sec ]['titulo'] );
			$preco = $raw['preco'] ?? '';
			if ( $preco !== '' ) {
				$preco = str_replace( array( 'R$', ' ', ',' ), array( '', '', '.' ), (string) $preco );
				$preco = round( (float) $preco, 2 );
				$clean[ $sec ]['preco'] = $preco > 0 ? (string) $preco : '';
			} else {
				$clean[ $sec ]['preco'] = '';
			}
			if ( 'upsell' === $sec ) {
				$clean[ $sec ]['sub']   = sanitize_text_field( $raw['sub'] ?? $clean[ $sec ]['sub'] );
				$clean[ $sec ]['botao'] = sanitize_text_field( $raw['botao'] ?? $clean[ $sec ]['botao'] );
			}
		}

		update_option( self::OPTION, $clean );
		return self::get_config();
	}

	/**
	 * Preço efetivo de uma oferta (promocional se preenchido, senão o do produto).
	 *
	 * @param array  $sec Config da seção.
	 * @param object $p   Produto.
	 * @return float
	 */
	private static function offer_price( $sec, $p ) {
		if ( ( $sec['preco'] ?? '' ) !== '' ) {
			return (float) $sec['preco'];
		}
		return (float) $p->get_price();
	}

	/**
	 * Order bump: card com checkbox antes dos métodos de pagamento no checkout.
	 */
	public static function render_bump() {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return;
		}
		$cfg = self::get_config();
		$b   = $cfg['bump'];
		if ( empty( $b['on'] ) || empty( $b['product_id'] ) ) {
			return;
		}
		$p = wc_get_product( $b['product_id'] );
		if ( ! $p || 'publish' !== $p->get_status() || ! $p->is_purchasable() ) {
			return;
		}
		$price = self::offer_price( $b, $p );

		// Já está no carrinho? Marca o checkbox (qualquer item, não só bump).
		$in_cart = false;
		if ( is_callable( array( WC()->cart, 'get_cart' ) ) ) {
			foreach ( WC()->cart->get_cart() as $item ) {
				if ( (int) ( $item['product_id'] ?? 0 ) === (int) $b['product_id'] ) {
					$in_cart = true;
					break;
				}
			}
		}

		$thumb = $p->get_image_id();
		$img   = $thumb ? wp_get_attachment_image_url( $thumb, 'woocommerce_thumbnail' ) : '';

		echo '<div class="tm-bump" data-tm-bump data-product="' . esc_attr( $b['product_id'] ) . '">';
		echo '<div class="tm-bump-media">' . ( $img ? '<img src="' . esc_url( $img ) . '" alt="' . esc_attr( $p->get_name() ) . '" loading="lazy">' : '<span class="tm-bump-ico">★</span>' ) . '</div>';
		echo '<div class="tm-bump-body">';
		echo '<span class="tm-bump-titulo">' . esc_html( $b['titulo'] ) . '</span>';
		echo '<span class="tm-bump-item">' . esc_html( $p->get_name() ) . '</span>';
		echo '</div>';
		echo '<label class="tm-bump-acao">';
		echo '<input type="checkbox"' . ( $in_cart ? ' checked' : '' ) . '>';
		echo '<span class="tm-bump-preco">' . wp_kses_post( wc_price( $price ) ) . '</span>';
		echo '</label>';
		echo '</div>';
	}

	/**
	 * Upsell: card na página de agradecimento com botão que cria novo pedido.
	 *
	 * @param int $order_id ID do pedido recém finalizado.
	 */
	public static function render_upsell( $order_id ) {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return;
		}
		$cfg = self::get_config();
		$u   = $cfg['upsell'];
		if ( empty( $u['on'] ) || empty( $u['product_id'] ) ) {
			return;
		}
		$order = wc_get_order( absint( $order_id ) );
		if ( ! $order ) {
			return;
		}
		if ( ! in_array( $order->get_status(), array( 'processing', 'completed', 'on-hold' ), true ) ) {
			return;
		}
		$p = wc_get_product( $u['product_id'] );
		if ( ! $p || 'publish' !== $p->get_status() || ! $p->is_purchasable() ) {
			return;
		}

		// Não oferece se o produto já está no pedido.
		foreach ( $order->get_items() as $item ) {
			if ( (int) $item->get_product_id() === (int) $u['product_id'] ) {
				return;
			}
		}

		$price = self::offer_price( $u, $p );
		$thumb = $p->get_image_id();
		$img   = $thumb ? wp_get_attachment_image_url( $thumb, 'woocommerce_thumbnail' ) : '';

		echo '<div class="tm-upsell" data-tm-upsell data-order="' . esc_attr( $order->get_id() ) . '" data-product="' . esc_attr( $u['product_id'] ) . '">';
		echo '<div class="tm-upsell-media">' . ( $img ? '<img src="' . esc_url( $img ) . '" alt="' . esc_attr( $p->get_name() ) . '" loading="lazy">' : '<span class="tm-upsell-ico">★</span>' ) . '</div>';
		echo '<div class="tm-upsell-body">';
		echo '<span class="tm-upsell-kicker">' . esc_html__( 'Você também vai amar', 'todday-modas' ) . '</span>';
		echo '<span class="tm-upsell-titulo">' . esc_html( $u['titulo'] ) . '</span>';
		echo '<span class="tm-upsell-item">' . esc_html( $p->get_name() ) . '</span>';
		if ( ! empty( $u['sub'] ) ) {
			echo '<span class="tm-upsell-sub">' . esc_html( $u['sub'] ) . '</span>';
		}
		echo '</div>';
		echo '<div class="tm-upsell-acao">';
		echo '<span class="tm-upsell-preco">' . wp_kses_post( wc_price( $price ) ) . '</span>';
		echo '<button type="button" class="tm-upsell-btn" data-label="' . esc_attr( $u['botao'] ) . '">' . esc_html( $u['botao'] ) . '</button>';
		echo '</div>';
		echo '</div>';
	}

	/**
	 * Aplica o preço promocional do bump ao item marcado dentro do carrinho.
	 *
	 * @param \WC_Cart $cart Carrinho.
	 */
	public static function apply_bump_price( $cart ) {
		if ( empty( $cart ) ) {
			return;
		}
		$cfg = self::get_config();
		$b   = $cfg['bump'];
		if ( empty( $b['on'] ) || ( $b['preco'] ?? '' ) === '' ) {
			return;
		}
		$promo = (float) $b['preco'];
		if ( $promo <= 0 ) {
			return;
		}
		foreach ( $cart->get_cart() as $item ) {
			if ( ! empty( $item['tm_bump'] ) && isset( $item['data'] ) && is_callable( array( $item['data'], 'set_price' ) ) ) {
				$item['data']->set_price( $promo );
			}
		}
	}

	/**
	 * AJAX: liga/desliga o bump no carrinho sem recarregar o checkout.
	 */
	public static function ajax_bump_toggle() {
		check_ajax_referer( 'tm_ofertas', 'nonce' );

		if ( ! function_exists( 'wc_get_product' ) || ! is_callable( array( WC()->cart, 'add_to_cart' ) ) ) {
			wp_send_json_error( array( 'message' => 'Carrinho indisponível no momento.' ), 400 );
		}

		$cfg       = self::get_config();
		$b         = $cfg['bump'];
		$product_id = absint( $_POST['product_id'] ?? 0 );
		$on        = ! empty( $_POST['on'] );

		if ( empty( $b['on'] ) || (int) $b['product_id'] !== $product_id ) {
			wp_send_json_error( array( 'message' => 'Esta oferta não está mais disponível.' ), 400 );
		}
		$p = wc_get_product( $product_id );
		if ( ! $p || ! $p->is_purchasable() || 'publish' !== $p->get_status() ) {
			wp_send_json_error( array( 'message' => 'Este produto não está mais disponível.' ), 400 );
		}

		$cart = WC()->cart;

		// Localiza o item marcado como bump deste produto.
		$found_key = null;
		foreach ( $cart->get_cart() as $key => $item ) {
			if ( ! empty( $item['tm_bump'] ) && (int) ( $item['product_id'] ?? 0 ) === $product_id ) {
				$found_key = $key;
				break;
			}
		}

		if ( $on && null === $found_key ) {
			// Se já houver o produto como item normal, não duplica; apenas marca como bump.
			foreach ( $cart->get_cart() as $key => $item ) {
				if ( (int) ( $item['product_id'] ?? 0 ) === $product_id ) {
					$found_key = $key;
					break;
				}
			}
			if ( null === $found_key ) {
				$cart->add_to_cart( $product_id, 1, 0, array(), array( 'tm_bump' => true ) );
			}
		} elseif ( ! $on && null !== $found_key ) {
			$cart->remove_cart_item( $found_key );
		}

		$cart->calculate_totals();
		wp_send_json_success( array( 'on' => $on, 'cart_count' => $cart->get_cart_contents_count() ) );
	}

	/**
	 * AJAX: cria um novo pedido com o produto do upsell e devolve a URL de pagamento.
	 */
	public static function ajax_upsell_order() {
		check_ajax_referer( 'tm_ofertas', 'nonce' );

		if ( ! function_exists( 'wc_create_order' ) ) {
			wp_send_json_error( array( 'message' => 'Loja indisponível no momento.' ), 400 );
		}

		$cfg       = self::get_config();
		$u         = $cfg['upsell'];
		$product_id = absint( $_POST['product_id'] ?? 0 );
		$order_id  = absint( $_POST['order_id'] ?? 0 );

		if ( empty( $u['on'] ) || (int) $u['product_id'] !== $product_id ) {
			wp_send_json_error( array( 'message' => 'Esta oferta não está mais disponível.' ), 400 );
		}
		$p = wc_get_product( $product_id );
		if ( ! $p || ! $p->is_purchasable() || 'publish' !== $p->get_status() ) {
			wp_send_json_error( array( 'message' => 'Este produto não está mais disponível.' ), 400 );
		}

		$source = $order_id ? wc_get_order( $order_id ) : null;
		if ( ! $source ) {
			wp_send_json_error( array( 'message' => 'Pedido original não encontrado.' ), 400 );
		}

		$price = self::offer_price( $u, $p );
		// Produto com o preço da oferta para gravar no subtotal do item.
		$priced = wc_get_product( $product_id );
		if ( ! empty( $u['preco'] ) && (float) $u['preco'] > 0 ) {
			$priced->set_price( (float) $u['preco'] );
		}

		$order = wc_create_order( array( 'customer_id' => $source->get_customer_id() ) );
		$order->add_product( $priced, 1 );
		$order->set_currency( $source->get_currency() );

		// Copia os dados de cobrança/entrega do pedido original.
		foreach ( array( 'billing', 'shipping' ) as $type ) {
			foreach ( array( 'first_name', 'last_name', 'company', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country', 'phone', 'email' ) as $field ) {
				$value = $source->{"get_{$type}_{$field}"}();
				$order->{"set_{$type}_{$field}"}( $value );
			}
		}

		// Fornece o contexto (vindo de um upsell pós-compra) para o histórico.
		$order->add_order_note( sprintf( 'Pedido criado por upsell a partir do pedido #%d.', $source->get_id() ) );
		$order->update_meta_data( '_tm_upsell_source', $source->get_id() );

		$order->calculate_totals();
		$order->update_status( 'pending' );
		$order->save();

		// Garante que métodos de pagamento disponíveis sejam carregados na página de pagamento.
		WC()->payment_gateways();

		wp_send_json_success( array(
			'order_id'   => $order->get_id(),
			'pay_url'    => str_replace( '&#038;', '&', $order->get_checkout_payment_url() ),
		) );
	}

	/**
	 * Fornece o endereço AJAX e o nonce para os handlers públicos (handle tm-public).
	 */
	public static function localize_front() {
		wp_localize_script( 'tm-public', 'TM_OfertasCfg', array(
			'ajax'         => admin_url( 'admin-ajax.php' ),
			'nonce'        => wp_create_nonce( 'tm_ofertas' ),
			'cartPage'     => function_exists( 'wc_get_cart_url' ) ? esc_url_raw( wc_get_cart_url() ) : '',
			'errorGeneric' => __( 'Não foi possível processar. Tente novamente.', 'todday-modas' ),
		) );
	}
}