<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

if ( class_exists( '\Elementor\Widget_Base' ) ) {
    class TM_Widget_Banner_CTA extends \Elementor\Widget_Base {
        public function get_name() { return 'tm_widget_banner_cta'; }
        public function get_title() { return __( 'Banner com Chamada (Todday)', 'todday-modas' ); }
        public function get_icon() { return 'eicon-call-to-action'; }
        public function get_categories() { return array( 'todday-modas' ); }

        protected function register_controls() {
            $this->start_controls_section(
                'section_content',
                array( 'label' => __( 'Conteudo', 'todday-modas' ) )
            );
            $this->end_controls_section();
        }

        protected function render() {
            echo '<div class="tm-banner-cta-box"><p>' . esc_html__( 'Banner CTA Todday Modas', 'todday-modas' ) . '</p></div>';
        }
    }
}
