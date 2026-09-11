<?php
namespace ToddayModasBrecho\Services;

if (!defined('ABSPATH')) {
    exit;
}

use ToddayModasBrecho\Database\ActivityLogRepository;

class NotificacaoService {
    public static function get_whatsapp_url(string $phone = '', string $message = ''): string {
        $settings = get_option('todday_settings_whatsapp', []);
        $target_phone = !empty($phone) ? $phone : ($settings['phone'] ?? '5511999998888');
        $clean_phone = preg_replace('/\D/', '', $target_phone);

        $default_msg = $settings['default_message'] ?? 'Olá! Gostaria de informações sobre o Todday Modas Brechó.';
        $msg_to_send = !empty($message) ? $message : $default_msg;

        return 'https://wa.me/' . $clean_phone . '?text=' . rawurlencode($msg_to_send);
    }

    public static function get_order_whatsapp_url(int $order_id): string {
        if (!function_exists('wc_get_order')) {
            return self::get_whatsapp_url();
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            return self::get_whatsapp_url();
        }

        $msg = sprintf(
            "Olá! Gostaria de acompanhar meu pedido #%s no Todday Modas Brechó. Status atual: %s. Total: R$ %s.",
            $order->get_order_number(),
            wc_get_order_status_name($order->get_status()),
            number_format((float) $order->get_total(), 2, ',', '.')
        );

        $customer_phone = $order->get_billing_phone();
        return self::get_whatsapp_url($customer_phone, $msg);
    }

    public static function send_order_status_email(int $order_id): bool {
        if (!function_exists('wc_get_order')) {
            return false;
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            return false;
        }

        $to = $order->get_billing_email();
        if (empty($to)) {
            return false;
        }

        $order_num = $order->get_order_number();
        $status_name = wc_get_order_status_name($order->get_status());
        $subject = "Atualização do seu Pedido #{$order_num} — Todday Modas Brechó";

        $body = "
        <div style='font-family: Arial, sans-serif; background-color: #F6FFF9; padding: 24px; color: #12201B;'>
            <div style='max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; padding: 32px; border: 1px solid #C4B5FD;'>
                <h1 style='color: #0E9B75; font-size: 24px; margin-bottom: 8px;'>Todday Modas Brechó</h1>
                <p style='color: #8B5CF6; font-weight: bold; font-size: 16px;'>Status do Pedido #{$order_num}</p>
                <p>Olá, <strong>" . esc_html($order->get_billing_first_name()) . "</strong>!</p>
                <p>Seu pedido foi atualizado para: <span style='background: #0E9B75; color: #FFFFFF; padding: 4px 10px; border-radius: 20px; font-weight: bold;'>" . esc_html($status_name) . "</span></p>
                <div style='margin-top: 24px; border-top: 1px solid #E5E7EB; padding-top: 16px;'>
                    <p><strong>Total:</strong> R$ " . number_format((float) $order->get_total(), 2, ',', '.') . "</p>
                </div>
                <p style='margin-top: 24px; font-size: 13px; color: #4A5A54;'>Dúvidas? Entre em contato pelo nosso WhatsApp ou acesse seu painel na loja.</p>
            </div>
        </div>
        ";

        $headers = ['Content-Type: text/html; charset=UTF-8'];
        $sent = wp_mail($to, $subject, $body, $headers);

        ActivityLogRepository::log('email_notification_sent', 'order', (string) $order_id, [
            'recipient' => $to,
            'status' => $order->get_status(),
            'success' => $sent,
        ]);

        return $sent;
    }
}
