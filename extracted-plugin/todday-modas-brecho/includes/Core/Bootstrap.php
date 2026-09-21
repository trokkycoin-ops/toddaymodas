<?php
namespace ToddayModasBrecho\Core;

if (!defined('ABSPATH')) {
    exit;
}

use ToddayModasBrecho\Database\Schema;
use ToddayModasBrecho\Database\Migrations;
use ToddayModasBrecho\Security\CapabilityMatrix;
use ToddayModasBrecho\Admin\Menu;
use ToddayModasBrecho\Admin\Enqueue as AdminEnqueue;
use ToddayModasBrecho\Frontend\Shortcodes;
use ToddayModasBrecho\Frontend\Pwa;
use ToddayModasBrecho\Frontend\Vitrine;
use ToddayModasBrecho\Api\RestController;
use ToddayModasBrecho\Elementor\ElementorInit;
use ToddayModasBrecho\Integrations\Gateways\MercadoPagoGateway;
use ToddayModasBrecho\Logs\ActivityLogger;

class Bootstrap {
    public static function init(): void {
        // Alertas caso WooCommerce não esteja ativo
        add_action('admin_notices', [self::class, 'check_woocommerce_dependency']);

        // Handlers de banco e capabilities
        add_action('init', [self::class, 'init_schema_and_roles'], 5);
        add_action('init', [self::class, 'register_order_statuses'], 6);
        add_action('init', [self::class, 'register_rewrite_rules'], 10);
        add_filter('query_vars', [self::class, 'register_query_vars']);
        add_action('template_redirect', [self::class, 'handle_spa_routes']);

        // REST API
        add_action('rest_api_init', [RestController::class, 'register_routes']);

        // Frontend & Shortcodes
        Shortcodes::register();
        Pwa::register();
        Vitrine::register();

        // Elementor Widgets
        ElementorInit::register();

        // Admin & Menus
        if (is_admin()) {
            Menu::register();
            AdminEnqueue::register();
        }

        // Gateway Mercado Pago para WooCommerce (se WooCommerce ativo)
        add_filter('woocommerce_payment_gateways', [MercadoPagoGateway::class, 'register_gateway']);

        // Logger de atividades
        ActivityLogger::register_hooks();
    }

    public static function check_woocommerce_dependency(): void {
        if (!class_exists('WooCommerce')) {
            echo '<div class="notice notice-warning is-dismissible">';
            echo '<p><strong>Todday Modas Brechó:</strong> O WooCommerce precisa estar ativo para pleno funcionamento de carrinho, catálogo e checkout.</p>';
            echo '</div>';
        }
    }

    public static function init_schema_and_roles(): void {
        $installed_ver = get_option('todday_db_version', '0.0.0');
        if (version_compare($installed_ver, TODDAY_MODAS_DB_VERSION, '<')) {
            Schema::create_tables();
            Migrations::run();
            CapabilityMatrix::setup_roles_and_capabilities();
            update_option('todday_db_version', TODDAY_MODAS_DB_VERSION);
        }
    }

    public static function register_order_statuses(): void {
        register_post_status('wc-shipped', [
            'label' => _x('Enviado', 'Order status', 'todday-modas-brecho'),
            'public' => true,
            'exclude_from_search' => false,
            'show_in_admin_all_list' => true,
            'show_in_admin_status_list' => true,
            'label_count' => _n_noop('Enviado <span class="count">(%s)</span>', 'Enviados <span class="count">(%s)</span>', 'todday-modas-brecho'),
        ]);
    }

    public static function register_rewrite_rules(): void {
        add_rewrite_rule('^painel-gestao-tm/?$', 'index.php?todday_panel=admin', 'top');
        add_rewrite_rule('^todday-vendedor/?$', 'index.php?todday_panel=vendor', 'top');
        add_rewrite_rule('^todday-cliente/?$', 'index.php?todday_panel=customer', 'top');
        add_rewrite_rule('^todday-download/?$', 'index.php?todday_panel=download', 'top');
        add_rewrite_rule('^todday-docs/?$', 'index.php?todday_panel=docs', 'top');

        // Regera as regras de rewrite quando a versão do plugin muda (novas rotas).
        if (get_option('todday_rewrite_version') !== TODDAY_MODAS_VERSION) {
            flush_rewrite_rules(false);
            update_option('todday_rewrite_version', TODDAY_MODAS_VERSION);
        }
    }

    public static function register_query_vars(array $vars): array {
        $vars[] = 'todday_panel';
        return $vars;
    }

    public static function handle_spa_routes(): void {
        $panel = get_query_var('todday_panel');
        if (!$panel) {
            return;
        }

        // Rota do painel de gestão
        if ($panel === 'admin') {
            include TODDAY_MODAS_PATH . 'templates/admin-panel.php';
            exit;
        }

        // Rota do painel do vendedor
        if ($panel === 'vendor') {
            include TODDAY_MODAS_PATH . 'templates/vendor-panel.php';
            exit;
        }

        // Rota do painel do cliente
        if ($panel === 'customer') {
            include TODDAY_MODAS_PATH . 'templates/customer-panel.php';
            exit;
        }

        // Rota de download do plugin
        if ($panel === 'download') {
            include TODDAY_MODAS_PATH . 'templates/download.php';
            exit;
        }

        // Rota da documentação da API
        if ($panel === 'docs') {
            include TODDAY_MODAS_PATH . 'templates/docs.php';
            exit;
        }
    }
}
