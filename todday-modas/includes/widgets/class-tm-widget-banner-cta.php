<?php
/**
 * Widget Elementor: TM Banner com CTA.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Banner responsivo com imagem de fundo, título, texto e botão.
 */
class TM_Widget_Banner_CTA extends \Elementor\Widget_Base {

	/**
	 * @return string
	 */
	public function get_name() {
		return 'tm_banner_cta';
	}

	/**
	 * @return string
	 */
	public function get_title() {
		return __( 'TM Banner com CTA', 'todday-modas' );
	}

	/**
	 * @return string
	 */
	public function get_icon() {
		return 'eicon-call-to-action';
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
		$this->start_controls_section( 'content', array( 'label' => __( 'Conteúdo', 'todday-modas' ) ) );

		$this->add_control(
			'imagem',
			array(
				'label'   => __( 'Imagem de fundo', 'todday-modas' ),
				'type'    => \Elementor\Controls_Manager::MEDIA,
				'default' => array(),
			)
		);

		$this->add_control(
			'titulo',
			array(
				'label'   => __( 'Título', 'todday-modas' ),
				'type'    => \Elementor\Controls_Manager::TEXT,
				'default' => __( 'Nova coleção', 'todday-modas' ),
			)
		);

		$this->add_control(
			'subtitulo',
			array(
				'label'   => __( 'Subtítulo', 'todday-modas' ),
				'type'    => \Elementor\Controls_Manager::TEXTAREA,
				'default' => __( 'Peças selecionadas para o seu estilo.', 'todday-modas' ),
			)
		);

		$this->add_control(
			'botao_texto',
			array(
				'label'   => __( 'Texto do botão', 'todday-modas' ),
				'type'    => \Elementor\Controls_Manager::TEXT,
				'default' => __( 'Ver coleção', 'todday-modas' ),
			)
		);

		$this->add_control(
			'link',
			array(
				'label'   => __( 'Link do botão', 'todday-modas' ),
				'type'    => \Elementor\Controls_Manager::URL,
				'default' => array( 'url' => '' ),
			)
		);

		$this->add_control(
			'alinhamento',
			array(
				'label'   => __( 'Alinhamento do texto', 'todday-modas' ),
				'type'    => \Elementor\Controls_Manager::CHOOSE,
				'options' => array(
					'flex-start' => array( 'title' => __( 'Esquerda', 'todday-modas' ), 'icon' => 'eicon-text-align-left' ),
					'center'     => array( 'title' => __( 'Centro', 'todday-modas' ), 'icon' => 'eicon-text-align-center' ),
					'flex-end'   => array( 'title' => __( 'Direita', 'todday-modas' ), 'icon' => 'eicon-text-align-right' ),
				),
				'default' => 'flex-start',
			)
		);

		$this->add_control(
			'altura',
			array(
				'label'      => __( 'Altura mínima (px)', 'todday-modas' ),
				'type'       => \Elementor\Controls_Manager::NUMBER,
				'default'    => 420,
				'min'        => 240,
				'max'        => 800,
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Render.
	 */
	protected function render() {
		$s       = $this->get_settings_for_display();
		$img_url = ! empty( $s['imagem']['url'] ) ? $s['imagem']['url'] : '';
		$link    = ! empty( $s['link']['url'] ) ? $s['link']['url'] : '';
		$target  = ! empty( $s['link']['is_external'] ) ? '_blank' : '_self';
		$rel     = '_blank' === $target ? 'noopener noreferrer' : '';
		$align   = in_array( $s['alinhamento'], array( 'flex-start', 'center', 'flex-end' ), true ) ? $s['alinhamento'] : 'flex-start';
		$altura  = isset( $s['altura'] ) ? absint( $s['altura'] ) : 420;
		if ( $altura < 240 ) {
			$altura = 240;
		}
		?>
		<div class="tm-banner-cta" style="justify-content:<?php echo esc_attr( $align ); ?>; min-height:<?php echo esc_attr( (string) $altura ); ?>px;<?php echo $img_url ? ' background-image:url(' . esc_url( $img_url ) . ');' : ''; ?>">
			<div class="tm-banner-cta-overlay"></div>
			<div class="tm-banner-cta-conteudo">
				<?php if ( ! empty( $s['titulo'] ) ) : ?>
					<h2 class="tm-banner-cta-titulo"><?php echo esc_html( $s['titulo'] ); ?></h2>
				<?php endif; ?>
				<?php if ( ! empty( $s['subtitulo'] ) ) : ?>
					<p class="tm-banner-cta-sub"><?php echo esc_html( $s['subtitulo'] ); ?></p>
				<?php endif; ?>
				<?php if ( ! empty( $s['botao_texto'] ) && $link ) : ?>
					<a class="tm-banner-cta-botao" href="<?php echo esc_url( $link ); ?>" target="<?php echo esc_attr( $target ); ?>" <?php echo $rel ? ' rel="' . esc_attr( $rel ) . '"' : ''; ?>>
						<?php echo esc_html( $s['botao_texto'] ); ?>
					</a>
				<?php endif; ?>
			</div>
		</div>
		<?php
	}
}
