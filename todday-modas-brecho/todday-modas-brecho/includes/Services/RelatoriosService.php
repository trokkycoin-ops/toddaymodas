<?php
namespace ToddayModasBrecho\Services;

if (!defined('ABSPATH')) {
    exit;
}

class RelatoriosService {
    public static function get_summary(string $from = '', string $to = ''): array {
        if (!function_exists('wc_get_orders')) {
            return self::empty_summary();
        }

        $query_args = [
            'limit' => -1,
            'status' => ['wc-processing', 'wc-completed', 'wc-on-hold'],
            'return' => 'ids',
        ];

        if (!empty($from) && !empty($to)) {
            $query_args['date_created'] = $from . '...' . $to;
        }

        $order_ids = wc_get_orders($query_args);

        if (empty($order_ids)) {
            return self::empty_summary();
        }

        $total_revenue = 0.0;
        $order_count = count($order_ids);
        $product_sales = [];
        $daily_sales = [];

        foreach ($order_ids as $order_id) {
            $order = wc_get_order($order_id);
            if (!$order) {
                continue;
            }

            $order_total = (float) $order->get_total();
            $total_revenue += $order_total;

            $date_str = $order->get_date_created() ? $order->get_date_created()->date('Y-m-d') : 'unknown';
            if (!isset($daily_sales[$date_str])) {
                $daily_sales[$date_str] = ['date' => $date_str, 'revenue' => 0.0, 'orders' => 0];
            }
            $daily_sales[$date_str]['revenue'] += $order_total;
            $daily_sales[$date_str]['orders'] += 1;

            foreach ($order->get_items() as $item) {
                $pid = $item->get_product_id();
                $qty = $item->get_quantity();
                $name = $item->get_name();

                if (!isset($product_sales[$pid])) {
                    $product_sales[$pid] = [
                        'id' => $pid,
                        'name' => $name,
                        'quantity' => 0,
                        'total' => 0.0,
                    ];
                }
                $product_sales[$pid]['quantity'] += $qty;
                $product_sales[$pid]['total'] += (float) $item->get_total();
            }
        }

        $avg_ticket = $order_count > 0 ? $total_revenue / $order_count : 0.0;

        // Ordena produtos mais vendidos
        usort($product_sales, function ($a, $b) {
            return $b['quantity'] <=> $a['quantity'];
        });

        // Ordena vendas diárias por data
        ksort($daily_sales);

        return [
            'total_revenue' => round($total_revenue, 2),
            'order_count' => $order_count,
            'average_ticket' => round($avg_ticket, 2),
            'new_customers' => count(get_users(['role__in' => ['customer', 'subscriber'], 'fields' => 'ID'])),
            'top_products' => array_slice(array_values($product_sales), 0, 5),
            'timeline' => array_values($daily_sales),
        ];
    }

    private static function empty_summary(): array {
        return [
            'total_revenue' => 0.0,
            'order_count' => 0,
            'average_ticket' => 0.0,
            'new_customers' => count(get_users(['role__in' => ['customer', 'subscriber'], 'fields' => 'ID'])),
            'top_products' => [],
            'timeline' => [],
        ];
    }
}
