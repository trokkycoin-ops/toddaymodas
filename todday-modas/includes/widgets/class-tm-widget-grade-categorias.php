<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

if ( class_exists( '\Elementor\Widget_Base' ) ) {
    class TM_Widget_Grade_Categorias extends \Elementor\Widget_Base {
        public function get_name() { return 'tm_grade_categorias'; }
        public function get_title() { return __( 'Grade de Departamentos (Todday)', 'todday-modas' ); }
        public function get_icon() { return 'eicon-gallery-grid'; }
        public function get_categories() { return array( 'todday-modas' ); }

        protected function register_controls() {
            $this->start_controls_section(
                'section_content',
                array( 'label' => __( 'Conteudo', 'todday-modas' ) )
            );
            $this->end_controls_section();
        }

        protected function render() {
            echo do_shortcode( '[tm_categorias]' );
        }
    }
}
