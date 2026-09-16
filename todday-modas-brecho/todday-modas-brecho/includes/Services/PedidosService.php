<?php
namespace ToddayModasBrecho\Services;

if (!defined('ABSPATH')) {
    exit;
}

use ToddayModasBrecho\Database\ActivityLogRepository;

class PedidosService {
    /**
     * Lista pedidos com suporte a HPOS e filtros de papel.
     */
    public static function get_orders(array $args = []): array {
        if (!function_exists('wc_get_orders')) {
            return [];
        }

        $limit = $args['limit'] ?? 20;
        $page = $args['page'] ?? 1;
        $status = $args['status'] ?? 'any';
        $customer_id = $args['customer_id'] ?? null;
        $vendor_id = $args['vendor_id'] ?? null;
        $search = $args['search'] ?? '';

        $query_args = [
            'limit' => $limit,
            'page' => $page,
            'paginate' => true,
            'orderby' => 'date',
            'order' => 'DESC',
        ];

        if ($status !== 'any') {
            $query_args['status'] = $status;
        }

        if ($customer_id) {
            $query_args['customer_id'] = $customer_id;
        }

        if (!empty($search)) {
            $query_args['s'] = $search;
        }

        if ($vendor_id) {
            $query_args['meta_key'] = '_todday_vendor_id';
            $query_args['meta_value'] = $vendor_id;
        }

        $results = wc_get_orders($query_args);
        $orders_data = [];

        if (is_object($results) && isset($results->orders)) {
            foreach ($results->orders as $order) {
                $orders_data[] = self::format_order($order);
            }
            return [
                'orders' => $orders_data,
                'total' => $results->total,
                'max_num_pages' => $results->max_num_pages,
            ];
        }

        return ['orders' => [], 'total' => 0, 'max_num_pages' => 0];
    }

    public static function get_order_by_id(int $order_id): ?array {
        if (!function_exists('wc_get_order')) {
            return null;
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            return null;
        }

        return self::format_order($order, true);
    }

    public static function update_order_status(int $order_id, string $new_status, string $note = ''): bool {
        if (!function_exists('wc_get_order')) {
            return false;
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            return false;
        }

        // Remove prefixo 'wc-' se informado
        $clean_status = str_replace('wc-', '', $new_status);
        $order->update_status($clean_status, $note);
        $order->save();

        ActivityLogRepository::log('order_status_updated', 'order', (string) $order_id, [
            'status' => $clean_status,
            'note' => $note,
        ]);

        return true;
    }

    public static function format_order($order, bool $include_items = true): array {
        $items = [];
        if ($include_items) {
            foreach ($order->get_items() as $item_id => $item) {
                $product = $item->get_product();
                $image_url = $product && $product->get_image_id() ? wp_get_attachment_url($product->get_image_id()) : '';
                $items[] = [
                    'id' => $item_id,
                    'product_id' => $item->get_product_id(),
                    'name' => $item->get_name(),
                    'quantity' => $item->get_quantity(),
                    'subtotal' => (float) $item->get_subtotal(),
                    'total' => (float) $item->get_total(),
                    'image' => $image_url,
                ];
            }
        }

        return [
            'id' => $order->get_id(),
            'order_number' => $order->get_order_number(),
            'status' => $order->get_status(),
            'status_name' => wc_get_order_status_name($order->get_status()),
            'date_created' => $order->get_date_created() ? $order->get_date_created()->date('Y-m-d H:i:s') : '',
            'total' => (float) $order->get_total(),
            'subtotal' => (float) $order->get_subtotal(),
            'shipping_total' => (float) $order->get_shipping_total(),
            'discount_total' => (float) $order->get_discount_total(),
            'currency' => $order->get_currency(),
            'payment_method' => $order->get_payment_method(),
            'payment_method_title' => $order->get_payment_method_title(),
            'customer_id' => $order->get_customer_id(),
            'customer_name' => trim($order->get_formatted_billing_full_name()),
            'customer_email' => $order->get_billing_email(),
            'customer_phone' => $order->get_billing_phone(),
            'shipping_address' => [
                'first_name' => $order->get_shipping_first_name(),
                'last_name' => $order->get_shipping_last_name(),
                'address_1' => $order->get_shipping_address_1(),
                'address_2' => $order->get_shipping_address_2(),
                'city' => $order->get_shipping_city(),
                'state' => $order->get_shipping_state(),
                'postcode' => $order->get_shipping_postcode(),
            ],
            'tracking_code' => $order->get_meta('_todday_tracking_code') ?: '',
            'vendor_id' => (int) ($order->get_meta('_todday_vendor_id') ?: 0),
            'items' => $items,
        ];
    }
}
