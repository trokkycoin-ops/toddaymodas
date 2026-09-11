<?php
namespace ToddayModasBrecho\Services;

if (!defined('ABSPATH')) {
    exit;
}

class PdfService {
    /**
     * Gera e envia o PDF de fatura/resumo do pedido no formato PDF 1.4 puro sem dependências externas.
     */
    public static function output_order_pdf(int $order_id): void {
        if (!function_exists('wc_get_order')) {
            wp_die('WooCommerce não disponível.');
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            wp_die('Pedido não encontrado.');
        }

        $order_number = $order->get_order_number();
        $date = $order->get_date_created() ? $order->get_date_created()->date('d/m/Y H:i') : '';
        $customer_name = $order->get_formatted_billing_full_name();
        $customer_email = $order->get_billing_email();
        $customer_phone = $order->get_billing_phone();
        $status_name = wc_get_order_status_name($order->get_status());
        $total = number_format((float) $order->get_total(), 2, ',', '.');
        $shipping = number_format((float) $order->get_shipping_total(), 2, ',', '.');
        $discount = number_format((float) $order->get_discount_total(), 2, ',', '.');

        // Itens
        $items_text = [];
        foreach ($order->get_items() as $item) {
            $name = substr($item->get_name(), 0, 38);
            $qty = $item->get_quantity();
            $item_total = number_format((float) $item->get_total(), 2, ',', '.');
            $items_text[] = sprintf("%-40s %5d  R$ %10s", $name, $qty, $item_total);
        }

        $pdf_content = self::generate_raw_pdf([
            'order_number' => $order_number,
            'date' => $date,
            'customer_name' => $customer_name,
            'customer_email' => $customer_email,
            'customer_phone' => $customer_phone,
            'status' => $status_name,
            'items' => $items_text,
            'shipping' => $shipping,
            'discount' => $discount,
            'total' => $total,
        ]);

        header('Content-Type: application/pdf');
        header('Content-Disposition: inline; filename="pedido-' . $order_number . '.pdf"');
        header('Content-Length: ' . strlen($pdf_content));
        echo $pdf_content;
        exit;
    }

    /**
     * Motor de geração de PDF 1.4 padrão em PHP puro.
     */
    private static function generate_raw_pdf(array $data): string {
        $lines = [
            "TODDAY MODAS BRECHO",
            "Loja Virtual & Moda Sustentavel",
            "============================================================",
            "RECIBO DE PEDIDO #" . $data['order_number'],
            "Data: " . $data['date'],
            "Status: " . $data['status'],
            "------------------------------------------------------------",
            "DADOS DO CLIENTE:",
            "Nome: " . $data['customer_name'],
            "E-mail: " . $data['customer_email'],
            "Telefone: " . $data['customer_phone'],
            "------------------------------------------------------------",
            "ITENS DO PEDIDO:",
            sprintf("%-40s %5s  %13s", "PRODUTO", "QTD", "TOTAL"),
            "------------------------------------------------------------",
        ];

        foreach ($data['items'] as $item_line) {
            $lines[] = $item_line;
        }

        $lines[] = "------------------------------------------------------------";
        $lines[] = "Frete: R$ " . $data['shipping'];
        $lines[] = "Descontos: R$ " . $data['discount'];
        $lines[] = "TOTAL DO PEDIDO: R$ " . $data['total'];
        $lines[] = "============================================================";
        $lines[] = "Obrigado por apoiar a moda consciente no Todday Modas Brecho!";
        $lines[] = "Em caso de duvidas: contato@tselak.com.br";

        // Monta os comandos de texto em PostScript/PDF stream
        $text_stream = "BT\n/F1 10 Tf\n40 760 Td\n15 TL\n";
        foreach ($lines as $line) {
            $escaped = strtr($line, ['\\' => '\\\\', '(' => '\\(', ')' => '\\)']);
            $text_stream .= "(" . $escaped . ") '\n";
        }
        $text_stream .= "ET\n";

        $stream_len = strlen($text_stream);

        // Estrutura de objetos PDF
        $objects = [];
        $objects[] = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
        $objects[] = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
        $objects[] = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n";
        $objects[] = "4 0 obj\n<< /Length {$stream_len} >>\nstream\n{$text_stream}endstream\nendobj\n";
        $objects[] = "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n";

        $output = "%PDF-1.4\n";
        $xref = [0];
        $offset = strlen($output);

        foreach ($objects as $obj) {
            $xref[] = $offset;
            $output .= $obj;
            $offset = strlen($output);
        }

        $xref_offset = strlen($output);
        $output .= "xref\n0 " . count($xref) . "\n";
        $output .= "0000000000 65535 f \n";
        for ($i = 1; $i < count($xref); $i++) {
            $output .= sprintf("%010d 00000 n \n", $xref[$i]);
        }

        $output .= "trailer\n<< /Size " . count($xref) . " /Root 1 0 R >>\nstartxref\n{$xref_offset}\n%%EOF";
        return $output;
    }
}
