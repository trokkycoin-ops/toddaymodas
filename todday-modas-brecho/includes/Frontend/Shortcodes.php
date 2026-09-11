<?php
namespace ToddayModasBrecho\Frontend;

if (!defined('ABSPATH')) {
    exit;
}

use ToddayModasBrecho\Services\NotificacaoService;

class Shortcodes {
    public static function register(): void {
        add_shortcode('todday_loja', [self::class, 'render_vitrine']);
        add_shortcode('todday_carrinho', [self::class, 'render_cart']);
        add_shortcode('todday_checkout', [self::class, 'render_checkout']);
        add_shortcode('todday_whatsapp', [self::class, 'render_whatsapp_btn']);
    }

    public static function render_vitrine(array $atts = []): string {
        ob_start();
        include TODDAY_MODAS_PATH . 'templates/vitrine.php';
        return ob_get_clean();
    }

    public static function render_cart(): string {
        ob_start();
        include TODDAY_MODAS_PATH . 'templates/cart.php';
        return ob_get_clean();
    }

    public static function render_checkout(): string {
        ob_start();
        include TODDAY_MODAS_PATH . 'templates/checkout.php';
        return ob_get_clean();
    }

    public static function render_whatsapp_btn(array $atts = []): string {
        $msg = sanitize_text_field($atts['msg'] ?? '');
        $url = NotificacaoService::get_whatsapp_url('', $msg);
        return '<a href="' . esc_url($url) . '" target="_blank" rel="noopener" class="tdm-wa-btn" id="tdm-whatsapp-button"><span class="tdm-wa-icon">&#x1F4AC;</span> Atendimento WhatsApp</a>';
    }
}
