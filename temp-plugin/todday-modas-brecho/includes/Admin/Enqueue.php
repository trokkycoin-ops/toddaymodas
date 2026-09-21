<?php
namespace ToddayModasBrecho\Admin;

if (!defined('ABSPATH')) {
    exit;
}

class Enqueue {
    public static function register(): void {
        add_action('admin_enqueue_scripts', [self::class, 'enqueue_assets']);
    }

    public static function enqueue_assets(string $hook): void {
        if (!str_contains($hook, 'todday')) {
            return;
        }

        wp_enqueue_style(
            'tdm-admin-style',
            TODDAY_MODAS_URL . 'assets/css/todday-frontend.css',
            [],
            TODDAY_MODAS_VERSION
        );
    }
}
