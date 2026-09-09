<?php
/**
 * Widget Elementor: TM Produto em Destaque.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Card de produto com foto, preço e botão "Comprar".
 */
class TM_Widget_Produto_Destaque extends \Elementor\Widget_Base {

	/**
	 * Slug do widget.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'tm_produto_destaque';
	}

	/**
	 * Título no painel do Elementor.
	 *
	 * @return string
	 */
	public function get_title() {
		return __( 'TM Produto em Destaque', 'todday-modas' );
	}

	/**
	 * Ícone.
	 *
	 * @return string
	 */
	public function get_icon() {
		return 'eicon-product-info';
	}

	/**
	 * Categoria no painel.
	 *
	 * @return array
	 */
	public function get_categories() {
		return array( 'general' );
	}

	/**
	 * Controles do widget.
	 */
	protected function register_controls() {
		$this->start_controls_section(
			'content_section',
			array( 'label' => __( 'Produto', 'todday-modas' ) )
		);

		$options = array();
		$products = wc_get_products(
			array(
				'status' => 'publish',
				'limit'  => 100,
				'orderby' => 'title',
				'order'  => 'ASC',
			)
		);
		foreach ( $products as $product ) {
			$options[ $product->get_id() ] = $product->get_name();
		}

		$this->add_control(
			'product_id',
			array(
				'label'   => __( 'Escolha o produto', 'todday-modas' ),
				'type'    => \Elementor\Controls_Manager::SELECT,
				'options' => $options,
			)
		);

		$this->add_control(
			'button_text',
			array(
				'label'   => __( 'Texto do botão', 'todday-modas' ),
				'type'    => \Elementor\Controls_Manager::TEXT,
				'default' => __( 'Comprar', 'todday-modas' ),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Render do widget (front + editor).
	 */
	protected function render() {
		$settings   = $this->get_settings_for_display();
		$product_id = isset( $settings['product_id'] ) ? absint( $settings['product_id'] ) : 0;
		$product    = $product_id ? wc_get_product( $product_id ) : false;

		if ( ! $product ) {
			if ( \Elementor\Plugin::$instance->editor->is_edit_mode() ) {
				echo '<p>' . esc_html__( 'Selecione um produto no painel ao lado.', 'todday-modas' ) . '</p>';
			}
			return;
		}

		$button_text = ! empty( $settings['button_text'] ) ? $settings['button_text'] : __( 'Comprar', 'todday-modas' );
		$image       = $product->get_image( 'woocommerce_thumbnail' );
		?>
		<div class="tm-card-produto-destaque">
			<a class="tm-cpd-foto" href="<?php echo esc_url( $product->get_permalink() ); ?>">
				<?php echo wp_kses_post( $image ); ?>
			</a>
			<h3 class="tm-cpd-nome">
				<a href="<?php echo esc_url( $product->get_permalink() ); ?>"><?php echo esc_html( $product->get_name() ); ?></a>
			</h3>
			<div class="tm-cpd-preco"><?php echo wp_kses_post( $product->get_price_html() ); ?></div>
			<a class="tm-cpd-botao" href="<?php echo esc_url( $product->add_to_cart_url() ); ?>">
				<?php echo esc_html( $button_text ); ?>
			</a>
		</div>
		<?php
	}
}
