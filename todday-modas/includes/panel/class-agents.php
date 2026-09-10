<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class TM_Panel_Agents {
    public static function init() {
        add_action( 'init', array( __CLASS__, 'setup_roles' ) );
    }

    public static function setup_roles() {
        add_role( 'tm_gerente', __( 'Gerente Todday Modas', 'todday-modas' ), array(
            'read'         => true,
            'tm_panel'     => true,
            'upload_files' => true,
        ) );

        $admin = get_role( 'administrator' );
        if ( $admin && ! $admin->has_cap( 'tm_panel' ) ) {
            $admin->add_cap( 'tm_panel' );
        }
    }
}
