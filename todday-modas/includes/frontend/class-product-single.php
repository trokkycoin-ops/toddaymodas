<?php
namespace ToddayModas\Frontend;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Renderização de Ficha Técnica, Tabela de Medidas e Condição na Página de Produto
 */
class ProductSingle {
    private static $instance = null;

    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {}

    public function init() {
        // Adiciona aba especializada de "Medidas Reais & Condição" no WooCommerce
        add_filter('woocommerce_product_tabs', [$this, 'add_brecho_tabs']);
        
        // Exibe bloco compacto de condição logo abaixo do preço
        add_action('woocommerce_single_product_summary', [$this, 'render_condition_summary'], 12);
    }

    public function render_condition_summary() {
        global $product;
        if (!$product) return;

        $condition_key = get_post_meta($product->get_id(), '_todday_condition', true);
        if (!$condition_key) return;

        $info = \ToddayModas\Domain\Condition::get_condition_info($condition_key);
        if (!$info) return;

        $notes = get_post_meta($product->get_id(), '_todday_condition_notes', true);

        ?>
        <div class="todday-condition-box" style="margin: 15px 0; padding: 14px; background: #FAF8F5; border-radius: 8px; border: 1px solid #EDE8E1;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #78716C; font-weight: 600;">
                    <?php esc_html_e('Estado de Conservação', 'todday-modas'); ?>
                </span>
                <span class="todday-condition-pill" style="background: <?php echo esc_attr($info['badge_color']); ?>; color: #fff; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                    <?php echo esc_html($info['label']); ?>
                </span>
            </div>
            <p style="margin: 0; font-size: 13px; color: #44403C; line-height: 1.5;">
                <?php echo esc_html($info['description']); ?>
            </p>
            <?php if (!empty($notes)) : ?>
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #D6D3D1; font-size: 12px; color: #57534E;">
                    <strong><?php esc_html_e('Detalhes observados na curadoria:', 'todday-modas'); ?></strong> <?php echo esc_html($notes); ?>
                </div>
            <?php endif; ?>
        </div>
        <?php
    }

    public function add_brecho_tabs($tabs) {
        global $product;
        if (!$product) return $tabs;

        $measurements = \ToddayModas\Domain\Measurements::get_product_measurements($product->get_id());
        if (!empty($measurements)) {
            $tabs['todday_measurements'] = [
                'title'    => __('Guia de Medidas Reais', 'todday-modas'),
                'priority' => 15,
                'callback' => [$this, 'render_measurements_tab']
            ];
        }

        return $tabs;
    }

    public function render_measurements_tab() {
        global $product;
        if (!$product) return;

        $measurements = \ToddayModas\Domain\Measurements::get_product_measurements($product->get_id());
        $fields = \ToddayModas\Domain\Measurements::get_standard_fields();
        $vintage_era = get_post_meta($product->get_id(), '_todday_vintage_era', true);
        $composition = get_post_meta($product->get_id(), '_todday_composition', true);

        ?>
        <div class="todday-measurements-wrapper">
            <h3><?php esc_html_e('Medidas Anatômicas Aferidas na Peça', 'todday-modas'); ?></h3>
            <p style="color: #64748b; font-size: 14px;">
                <?php esc_html_e('As peças de brechó e vintage possuem cortes únicos. Recomendamos que você meça uma peça similar do seu guarda-roupa com uma fita métrica para comparar as dimensões.', 'todday-modas'); ?>
            </p>

            <table class="todday-measurements-table" style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                <thead>
                    <tr style="background: #F4F1EA; text-align: left;">
                        <th style="padding: 10px; border: 1px solid #E2DCD2;"><?php esc_html_e('Ponto de Medição', 'todday-modas'); ?></th>
                        <th style="padding: 10px; border: 1px solid #E2DCD2;"><?php esc_html_e('Dimensão Real', 'todday-modas'); ?></th>
                        <th style="padding: 10px; border: 1px solid #E2DCD2;"><?php esc_html_e('Como Medimos', 'todday-modas'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($measurements as $key => $value) : 
                        if (empty($value) || !isset($fields[$key])) continue;
                        $field = $fields[$key];
                    ?>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #E2DCD2; font-weight: 600;"><?php echo esc_html($field['label']); ?></td>
                            <td style="padding: 10px; border: 1px solid #E2DCD2; color: #C86D51; font-weight: 700;"><?php echo esc_html($value); ?> <?php echo esc_html($field['unit']); ?></td>
                            <td style="padding: 10px; border: 1px solid #E2DCD2; font-size: 13px; color: #666;"><?php echo esc_html($field['tip']); ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>

            <?php if ($vintage_era || $composition) : ?>
                <div style="margin-top: 20px; padding: 14px; background: #fff; border: 1px solid #eee; border-radius: 6px;">
                    <?php if ($vintage_era) : ?>
                        <p style="margin: 4px 0;"><strong><?php esc_html_e('Época / Estilo:', 'todday-modas'); ?></strong> <?php echo esc_html($vintage_era); ?></p>
                    <?php endif; ?>
                    <?php if ($composition) : ?>
                        <p style="margin: 4px 0;"><strong><?php esc_html_e('Composição Têxtil:', 'todday-modas'); ?></strong> <?php echo esc_html($composition); ?></p>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>
        <?php
    }
}
