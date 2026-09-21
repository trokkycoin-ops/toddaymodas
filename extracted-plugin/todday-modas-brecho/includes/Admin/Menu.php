<?php
namespace ToddayModasBrecho\Admin;

if (!defined('ABSPATH')) {
    exit;
}

class Menu {
    public static function register(): void {
        add_action('admin_menu', [self::class, 'add_menu_pages']);
    }

    public static function add_menu_pages(): void {
        add_menu_page(
            __('Todday Modas Brechó', 'todday-modas-brecho'),
            __('Todday Modas', 'todday-modas-brecho'),
            'manage_options',
            'todday-modas-brecho',
            [self::class, 'render_admin_wrapper'],
            'dashicons-tag',
            56
        );

        add_submenu_page(
            'todday-modas-brecho',
            __('Painel de Gestão (SPA)', 'todday-modas-brecho'),
            __('Painel de Gestão', 'todday-modas-brecho'),
            'todday_gerente_panel',
            'todday-painel-redirect',
            [self::class, 'redirect_to_spa']
        );

        add_submenu_page(
            'todday-modas-brecho',
            __('Configurações do Plugin', 'todday-modas-brecho'),
            __('Configurações', 'todday-modas-brecho'),
            'manage_options',
            'todday-settings',
            [Settings::class, 'render']
        );
    }

    public static function render_admin_wrapper(): void {
        $spa_url = home_url('/painel-gestao-tm/');
        ?>
        <div class="wrap" style="max-width: 900px; padding: 24px 0;">
            <h1 style="color: #0E9B75; font-size: 28px; margin-bottom: 8px;">Todday Modas Brechó</h1>
            <p style="font-size: 15px; color: #4A5A54;">Loja virtual premium sobre WooCommerce com catálogo exclusivo de brechó, checkout brasileiro e painel de gestão dedicado.</p>

            <div style="background: #FFFFFF; border-radius: 12px; padding: 28px; border: 1px solid #C4B5FD; box-shadow: 0 4px 12px rgba(14,155,117,0.08); margin-top: 24px;">
                <h2 style="margin-top: 0; color: #12201B;">Painel de Gestão SPA (Fora do wp-admin)</h2>
                <p>O Todday Modas Brechó conta com um painel completo em Single Page Application para visualização de métricas, pedidos, estoque, relatórios e auditoria. O acesso não exige login no WordPress — apenas a senha do painel.</p>
                <p style="color:#b45309;"><strong>Importante:</strong> a URL do painel é <code>https://<?php echo esc_html(wp_parse_url(home_url(), PHP_URL_HOST)); ?>/painel-gestao-tm/</code> e é <strong>privada</strong> — não divulgue nem envie para terceiros. Quem conhecer a URL ainda precisa da senha.</p>
                <div style="margin-top: 20px;">
                    <a href="<?php echo esc_url($spa_url); ?>" target="_blank" class="button button-primary" style="background: #0E9B75; border-color: #0A7956; padding: 6px 20px; font-size: 15px; height: auto;">
                        Abrir Painel de Gestão &rarr;
                    </a>
                    <a href="<?php echo esc_url(home_url('/todday-vendedor/')); ?>" target="_blank" class="button" style="margin-left: 10px; padding: 6px 16px; height: auto;">
                        Painel do Vendedor
                    </a>
                    <a href="<?php echo esc_url(home_url('/todday-cliente/')); ?>" target="_blank" class="button" style="margin-left: 10px; padding: 6px 16px; height: auto;">
                        Painel do Cliente
                    </a>
                </div>
            </div>
        </div>
        <?php
    }

    public static function redirect_to_spa(): void {
        wp_redirect(home_url('/painel-gestao-tm/'));
        exit;
    }
}
