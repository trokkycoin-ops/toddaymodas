<?php
namespace ToddayModasBrecho\Admin;

if (!defined('ABSPATH')) {
    exit;
}

use ToddayModasBrecho\Security\Security;

class Settings {
    public static function render(): void {
        if (!current_user_can('manage_options')) {
            wp_die('Acesso negado.');
        }

        if (isset($_POST['tdm_save_settings']) && check_admin_referer('tdm_settings_action', 'tdm_settings_nonce')) {
            $delete_data = sanitize_text_field($_POST['todday_delete_data'] ?? 'no');
            update_option('todday_delete_data', $delete_data);

            echo '<div class="updated"><p>Configurações atualizadas com sucesso.</p></div>';
        }

        $delete_data = get_option('todday_delete_data', 'no');
        ?>
        <div class="wrap" style="max-width: 800px;">
            <h1>Configurações — Todday Modas Brechó</h1>
            <form method="post">
                <?php wp_nonce_field('tdm_settings_action', 'tdm_settings_nonce'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row">Desinstalação de Dados</th>
                        <td>
                            <label>
                                <input type="checkbox" name="todday_delete_data" value="yes" <?php checked($delete_data, 'yes'); ?> />
                                Apagar tabelas de logs e configurações ao desinstalar o plugin (não apaga dados do WooCommerce).
                            </label>
                        </td>
                    </tr>
                </table>
                <p class="submit">
                    <input type="submit" name="tdm_save_settings" class="button button-primary" value="Salvar Configurações" />
                </p>
            </form>
        </div>
        <?php
    }
}
