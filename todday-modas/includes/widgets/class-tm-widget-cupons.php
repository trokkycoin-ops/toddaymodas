<?php
/**
 * Widget Elementor: TM Cupons — vitrine de cupons ativos.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lista os cupons publicados/vigentes com botão de copiar.
 */
class TM_Widget_Cupons extends \Elementor\Widget_Base {

	/**
	 * @return string
	 */
	public function get_name() {
		return 'tm_cupons';
	}

	/**
	 * @return string
	 */
	public function get_title() {
		return __( 'TM Cupons', 'todday-modas' );
	}

	/**
	 * @return string
	 */
	public function get_icon() {
		return 'eicon-product-sale-price';
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
		$this->start_controls_section( 'content', array( 'label' => __( 'Cupons', 'todday-modas' ) ) );

		$this->add_control(
			'titulo',
			array(
				'label'   => __( 'Título da seção', 'todday-modas' ),
				'type'    => \Elementor\Controls_Manager::TEXT,
				'default' => __( 'Cupons para você economizar', 'todday-modas' ),
			)
		);

		$this->add_control(
			'limite',
			array(
				'label'   => __( 'Quantidade máxima', 'todday-modas' ),
				'type'    => \Elementor\Controls_Manager::NUMBER,
				'default' => 3,
				'min'     => 1,
				'max'     => 12,
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Render.
	 */
	protected function render() {
		$s = $this->get_settings_for_display();
		TM_Public::render_cupons(
			array(
				'title' => isset( $s['titulo'] ) ? $s['titulo'] : '',
				'limit' => isset( $s['limite'] ) ? absint( $s['limite'] ) : 3,
			)
		);
	}
}
