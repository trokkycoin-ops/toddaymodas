<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Data_Tabelas_Medidas {
    public static function get_tabelas() {
        return array(
            'vestuario' => array(
                'PP' => array( 'busto' => '80-84', 'cintura' => '60-64', 'quadril' => '88-92' ),
                'P'  => array( 'busto' => '85-89', 'cintura' => '65-69', 'quadril' => '93-97' ),
                'M'  => array( 'busto' => '90-94', 'cintura' => '70-74', 'quadril' => '98-102' ),
                'G'  => array( 'busto' => '95-99', 'cintura' => '75-79', 'quadril' => '103-107' ),
                'GG' => array( 'busto' => '100-104', 'cintura' => '80-84', 'quadril' => '108-112' ),
            ),
            'calcados' => array(
                '34' => '22.5 cm',
                '35' => '23.0 cm',
                '36' => '23.5 cm',
                '37' => '24.5 cm',
                '38' => '25.0 cm',
                '39' => '25.5 cm',
            ),
        );
    }
}
