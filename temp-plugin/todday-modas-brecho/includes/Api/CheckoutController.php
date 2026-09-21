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
use ToddayModasBrecho\Security\Security;

class CheckoutController {
    public static function register_routes(): void {
        register_rest_route(RestController::NAMESPACE, '/shipping/quote', [
            'methods' => 'POST',
            'callback' => [self::class, 'quote_shipping'],
            'permission_callback' => [Security::class, 'verify_rest_nonce'],
        ]);

        register_rest_route(RestController::NAMESPACE, '/checkout/place', [
            'methods' => 'POST',
            'callback' => [self::class, 'place_order'],
            'permission_callback' => [Security::class, 'verify_rest_nonce'],
        ]);

        register_rest_route(RestController::NAMESPACE, '/checkout/payment', [
            'methods' => 'POST',
            'callback' => [self::class, 'process_payment'],
            'permission_callback' => [Security::class, 'verify_rest_nonce'],
        ]);

        register_rest_route(RestController::NAMESPACE, '/checkout/status', [
            'methods' => 'GET',
            'callback' => [self::class, 'checkout_status'],
            'permission_callback' => [Security::class, 'verify_rest_nonce'],
        ]);
    }

    public static function checkout_status(WP_REST_Request $request): WP_REST_Response {
        $order_id = absint($request->get_param('order_id'));
        $email = sanitize_email($request->get_param('email') ?? '');

        if (!$order_id || empty($email) || !function_exists('wc_get_order')) {
            return new WP_REST_Response(['success' => false, 'message' => 'Parâmetros inválidos.'], 400);
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            return new WP_REST_Response(['success' => false, 'message' => 'Pedido não encontrado.'], 404);
        }

        if (strtolower((string) $order->get_billing_email()) !== strtolower($email)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Consulta não autorizada para esse pedido.'], 403);
        }

        if (!is_user_logged_in() && !self::guest_order_key_matches($order, $request)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Chave do pedido inválida.'], 403);
        }

        return new WP_REST_Response([
            'success' => true,
            'data' => [
                'order_id' => $order->get_id(),
                'order_number' => $order->get_order_number(),
                'order_key' => $order->get_order_key(),
                'status' => $order->get_status(),
                'payment_status' => $order->is_paid() ? 'paid' : 'pending',
                'total' => (float) $order->get_total(),
            ],
        ]);
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

    private const ALLOWED_PAYMENT_METHODS = ['todday_mercadopago'];

    public static function place_order(WP_REST_Request $request): WP_REST_Response {
        if (!function_exists('wc_create_order')) {
            return new WP_REST_Response(['success' => false, 'message' => 'WooCommerce não ativo.'], 500);
        }

        // Rate limit simples por cliente/IP para evitar spam de pedidos.
        if (self::rate_limit_exceeded('place_order', 6)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Muitos pedidos em pouco tempo. Aguarde alguns minutos e tente novamente.',
            ], 429);
        }

        $customer_data = $request->get_param('customer') ?? [];
        $items = $request->get_param('items') ?? [];
        $shipping_quote = $request->get_param('shipping') ?? [];
        $payment_method = sanitize_text_field($request->get_param('payment_method') ?? 'todday_mercadopago');
        $payment_method = in_array($payment_method, self::ALLOWED_PAYMENT_METHODS, true) ? $payment_method : self::ALLOWED_PAYMENT_METHODS[0];

        if (empty($items)) {
            return new WP_REST_Response(['success' => false, 'message' => 'O carrinho está vazio.'], 400);
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

        // Cliente logado: o e-mail do pedido é sempre o da conta, nunca o do corpo da requisição.
        if (is_user_logged_in()) {
            $current_user = wp_get_current_user();
            $address['email'] = $current_user->user_email;
        }

        if (!is_email($address['email'])) {
            return new WP_REST_Response(['success' => false, 'message' => 'Informe um e-mail válido para a compra.'], 400);
        }

        // Lista de itens validada produto a produto (preço e estoque sempre vindos do servidor).
        $order = wc_create_order(['customer_id' => get_current_user_id()]);

        if (is_wp_error($order)) {
            return new WP_REST_Response(['success' => false, 'message' => $order->get_error_message()], 500);
        }

        foreach ($items as $item) {
            $product_id = (int) ($item['product_id'] ?? 0);
            $qty = (int) ($item['quantity'] ?? 1);
            $product = wc_get_product($product_id);

            if (!$product) {
                $order->delete(true);
                return new WP_REST_Response(['success' => false, 'message' => 'Produto não encontrado na loja.'], 400);
            }

            if ($product->get_status() !== 'publish' || !$product->is_purchasable()) {
                $order->delete(true);
                return new WP_REST_Response([
                    'success' => false,
                    'message' => "O produto '{$product->get_name()}' não está disponível para compra.",
                ], 400);
            }

            if ($qty <= 0) {
                $order->delete(true);
                return new WP_REST_Response(['success' => false, 'message' => 'Quantidade inválida no pedido.'], 400);
            }

            if (!$product->has_enough_stock($qty)) {
                $order->delete(true);
                return new WP_REST_Response([
                    'success' => false,
                    'message' => "Estoque insuficiente para a peça '{$product->get_name()}'.",
                ], 400);
            }

            $order->add_product($product, $qty);
        }

        $order->set_address($address, 'billing');
        $order->set_address($address, 'shipping');

        // Frete: o valor é SEMPRE recalculado no servidor — nunca aceito do navegador.
        $cep = preg_replace('/\D/', '', (string) $address['postcode']);
        $resolved = self::resolve_shipping_quote($cep, (array) $shipping_quote);
        if (!empty($resolved)) {
            $shipping_item = new \WC_Order_Item_Shipping();
            $shipping_item->set_method_title($resolved['name'] ?? 'Entrega');
            $shipping_item->set_method_id($resolved['id'] ?? 'custom_shipping');
            $shipping_item->set_total((float) $resolved['price']);
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
                'order_key' => $order->get_order_key(),
                'total' => (float) $order->get_total(),
            ],
        ]);
    }

    public static function process_payment(WP_REST_Request $request): WP_REST_Response {
        $order_id = (int) $request->get_param('order_id');
        $payment_type = sanitize_text_field($request->get_param('payment_type') ?? 'pix'); // pix ou credit_card
        $card_token = sanitize_text_field($request->get_param('token') ?? '');
        $installments = min(12, max(1, (int) ($request->get_param('installments') ?? 1)));

        $order = function_exists('wc_get_order') ? wc_get_order($order_id) : null;
        if (!$order) {
            return new WP_REST_Response(['success' => false, 'message' => 'Pedido não encontrado.'], 404);
        }

        // IDOR guard: cliente só pode pagar os próprios pedidos.
        $owner_id = (int) $order->get_customer_id();
        if ($owner_id > 0 && get_current_user_id() !== $owner_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Pedido não pertence a este usuário.'], 403);
        }
        if ($owner_id === 0) {
            $email = sanitize_email($request->get_param('email') ?? '');
            if (!is_email($email) || strtolower($email) !== strtolower((string) $order->get_billing_email())) {
                return new WP_REST_Response(['success' => false, 'message' => 'Confirme o e-mail usado no pedido.'], 403);
            }
            if (!self::guest_order_key_matches($order, $request)) {
                return new WP_REST_Response(['success' => false, 'message' => 'Chave do pedido inválida.'], 403);
            }
        }

        // Impede pagamento duplicado de pedido já pago.
        if ($order->is_paid()) {
            return new WP_REST_Response(['success' => false, 'message' => 'Este pedido já foi pago.'], 409);
        }

        if ((float) $order->get_total() <= 0) {
            return new WP_REST_Response(['success' => false, 'message' => 'Pedido sem valor para cobrança.'], 400);
        }

        $settings = get_option('todday_settings_mercadopago', []);
        $mp_configured = ($settings['enabled'] ?? 'no') === 'yes' && !empty($settings['access_token'] ?? '');
        if (!$mp_configured) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'O pagamento online ainda não está habilitado nesta loja.',
            ], 409);
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

        $idempotency_key = (string) $order->get_meta('_todday_mp_idempotency_key');
        if ($idempotency_key === '') {
            $idempotency_key = 'todday-order-' . $order->get_id();
            $order->update_meta_data('_todday_mp_idempotency_key', $idempotency_key);
            $order->save();
        }
        $payment_payload['_idempotency_key'] = $idempotency_key;

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

    private static function client_identifier(): string {
        if (is_user_logged_in()) {
            return 'u' . get_current_user_id();
        }
        $ip = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : '0';
        return 'i' . md5($ip);
    }

    private static function guest_order_key_matches($order, WP_REST_Request $request): bool {
        $provided_key = sanitize_text_field($request->get_param('order_key') ?? '');
        $order_key = (string) $order->get_order_key();
        return $provided_key !== '' && $order_key !== '' && hash_equals($order_key, $provided_key);
    }

    private static function rate_limit_exceeded(string $action, int $max): bool {
        $key = 'tdm_rl_' . $action . '_' . self::client_identifier();
        $count = (int) get_transient($key);
        if ($count >= $max) {
            return true;
        }
        set_transient($key, $count + 1, HOUR_IN_SECONDS);
        return false;
    }

    /**
     * Resolve a cotação de frete SEMPRE pelo servidor. O id/name enviados pelo
     * navegador são apenas referência; o preço cobrado vem da cotação real.
     * Se o serviço selecionado não existir na cotação atual, usa o mais barato.
     */
    private static function resolve_shipping_quote(string $cep, array $selected): array {
        $cep = preg_replace('/\D/', '', $cep);
        if (strlen($cep) !== 8) {
            return [];
        }

        $result = MelhorEnvio::calculate_shipping($cep, []);
        $quotes = is_array($result) ? ($result['quotes'] ?? []) : [];

        // Retirada na loja: preço fixo zero, sempre disponível.
        $fallback = [
            'id' => 'retirada_loja',
            'name' => 'Retirada na loja',
            'price' => 0.0,
        ];

        if (empty($quotes) || !empty($result['error'])) {
            return $fallback;
        }

        // Busca o serviço correspondente ao selecionado pelo cliente.
        foreach ($quotes as $quote) {
            if (isset($quote['id']) && $quote['id'] === ($selected['id'] ?? null)) {
                return [
                    'id' => $quote['id'],
                    'name' => $quote['name'] ?? 'Entrega',
                    'price' => max(0.0, (float) ($quote['price'] ?? 0)),
                ];
            }
        }

        // Sem correspondência: aplica a opção mais barata da cotação.
        $cheapest = null;
        foreach ($quotes as $quote) {
            $price = max(0.0, (float) ($quote['price'] ?? 0));
            if ($cheapest === null || $price < $cheapest['price']) {
                $cheapest = [
                    'id' => $quote['id'] ?? 'shipping',
                    'name' => $quote['name'] ?? 'Entrega',
                    'price' => $price,
                ];
            }
        }

        return $cheapest !== null ? $cheapest : $fallback;
    }
}
