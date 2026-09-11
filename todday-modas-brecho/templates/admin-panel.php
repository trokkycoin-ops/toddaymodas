<?php
/**
 * SPA Entry Point: Painel de Gestão Todday Modas Brechó (/todday-painel/)
 *
 * @package ToddayModasBrecho
 */

if (!defined('ABSPATH')) {
    exit;
}

use ToddayModasBrecho\Security\CapabilityMatrix;

$is_logged_in = is_user_logged_in();
$can_manage = CapabilityMatrix::can_manage_store();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel de Gestão — Todday Modas Brechó</title>
    <link rel="stylesheet" href="<?php echo esc_url(TODDAY_MODAS_URL . 'assets/css/todday-frontend.css'); ?>">
    <link rel="manifest" href="<?php echo esc_url(TODDAY_MODAS_URL . 'public/pwa/manifest.json'); ?>">
    <meta name="theme-color" content="#0E9B75">
</head>
<body class="tdm-panel-body">
    <div id="tdm-admin-spa-root" 
         data-rest-url="<?php echo esc_url_raw(rest_url('todday/v1')); ?>"
         data-nonce="<?php echo esc_attr(wp_create_nonce('wp_rest')); ?>"
         data-logged-in="<?php echo $is_logged_in ? 'true' : 'false'; ?>"
         data-can-manage="<?php echo $can_manage ? 'true' : 'false'; ?>"
         data-user-name="<?php echo esc_attr(wp_get_current_user()->display_name); ?>">
        <div class="tdm-loading-screen">
            <div class="tdm-spinner"></div>
            <p>Carregando Painel Todday Modas...</p>
        </div>
    </div>

    <!-- Chart.js local minificado dentro do ZIP -->
    <script src="<?php echo esc_url(TODDAY_MODAS_URL . 'assets/js/chart.min.js'); ?>"></script>
    <script src="<?php echo esc_url(TODDAY_MODAS_URL . 'assets/js/todday-frontend.js'); ?>"></script>
</body>
</html>
