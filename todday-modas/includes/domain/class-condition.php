<?php
namespace ToddayModas\Domain;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Matriz e Níveis de Conservação para Peças de Brechó
 */
class Condition {
    private static $instance = null;

    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {}

    public function init() {
        // Inicialização de filtros caso necessário
    }

    /**
     * Retorna os 6 níveis de conservação oficiais da Todday Modas
     */
    public static function get_levels() {
        return [
            'novo_com_etiqueta' => [
                'label'       => __('Novo com etiqueta', 'todday-modas'),
                'short_label' => __('Novo c/ Etiqueta', 'todday-modas'),
                'badge_color' => '#2E7D32', // Verde esmeralda suave
                'description' => __('Peça nunca usada, preservando a etiqueta original de fábrica ou loja.', 'todday-modas'),
                'stars'       => 5
            ],
            'novo_sem_etiqueta' => [
                'label'       => __('Novo sem etiqueta', 'todday-modas'),
                'short_label' => __('Novo s/ Etiqueta', 'todday-modas'),
                'badge_color' => '#388E3C',
                'description' => __('Peça intacta, sem sinais de lavagem ou uso, porém sem a etiqueta fixada.', 'todday-modas'),
                'stars'       => 5
            ],
            'como_novo' => [
                'label'       => __('Como novo', 'todday-modas'),
                'short_label' => __('Como Novo', 'todday-modas'),
                'badge_color' => '#1B5E20',
                'description' => __('Peça utilizada uma única vez ou impecavelmente conservada, sem qualquer desgaste visível.', 'todday-modas'),
                'stars'       => 4.5
            ],
            'excelente_estado' => [
                'label'       => __('Excelente estado', 'todday-modas'),
                'short_label' => __('Excelente', 'todday-modas'),
                'badge_color' => '#556B2F', // Verde oliva editorial
                'description' => __('Apresenta pouquíssimo uso, tecido preservado, cor vibrante, sem bolinhas ou furos.', 'todday-modas'),
                'stars'       => 4
            ],
            'bom_estado' => [
                'label'       => __('Bom estado', 'todday-modas'),
                'short_label' => __('Bom Estado', 'todday-modas'),
                'badge_color' => '#C86D51', // Ocre terracota suave
                'description' => __('Peça com sinais leves e naturais de uso/lavagem, perfeitamente estruturada e higienizada.', 'todday-modas'),
                'stars'       => 3.5
            ],
            'estado_regular' => [
                'label'       => __('Estado regular', 'todday-modas'),
                'short_label' => __('Regular / Vintage', 'todday-modas'),
                'badge_color' => '#8D6E63',
                'description' => __('Peça autêntica vintage que pode conter pequenas marcas de época detalhadas na descrição.', 'todday-modas'),
                'stars'       => 3
            ]
        ];
    }

    public static function get_condition_info($key) {
        $levels = self::get_levels();
        return $levels[$key] ?? null;
    }
}
