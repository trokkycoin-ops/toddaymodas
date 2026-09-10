<?php
namespace ToddayModas\Admin;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Metaboxes de Brechó para Cadastro de Peças Únicas, Medidas e Condição
 */
class ProductMetabox {
    private static $instance = null;

    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {}

    public function init() {
        add_action('add_meta_boxes', [$this, 'add_metaboxes']);
        add_action('save_post_product', [$this, 'save_product_meta']);
    }

    public function add_metaboxes() {
        add_meta_box(
            'todday_product_brecho_details',
            __('Todday Modas - Ficha Técnica do Brechó & Medidas', 'todday-modas'),
            [$this, 'render_metabox'],
            'product',
            'normal',
            'high'
        );
    }

    public function render_metabox($post) {
        wp_nonce_field('todday_save_product_details', 'todday_product_nonce');

        $is_unique = get_post_meta($post->ID, '_todday_is_unique_piece', true);
        $condition = get_post_meta($post->ID, '_todday_condition', true);
        $condition_notes = get_post_meta($post->ID, '_todday_condition_notes', true);
        $vintage_era = get_post_meta($post->ID, '_todday_vintage_era', true);
        $composition = get_post_meta($post->ID, '_todday_composition', true);
        $measurements = \ToddayModas\Domain\Measurements::get_product_measurements($post->ID);
        $fields = \ToddayModas\Domain\Measurements::get_standard_fields();
        $conditions = \ToddayModas\Domain\Condition::get_levels();
        ?>
        <div class="todday-admin-metabox-wrapper" style="padding: 12px 0;">
            <p style="margin-bottom: 16px; background: #faf8f5; border-left: 4px solid #C86D51; padding: 10px 14px;">
                <strong><?php esc_html_e('Configuração do Brechó:', 'todday-modas'); ?></strong>
                <?php esc_html_e('Preencha com rigor as medidas reais e o estado de conservação para proporcionar máxima transparência e segurança na compra de peças seminovas.', 'todday-modas'); ?>
            </p>

            <table class="form-table" role="presentation">
                <tbody>
                    <tr>
                        <th scope="row"><?php esc_html_e('Peça Única?', 'todday-modas'); ?></th>
                        <td>
                            <label>
                                <input type="checkbox" name="_todday_is_unique_piece" value="1" <?php checked($is_unique, '1'); ?> />
                                <strong><?php esc_html_e('Sim, esta é uma peça única no estoque (quantidade 1 com proteção concorrente)', 'todday-modas'); ?></strong>
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Estado de Conservação', 'todday-modas'); ?></th>
                        <td>
                            <select name="_todday_condition" style="min-width: 250px;">
                                <option value=""><?php esc_html_e('Selecione o estado...', 'todday-modas'); ?></option>
                                <?php foreach ($conditions as $key => $item) : ?>
                                    <option value="<?php echo esc_attr($key); ?>" <?php selected($condition, $key); ?>>
                                        <?php echo esc_html($item['label']); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Detalhes / Sinais de Uso', 'todday-modas'); ?></th>
                        <td>
                            <textarea name="_todday_condition_notes" rows="3" style="width: 100%; max-width: 600px;" placeholder="<?php esc_attr_e('Descreva com transparência pequenos desgastes, desbotados ou pontos de atenção...', 'todday-modas'); ?>"><?php echo esc_textarea($condition_notes); ?></textarea>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Época / Estilo Vintage', 'todday-modas'); ?></th>
                        <td>
                            <input type="text" name="_todday_vintage_era" value="<?php echo esc_attr($vintage_era); ?>" placeholder="Ex: Anos 90, Vintage 80s, Y2K, Contemporâneo" style="width: 300px;" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Composição Têxtil', 'todday-modas'); ?></th>
                        <td>
                            <input type="text" name="_todday_composition" value="<?php echo esc_attr($composition); ?>" placeholder="Ex: 100% Seda Pura, Linho com Viscose, Algodão Puro" style="width: 300px;" />
                        </td>
                    </tr>
                </tbody>
            </table>

            <h4 style="margin: 24px 0 10px 0; border-bottom: 1px solid #eee; padding-bottom: 6px;">
                <?php esc_html_e('Matriz de Medidas Reais (em centímetros)', 'todday-modas'); ?>
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; margin-top: 10px;">
                <?php foreach ($fields as $field_key => $field_data) : 
                    $val = $measurements[$field_key] ?? '';
                ?>
                    <div style="background: #fff; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px;">
                        <label style="font-weight: 600; display: block; font-size: 13px; margin-bottom: 4px;">
                            <?php echo esc_html($field_data['label']); ?> (<?php echo esc_html($field_data['unit']); ?>)
                        </label>
                        <input type="number" step="0.5" name="_todday_measurements[<?php echo esc_attr($field_key); ?>]" value="<?php echo esc_attr($val); ?>" style="width: 100%;" placeholder="Ex: 88" />
                        <small style="color: #64748b; font-size: 11px; display: block; margin-top: 2px;">
                            <?php echo esc_html($field_data['tip']); ?>
                        </small>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        <?php
    }

    public function save_product_meta($post_id) {
        if (!isset($_POST['todday_product_nonce']) || !wp_verify_nonce($_POST['todday_product_nonce'], 'todday_save_product_details')) {
            return;
        }

        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        if (!current_user_can('edit_product', $post_id)) {
            return;
        }

        // Salva peça única
        $is_unique = isset($_POST['_todday_is_unique_piece']) ? '1' : '0';
        update_post_meta($post_id, '_todday_is_unique_piece', $is_unique);

        if ($is_unique === '1') {
            // Garante estoque igual a 1 e gerencia estoque
            update_post_meta($post_id, '_manage_stock', 'yes');
            update_post_meta($post_id, '_sold_individually', 'yes');
            if (get_post_meta($post_id, '_stock', true) === '') {
                update_post_meta($post_id, '_stock', 1);
            }
        }

        // Salva condição e notas
        if (isset($_POST['_todday_condition'])) {
            update_post_meta($post_id, '_todday_condition', sanitize_text_field($_POST['_todday_condition']));
        }

        if (isset($_POST['_todday_condition_notes'])) {
            update_post_meta($post_id, '_todday_condition_notes', sanitize_textarea_field($_POST['_todday_condition_notes']));
        }

        if (isset($_POST['_todday_vintage_era'])) {
            update_post_meta($post_id, '_todday_vintage_era', sanitize_text_field($_POST['_todday_vintage_era']));
        }

        if (isset($_POST['_todday_composition'])) {
            update_post_meta($post_id, '_todday_composition', sanitize_text_field($_POST['_todday_composition']));
        }

        // Salva matriz de medidas
        if (isset($_POST['_todday_measurements']) && is_array($_POST['_todday_measurements'])) {
            $cleaned_measurements = [];
            foreach ($_POST['_todday_measurements'] as $k => $v) {
                if ($v !== '') {
                    $cleaned_measurements[sanitize_key($k)] = floatval($v);
                }
            }
            update_post_meta($post_id, '_todday_measurements', $cleaned_measurements);
        }
    }
}
