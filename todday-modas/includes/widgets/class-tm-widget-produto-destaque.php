<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

if ( class_exists( '\Elementor\Widget_Base' ) ) {
    class TM_Widget_Produto_Destaque extends \Elementor\Widget_Base {
        public function get_name() { return 'tm_produto_destaque'; }
        public function get_title() { return __( 'Produto em Destaque (Todday)', 'todday-modas' ); }
        public function get_icon() { return 'eicon-product-related'; }
        public function get_categories() { return array( 'todday-modas' ); }

        protected function register_controls() {
            $this->start_controls_section(
                'section_content',
                array( 'label' => __( 'Configuracoes', 'todday-modas' ) )
            );
            $this->add_control(
                'title',
                array(
                    'label'   => __( 'Titulo', 'todday-modas' ),
                    'type'    => \Elementor\Controls_Manager::TEXT,
                    'default' => __( 'Peca Selecionada', 'todday-modas' ),
                )
            );
            $this->end_controls_section();
        }

        protected function render() {
            $settings = $this->get_settings_for_display();
            echo '<div class="tm-widget-box"><h3>' . esc_html( $settings['title'] ) . '</h3></div>';
        }
    }
}
