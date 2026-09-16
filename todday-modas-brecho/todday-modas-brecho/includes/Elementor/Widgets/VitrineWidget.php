<?php
namespace ToddayModasBrecho\Elementor\Widgets;

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('\Elementor\Widget_Base')) {
    return;
}

class VitrineWidget extends \Elementor\Widget_Base {
    public function get_name(): string {
        return 'tdm_vitrine_widget';
    }

    public function get_title(): string {
        return esc_html__('Vitrine Todday', 'todday-modas-brecho');
    }

    public function get_icon(): string {
        return 'eicon-products';
    }

    public function get_categories(): array {
        return ['todday-modas'];
    }

    protected function register_controls(): void {
        $this->start_controls_section(
            'section_content',
            [
                'label' => esc_html__('Configurações da Vitrine', 'todday-modas-brecho'),
            ]
        );

        $this->add_control(
            'products_per_page',
            [
                'label' => esc_html__('Produtos por Página', 'todday-modas-brecho'),
                'type' => \Elementor\Controls_Manager::NUMBER,
                'default' => 12,
                'min' => 4,
                'max' => 48,
            ]
        );

        $this->end_controls_section();
    }

    protected function render(): void {
        echo do_shortcode('[todday_loja]');
    }
}
