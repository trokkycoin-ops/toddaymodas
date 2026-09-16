<?php
namespace ToddayModasBrecho\Core;

if (!defined('ABSPATH')) {
    exit;
}

class Deactivator {
    public static function deactivate(): void {
        // Na desativação, nunca apagar dados de pedidos, produtos ou clientes
        flush_rewrite_rules();
    }
}
