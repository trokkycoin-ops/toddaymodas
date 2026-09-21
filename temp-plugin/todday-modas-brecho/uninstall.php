<?php
/**
 * Script de Desinstalação do Todday Modas Brechó.
 *
 * @package ToddayModasBrecho
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Verifica se a opção de limpeza de dados foi expressamente confirmada pelo administrador
$delete_data = get_option('todday_delete_data', 'no');

if ($delete_data === 'yes') {
    global $wpdb;

    // Remove tabelas dedicadas de auditoria/logs do plugin
    $table_logs = $wpdb->prefix . 'todday_activity_log';
    $wpdb->query("DROP TABLE IF EXISTS {$table_logs}");

    // Remove opções de configuração do plugin
    $options_to_delete = [
        'todday_db_version',
        'todday_delete_data',
        'todday_settings_general',
        'todday_settings_mercadopago',
        'todday_settings_melhorenvio',
        'todday_settings_viacep',
        'todday_settings_whatsapp',
        'todday_panel_page_id',
        'todday_vendor_page_id',
        'todday_customer_page_id'
    ];

    foreach ($options_to_delete as $option) {
        delete_option($option);
    }

    // Remove papéis criados
    remove_role('todday_gerente');
    remove_role('todday_vendedor');
}
