<?php
namespace ToddayModas\Core;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Procedimentos executados na desativação do plugin (sem perda de dados)
 */
class Deactivator {
    public static function deactivate() {
        // Limpa apenas agendamentos do WP-Cron para evitar execuções fantasmas
        $timestamp = wp_next_scheduled('todday_clean_expired_locks');
        if ($timestamp) {
            wp_unschedule_event($timestamp, 'todday_clean_expired_locks');
        }
        wp_clear_scheduled_hook('todday_clean_expired_locks');

        // Transients de cache temporários
        delete_transient('todday_modas_active_banners');
    }
}
