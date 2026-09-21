<?php
namespace ToddayModasBrecho\Core;

if (!defined('ABSPATH')) {
    exit;
}

class Plugin {
    private static ?Plugin $instance = null;

    public static function instance(): Plugin {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {}

    public function init(): void {
        // Inicializa I18n
        I18n::load_plugin_textdomain();

        // Verifica migração de schema no init
        add_action('init', [Bootstrap::class, 'init_schema_and_roles'], 5);

        // Inicializa componentes do core, admin, frontend e api
        Bootstrap::init();
    }
}
