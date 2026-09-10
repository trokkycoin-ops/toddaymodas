<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Admin_Menu {
    public static function init() {
        add_action( 'admin_menu', array( __CLASS__, 'registra_menus' ) );
    }

    public static function registra_menus() {
        $capability = 'manage_options';

        add_menu_page(
            __( 'Todday Modas', 'todday-modas' ),
            __( 'Todday Modas', 'todday-modas' ),
            $capability,
            'todday-modas',
            array( __CLASS__, 'view_dashboard' ),
            'dashicons-tag',
            56
        );

        add_submenu_page(
            'todday-modas',
            __( 'Dashboard & Visao Geral', 'todday-modas' ),
            __( 'Dashboard', 'todday-modas' ),
            $capability,
            'todday-modas',
            array( __CLASS__, 'view_dashboard' )
        );

        add_submenu_page(
            'todday-modas',
            __( 'Identidade & Branding', 'todday-modas' ),
            __( 'Branding', 'todday-modas' ),
            $capability,
            'tm-branding',
            array( __CLASS__, 'view_branding' )
        );

        add_submenu_page(
            'todday-modas',
            __( 'Gestao de Banners', 'todday-modas' ),
            __( 'Banners', 'todday-modas' ),
            $capability,
            'tm-banners',
            array( __CLASS__, 'view_banners' )
        );

        add_submenu_page(
            'todday-modas',
            __( 'Promocoes & Cupons', 'todday-modas' ),
            __( 'Promocoes', 'todday-modas' ),
            $capability,
            'tm-promocoes',
            array( __CLASS__, 'view_promocoes' )
        );

        add_submenu_page(
            'todday-modas',
            __( 'Configuracoes de Frete', 'todday-modas' ),
            __( 'Frete & Entregas', 'todday-modas' ),
            $capability,
            'tm-frete',
            array( __CLASS__, 'view_frete' )
        );

        add_submenu_page(
            'todday-modas',
            __( 'Integrações Mercado Pago & APIs', 'todday-modas' ),
            __( 'Integrações', 'todday-modas' ),
            $capability,
            'tm-integracoes',
            array( __CLASS__, 'view_integracoes' )
        );

        add_submenu_page(
            'todday-modas',
            __( 'Relatorios & Vendas', 'todday-modas' ),
            __( 'Relatorios', 'todday-modas' ),
            $capability,
            'tm-relatorios',
            array( __CLASS__, 'view_relatorios' )
        );

        add_submenu_page(
            'todday-modas',
            __( 'Logs do Sistema', 'todday-modas' ),
            __( 'Logs & Auditoria', 'todday-modas' ),
            $capability,
            'tm-logs',
            array( __CLASS__, 'view_logs' )
        );
    }

    public static function view_dashboard() {
        require TM_PLUGIN_DIR . 'admin/views/dashboard.php';
    }

    public static function view_branding() {
        require TM_PLUGIN_DIR . 'admin/views/branding.php';
    }

    public static function view_banners() {
        require TM_PLUGIN_DIR . 'admin/views/banners.php';
    }

    public static function view_promocoes() {
        require TM_PLUGIN_DIR . 'admin/views/promocoes.php';
    }

    public static function view_frete() {
        require TM_PLUGIN_DIR . 'admin/views/frete.php';
    }

    public static function view_integracoes() {
        require TM_PLUGIN_DIR . 'admin/views/integracoes.php';
    }

    public static function view_relatorios() {
        require TM_PLUGIN_DIR . 'admin/views/relatorios.php';
    }

    public static function view_logs() {
        require TM_PLUGIN_DIR . 'admin/views/logs.php';
    }
}
