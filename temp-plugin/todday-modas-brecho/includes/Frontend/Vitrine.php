<?php
namespace ToddayModasBrecho\Frontend;

if (!defined('ABSPATH')) {
    exit;
}

class Vitrine {
    public static function register(): void {
        add_action('wp_enqueue_scripts', [self::class, 'enqueue_scripts']);
        add_action('wp_enqueue_scripts', [self::class, 'enqueue_global_assets']);
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
            'tdm-mercadopago-sdk',
            'https://sdk.mercadopago.com/js/v2',
            [],
            null,
            false
        );

        wp_enqueue_script(
            'tdm-frontend-js',
            TODDAY_MODAS_URL . 'assets/react/index.js',
            ['tdm-mercadopago-sdk'],
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
            'mercadopagoPublicKey' => get_option('todday_settings_mercadopago', [])['public_key'] ?? '',
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

}
