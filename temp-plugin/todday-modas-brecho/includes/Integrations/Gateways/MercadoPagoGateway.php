<?php
namespace ToddayModasBrecho\Integrations\Gateways;

if (!defined('ABSPATH')) {
    exit;
}

class MercadoPagoGateway {
    public static function register_gateway(array $gateways): array {
        if (class_exists(WcGatewayMercadoPagoTodday::class)) {
            $gateways[] = WcGatewayMercadoPagoTodday::class;
        }
        return $gateways;
    }
}

// Definição da classe gateway concreta caso WooCommerce esteja carregado
if (class_exists('WC_Payment_Gateway')) {
    class WcGatewayMercadoPagoTodday extends \WC_Payment_Gateway {
        public function __construct() {
            $this->id = 'todday_mercadopago';
            $this->icon = '';
            $this->has_fields = false;
            $this->method_title = __('Mercado Pago (Todday Modas)', 'todday-modas-brecho');
            $this->method_description = __('Receba pagamentos via PIX e Cartão de Crédito no Todday Modas Brechó.', 'todday-modas-brecho');

            $this->init_form_fields();
            $this->init_settings();

            $this->title = $this->get_option('title', 'PIX ou Cartão de Crédito');
            $this->description = $this->get_option('description', 'Pague de forma rápida e segura via Mercado Pago.');

            add_action('woocommerce_update_options_payment_gateways_' . $this->id, [$this, 'process_admin_options']);
        }

        public function init_form_fields(): void {
            $this->form_fields = [
                'enabled' => [
                    'title' => __('Ativar Gateway', 'todday-modas-brecho'),
                    'type' => 'checkbox',
                    'label' => __('Ativar Mercado Pago no checkout', 'todday-modas-brecho'),
                    'default' => 'yes',
                ],
                'title' => [
                    'title' => __('Título exibido ao cliente', 'todday-modas-brecho'),
                    'type' => 'text',
                    'default' => __('PIX ou Cartão de Crédito (Mercado Pago)', 'todday-modas-brecho'),
                ],
            ];
        }

        public function process_payment($order_id) {
            wc_add_notice(
                __('Finalize o pagamento pela tela de checkout da Todday Modas.', 'todday-modas-brecho'),
                'error'
            );

            return ['result' => 'failure'];
        }
    }
}
