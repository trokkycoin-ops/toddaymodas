<?php
/**
 * Extensões do WooCommerce: e-mails com a marca, selos, frete grátis, frete.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Hooks de integração com o WooCommerce (somente filters/actions — nada reimplementado).
 */
class TM_WooCommerce {

	/**
	 * Hooks.
	 */
	public static function init() {
		// E-mails transacionais com as cores da marca.
		add_filter( 'woocommerce_email_styles', array( __CLASS__, 'email_styles' ) );

		// Selos de segurança no checkout.
		add_action( 'woocommerce_review_order_after_payment', array( __CLASS__, 'checkout_trust_badges' ) );

		// Aviso de frete grátis na loja/produto/carrinho.
		$min = (float) TM_Helpers::get( 'tm_free_shipping_min', 0 );
		if ( $min > 0 ) {
			add_action( 'woocommerce_before_shop_loop', array( __CLASS__, 'free_shipping_notice' ), 5 );
			add_action( 'woocommerce_before_cart', array( __CLASS__, 'free_shipping_notice' ), 5 );
		}

		// Mensagem de status do pedido na página de obrigado (Pix pendente etc.).
		add_action( 'woocommerce_thankyou', array( __CLASS__, 'thankyou_status_note' ), 5, 1 );
	}

	/**
	 * Aplica a paleta da marca nos e-mails transacionais do WooCommerce.
	 *
	 * @param string $css CSS original dos e-mails.
	 * @return string
	 */
	public static function email_styles( $css ) {
		$destaque   = TM_Helpers::get( 'tm_color_destaque' );
		$secundaria = TM_Helpers::get( 'tm_color_secundaria' );

		$css .= '#template_header { background-color: ' . esc_attr( $secundaria ) . '; }';
		$css .= '#template_header h1 { color: #ffffff; }';
		$css .= '#template_footer td { color: ' . esc_attr( $secundaria ) . '; }';
		$css .= '.button, a.link { color: ' . esc_attr( $destaque ) . '; }';
		return $css;
	}

	/**
	 * Aviso "Frete grátis acima de R$ X".
	 */
	public static function free_shipping_notice() {
		$min = (float) TM_Helpers::get( 'tm_free_shipping_min', 0 );
		if ( $min <= 0 ) {
			return;
		}
		printf(
			'<div class="tm-free-shipping-badge" role="note">%s</div>',
			sprintf(
				/* translators: %s: valor mínimo formatado */
				esc_html__( '🚚 Frete grátis em compras acima de %s', 'todday-modas' ),
				esc_html( wc_price( $min ) )
			)
		);
	}

	/**
	 * Selos de segurança logo abaixo dos métodos de pagamento no checkout.
	 */
	public static function checkout_trust_badges() {
		echo '<div class="tm-trust-badges">';
		echo '<span>' . esc_html__( '🔒 Compra 100% segura', 'todday-modas' ) . '</span>';
		echo '<span>' . esc_html__( '↩️ Troca facilitada', 'todday-modas' ) . '</span>';
		echo '<span>' . esc_html__( '💳 Pagamento via Mercado Pago', 'todday-modas' ) . '</span>';
		echo '</div>';
	}

	/**
	 * Nota de status no topo da página "Pedido recebido" (ex.: Pix aguardando pagamento).
	 *
	 * @param int $order_id ID do pedido.
	 */
	public static function thankyou_status_note( $order_id ) {
		$order = wc_get_order( absint( $order_id ) );
		if ( ! $order ) {
			return;
		}

		$msg = '';
		if ( $order->has_status( 'on-hold' ) ) {
			$msg = __( '⏳ Pagamento identificado como pendente. Se você pagou via Pix ou boleto, a confirmação chega em instantes (boleto pode levar até 2 dias úteis).', 'todday-modas' );
		} elseif ( $order->has_status( 'processing' ) || $order->has_status( 'completed' ) ) {
			$msg = __( '✅ Pagamento confirmado! Já estamos preparando seu pedido.', 'todday-modas' );
		}

		if ( $msg ) {
			echo '<p class="tm-thankyou-note woocommerce-message">' . esc_html( $msg ) . '</p>';
		}
	}
}
