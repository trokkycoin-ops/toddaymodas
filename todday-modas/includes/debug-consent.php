<?php
/**
 * Script de debug para testar o sistema de consentimentos
 * Acesse: /wp-admin/admin-ajax.php?action=tm_debug_consent
 * 
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registra ação AJAX para debug do sistema de consentimentos
 */
add_action( 'wp_ajax_tm_debug_consent', 'tm_debug_consent_handler' );

function tm_debug_consent_handler() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Acesso negado' );
	}

	header( 'Content-Type: text/html; charset=utf-8' );
	
	global $wpdb;
	$tabela = $wpdb->prefix . 'tm_consents';
	
	echo '<html><head><meta charset="utf-8"><title>Debug - Sistema de Consentimentos</title>';
	echo '<style>body{font-family:sans-serif;padding:20px;background:#f5f5f5}';
	echo '.box{background:white;padding:20px;margin:10px 0;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1)}';
	echo 'h2{color:#333;border-bottom:2px solid #007bff;padding-bottom:10px}';
	echo 'table{width:100%;border-collapse:collapse}';
	echo 'th,td{padding:10px;text-align:left;border-bottom:1px solid #ddd}';
	echo 'th{background:#007bff;color:white}';
	echo '.success{color:#28a745}.error{color:#dc3545}.warning{color:#ffc107}';
	echo '</style></head><body>';
	
	echo '<h1>🔍 Debug - Sistema de Consentimentos LGPD</h1>';
	
	// 1. Verifica se a tabela existe
	echo '<div class="box">';
	echo '<h2>1. Verificação da Tabela</h2>';
	$tabela_existe = $wpdb->get_var( "SHOW TABLES LIKE '{$tabela}'" );
	if ( $tabela_existe ) {
		echo '<p class="success">✓ Tabela <code>' . esc_html( $tabela ) . '</code> existe</p>';
		
		// Mostra estrutura da tabela
		$colunas = $wpdb->get_results( "DESCRIBE {$tabela}" );
		echo '<table><tr><th>Coluna</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th></tr>';
		foreach ( $colunas as $col ) {
			echo '<tr>';
			echo '<td>' . esc_html( $col->Field ) . '</td>';
			echo '<td>' . esc_html( $col->Type ) . '</td>';
			echo '<td>' . esc_html( $col->Null ) . '</td>';
			echo '<td>' . esc_html( $col->Key ) . '</td>';
			echo '<td>' . esc_html( $col->Default ) . '</td>';
			echo '</tr>';
		}
		echo '</table>';
	} else {
		echo '<p class="error">✗ Tabela <code>' . esc_html( $tabela ) . '</code> NÃO existe!</p>';
		echo '<p>Execute o método TM_Consent::criar_tabela() para criar a tabela.</p>';
	}
	echo '</div>';
	
	// 2. Verifica registros existentes
	echo '<div class="box">';
	echo '<h2>2. Registros Existentes</h2>';
	if ( $tabela_existe ) {
		$total = $wpdb->get_var( "SELECT COUNT(*) FROM {$tabela}" );
		echo '<p>Total de registros: <strong>' . intval( $total ) . '</strong></p>';
		
		if ( $total > 0 ) {
			$registros = $wpdb->get_results( "SELECT * FROM {$tabela} ORDER BY id DESC LIMIT 10" );
			echo '<table>';
			echo '<tr><th>ID</th><th>Consentimento ID</th><th>Usuário</th><th>Análise</th><th>Publicidade</th><th>Personalização</th><th>Ação</th><th>IP</th><th>Origem</th><th>Criado em</th></tr>';
			foreach ( $registros as $r ) {
				echo '<tr>';
				echo '<td>' . intval( $r->id ) . '</td>';
				echo '<td><code style="font-size:11px">' . esc_html( $r->consentimento_id ) . '</code></td>';
				echo '<td>' . intval( $r->usuario_id ) . '</td>';
				echo '<td>' . ( $r->aceita_analise ? '✓' : '✗' ) . '</td>';
				echo '<td>' . ( $r->aceita_publicidade ? '✓' : '✗' ) . '</td>';
				echo '<td>' . ( $r->aceita_personalizacao ? '✓' : '✗' ) . '</td>';
				echo '<td>' . esc_html( $r->acao ) . '</td>';
				echo '<td>' . esc_html( $r->ip_anonimizado ) . '</td>';
				echo '<td>' . esc_html( $r->origem ) . '</td>';
				echo '<td>' . esc_html( $r->criado_em ) . '</td>';
				echo '</tr>';
			}
			echo '</table>';
		}
	}
	echo '</div>';
	
	// 3. Testa inserção
	echo '<div class="box">';
	echo '<h2>3. Teste de Inserção</h2>';
	if ( $tabela_existe ) {
		$resultado = TM_Consent::gravar( array(
			'acao'                  => 'aceitar_todos',
			'aceita_analise'        => 1,
			'aceita_publicidade'    => 1,
			'aceita_personalizacao' => 1,
			'versao_politica'       => '1.0',
			'origem'                => 'debug',
			'ip_anonimizado'        => '127.0.0.0',
		) );
		
		if ( is_wp_error( $resultado ) ) {
			echo '<p class="error">✗ Erro ao inserir: ' . esc_html( $resultado->get_error_message() ) . '</p>';
			echo '<p>Erro MySQL: ' . esc_html( $wpdb->last_error ) . '</p>';
		} else {
			echo '<p class="success">✓ Registro inserido com sucesso!</p>';
			echo '<pre>' . esc_html( print_r( $resultado, true ) ) . '</pre>';
		}
	}
	echo '</div>';
	
	// 4. Verifica rotas REST
	echo '<div class="box">';
	echo '<h2>4. Rotas REST API</h2>';
	$rest_url = rest_url( 'cc/v1/logs' );
	echo '<p>URL Base: <code>' . esc_html( $rest_url ) . '</code></p>';
	echo '<p><a href="' . esc_url( $rest_url ) . '" target="_blank">Testar GET /cc/v1/logs</a></p>';
	echo '</div>';
	
	// 5. Verifica permissões
	echo '<div class="box">';
	echo '<h2>5. Permissões</h2>';
	echo '<p>Usuário atual: <strong>' . wp_get_current_user()->user_login . '</strong></p>';
	echo '<p>manage_options: ' . ( current_user_can( 'manage_options' ) ? '<span class="success">✓ Sim</span>' : '<span class="error">✗ Não</span>' ) . '</p>';
	echo '<p>tm_panel: ' . ( current_user_can( 'tm_panel' ) ? '<span class="success">✓ Sim</span>' : '<span class="error">✗ Não</span>' ) . '</p>';
	echo '</div>';
	
	// 6. Verifica últimos erros do PHP
	echo '<div class="box">';
	echo '<h2>6. Configuração do WordPress</h2>';
	echo '<p>WP_DEBUG: ' . ( defined( 'WP_DEBUG' ) && WP_DEBUG ? '<span class="warning">Ativo</span>' : '<span>Inativo</span>' ) . '</p>';
	echo '<p>WP_DEBUG_LOG: ' . ( defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ? '<span class="warning">Ativo</span>' : '<span>Inativo</span>' ) . '</p>';
	echo '<p>Versão do WordPress: ' . get_bloginfo( 'version' ) . '</p>';
	echo '<p>Versão do PHP: ' . phpversion() . '</p>';
	echo '<p>Versão do MySQL: ' . $wpdb->db_version() . '</p>';
	echo '</div>';
	
	echo '</body></html>';
	exit;
}
