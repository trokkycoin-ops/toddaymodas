<?php
namespace ToddayModasBrecho\Services;

if (!defined('ABSPATH')) {
    exit;
}

class ClientesService {
    public static function get_customers(array $args = []): array {
        $limit = $args['limit'] ?? 20;
        $page = $args['page'] ?? 1;
        $search = $args['search'] ?? '';

        $offset = ($page - 1) * $limit;

        $user_query_args = [
            'role__in' => ['customer', 'subscriber'],
            'number' => $limit,
            'offset' => $offset,
            'orderby' => 'registered',
            'order' => 'DESC',
            'count_total' => true,
        ];

        if (!empty($search)) {
            $user_query_args['search'] = '*' . esc_attr($search) . '*';
            $user_query_args['search_columns'] = ['user_login', 'user_email', 'user_nicename', 'display_name'];
        }

        $user_query = new \WP_User_Query($user_query_args);
        $users = $user_query->get_results();
        $total = $user_query->get_total();

        $formatted = [];
        foreach ($users as $user) {
            $customer_id = $user->ID;
            $customer = function_exists('wc_get_customer') ? new \WC_Customer($customer_id) : null;

            $total_spent = $customer ? (float) $customer->get_total_spent() : 0.0;
            $order_count = $customer ? (int) $customer->get_order_count() : 0;
            $billing_phone = get_user_meta($customer_id, 'billing_phone', true) ?: '';
            $billing_city = get_user_meta($customer_id, 'billing_city', true) ?: '';
            $billing_state = get_user_meta($customer_id, 'billing_state', true) ?: '';

            $formatted[] = [
                'id' => $customer_id,
                'name' => $user->display_name ?: $user->user_login,
                'email' => $user->user_email,
                'phone' => $billing_phone,
                'city' => $billing_city,
                'state' => $billing_state,
                'registered' => $user->user_registered,
                'total_spent' => $total_spent,
                'order_count' => $order_count,
            ];
        }

        return [
            'customers' => $formatted,
            'total' => $total,
            'pages' => ceil($total / $limit),
        ];
    }

    public static function get_customer_by_id(int $customer_id): ?array {
        $user = get_userdata($customer_id);
        if (!$user) {
            return null;
        }

        $customer = function_exists('wc_get_customer') ? new \WC_Customer($customer_id) : null;

        return [
            'id' => $customer_id,
            'name' => $user->display_name,
            'email' => $user->user_email,
            'registered' => $user->user_registered,
            'billing' => [
                'first_name' => get_user_meta($customer_id, 'billing_first_name', true),
                'last_name' => get_user_meta($customer_id, 'billing_last_name', true),
                'phone' => get_user_meta($customer_id, 'billing_phone', true),
                'address_1' => get_user_meta($customer_id, 'billing_address_1', true),
                'address_2' => get_user_meta($customer_id, 'billing_address_2', true),
                'city' => get_user_meta($customer_id, 'billing_city', true),
                'state' => get_user_meta($customer_id, 'billing_state', true),
                'postcode' => get_user_meta($customer_id, 'billing_postcode', true),
            ],
            'total_spent' => $customer ? (float) $customer->get_total_spent() : 0.0,
            'order_count' => $customer ? (int) $customer->get_order_count() : 0,
        ];
    }
}
