<?php
/**
 * Template de Sucesso do Pedido Todday Modas Brechó.
 *
 * @package ToddayModasBrecho
 */

if (!defined('ABSPATH')) {
    exit;
}

$order_id = isset($_GET['order_id']) ? (int) $_GET['order_id'] : 0;
$order = $order_id > 0 && function_exists('wc_get_order') ? wc_get_order($order_id) : null;
?>
<div class="tdm-success-wrapper" id="todday-order-success-page">
    <div class="tdm-success-card">
        <div class="tdm-success-icon">&#x2714;</div>
        <h1>Pedido Confirmado com Sucesso!</h1>
        <p class="tdm-success-subtitle">Obrigado por apoiar a moda consciente no <strong>Todday Modas Brechó</strong>.</p>

        <?php if ($order): ?>
            <div class="tdm-order-receipt-box">
                <p><strong>Número do Pedido:</strong> #<?php echo esc_html($order->get_order_number()); ?></p>
                <p><strong>Total:</strong> R$ <?php echo esc_html(number_format((float) $order->get_total(), 2, ',', '.')); ?></p>
                <p><strong>Status:</strong> <span class="tdm-badge"><?php echo esc_html(wc_get_order_status_name($order->get_status())); ?></span></p>
                <p><strong>E-mail de confirmação:</strong> <?php echo esc_html($order->get_billing_email()); ?></p>
            </div>
            <div class="tdm-success-actions">
                <a href="<?php echo esc_url(rest_url('todday/v1/orders/' . $order->get_id() . '/pdf')); ?>" target="_blank" class="tdm-btn tdm-btn-secondary">
                    Baixar Recibo em PDF
                </a>
                <a href="<?php echo esc_url(\ToddayModasBrecho\Services\NotificacaoService::get_order_whatsapp_url($order->get_id())); ?>" target="_blank" class="tdm-btn tdm-btn-primary">
                    Acompanhar no WhatsApp
                </a>
            </div>
        <?php else: ?>
            <p>Seu pedido foi registrado com sucesso em nosso sistema.</p>
        <?php endif; ?>

        <div style="margin-top: 32px;">
            <a href="<?php echo esc_url(home_url('/')); ?>" class="tdm-btn tdm-btn-outline">&larr; Voltar à Loja</a>
        </div>
    </div>
</div>
