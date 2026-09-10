<?php
namespace ToddayModas\Domain;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Gestão e Formatação da Matriz de Medidas Reais da Peça
 */
class Measurements {
    private static $instance = null;

    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {}

    public function init() {}

    /**
     * Campos padrão de medidas anatômicas
     */
    public static function get_standard_fields() {
        return [
            'busto'        => ['label' => __('Busto', 'todday-modas'), 'unit' => 'cm', 'tip' => __('Circunferência na altura mais larga do busto', 'todday-modas')],
            'cintura'      => ['label' => __('Cintura', 'todday-modas'), 'unit' => 'cm', 'tip' => __('Circunferência no ponto mais estreito do tronco', 'todday-modas')],
            'quadril'      => ['label' => __('Quadril', 'todday-modas'), 'unit' => 'cm', 'tip' => __('Circunferência na área mais volumosa dos quadris', 'todday-modas')],
            'comprimento'  => ['label' => __('Comprimento Total', 'todday-modas'), 'unit' => 'cm', 'tip' => __('Do ponto mais alto do ombro/cós até a barra', 'todday-modas')],
            'ombro'        => ['label' => __('Ombro a Ombro', 'todday-modas'), 'unit' => 'cm', 'tip' => __('De uma ponta do ombro à outra pelas costas', 'todday-modas')],
            'manga'        => ['label' => __('Comprimento da Manga', 'todday-modas'), 'unit' => 'cm', 'tip' => __('Da costura do ombro até o punho', 'todday-modas')],
            'gancho'       => ['label' => __('Gancho / Cavalo', 'todday-modas'), 'unit' => 'cm', 'tip' => __('Da costura do cós até a junção entrepernas', 'todday-modas')],
            'entrepernas'  => ['label' => __('Entrepernas', 'todday-modas'), 'unit' => 'cm', 'tip' => __('Da junção entrepernas até a barra da calça', 'todday-modas')],
            'largura'      => ['label' => __('Largura Plana', 'todday-modas'), 'unit' => 'cm', 'tip' => __('Largura medida com a peça estendida na mesa', 'todday-modas')],
            'altura'       => ['label' => __('Altura', 'todday-modas'), 'unit' => 'cm', 'tip' => __('Para bolsas e acessórios', 'todday-modas')],
            'circunferencia' => ['label' => __('Circunferência da Barra', 'todday-modas'), 'unit' => 'cm', 'tip' => __('Circunferência total da abertura da barra', 'todday-modas')]
        ];
    }

    /**
     * Resgata as medidas preenchidas de um produto
     */
    public static function get_product_measurements($product_id) {
        $raw = get_post_meta($product_id, '_todday_measurements', true);
        if (empty($raw)) {
            return [];
        }

        if (is_string($raw)) {
            $decoded = json_decode($raw, true);
            return is_array($decoded) ? $decoded : [];
        }

        return is_array($raw) ? $raw : [];
    }
}
