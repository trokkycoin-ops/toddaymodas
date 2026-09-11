<?php
namespace ToddayModasBrecho\Elementor\Widgets;

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('\Elementor\Widget_Base')) {
    return;
}

class WhatsAppWidget extends \Elementor\Widget_Base {
    public function get_name(): string {
        return 'tdm_whatsapp_widget';
    }

    public function get_title(): string {
        return esc_html__('Botão WhatsApp Todday', 'todday-modas-brecho');
    }

    public function get_icon(): string {
        return 'eicon-commenting';
    }

    public function get_categories(): array {
        return ['todday-modas'];
    }

    protected function render(): void {
        echo do_shortcode('[todday_whatsapp]');
    }
}
