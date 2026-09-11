<?php
namespace ToddayModasBrecho\Services;

if (!defined('ABSPATH')) {
    exit;
}

use ToddayModasBrecho\Database\ActivityLogRepository;

class ImportExportService {
    /**
     * Exporta produtos WooCommerce para CSV.
     */
    public static function export_products_csv(): void {
        if (!function_exists('wc_get_products')) {
            wp_die('WooCommerce não instalado');
        }

        $products = wc_get_products(['limit' => -1]);

        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="produtos-todday-' . date('Y-m-d') . '.csv"');

        $out = fopen('php://output', 'w');
        // BOM para compatibilidade com Excel
        fprintf($out, chr(0xEF) . chr(0xBB) . chr(0xBF));

        fputcsv($out, ['ID', 'Nome', 'SKU', 'Preco_Normal', 'Preco_Promocional', 'Estoque', 'Categorias', 'Condicao_Brecho']);

        foreach ($products as $p) {
            $terms = wp_get_post_terms($p->get_id(), 'product_cat', ['fields' => 'names']);
            $categories = is_array($terms) ? implode(', ', $terms) : '';
            $condition = get_post_meta($p->get_id(), '_todday_condition', true) ?: 'Estado de Novo';

            fputcsv($out, [
                $p->get_id(),
                $p->get_name(),
                $p->get_sku(),
                $p->get_regular_price(),
                $p->get_sale_price(),
                $p->get_stock_quantity() ?? '',
                $categories,
                $condition,
            ]);
        }

        fclose($out);
        exit;
    }

    /**
     * Exporta pedidos para CSV.
     */
    public static function export_orders_csv(): void {
        if (!function_exists('wc_get_orders')) {
            wp_die('WooCommerce não instalado');
        }

        $orders = wc_get_orders(['limit' => -1]);

        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="pedidos-todday-' . date('Y-m-d') . '.csv"');

        $out = fopen('php://output', 'w');
        fprintf($out, chr(0xEF) . chr(0xBB) . chr(0xBF));

        fputcsv($out, ['Numero_Pedido', 'Data', 'Status', 'Cliente_Nome', 'Cliente_Email', 'Total', 'Frete', 'Metodo_Pagamento']);

        foreach ($orders as $order) {
            fputcsv($out, [
                $order->get_order_number(),
                $order->get_date_created() ? $order->get_date_created()->date('Y-m-d H:i:s') : '',
                $order->get_status(),
                $order->get_formatted_billing_full_name(),
                $order->get_billing_email(),
                $order->get_total(),
                $order->get_shipping_total(),
                $order->get_payment_method_title(),
            ]);
        }

        fclose($out);
        exit;
    }

    /**
     * Importa produtos via CSV com validação linha por linha.
     */
    public static function import_products_csv(string $file_path): array {
        if (!file_exists($file_path) || !is_readable($file_path)) {
            return ['success' => false, 'message' => 'Arquivo CSV inválido ou inacessível.'];
        }

        $handle = fopen($file_path, 'r');
        if (!$handle) {
            return ['success' => false, 'message' => 'Não foi possível abrir o arquivo CSV.'];
        }

        // Lê cabeçalho
        $header = fgetcsv($handle, 1000, ',');
        if (!$header || count($header) < 3) {
            fclose($handle);
            return ['success' => false, 'message' => 'Cabeçalho do CSV inválido. Colunas mínimas: Nome, Preço, Estoque'];
        }

        $imported = 0;
        $errors = [];
        $line = 1;

        while (($data = fgetcsv($handle, 1000, ',')) !== false) {
            $line++;
            $name = sanitize_text_field($data[0] ?? '');
            $regular_price = sanitize_text_field($data[1] ?? '');
            $stock = isset($data[2]) ? (int) $data[2] : 1;
            $condition = sanitize_text_field($data[3] ?? 'Estado de Novo');

            if (empty($name)) {
                $errors[] = "Linha {$line}: Nome do produto ausente.";
                continue;
            }

            if (!is_numeric($regular_price) || (float) $regular_price <= 0) {
                $errors[] = "Linha {$line}: Preço inválido para o produto '{$name}'.";
                continue;
            }

            // Criação do produto no WooCommerce
            if (class_exists('WC_Product_Simple')) {
                $product = new \WC_Product_Simple();
                $product->set_name($name);
                $product->set_regular_price($regular_price);
                $product->set_manage_stock(true);
                $product->set_stock_quantity($stock);
                $product->set_status('publish');
                $pid = $product->save();

                if ($pid) {
                    update_post_meta($pid, '_todday_condition', $condition);
                    $imported++;
                } else {
                    $errors[] = "Linha {$line}: Falha ao salvar produto '{$name}' no WooCommerce.";
                }
            } else {
                $errors[] = "WooCommerce não disponível para inserção de produtos.";
                break;
            }
        }

        fclose($handle);

        ActivityLogRepository::log('products_csv_imported', 'import', '', [
            'imported_count' => $imported,
            'errors_count' => count($errors),
        ]);

        return [
            'success' => true,
            'imported_count' => $imported,
            'errors' => $errors,
        ];
    }
}
