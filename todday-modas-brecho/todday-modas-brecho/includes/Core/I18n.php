<?php
namespace ToddayModasBrecho\Core;

if (!defined('ABSPATH')) {
    exit;
}

class I18n {
    public static function load_plugin_textdomain(): void {
        load_plugin_textdomain(
            'todday-modas-brecho',
            false,
            dirname(plugin_basename(TODDAY_MODAS_FILE)) . '/languages/'
        );
    }
}
