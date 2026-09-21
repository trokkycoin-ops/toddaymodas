<?php
/**
 * Página dedicada: Painel de Gestão Todday Modas Brechó (/painel-gestao-tm/)
 *
 * Acesso protegido por senha própria do painel (não exige login no WordPress).
 *
 * @package ToddayModasBrecho
 */

if (!defined('ABSPATH')) {
    exit;
}

use ToddayModasBrecho\Security\CapabilityMatrix;
use ToddayModasBrecho\Security\GestaoSession;

nocache_headers();
header('X-Robots-Tag: noindex, nofollow');

$allow = CapabilityMatrix::can_manage_store() || GestaoSession::is_valid();
$error = '';
$bootstrap = null;

if (!$allow && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $nonce_ok = isset($_POST['tdm_gestao_nonce']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['tdm_gestao_nonce'])), 'tdm_gestao_login');
    if ($nonce_ok) {
        $senha = (string) ($_POST['senha'] ?? '');
        $allow = GestaoSession::login($senha);
        if (!$allow) {
            $error = GestaoSession::is_blocked() ? 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.' : 'Senha incorreta.';
        }
    } else {
        $error = 'Sessão expirada. Recarregue a página e tente novamente.';
    }
}

if (!$allow) {
    if (!GestaoSession::has_password()) {
        GestaoSession::ensure_password();
    }
    $bootstrap = GestaoSession::get_auto_password();
    $blocked = GestaoSession::is_blocked();
    ?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex,nofollow">
    <title>Acesso Restrito — Todday Modas Brechó</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;
               font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; background: #1e1b4b; color: #1e293b; }
        .card { width: 100%; max-width: 420px; background: #fff; border-radius: 20px; padding: 36px 32px;
                box-shadow: 0 20px 60px rgba(0,0,0,.35); }
        .logo { width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, #8b5cf6, #6d28d9);
                display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; color: #fff; font-weight: 800; font-size: 20px; }
        h1 { text-align: center; font-size: 20px; margin: 0 0 6px; color: #1e1b4b; }
        p.sub { text-align: center; font-size: 13px; color: #64748b; margin: 0 0 22px; }
        label { display: block; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 6px; letter-spacing: .02em; }
        input[type=password] { width: 100%; padding: 12px 14px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 15px; }
        input[type=password]:focus { outline: none; border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,.15); }
        button { width: 100%; margin-top: 14px; padding: 12px; border: 0; border-radius: 10px; background: linear-gradient(135deg, #8b5cf6, #6d28d9);
                 color: #fff; font-weight: 800; font-size: 15px; cursor: pointer; }
        button:disabled { opacity: .5; cursor: not-allowed; }
        .error { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; font-size: 13px; padding: 10px 12px; border-radius: 8px; margin: 0 0 14px; }
        .bootstrap { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 14px 16px; margin: 0 0 16px; }
        .bootstrap .pw { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 17px; font-weight: 800; color: #6d28d9;
                         letter-spacing: .06em; word-break: break-all; background: #fff; border: 1px dashed #d8b4fe; border-radius: 8px; padding: 8px 10px; margin-top: 8px; }
        .bootstrap p { margin: 0; font-size: 12px; color: #7c3aed; line-height: 1.5; }
        footer { margin-top: 18px; text-align: center; font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo">TM</div>
        <h1>Acesso Restrito</h1>
        <p class="sub">Painel de Gestão Todday Modas Brechó</p>

        <?php if ($bootstrap): ?>
            <div class="bootstrap">
                <p><strong>Senha gerada automaticamente.</strong> Você verá apenas enquanto não definir uma senha própria no WordPress (Configurações → Senha do painel de gestão).</p>
                <div class="pw" id="tdm-pw"><?php echo esc_html($bootstrap); ?></div>
                <button type="button" onclick="document.getElementById('tdm-senha').value=document.getElementById('tdm-pw').textContent;document.getElementById('tdm-senha').focus();" style="margin-top:12px;">Usar esta senha</button>
            </div>
        <?php endif; ?>

        <?php if ($error): ?>
            <div class="error"><?php echo esc_html($error); ?></div>
        <?php endif; ?>

        <form method="post" action="<?php echo esc_url(wp_unslash($_SERVER['REQUEST_URI']) ?? home_url('/painel-gestao-tm/')); ?>" autocomplete="off">
            <?php wp_nonce_field('tdm_gestao_login', 'tdm_gestao_nonce'); ?>
            <label for="tdm-senha">Senha de acesso</label>
            <input type="password" id="tdm-senha" name="senha" autocomplete="current-password" autofocus required <?php echo $blocked ? 'disabled' : ''; ?> />
            <button type="submit" <?php echo $blocked ? 'disabled' : ''; ?>>Entrar no Painel</button>
        </form>
        <footer>Somente quem conhece esta URL e a senha pode acessar.</footer>
    </div>
</body>
</html>
    <?php
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex,nofollow">
    <title>Painel de Gestão — Todday Modas Brechó</title>
    <link rel="stylesheet" href="<?php echo esc_url(TODDAY_MODAS_URL . 'assets/react/index.css?v=' . TODDAY_MODAS_VERSION); ?>">
    <script>
    window.tdmAppMode = 'admin';
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