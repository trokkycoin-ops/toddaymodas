<?php
namespace ToddayModasBrecho\Core;

if (!defined('ABSPATH')) {
    exit;
}

use ToddayModasBrecho\Database\Schema;
use ToddayModasBrecho\Database\Migrations;
use ToddayModasBrecho\Security\CapabilityMatrix;

class Activator {
    public static function activate(): void {
        // Criação de tabelas
        Schema::create_tables();

        // Execução de migrações
        Migrations::run();

        // Criação de papéis e capacidades personalizadas
        CapabilityMatrix::setup_roles_and_capabilities();

        // Salva versão do banco
        update_option('todday_db_version', TODDAY_MODAS_DB_VERSION);

        // Opções padrão
        if (false === get_option('todday_settings_general')) {
            update_option('todday_settings_general', [
                'store_name' => 'Todday Modas Brechó',
                'contact_email' => get_option('admin_email'),
                'phone' => '(35) 99175-9960',
                'currency' => 'BRL',
            ]);
        }

        // Registra rewrite rules e faz flush único na ativação
        Bootstrap::register_rewrite_rules();
        flush_rewrite_rules();
    }
}
