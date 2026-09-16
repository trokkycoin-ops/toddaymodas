<?php
/**
 * Template do Carrinho Todday Modas Brechó.
 *
 * @package ToddayModasBrecho
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="tdm-cart-wrapper" id="todday-cart-app">
    <h2 class="tdm-section-title">Minha Sacola de Garimpos</h2>

    <div class="tdm-cart-layout">
        <!-- Lista de Itens -->
        <div class="tdm-cart-items-column" id="tdm-cart-items-container">
            <div class="tdm-loading-state">
                <div class="tdm-spinner"></div>
                <p>Carregando itens da sacola...</p>
            </div>
        </div>

        <!-- Resumo do Pedido -->
        <div class="tdm-cart-summary-column" id="tdm-cart-summary">
            <div class="tdm-summary-card">
                <h3>Resumo da Compra</h3>
                <div class="tdm-summary-row">
                    <span>Subtotal</span>
                    <span id="tdm-cart-subtotal">R$ 0,00</span>
                </div>
                <div class="tdm-summary-row" id="tdm-cart-discount-row" style="display:none; color:#0E9B75;">
                    <span>Desconto</span>
                    <span id="tdm-cart-discount">- R$ 0,00</span>
                </div>
                <div class="tdm-summary-row tdm-total-row">
                    <strong>Total Estimado</strong>
                    <strong id="tdm-cart-total">R$ 0,00</strong>
                </div>

                <!-- Cupom -->
                <div class="tdm-coupon-box">
                    <input type="text" id="tdm-coupon-input" placeholder="Cupom de desconto" class="tdm-input" />
                    <button id="tdm-apply-coupon-btn" class="tdm-btn tdm-btn-secondary">Aplicar</button>
                </div>

                <a href="<?php echo esc_url(function_exists('wc_get_checkout_url') ? wc_get_checkout_url() : home_url('/checkout/')); ?>" class="tdm-btn tdm-btn-primary tdm-btn-block" id="tdm-btn-go-checkout">
                    Avançar para o Checkout &rarr;
                </a>
            </div>
        </div>
    </div>
</div>
