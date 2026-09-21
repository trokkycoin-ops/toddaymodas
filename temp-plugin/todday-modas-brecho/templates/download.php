<?php
/**
 * Página dedicada: Download do Plugin Todday Modas Brechó (/todday-download/)
 *
 * Com ?file=1 gera e entrega o pacote .zip do próprio plugin.
 * Sem o parâmetro, renderiza a página React de download.
 *
 * @package ToddayModasBrecho
 */

if (!defined('ABSPATH')) {
    exit;
}

use ToddayModasBrecho\Security\CapabilityMatrix;
use ToddayModasBrecho\Security\GestaoSession;

// Página e download do pacote ficam restritos ao dono (sessão do painel de gestão).
if (!CapabilityMatrix::can_manage_store() && !GestaoSession::is_valid()) {
    nocache_headers();
    status_header(404);
    wp_die('Página não encontrada.', '404 — Todday Modas Brechó', ['response' => 404]);
}

if (isset($_GET['file'])) {
    if (!is_ssl()) {
        wp_die('Use HTTPS para baixar o pacote.');
    }
    if (!class_exists('ZipArchive')) {
        wp_die('A extensão ZIP do PHP não está disponível neste servidor.');
    }

    $tmp = trailingslashit(get_temp_dir()) . 'todday-modas-brecho-' . wp_generate_password(6, false) . '.zip';
    if (file_exists($tmp)) {
        @unlink($tmp);
    }

    $zip = new ZipArchive();
    if ($zip->open($tmp, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
        wp_die('Não foi possível iniciar o pacote.');
    }

    $root = rtrim(TODDAY_MODAS_PATH, '/\\');
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::LEAVES_ONLY
    );

    foreach ($iterator as $file) {
        if ($file->isDir()) {
            continue;
        }
        $path = $file->getPathname();
        $rel = str_replace('\\', '/', ltrim(str_replace($root, '', $path), '/\\'));
        $zip->addFile($path, 'todday-modas-brecho/' . $rel);
    }
    $zip->close();

    if (!file_exists($tmp)) {
        wp_die('Falha ao gerar o pacote.');
    }

    nocache_headers();
    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename="todday-modas-brecho.zip"');
    header('Content-Length: ' . filesize($tmp));
    readfile($tmp);
    @unlink($tmp);
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex,nofollow">
    <title>Download do Plugin — Todday Modas Brechó</title>
    <link rel="stylesheet" href="<?php echo esc_url(TODDAY_MODAS_URL . 'assets/react/index.css?v=' . TODDAY_MODAS_VERSION); ?>">
    <script>
    window.tdmAppMode = 'download';
    window.tdmConfig = {
        restUrl: <?php echo wp_json_encode(esc_url_raw(rest_url('todday/v1'))); ?>,
        nonce: <?php echo wp_json_encode(wp_create_nonce('wp_rest')); ?>,
        ajaxUrl: <?php echo wp_json_encode(admin_url('admin-ajax.php')); ?>,
        ajaxNonce: <?php echo wp_json_encode(wp_create_nonce('tdm_ajax_nonce')); ?>,
        currency: 'R$',
        isLoggedIn: <?php echo is_user_logged_in() ? 'true' : 'false'; ?>,
        homeUrl: <?php echo wp_json_encode(home_url('/')); ?>
    };
    </script>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="<?php echo esc_url(TODDAY_MODAS_URL . 'assets/react/index.js?v=' . TODDAY_MODAS_VERSION); ?>"></script>
</body>
</html>
