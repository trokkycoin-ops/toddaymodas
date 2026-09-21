<?php
/**
 * Página dedicada: Área do Cliente Todday Modas Brechó (/todday-cliente/)
 *
 * @package ToddayModasBrecho
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!is_user_logged_in()) {
    wp_safe_redirect(wp_login_url(home_url('/todday-cliente/')));
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex,nofollow">
    <title>Minha Conta — Todday Modas Brechó</title>
    <link rel="stylesheet" href="<?php echo esc_url(TODDAY_MODAS_URL . 'assets/react/index.css?v=' . TODDAY_MODAS_VERSION); ?>">
    <script>
    window.tdmAppMode = 'customer';
    window.tdmConfig = {
        restUrl: <?php echo wp_json_encode(esc_url_raw(rest_url('todday/v1'))); ?>,
        nonce: <?php echo wp_json_encode(wp_create_nonce('wp_rest')); ?>,
        ajaxUrl: <?php echo wp_json_encode(admin_url('admin-ajax.php')); ?>,
        ajaxNonce: <?php echo wp_json_encode(wp_create_nonce('tdm_ajax_nonce')); ?>,
        currency: 'R$',
        isLoggedIn: true,
        homeUrl: <?php echo wp_json_encode(home_url('/')); ?>
    };
    </script>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="<?php echo esc_url(TODDAY_MODAS_URL . 'assets/react/index.js?v=' . TODDAY_MODAS_VERSION); ?>"></script>
</body>
</html>
