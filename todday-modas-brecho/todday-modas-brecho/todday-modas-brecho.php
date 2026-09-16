<?php
/**
 * Plugin Name:       Todday Modas Brechó
 * Plugin URI:        https://tselak.com.br/plugins/todday-modas-brecho
 * Description:       Loja virtual premium sobre WooCommerce para Todday Modas Brechó. Catálogo customizado, checkout com ViaCEP, Melhor Envio e Mercado Pago, painéis SPA fora do wp-admin, PWA e widgets Elementor.
 * Version:           1.0.16
 * Requires at least: 6.0
 * Requires PHP:      8.1
 * Author:            Tselak Solutions
 * Author URI:        https://tselak.com.br
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       todday-modas-brecho
 * Domain Path:       /languages
 *
 * @package           ToddayModasBrecho
 */

if (!defined('ABSPATH')) {
    exit;
}

// Definição de constantes do plugin
define('TODDAY_MODAS_VERSION', '1.0.16');
define('TODDAY_MODAS_DB_VERSION', '1.0.0');
define('TODDAY_MODAS_FILE', __FILE__);
define('TODDAY_MODAS_PATH', plugin_dir_path(__FILE__));
define('TODDAY_MODAS_URL', plugin_dir_url(__FILE__));
define('TODDAY_MODAS_BASENAME', plugin_basename(__FILE__));
define('TODDAY_MODAS_PREFIX', 'tdm');

/**
 * Autoloader PSR-4 leve nativo sem Composer em runtime.
 */
spl_autoload_register(function ($class) {
    $prefix = 'ToddayModasBrecho\\';
    $base_dir = TODDAY_MODAS_PATH . 'includes/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
});

/**
 * Declaração explícita de compatibilidade com WooCommerce High-Performance Order Storage (HPOS).
 */
add_action('before_woocommerce_init', function () {
    if (class_exists(\Automattic\WooCommerce\Utilities\FeaturesUtil::class)) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
            'custom_order_tables',
            TODDAY_MODAS_FILE,
            true
        );
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
            'cart_checkout_blocks',
            TODDAY_MODAS_FILE,
            true
        );
    }
});

/**
 * Hooks de Ativação, Desativação e Inicialização
 */
register_activation_hook(TODDAY_MODAS_FILE, function () {
    \ToddayModasBrecho\Core\Activator::activate();
});

register_deactivation_hook(TODDAY_MODAS_FILE, function () {
    \ToddayModasBrecho\Core\Deactivator::deactivate();
});

/**
 * Bootstrap do plugin
 */
add_action('plugins_loaded', function () {
    \ToddayModasBrecho\Core\Plugin::instance()->init();
});
