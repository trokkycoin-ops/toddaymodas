<?php
namespace ToddayModasBrecho\Integrations;

if (!defined('ABSPATH')) {
    exit;
}

class WhatsApp {
    public static function get_chat_link(string $custom_text = '', string $phone_override = ''): string {
        $settings = get_option('todday_settings_whatsapp', []);
        $phone = !empty($phone_override) ? $phone_override : ($settings['phone'] ?? '5535991759960');
        $clean_phone = preg_replace('/\D/', '', $phone);

        $text = !empty($custom_text) ? $custom_text : ($settings['default_message'] ?? 'Olá, tenho interesse nas peças do Todday Modas Brechó!');

        return 'https://wa.me/' . $clean_phone . '?text=' . rawurlencode($text);
    }
}
