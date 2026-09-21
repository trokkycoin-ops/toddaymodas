<?php
/**
 * Script para deletar plugin corrompido
 * Salve como delete-plugin.php na raiz do WordPress e acesse via navegador
 */

// Segurança básica
if (!defined('ABSPATH')) {
    exit;
}

echo "<h1>Limpeza do Plugin Todday Modas Brecho</h1>";

$plugin_dir = WP_PLUGIN_DIR . '/todday-modas-brecho';

echo "<p>Verificando: " . $plugin_dir . "</p>";

if (file_exists($plugin_dir)) {
    echo "<p>Diretório encontrado...</p>";
    
    // Tentar desativar primeiro
    if (function_exists('deactivate_plugins')) {
        require_once(ABSPATH . 'wp-admin/includes/plugin.php');
        deactivate_plugins('todday-modas-brecho/todday-modas-brecho.php');
        echo "<p>Plugin desativado.</p>";
    }
    
    // Remover
    function deleteDirectory($dir) {
        if (!file_exists($dir)) {
            return true;
        }
        if (!is_dir($dir)) {
            return unlink($dir);
        }
        foreach (scandir($dir) as $item) {
            if ($item == '.' || $item == '..') {
                continue;
            }
            if (!deleteDirectory($dir . DIRECTORY_SEPARATOR . $item)) {
                return false;
            }
        }
        return rmdir($dir);
    }
    
    if (deleteDirectory($plugin_dir)) {
        echo "<p style='color:green;'>SUCESSO: Plugin removido!</p>";
        echo "<p><a href='" . admin_url('plugin-install.php') . "'>Instalar novo plugin agora</a></p>";
    } else {
        echo "<p style='color:red;'>ERRO: Não foi possível remover. Permissões insuficientes.</p>";
        echo "<p>Execute via SSH: <code>rm -rf " . $plugin_dir . "</code></p>";
    }
} else {
    echo "<p>Diretório não encontrado. O plugin já foi removido.</p>";
}

echo "<hr><p><strong>Próximos passos:</strong></p>";
echo "<ol>";
echo "<li>Instale o novo plugin via: Plugins → Adicionar Novo → Enviar Plugin</li>";
echo "<li>Use o arquivo: <code>todday-modas-brecho-prod.zip</code></li>";
echo "</ol>";