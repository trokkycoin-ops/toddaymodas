<?php
namespace ToddayModas\Integrations\WooCommerce;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Customizações do WooCommerce para a Experiência Todday Modas
 */
class WcSetup {
    private static $instance = null;

    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {}

    public function init() {
        // Injeção de badges editoriais nos cards de produtos
        add_action('woocommerce_before_shop_loop_item_title', [$this, 'render_editorial_badges'], 15);
        
        // Customização do texto do botão "Adicionar ao carrinho" para peças únicas
        add_filter('woocommerce_product_single_add_to_cart_text', [$this, 'custom_add_to_cart_text'], 10, 2);
        add_filter('woocommerce_product_add_to_cart_text', [$this, 'custom_loop_add_to_cart_text'], 10, 2);
        
        // Exibição de aviso de peça única na página de produto
        add_action('woocommerce_single_product_summary', [$this, 'render_unique_piece_banner'], 11);
    }

    public function render_editorial_badges() {
        global $product;
        if (!$product) return;

        $product_id = $product->get_id();
        $is_unique = (bool) get_post_meta($product_id, '_todday_is_unique_piece', true);
        $condition_key = get_post_meta($product_id, '_todday_condition', true);
        $condition_info = \ToddayModas\Domain\Condition::get_condition_info($condition_key);

        echo '<div class="todday-badge-container">';
        if ($is_unique) {
            echo '<span class="todday-badge todday-badge--unique">' . esc_html__('Peça Única', 'todday-modas') . '</span>';
        }

        if ($condition_info) {
            echo '<span class="todday-badge todday-badge--condition" style="--badge-color: ' . esc_attr($condition_info['badge_color']) . ';">' . esc_html($condition_info['short_label']) . '</span>';
        }

        if ($product->is_on_sale()) {
            echo '<span class="todday-badge todday-badge--sale">' . esc_html__('Oferta', 'todday-modas') . '</span>';
        }
        echo '</div>';
    }

    public function custom_add_to_cart_text($text, $product) {
        if (get_post_meta($product->get_id(), '_todday_is_unique_piece', true)) {
            return __('Garantir Peça Única', 'todday-modas');
        }
        return $text;
    }

    public function custom_loop_add_to_cart_text($text, $product) {
        if (get_post_meta($product->get_id(), '_todday_is_unique_piece', true)) {
            return __('Ver Peça', 'todday-modas');
        }
        return $text;
    }

    public function render_unique_piece_banner() {
        global $product;
        if (!$product) return;

        if (get_post_meta($product->get_id(), '_todday_is_unique_piece', true)) {
            echo '<div class="todday-unique-notice">';
            echo '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
            echo '<div><strong>' . esc_html__('Exclusividade Todday:', 'todday-modas') . '</strong> ' . esc_html__('Esta é uma peça vintage/seminova única no acervo. Apenas 1 unidade disponível.', 'todday-modas') . '</div>';
            echo '</div>';
        }
    }
}
