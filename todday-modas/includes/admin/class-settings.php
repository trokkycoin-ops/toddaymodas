<?php
namespace ToddayModas\Admin;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Painel de Configurações do Plugin Todday Modas
 */
class Settings {
    private static $instance = null;

    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {}

    public function init() {
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
    }

    public function add_admin_menu() {
        add_menu_page(
            __('Todday Modas', 'todday-modas'),
            __('Todday Modas', 'todday-modas'),
            'manage_woocommerce',
            'todday-modas-settings',
            [$this, 'render_settings_page'],
            'dashicons-store',
            56
        );

        add_submenu_page(
            'todday-modas-settings',
            __('Configurações Gerais', 'todday-modas'),
            __('Configurações', 'todday-modas'),
            'manage_woocommerce',
            'todday-modas-settings',
            [$this, 'render_settings_page']
        );
    }

    public function register_settings() {
        register_setting('todday_settings_group', 'todday_modas_lock_duration_minutes', [
            'type'              => 'integer',
            'sanitize_callback' => 'absint',
            'default'           => 15
        ]);

        register_setting('todday_settings_group', 'todday_modas_purge_on_uninstall', [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => 'yes'
        ]);
    }

    public function render_settings_page() {
        ?>
        <div class="wrap todday-admin-settings">
            <h1><?php esc_html_e('Todday Modas — Configurações do Ecossistema Brechó', 'todday-modas'); ?></h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('todday_settings_group');
                do_settings_sections('todday_settings_group');
                $minutes = get_option('todday_modas_lock_duration_minutes', 15);
                $purge = get_option('todday_modas_purge_on_uninstall', 'yes');
                ?>
                <table class="form-table" role="presentation">
                    <tbody>
                        <tr>
                            <th scope="row">
                                <label for="todday_modas_lock_duration_minutes">
                                    <?php esc_html_e('Tempo de Reserva no Carrinho (Soft Lock)', 'todday-modas'); ?>
                                </label>
                            </th>
                            <td>
                                <input name="todday_modas_lock_duration_minutes" type="number" id="todday_modas_lock_duration_minutes" value="<?php echo esc_attr($minutes); ?>" min="5" max="60" class="small-text" />
                                <span><?php esc_html_e('minutos (período em que a peça única fica reservada antes de expirar)', 'todday-modas'); ?></span>
                            </td>
                        </tr>

                        <tr>
                            <th scope="row">
                                <label for="todday_modas_purge_on_uninstall">
                                    <?php esc_html_e('Desinstalação Limpa (uninstall.php)', 'todday-modas'); ?>
                                </label>
                            </th>
                            <td>
                                <label>
                                    <input type="checkbox" name="todday_modas_purge_on_uninstall" value="yes" <?php checked($purge, 'yes'); ?> />
                                    <?php esc_html_e('Ativar remoção completa de tabelas customizadas e opções ao excluir o plugin no WordPress ("Zero Lixo no Banco").', 'todday-modas'); ?>
                                </label>
                                <p class="description">
                                    <?php esc_html_e('Respeita dados essenciais do WooCommerce: pedidos, clientes e histórico de vendas são preservados intactos.', 'todday-modas'); ?>
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <?php submit_button(__('Salvar Configurações', 'todday-modas')); ?>
            </form>
        </div>
        <?php
    }
}
