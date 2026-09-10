<?php
namespace ToddayModas\Admin;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Gestão Administrativa de Banners e Sliders do Hero
 */
class BannerManager {
    private static $instance = null;

    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {}

    public function init() {
        add_action('admin_menu', [$this, 'add_banner_submenu']);
    }

    public function add_banner_submenu() {
        add_submenu_page(
            'todday-modas-settings',
            __('Banners & Hero', 'todday-modas'),
            __('Banners & Hero', 'todday-modas'),
            'manage_woocommerce',
            'todday-modas-banners',
            [$this, 'render_banners_page']
        );
    }

    public function render_banners_page() {
        ?>
        <div class="wrap todday-admin-banners">
            <h1><?php esc_html_e('Gerenciamento de Banners & Hero Editorial', 'todday-modas'); ?></h1>
            <p><?php esc_html_e('Configure os banners principais da homepage com imagens responsivas para Desktop e Mobile, tipografia editorial e links de chamada para ação.', 'todday-modas'); ?></p>
            <div style="background: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 15px;">
                <p><strong><?php esc_html_e('Dica de Fotografia de Moda:', 'todday-modas'); ?></strong> <?php esc_html_e('Utilize proporção 1920x800px para Desktop e 800x1000px (vertical) para Mobile para obter máximo impacto visual sem cortes indesejados.', 'todday-modas'); ?></p>
            </div>
        </div>
        <?php
    }
}
