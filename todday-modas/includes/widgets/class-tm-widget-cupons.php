<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

if ( class_exists( '\Elementor\Widget_Base' ) ) {
    class TM_Widget_Cupons extends \Elementor\Widget_Base {
        public function get_name() { return 'tm_widget_cupons'; }
        public function get_title() { return __( 'Cupons Ativos (Todday)', 'todday-modas' ); }
        public function get_icon() { return 'eicon-ticket'; }
        public function get_categories() { return array( 'todday-modas' ); }

        protected function register_controls() {
            $this->start_controls_section(
                'section_content',
                array( 'label' => __( 'Conteudo', 'todday-modas' ) )
            );
            $this->end_controls_section();
        }

        protected function render() {
            echo do_shortcode( '[tm_cupons]' );
        }
    }
}
