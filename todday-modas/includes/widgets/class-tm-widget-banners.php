<?php
/**
 * Widget Elementor: TM Banners — slider dos banners ativos cadastrados no painel.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Slider de banners (imagem + link) com autoplay opcional.
 */
class TM_Widget_Banners extends \Elementor\Widget_Base {

	/**
	 * @return string
	 */
	public function get_name() {
		return 'tm_banners';
	}

	/**
	 * @return string
	 */
	public function get_title() {
		return __( 'TM Banners (slider)', 'todday-modas' );
	}

	/**
	 * @return string
	 */
	public function get_icon() {
		return 'eicon-slideshow';
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
		$this->start_controls_section( 'content', array( 'label' => __( 'Banners', 'todday-modas' ) ) );

		$this->add_control(
			'titulo',
			array(
				'label'   => __( 'Título da seção (opcional)', 'todday-modas' ),
				'type'    => \Elementor\Controls_Manager::TEXT,
				'default' => '',
			)
		);

		$this->add_control(
			'limite',
			array(
				'label'   => __( 'Quantidade máxima de banners', 'todday-modas' ),
				'type'    => \Elementor\Controls_Manager::NUMBER,
				'default' => 0,
				'min'     => 0,
				'max'     => 20,
				'description' => __( '0 exibe todos os banners ativos (agendados).', 'todday-modas' ),
			)
		);

		$this->add_control(
			'autoplay',
			array(
				'label'   => __( 'Trocar automaticamente a cada (segundos)', 'todday-modas' ),
				'type'    => \Elementor\Controls_Manager::NUMBER,
				'default' => 0,
				'min'     => 0,
				'max'     => 30,
				'description' => __( '0 desativa o giro automático. Pausa ao passar o mouse ou focar.', 'todday-modas' ),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Render.
	 */
	protected function render() {
		$s = $this->get_settings_for_display();
		TM_Public::render_banners(
			array(
				'titulo'   => isset( $s['titulo'] ) ? $s['titulo'] : '',
				'limit'    => isset( $s['limite'] ) ? absint( $s['limite'] ) : 0,
				'autoplay' => isset( $s['autoplay'] ) ? absint( $s['autoplay'] ) : 0,
			)
		);
		if ( \Elementor\Plugin::$instance->editor->is_edit_mode() && empty( TM_Banners::get_active() ) ) {
			echo '<p>' . esc_html__( 'Cadastre banners em "Todday Modas → Gestão de Banners" para vê-los aqui.', 'todday-modas' ) . '</p>';
		}
	}
}
