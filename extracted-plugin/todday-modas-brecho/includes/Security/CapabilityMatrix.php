<?php
namespace ToddayModasBrecho\Security;

if (!defined('ABSPATH')) {
    exit;
}

class CapabilityMatrix {
    public const CAP_ADMIN = 'manage_options';
    public const CAP_GERENTE = 'todday_gerente_panel';
    public const CAP_VENDEDOR = 'todday_vendedor_panel';
    public const CAP_CLIENTE = 'todday_customer_panel';

    public static function setup_roles_and_capabilities(): void {
        // Atribui capacidades ao Administrador
        $admin_role = get_role('administrator');
        if ($admin_role) {
            $admin_role->add_cap(self::CAP_GERENTE);
            $admin_role->add_cap(self::CAP_VENDEDOR);
            $admin_role->add_cap(self::CAP_CLIENTE);
        }

        // Criação ou atualização do papel Gerente
        $gerente_caps = [
            'read' => true,
            self::CAP_GERENTE => true,
            'edit_products' => true,
            'manage_woocommerce' => true,
        ];
        if (!get_role('todday_gerente')) {
            add_role('todday_gerente', __('Gerente Todday Modas', 'todday-modas-brecho'), $gerente_caps);
        } else {
            $role = get_role('todday_gerente');
            foreach ($gerente_caps as $cap => $grant) {
                $role->add_cap($cap, $grant);
            }
        }

        // Criação ou atualização do papel Vendedor
        $vendedor_caps = [
            'read' => true,
            self::CAP_VENDEDOR => true,
        ];
        if (!get_role('todday_vendedor')) {
            add_role('todday_vendedor', __('Vendedor Todday Modas', 'todday-modas-brecho'), $vendedor_caps);
        } else {
            $role = get_role('todday_vendedor');
            foreach ($vendedor_caps as $cap => $grant) {
                $role->add_cap($cap, $grant);
            }
        }

        // Garante capability de cliente para customer e subscriber
        $customer_role = get_role('customer');
        if ($customer_role) {
            $customer_role->add_cap(self::CAP_CLIENTE);
        }
        $sub_role = get_role('subscriber');
        if ($sub_role) {
            $sub_role->add_cap(self::CAP_CLIENTE);
        }
    }

    public static function can_manage_store(): bool {
        return current_user_can(self::CAP_ADMIN) || current_user_can(self::CAP_GERENTE) || GestaoSession::is_valid();
    }

    /** Acesso a pedidos: dono logado WP, papel adequado OU sessão do painel de gestão. */
    public static function can_access_orders(): bool {
        return is_user_logged_in() || GestaoSession::is_valid();
    }

    public static function can_access_vendor(): bool {
        return current_user_can(self::CAP_ADMIN) || current_user_can(self::CAP_GERENTE) || current_user_can(self::CAP_VENDEDOR);
    }

    public static function can_access_customer(): bool {
        return is_user_logged_in();
    }
}
