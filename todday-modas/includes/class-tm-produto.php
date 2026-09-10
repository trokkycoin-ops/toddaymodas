<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Produto {
    public static function init() {
        add_action( 'woocommerce_product_options_general_product_data', array( __CLASS__, 'add_custom_product_fields' ) );
        add_action( 'woocommerce_process_product_meta', array( __CLASS__, 'save_custom_product_fields' ) );
        add_action( 'woocommerce_single_product_summary', array( __CLASS__, 'render_condition_badge' ), 6 );
    }

    public static function add_custom_product_fields() {
        echo '<div class="options_group">';
        woocommerce_wp_select( array(
            'id'          => '_tm_condition',
            'label'       => __( 'Estado de Conservacao', 'todday-modas' ),
            'options'     => array(
                'novo_com_etiqueta' => __( 'Novo com Etiqueta', 'todday-modas' ),
                'excelente'         => __( 'Excelente Estado (Sem Marcas)', 'todday-modas' ),
                'muito_bom'         => __( 'Muito Bom (Sinais Minimos de Uso)', 'todday-modas' ),
                'bom'               => __( 'Bom Estado', 'todday-modas' ),
            ),
        ) );
        echo '</div>';
    }

    public static function save_custom_product_fields( $post_id ) {
        if ( isset( $_POST['_tm_condition'] ) ) {
            $condition = sanitize_text_field( wp_unslash( $_POST['_tm_condition'] ) );
            update_post_meta( $post_id, '_tm_condition', $condition );
        }
    }

    public static function render_condition_badge() {
        global $product;
        if ( ! $product ) { return; }
        $condition = get_post_meta( $product->get_id(), '_tm_condition', true );
        if ( ! empty( $condition ) ) {
            $labels = array(
                'novo_com_etiqueta' => __( 'Novo c/ Etiqueta', 'todday-modas' ),
                'excelente'         => __( 'Condicao Excelente', 'todday-modas' ),
                'muito_bom'         => __( 'Muito Bom Estado', 'todday-modas' ),
                'bom'               => __( 'Bom Estado', 'todday-modas' ),
            );
            $text = isset( $labels[ $condition ] ) ? $labels[ $condition ] : $condition;
            echo '<div class="tm-condition-tag"><span class="tm-dot"></span> ' . esc_html( $text ) . ' &bull; ' . esc_html__( 'Peca Unica de Brecho', 'todday-modas' ) . '</div>';
        }
    }
}
