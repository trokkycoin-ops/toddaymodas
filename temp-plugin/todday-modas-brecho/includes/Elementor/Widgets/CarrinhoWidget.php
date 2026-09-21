<?php
namespace ToddayModasBrecho\Elementor\Widgets;

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('\Elementor\Widget_Base')) {
    return;
}

class CarrinhoWidget extends \Elementor\Widget_Base {
    public function get_name(): string {
        return 'tdm_carrinho_widget';
    }

    public function get_title(): string {
        return esc_html__('Carrinho Todday', 'todday-modas-brecho');
    }

    public function get_icon(): string {
        return 'eicon-cart';
    }

    public function get_categories(): array {
        return ['todday-modas'];
    }

    protected function render(): void {
        echo do_shortcode('[todday_carrinho]');
    }
}
