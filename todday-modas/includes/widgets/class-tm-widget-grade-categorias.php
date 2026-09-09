<?php
/**
 * Widget Elementor: TM Grade de Categorias.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Grid com as categorias de produto (foto + nome), clicáveis.
 */
class TM_Widget_Grade_Categorias extends \Elementor\Widget_Base {

	/**
	 * @return string
	 */
	public function get_name() {
		return 'tm_grade_categorias';
	}

	/**
	 * @return string
	 */
	public function get_title() {
		return __( 'TM Grade de Categorias', 'todday-modas' );
	}

	/**
	 * @return string
	 */
	public function get_icon() {
		return 'eicon-gallery-grid';
	}

	/**
	 * @return array
	 */
	public function get_categories() {
		return array( 'general' );
	}

	/**
	 * Controles.
	 */
	protected function register_controls() {
		$this->start_controls_section( 'content', array( 'label' => __( 'Grade', 'todday-modas' ) ) );

		$this->add_control(
			'colunas',
			array(
				'label'   => __( 'Colunas (desktop)', 'todday-modas' ),
				'type'    => \Elementor\Controls_Manager::NUMBER,
				'default' => 4,
				'min'     => 2,
				'max'     => 6,
			)
		);

		$this->add_control(
			'limite',
			array(
				'label'   => __( 'Quantidade de categorias', 'todday-modas' ),
				'type'    => \Elementor\Controls_Manager::NUMBER,
				'default' => 6,
				'min'     => 1,
				'max'     => 24,
			)
		);

		$this->add_control(
			'mostrar_contagem',
			array(
				'label'   => __( 'Mostrar quantidade de produtos', 'todday-modas' ),
				'type'    => \Elementor\Controls_Manager::SWITCHER,
				'default' => '',
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Render.
	 */
	protected function render() {
		$s = $this->get_settings_for_display();
		TM_Public::render_categorias(
			array(
				'colunas'  => isset( $s['colunas'] ) ? absint( $s['colunas'] ) : 4,
				'limit'    => isset( $s['limite'] ) ? absint( $s['limite'] ) : 6,
				'contagem' => ! empty( $s['mostrar_contagem'] ) && 'yes' === $s['mostrar_contagem'],
			)
		);
		if ( \Elementor\Plugin::$instance->editor->is_edit_mode() ) {
			$terms = get_terms( array( 'taxonomy' => 'product_cat', 'hide_empty' => true, 'number' => 1 ) );
			if ( is_wp_error( $terms ) || empty( $terms ) ) {
				echo '<p>' . esc_html__( 'Cadastre categorias de produto para vê-las aqui.', 'todday-modas' ) . '</p>';
			}
		}
	}
}
