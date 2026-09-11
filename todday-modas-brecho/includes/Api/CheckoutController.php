<?php
namespace ToddayModasBrecho\Api;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Request;
use WP_REST_Response;
use ToddayModasBrecho\Integrations\ViaCep;
use ToddayModasBrecho\Integrations\MelhorEnvio;
use ToddayModasBrecho\Integrations\MercadoPago;
use ToddayModasBrecho\Services\PedidosService;

class CheckoutController {
    public static function register_routes(): void {
        register_rest_route(RestController::NAMESPACE, '/shipping/quote', [
            'methods' => 'POST',
            'callback' => [self::class, 'quote_shipping'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route(RestController::NAMESPACE, '/checkout/place', [
            'methods' => 'POST',
            'callback' => [self::class, 'place_order'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route(RestController::NAMESPACE, '/checkout/payment', [
            'methods' => 'POST',
            'callback' => [self::class, 'process_payment'],
            'permission_callback' => '__return_true',
        ]);
    }

    private static function resolve_shipping_total(string $cep, array $requested_quote): array {
        $dest_cep = preg_replace('/\D/', '', $cep);
        $requested_id = sanitize_text_field($requested_quote['id'] ?? '');
        $settings = get_option('todday_settings_melhorenvio', []);

        // Retirada na loja: permitida sempre (frete zero)
        if ($requested_id === 'retirada_loja') {
            return ['id' => 'retirada_loja', 'name' => 'Retirar no Brechó Todday Modas', 'price' => (float) 0];
        }

        // Tenta revalidar contra a cotação real do Melhor Envio
        if (strlen($dest_cep) === 8) {
            $quoted = MelhorEnvio::calculate_shipping($dest_cep);
            if (!empty($quoted['quotes'])) {
                foreach ($quoted['quotes'] as $q) {
                    if ($q['id'] === $requested_id) {
                        return ['id' => $q['id'], 'name' => $q['name'], 'price' => (float) $q['price']];
                    }
                }
                // ID não bateu: usa a primeira cotação válida (nunca o price do client)
                $first = $quoted['quotes'][0];
                return ['id' => $first['id'], 'name' => $first['name'], 'price' => (float) $first['price']];
            }
        }

        // Contingência: usa a tarifa fixa configurada, nunca o price do client
        $flat = (float) ($settings['fallback_flat_rate'] ?? 22.00);
        return ['id' => 'correios_pac', 'name' => 'Correios PAC (Econômico)', 'price' => $flat];
    }

    public static function quote_shipping(WP_REST_Request $request): WP_REST_Response {
        $cep = sanitize_text_field($request->get_param('cep') ?? '');

        if (empty($cep)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Informe o CEP.'], 400);
        }

        // Consulta endereço pelo ViaCEP
        $address = ViaCep::lookup_cep($cep);

        // Cotação pelo Melhor Envio com fallback automático
        $shipping = MelhorEnvio::calculate_shipping($cep);

        return new WP_REST_Response([
            'success' => true,
            'data' => [
                'address' => $address['data'] ?? null,
                'shipping_quotes' => $shipping['quotes'] ?? [],
                'provider' => $shipping['provider'] ?? 'fallback',
            ],
        ]);
    }

    public static function place_order(WP_REST_Request $request): WP_REST_Response {
        if (!function_exists('wc_create_order')) {
            return new WP_REST_Response(['success' => false, 'message' => 'WooCommerce não ativo.'], 500);
        }

        $customer_data = $request->get_param('customer') ?? [];
        $items = $request->get_param('items') ?? [];
        $shipping_quote = $request->get_param('shipping') ?? [];
        $payment_method = sanitize_text_field($request->get_param('payment_method') ?? 'todday_mercadopago');

        if (empty($items)) {
            return new WP_REST_Response(['success' => false, 'message' => 'O carrinho está vazio.'], 400);
        }

        $order = wc_create_order(['customer_id' => get_current_user_id()]);

        if (is_wp_error($order)) {
            return new WP_REST_Response(['success' => false, 'message' => $order->get_error_message()], 500);
        }

        // Adiciona itens verificando estoque
        foreach ($items as $item) {
            $product_id = (int) ($item['product_id'] ?? 0);
            $qty = (int) ($item['quantity'] ?? 1);
            $product = wc_get_product($product_id);

            if ($product) {
                if (!$product->has_enough_stock($qty)) {
                    $order->delete(true);
                    return new WP_REST_Response([
                        'success' => false,
                        'message' => "Estoque insuficiente para a peça '{$product->get_name()}'.",
                    ], 400);
                }
                $order->add_product($product, $qty);
            }
        }

        // Dados de cobrança e entrega
        $address = [
            'first_name' => sanitize_text_field($customer_data['first_name'] ?? ''),
            'last_name' => sanitize_text_field($customer_data['last_name'] ?? ''),
            'email' => sanitize_email($customer_data['email'] ?? ''),
            'phone' => sanitize_text_field($customer_data['phone'] ?? ''),
            'address_1' => sanitize_text_field($customer_data['address_1'] ?? ''),
            'address_2' => sanitize_text_field($customer_data['address_2'] ?? ''),
            'city' => sanitize_text_field($customer_data['city'] ?? ''),
            'state' => sanitize_text_field($customer_data['state'] ?? ''),
            'postcode' => sanitize_text_field($customer_data['postcode'] ?? ''),
            'country' => 'BR',
        ];

        $order->set_address($address, 'billing');
        $order->set_address($address, 'shipping');

        // Frete — valor SEMPRE revalidado no servidor, nunca confia no price do client
        if (!empty($shipping_quote)) {
            $final_shipping = self::resolve_shipping_total($address['postcode'], $shipping_quote);
            $shipping_item = new \WC_Order_Item_Shipping();
            $shipping_item->set_method_title($final_shipping['name']);
            $shipping_item->set_method_id($final_shipping['id']);
            $shipping_item->set_total($final_shipping['price']);
            $order->add_item($shipping_item);
        }

        $order->set_payment_method($payment_method);
        $order->calculate_totals();
        $order->update_status('pending', 'Aguardando confirmação de pagamento.');
        $order->save();

        return new WP_REST_Response([
            'success' => true,
            'data' => [
                'order_id' => $order->get_id(),
                'order_number' => $order->get_order_number(),
                'total' => (float) $order->get_total(),
            ],
        ]);
    }

    public static function process_payment(WP_REST_Request $request): WP_REST_Response {
        $order_id = (int) $request->get_param('order_id');
        $payment_type = sanitize_text_field($request->get_param('payment_type') ?? 'pix'); // pix ou credit_card
        $card_token = sanitize_text_field($request->get_param('token') ?? '');
        $installments = (int) ($request->get_param('installments') ?? 1);

        $order = function_exists('wc_get_order') ? wc_get_order($order_id) : null;
        if (!$order) {
            return new WP_REST_Response(['success' => false, 'message' => 'Pedido não encontrado.'], 404);
        }

        $payment_payload = [
            'transaction_amount' => (float) $order->get_total(),
            'description' => 'Pedido #' . $order->get_order_number() . ' Todday Modas Brechó',
            'external_reference' => (string) $order->get_id(),
            'payer' => [
                'email' => $order->get_billing_email(),
                'first_name' => $order->get_billing_first_name(),
                'last_name' => $order->get_billing_last_name(),
            ],
        ];

        if ($payment_type === 'pix') {
            $payment_payload['payment_method_id'] = 'pix';
        } else {
            $payment_payload['payment_method_id'] = sanitize_text_field($request->get_param('payment_method_id') ?? 'master');
            $payment_payload['token'] = $card_token;
            $payment_payload['installments'] = $installments;
        }

        $result = MercadoPago::create_payment($payment_payload);

        if (!$result['success']) {
            return new WP_REST_Response($result, 400);
        }

        // Salva meta no pedido HPOS
        $order->update_meta_data('_todday_mp_payment_id', $result['payment_id'] ?? '');
        $order->save();

        return new WP_REST_Response([
            'success' => true,
            'data' => $result,
        ]);
    }
}
