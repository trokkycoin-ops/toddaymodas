<?php
/**
 * Script para deploy do plugin Todday Modas Brecho
 * Execute no servidor de produção
 */

// Configurações
$plugin_url = 'https://github.com/trokkycoin-ops/toddaymodas/archive/refs/heads/main.zip';
$temp_file = '/tmp/todday-modas-plugin.zip';

echo "=== Deploy do Todday Modas Brecho ===\n\n";

// 1. Baixar do GitHub
echo "Baixando do GitHub...\n";
$zip_content = file_get_contents($plugin_url);
if ($zip_content === false) {
    die("Erro ao baixar do GitHub\n");
}
file_put_contents($temp_file, $zip_content);
echo "Arquivo baixado: " . filesize($temp_file) . " bytes\n\n";

// 2. Extrair ZIP
echo "Extraindo...\n";
$zip = new ZipArchive;
if ($zip->open($temp_file) !== TRUE) {
    die("Erro ao abrir ZIP\n");
}

// Criar diretório temporário
$extract_dir = '/tmp/todday-modas-temp';
if (!file_exists($extract_dir)) {
    mkdir($extract_dir, 0755, true);
}

$zip->extractTo($extract_dir);
$zip->close();
echo "Extraído para: $extract_dir\n\n";

// 3. Encontrar o plugin
$plugin_dir = $extract_dir . '/toddaymodas-main/todday-modas-brecho/todday-modas-brecho';
if (!file_exists($plugin_dir)) {
    die("Diretório do plugin não encontrado: $plugin_dir\n");
}

// 4. Copiar para plugins do WordPress
$wp_plugin_dir = ABSPATH . 'wp-content/plugins/todday-modas-brecho';
echo "Copiando para: $wp_plugin_dir\n";

// Remover plugin antigo
if (file_exists($wp_plugin_dir)) {
    echo "Removendo plugin antigo...\n";
    system("rm -rf " . escapeshellarg($wp_plugin_dir));
}

// Copiar novo plugin
system("cp -r " . escapeshellarg($plugin_dir) . " " . escapeshellarg($wp_plugin_dir));

// 5. Ativar plugin
echo "\nAtivando plugin...\n";
define('WP_USE_THEMES', false);
require_once(ABSPATH . 'wp-load.php');

if (!function_exists('activate_plugin')) {
    require_once(ABSPATH . 'wp-admin/includes/plugin.php');
}

$result = activate_plugin('todday-modas-brecho/todday-modas-brecho.php');
if (is_wp_error($result)) {
    echo "Erro ao ativar: " . $result->get_error_message() . "\n";
} else {
    echo "Plugin ativado com sucesso!\n";
}

// 6. Limpar
echo "\nLimpando arquivos temporários...\n";
unlink($temp_file);
system("rm -rf " . escapeshellarg($extract_dir));

echo "\n=== Deploy concluído ===\n";
echo "URL: https://toddaymodas.com.br\n";
echo "Plugin: Todday Modas Brecho v1.0.31-fixed\n";