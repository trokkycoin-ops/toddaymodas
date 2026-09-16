<?php
namespace ToddayModasBrecho\Frontend;

if (!defined('ABSPATH')) {
    exit;
}

use ToddayModasBrecho\Services\NotificacaoService;

class Vitrine {
    public static function register(): void {
        add_action('wp_enqueue_scripts', [self::class, 'enqueue_scripts']);
        add_action('wp_enqueue_scripts', [self::class, 'enqueue_global_assets']);
        add_action('wp_footer', [self::class, 'render_floating_whatsapp']);
    }

    public static function enqueue_global_assets(): void {
        wp_enqueue_style(
            'tdm-scrollbar-css',
            TODDAY_MODAS_URL . 'assets/react/todday-scrollbar.css',
            [],
            TODDAY_MODAS_VERSION
        );
    }

    public static function enqueue_scripts(): void {
        if (!self::is_storefront_page()) {
            return;
        }

        wp_enqueue_style(
            'tdm-frontend-css',
            TODDAY_MODAS_URL . 'assets/react/index.css',
            [],
            TODDAY_MODAS_VERSION
        );

        wp_enqueue_style(
            'tdm-storefront-css',
            TODDAY_MODAS_URL . 'assets/react/todday-storefront.css',
            ['tdm-frontend-css'],
            TODDAY_MODAS_VERSION
        );

        // Enfileira o bundle React (app lilás do AI Studio)
        wp_enqueue_script(
            'tdm-frontend-js',
            TODDAY_MODAS_URL . 'assets/react/index.js',
            [],
            TODDAY_MODAS_VERSION,
            true
        );

        wp_localize_script('tdm-frontend-js', 'tdmConfig', [
            'restUrl' => esc_url_raw(rest_url('todday/v1')),
            'nonce' => wp_create_nonce('wp_rest'),
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'ajaxNonce' => wp_create_nonce('tdm_ajax_nonce'),
            'currency' => 'R$',
            'isLoggedIn' => is_user_logged_in(),
            'cartUrl' => function_exists('wc_get_cart_url') ? wc_get_cart_url() : home_url('/carrinho/'),
            'checkoutUrl' => function_exists('wc_get_checkout_url') ? wc_get_checkout_url() : home_url('/checkout/'),
            'homeUrl' => home_url('/'),
        ]);
    }

    private static function is_storefront_page(): bool {
        if (!is_singular()) {
            return false;
        }
        $post = get_post();
        if (!$post) {
            return false;
        }
        foreach (['todday_loja', 'tm_home'] as $shortcode) {
            if (has_shortcode((string) $post->post_content, $shortcode)) {
                return true;
            }
        }
        return false;
    }

    public static function render_floating_whatsapp(): void {
        if (!self::is_storefront_page()) {
            return;
        }
        $settings = get_option('todday_settings_whatsapp', []);
        if (($settings['enabled'] ?? 'yes') !== 'yes') {
            return;
        }

        $url = NotificacaoService::get_whatsapp_url();
        ?>
        <a href="<?php echo esc_url($url); ?>" target="_blank" rel="noopener noreferrer" class="tdm-wa-floating" id="tdm-floating-whatsapp-btn" title="Falar no WhatsApp">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.8 14.18c-.24.67-1.39 1.29-1.92 1.38-.5.08-1.15.12-3.32-.78-2.62-1.09-4.29-3.77-4.42-3.95-.13-.18-1.06-1.41-1.06-2.69 0-1.28.67-1.91.91-2.17.24-.26.53-.32.71-.32.18 0 .36 0 .52.01.17.01.4.06.61.57.24.57.82 2 .89 2.15.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.18-.32.4-.46.54-.15.15-.31.31-.13.62.18.31.8 1.32 1.72 2.14 1.18 1.05 2.18 1.38 2.49 1.53.31.15.49.13.67-.08.18-.21.78-.91.99-1.22.21-.31.42-.26.71-.15.29.11 1.84.87 2.16 1.03.32.16.53.24.61.37.08.13.08.76-.16 1.43z"/>
            </svg>
        </a>
        <?php
    }
}
