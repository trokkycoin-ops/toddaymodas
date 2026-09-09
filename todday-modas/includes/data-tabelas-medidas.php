<?php
/**
 * Tabelas de medidas por categoria de produto (moda).
 *
 * Medidas da peça em repouso, em cm. Cada categoria tem a sua tabela,
 * conforme recomenda boas práticas de e-commerce de moda.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return array(
	'camisetas' => array(
		'colunas' => array( 'Comprimento', 'Largura', 'Ombro', 'Manga' ),
		'linhas'  => array(
			'P'  => array( '58', '44', '38', '18' ),
			'M'  => array( '62', '47', '40', '19' ),
			'G'  => array( '66', '50', '42', '20' ),
			'GG' => array( '70', '53', '44', '21' ),
		),
		'obs'    => 'Como medir: peça aberta na mesa, medir de ombro a barra (comprimento) e de axila a axila (largura).',
	),
	'calcas' => array(
		'colunas' => array( 'Busto', 'Cintura', 'Quadril', 'Comprimento' ),
		'linhas'  => array(
			'36' => array( '82', '66', '92', '98' ),
			'38' => array( '86', '70', '96', '99' ),
			'40' => array( '90', '74', '100', '100' ),
			'42' => array( '94', '78', '104', '101' ),
			'44' => array( '98', '82', '108', '102' ),
		),
		'obs'    => 'Como medir: busto no ponto mais cheio, cintura na linha natural, quadril na parte mais larga. A numeração segue o corpo, não a peça.',
	),
	'vestidos' => array(
		'colunas' => array( 'Busto', 'Cintura', 'Quadril', 'Comprimento' ),
		'linhas'  => array(
			'P'  => array( '84', '66', '92', '88' ),
			'M'  => array( '88', '70', '96', '90' ),
			'G'  => array( '92', '74', '100', '92' ),
			'GG' => array( '96', '78', '104', '94' ),
		),
		'obs'    => 'Como medir: busto no ponto mais cheio, cintura na linha natural, quadril na parte mais larga, comprimento do ombro à barra com a peça esticada.',
	),
	'calcados' => array(
		'colunas' => array( 'Comprimento do pé (cm)', 'Referência ' ),
		'linhas'  => array(
			'33' => array( '21,5', 'BR 33' ),
			'34' => array( '22,5', 'BR 34' ),
			'35' => array( '23', 'BR 35' ),
			'36' => array( '24', 'BR 36' ),
			'37' => array( '25', 'BR 37' ),
			'38' => array( '26', 'BR 38' ),
			'39' => array( '26,5', 'BR 39' ),
			'40' => array( '27,5', 'BR 40' ),
			'41' => array( '28,5', 'BR 41' ),
			'42' => array( '29,5', 'BR 42' ),
		),
		'obs'    => 'Como medir: coloque o pé em uma folha de papel, marque o calcanhar e a ponta do dedo mais longo e meça a distância com régua. Meça no final do dia, quando o pé está mais "aberto".',
	),
);