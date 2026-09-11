<?php
/**
 * Template do Checkout Todday Modas Brechó.
 *
 * @package ToddayModasBrecho
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="tdm-checkout-wrapper" id="todday-checkout-app">
    <h2 class="tdm-section-title">Finalizar Pedido</h2>

    <div class="tdm-checkout-grid">
        <!-- Coluna de Dados e Entrega -->
        <div class="tdm-checkout-form-col">
            <!-- Dados Pessoais -->
            <div class="tdm-card">
                <h3>1. Dados do Comprador</h3>
                <div class="tdm-form-row tdm-form-row-2">
                    <div class="tdm-form-group">
                        <label for="tdm-checkout-first-name">Nome *</label>
                        <input type="text" id="tdm-checkout-first-name" class="tdm-input" required />
                    </div>
                    <div class="tdm-form-group">
                        <label for="tdm-checkout-last-name">Sobrenome *</label>
                        <input type="text" id="tdm-checkout-last-name" class="tdm-input" required />
                    </div>
                </div>
                <div class="tdm-form-row tdm-form-row-2">
                    <div class="tdm-form-group">
                        <label for="tdm-checkout-email">E-mail *</label>
                        <input type="email" id="tdm-checkout-email" class="tdm-input" required />
                    </div>
                    <div class="tdm-form-group">
                        <label for="tdm-checkout-phone">WhatsApp / Telefone *</label>
                        <input type="tel" id="tdm-checkout-phone" class="tdm-input" placeholder="(11) 99999-9999" required />
                    </div>
                </div>
            </div>

            <!-- Endereço e CEP -->
            <div class="tdm-card">
                <h3>2. Endereço de Entrega</h3>
                <div class="tdm-form-row tdm-form-row-2">
                    <div class="tdm-form-group">
                        <label for="tdm-checkout-cep">CEP * (ViaCEP)</label>
                        <div class="tdm-input-with-action">
                            <input type="text" id="tdm-checkout-cep" class="tdm-input" placeholder="00000-000" maxlength="9" required />
                            <button type="button" id="tdm-btn-lookup-cep" class="tdm-btn tdm-btn-secondary">Buscar</button>
                        </div>
                    </div>
                    <div class="tdm-form-group">
                        <label for="tdm-checkout-number">Número *</label>
                        <input type="text" id="tdm-checkout-number" class="tdm-input" required />
                    </div>
                </div>
                <div class="tdm-form-group">
                    <label for="tdm-checkout-street">Rua / Logradouro</label>
                    <input type="text" id="tdm-checkout-street" class="tdm-input" required />
                </div>
                <div class="tdm-form-row tdm-form-row-3">
                    <div class="tdm-form-group">
                        <label for="tdm-checkout-bairro">Bairro</label>
                        <input type="text" id="tdm-checkout-bairro" class="tdm-input" required />
                    </div>
                    <div class="tdm-form-group">
                        <label for="tdm-checkout-city">Cidade</label>
                        <input type="text" id="tdm-checkout-city" class="tdm-input" required />
                    </div>
                    <div class="tdm-form-group">
                        <label for="tdm-checkout-state">UF</label>
                        <input type="text" id="tdm-checkout-state" class="tdm-input" maxlength="2" required />
                    </div>
                </div>
            </div>

            <!-- Opções de Frete (Melhor Envio / Correios) -->
            <div class="tdm-card">
                <h3>3. Opção de Frete</h3>
                <div id="tdm-shipping-options-list" class="tdm-radio-group">
                    <p class="tdm-hint">Digite o CEP acima para carregar as opções de envio disponíveis.</p>
                </div>
            </div>

            <!-- Pagamento (Mercado Pago) -->
            <div class="tdm-card">
                <h3>4. Pagamento via Mercado Pago</h3>
                <div class="tdm-payment-tabs">
                    <label class="tdm-payment-tab-option">
                        <input type="radio" name="tdm_payment_method" value="pix" checked />
                        <span>PIX (Aprovação Imediata)</span>
                    </label>
                    <label class="tdm-payment-tab-option">
                        <input type="radio" name="tdm_payment_method" value="credit_card" />
                        <span>Cartão de Crédito</span>
                    </label>
                </div>
                <div id="tdm-card-fields" style="display:none; margin-top: 16px;">
                    <div class="tdm-form-group">
                        <label for="tdm-card-number">Número do Cartão</label>
                        <input type="text" id="tdm-card-number" class="tdm-input" placeholder="•••• •••• •••• ••••" />
                    </div>
                    <div class="tdm-form-row tdm-form-row-2">
                        <div class="tdm-form-group">
                            <label for="tdm-card-exp">Validade</label>
                            <input type="text" id="tdm-card-exp" class="tdm-input" placeholder="MM/AA" />
                        </div>
                        <div class="tdm-form-group">
                            <label for="tdm-card-cvv">CVV</label>
                            <input type="text" id="tdm-card-cvv" class="tdm-input" placeholder="123" maxlength="4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Coluna de Resumo do Pedido -->
        <div class="tdm-checkout-summary-col">
            <div class="tdm-summary-card">
                <h3>Itens do Pedido</h3>
                <div id="tdm-checkout-items-preview"></div>
                <hr class="tdm-divider" />
                <div class="tdm-summary-row">
                    <span>Subtotal</span>
                    <span id="tdm-checkout-subtotal">R$ 0,00</span>
                </div>
                <div class="tdm-summary-row">
                    <span>Frete</span>
                    <span id="tdm-checkout-shipping">R$ 0,00</span>
                </div>
                <div class="tdm-summary-row tdm-total-row">
                    <strong>Total a Pagar</strong>
                    <strong id="tdm-checkout-total">R$ 0,00</strong>
                </div>

                <button type="button" id="tdm-btn-place-order" class="tdm-btn tdm-btn-primary tdm-btn-block">
                    Confirmar Pedido & Pagar
                </button>
            </div>
        </div>
    </div>
</div>
