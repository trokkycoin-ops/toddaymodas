<?php
namespace ToddayModasBrecho\Admin;

if (!defined('ABSPATH')) {
    exit;
}

use ToddayModasBrecho\Security\Security;
use ToddayModasBrecho\Security\GestaoSession;

class Settings {
    public static function render(): void {
        if (!current_user_can('manage_options')) {
            wp_die('Acesso negado.');
        }

        if (isset($_POST['tdm_save_settings']) && check_admin_referer('tdm_settings_action', 'tdm_settings_nonce')) {
            $delete_data = sanitize_text_field($_POST['todday_delete_data'] ?? 'no');
            update_option('todday_delete_data', $delete_data);

            // Senha do painel de gestão
            $nova_senha = sanitize_text_field(wp_unslash($_POST['todday_gestao_nova_senha'] ?? ''));
            $regenerar = isset($_POST['todday_gestao_regenerar']) && sanitize_text_field($_POST['todday_gestao_regenerar']) === 'yes';
            $msg = 'Configurações atualizadas com sucesso.';

            if (!empty($nova_senha)) {
                if (strlen($nova_senha) < 8) {
                    $msg = 'A nova senha do painel deve ter pelo menos 8 caracteres. Configurações restantes salvas.';
                } elseif (GestaoSession::change_password($nova_senha)) {
                    $msg = 'Senha do painel de gestão atualizada com sucesso. Use a nova senha para entrar em /painel-gestao-tm/.';
                }
            } elseif ($regenerar) {
                $plain = GestaoSession::generate();
                set_transient('tdm_gestao_settings_gen', ['senha' => $plain, 'quando' => time()], 30 * DAY_IN_SECONDS);
                $msg = 'Nova senha gerada automaticamente. No próximo acesso a /painel-gestao-tm/ ela aparecerá no aviso vermelho da tela de login.';
            }

            echo '<div class="updated"><p>' . esc_html($msg) . '</p></div>';
        }

        $delete_data = get_option('todday_delete_data', 'no');
        $gestao_status = GestaoSession::has_password()
            ? (GestaoSession::is_owner_changed() ? 'Definida pelo responsável' : 'Gerada automaticamente (exibida na tela de login do painel)')
            : 'Não definida';

        $ultima_gerada = get_transient('tdm_gestao_settings_gen');
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
                    <tr>
                        <th scope="row">Senha do Painel de Gestão</th>
                        <td>
                            <p><strong>URL privada:</strong> <code>/painel-gestao-tm/</code> — não divulgue. Não exige login no WordPress; apenas esta senha.</p>
                            <p style="margin-bottom:6px;">Status: <strong><?php echo esc_html($gestao_status); ?></strong></p>
                            <label>
                                <input type="password" name="todday_gestao_nova_senha" value="" placeholder="Nova senha (mínimo 8 caracteres)" autocomplete="new-password" style="width:100%; max-width:320px;" />
                                <span class="description">Define a senha manualmente (recomendado). Deixe em branco para não alterar.</span>
                            </label>
                            <p style="margin:8px 0 0;">
                                <label>
                                    <input type="checkbox" name="todday_gestao_regenerar" value="yes" />
                                    Gerar nova senha automaticamente e exibir no próximo acesso ao painel
                                </label>
                            </p>
                            <?php if (is_array($ultima_gerada) && !empty($ultima_gerada['senha'])): ?>
                                <p class="description" style="color:#b45309;">Última senha gerada aqui:
                                    <code><?php echo esc_html($ultima_gerada['senha']); ?></code> (mantida até você alterar).</p>
                            <?php endif; ?>
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
