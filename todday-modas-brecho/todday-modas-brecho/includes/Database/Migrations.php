<?php
namespace ToddayModasBrecho\Database;

if (!defined('ABSPATH')) {
    exit;
}

class Migrations {
    public static function run(): void {
        $current_version = get_option('todday_db_version', '0.0.0');

        // Migração 1.0.0 inicial
        if (version_compare($current_version, '1.0.0', '<')) {
            self::migrate_to_1_0_0();
        }
        if (version_compare($current_version, '1.0.1', '<')) {
            self::migrate_to_1_0_1();
        }
    }

    private static function migrate_to_1_0_0(): void {
        Schema::create_tables();

        // Configurações padrão seguras se ainda não existirem
        if (false === get_option('todday_settings_mercadopago')) {
            update_option('todday_settings_mercadopago', [
                'enabled' => 'no',
                'environment' => 'sandbox',
                'public_key' => '',
                'access_token' => '',
                'webhook_secret' => '',
            ]);
        }

        if (false === get_option('todday_settings_melhorenvio')) {
            update_option('todday_settings_melhorenvio', [
                'enabled' => 'no',
                'environment' => 'sandbox',
                'api_token' => '',
                'sender_cep' => '01001-000',
                'fallback_flat_rate' => '25.00',
            ]);
        }

        if (false === get_option('todday_settings_whatsapp')) {
            update_option('todday_settings_whatsapp', [
                'enabled' => 'yes',
                    'phone' => '5535991759960',
                    'default_message' => 'Olá, Sebastiana! Gostaria de tirar dúvidas sobre as peças do Todday Modas Brechó!',
            ]);
        }
    }

    private static function migrate_to_1_0_1(): void {
        $settings = get_option('todday_settings_whatsapp', []);
        if (in_array($settings['phone'] ?? '', ['', '5511999998888'], true)) {
            $settings['phone'] = '5535991759960';
            $settings['default_message'] = 'Olá, Sebastiana! Gostaria de tirar dúvidas sobre as peças do Todday Modas Brechó!';
            update_option('todday_settings_whatsapp', $settings);
        }
    }
}
