<?php
/**
 * Consentimento de cookies (LGPD): registro à prova legal e exposição REST
 * cc/v1 consumida pelo painel (view Cookies e Privacidade).
 *
 * Rotas:
 *   GET    /cc/v1/logs         lista paginada + estatísticas (filtros)
 *   DELETE /cc/v1/logs/<id>    exclui um registro
 *   GET    /cc/v1/export       exporta CSV ou JSON
 *   POST   /cc/v1/logs         grava consentimento (front, sem autenticação)
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class TM_Consent {

	const TABELA = 'tm_consents';
	const VERSAO_POLITICA = '1.0';
	const VERSAO_TABELA = '1.1';
	const NAMESPACE_ROTA = 'cc/v1';
	const FUSO = 'America/Sao_Paulo';
	const GEO_CACHE_DIAS = 30;

	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
		add_action( 'init', array( __CLASS__, 'criar_tabela' ) );
	}

	/**
	 * @return string Nome completo da tabela com prefixo.
	 */
	private static function tabela() {
		global $wpdb;
		return $wpdb->prefix . self::TABELA;
	}

	/**
	 * Registra as rotas cc/v1.
	 */
	public static function register_routes() {
		register_rest_route(
			self::NAMESPACE_ROTA,
			'/logs',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'listar' ),
					'permission_callback' => array( __CLASS__, 'admin_ou_console' ),
					'args'                => array(
						'page'     => array( 'default' => 1 ),
						'per_page' => array( 'default' => 20 ),
						'search'   => array( 'default' => '' ),
						'from'     => array( 'default' => '' ),
						'to'       => array( 'default' => '' ),
						'choice'   => array( 'default' => '' ),
					),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'gravar_rest' ),
					'permission_callback' => '__return_true',
				),
			)
		);

		register_rest_route(
			self::NAMESPACE_ROTA,
			'/logs/(?P<id>\d+)',
			array(
				'methods'             => 'DELETE',
				'callback'            => array( __CLASS__, 'excluir' ),
				'permission_callback' => array( __CLASS__, 'admin_ou_console' ),
			)
		);

		register_rest_route(
			self::NAMESPACE_ROTA,
			'/export',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'exportar' ),
				'permission_callback' => array( __CLASS__, 'admin_ou_console' ),
				'args'                => array(
					'format' => array( 'default' => 'csv' ),
					'search' => array( 'default' => '' ),
					'from'   => array( 'default' => '' ),
					'to'     => array( 'default' => '' ),
					'choice' => array( 'default' => '' ),
				),
			)
		);
	}

	/**
	 * Permissão: usuário logado com manage_options, gerente do painel (tm_panel),
	 * ou chamada interna (console WP-CLI).
	 */
	public static function admin_ou_console() {
		if ( current_user_can( 'manage_options' ) || current_user_can( 'tm_panel' ) ) {
			return true;
		}
		return defined( 'WP_CLI' ) && WP_CLI;
	}

	/**
	 * Anonimiza um IP mascarando o último octeto.
	 */
	private static function anonimizar_ip( $ip_raw ) {
		$ip = trim( (string) $ip_raw );
		if ( '' === $ip ) {
			return '';
		}
		if ( false !== strpos( $ip, ':' ) ) {
			$partes = explode( ':', $ip );
			$partes[ count( $partes ) - 1 ] = 'xxxx';
			return implode( ':', $partes );
		}
		$partes = explode( '.', $ip );
		$partes[ count( $partes ) - 1 ] = 0;
		return implode( '.', $partes );
	}

	/**
	 * Geolocaliza um IP completo (antes da anonimização) via ip-api.com.
	 * Nunca bloqueia o registro: em falha, retorna campos vazios.
	 *
	 * @param string $ip IP completo (REMOTE_ADDR).
	 * @return array chaves pais|regiao|cidade|isp|lat|lon (vazios se indisponível).
	 */
	private static function geolocalizar( $ip ) {
		$ip = trim( (string) $ip );
		if ( '' === $ip || ! filter_var( $ip, FILTER_VALIDATE_IP ) || false !== strpos( $ip, ':' ) ) {
			return array();
		}

		$chave = 'tm_geo_' . md5( $ip );
		$cache = get_transient( $chave );
		if ( is_array( $cache ) ) {
			return $cache;
		}

		$resposta = wp_remote_get(
			'http://ip-api.com/json/' . rawurlencode( $ip ) . '?lang=pt-BR&fields=status,country,regionName,city,isp,lat,lon',
			array(
				'timeout'     => 5,
				'redirection' => 1,
			)
		);

		if ( is_wp_error( $resposta ) ) {
			return array();
		}

		$corpo = wp_remote_retrieve_body( $resposta );
		$dados = json_decode( $corpo, true );
		if ( ! is_array( $dados ) || empty( $dados['status'] ) || 'success' !== $dados['status'] ) {
			return array();
		}

		$geo = array(
			'pais'   => isset( $dados['country'] ) ? sanitize_text_field( $dados['country'] ) : '',
			'regiao' => isset( $dados['regionName'] ) ? sanitize_text_field( $dados['regionName'] ) : '',
			'cidade' => isset( $dados['city'] ) ? sanitize_text_field( $dados['city'] ) : '',
			'isp'    => isset( $dados['isp'] ) ? sanitize_text_field( $dados['isp'] ) : '',
			'lat'    => isset( $dados['lat'] ) ? (float) $dados['lat'] : 0,
			'lon'    => isset( $dados['lon'] ) ? (float) $dados['lon'] : 0,
		);

		set_transient( $chave, $geo, self::GEO_CACHE_DIAS * DAY_IN_SECONDS );

		return $geo;
	}

	/**
	 * Insere um registro de consentimento.
	 *
	 * @param array $dados {
	 *   acao                string  aceitar_todos|somente_essenciais|recusar
	 *   aceita_analise      bool/int
	 *   aceita_publicidade  bool/int
	 *   aceita_personalizacao bool/int
	 *   versao_politica     string
	 *   origem              string  front|admin|console
	 *   ip_anonimizado      string
	 * }
	 */
	public static function gravar( $dados ) {
		global $wpdb;
		$tabela = self::tabela();

		$usuario_id = is_user_logged_in() ? (int) get_current_user_id() : 0;

		$ip_raw = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';

		$ip = isset( $dados['ip_anonimizado'] ) && '' !== $dados['ip_anonimizado']
			? $dados['ip_anonimizado']
			: self::anonimizar_ip( $ip_raw );

		$user_agent = '';
		if ( ! empty( $_SERVER['HTTP_USER_AGENT'] ) ) {
			$user_agent = substr( sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ), 0, 255 );
		} elseif ( isset( $dados['user_agent'] ) && '' !== $dados['user_agent'] ) {
			$user_agent = substr( sanitize_text_field( (string) $dados['user_agent'] ), 0, 255 );
		}

		$geo = self::geolocalizar( $ip_raw );

		$uuid = self::uuid();
		
		$inseriu = $wpdb->insert(
			$tabela,
			array(
				'consentimento_id'      => $uuid,
				'usuario_id'            => $usuario_id,
				'aceita_analise'        => ! empty( $dados['aceita_analise'] ) ? 1 : 0,
				'aceita_publicidade'    => ! empty( $dados['aceita_publicidade'] ) ? 1 : 0,
				'aceita_personalizacao' => ! empty( $dados['aceita_personalizacao'] ) ? 1 : 0,
				'acao'                  => isset( $dados['acao'] ) ? substr( sanitize_key( $dados['acao'] ), 0, 24 ) : 'outro',
				'versao_politica'       => isset( $dados['versao_politica'] ) ? substr( sanitize_text_field( $dados['versao_politica'] ), 0, 20 ) : self::VERSAO_POLITICA,
				'ip_anonimizado'        => $ip,
				'origem'                => isset( $dados['origem'] ) ? substr( sanitize_key( $dados['origem'] ), 0, 20 ) : 'front',
				'criado_em'             => gmdate( 'Y-m-d H:i:s' ),
				'user_agent'            => $user_agent,
				'geo_pais'              => isset( $geo['pais'] ) ? $geo['pais'] : '',
				'geo_regiao'            => isset( $geo['regiao'] ) ? $geo['regiao'] : '',
				'geo_cidade'            => isset( $geo['cidade'] ) ? $geo['cidade'] : '',
				'geo_isp'               => isset( $geo['isp'] ) ? $geo['isp'] : '',
				'geo_lat'               => isset( $geo['lat'] ) ? $geo['lat'] : 0,
				'geo_lon'               => isset( $geo['lon'] ) ? $geo['lon'] : 0,
			),
			array( '%s', '%d', '%d', '%d', '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%f', '%f' )
		);

		if ( false === $inseriu ) {
			// Log do erro para debug
			error_log( 'TM Consent Error: ' . $wpdb->last_error );
			return new WP_Error( 'tm_consent_db', 'Falha ao registrar consentimento: ' . $wpdb->last_error, array( 'status' => 500 ) );
		}

		// Limpa qualquer cache que possa estar ativo
		wp_cache_delete( 'tm_consent_lista', 'tm_consent' );

		return array(
			'id'               => (int) $wpdb->insert_id,
			'consentimento_id' => $uuid,
		);
	}

	private static function uuid() {
		$bytes = random_bytes( 16 );
		$bytes[6] = chr( ( ord( $bytes[6] ) & 0x0f ) | 0x40 );
		$bytes[8] = chr( ( ord( $bytes[8] ) & 0x3f ) | 0x80 );
		return sprintf(
			'%s%s-%s-%s-%s-%s%s%s',
			bin2hex( substr( $bytes, 0, 4 ) ),
			bin2hex( substr( $bytes, 4, 2 ) ),
			bin2hex( substr( $bytes, 6, 2 ) ),
			bin2hex( substr( $bytes, 8, 2 ) ),
			bin2hex( substr( $bytes, 10, 2 ) ),
			bin2hex( substr( $bytes, 12, 2 ) ),
			bin2hex( substr( $bytes, 14, 1 ) ),
			bin2hex( substr( $bytes, 15, 1 ) )
		);
	}

	/**
	 * Monta o WHERE com filtros e retorna [where, valores].
	 */
	private static function filtros( $params ) {
		global $wpdb;
		$tabela = self::tabela();
		$where  = array( '1=1' );
		$val    = array();

		$search = isset( $params['search'] ) ? trim( (string) $params['search'] ) : '';
		if ( '' !== $search ) {
			$where[] = '(consentimento_id LIKE %s OR CAST(usuario_id AS CHAR) LIKE %s OR ip_anonimizado LIKE %s OR origem LIKE %s)';
			$like    = '%' . $wpdb->esc_like( $search ) . '%';
			array_push( $val, $like, $like, $like, $like );
		}

		$from = isset( $params['from'] ) ? trim( (string) $params['from'] ) : '';
		if ( '' !== $from && preg_match( '/^\d{4}-\d{2}-\d{2}$/', $from ) ) {
			$where[] = 'criado_em >= %s';
			$val[]   = self::para_utc( $from, '00:00:00' );
		}

		$to = isset( $params['to'] ) ? trim( (string) $params['to'] ) : '';
		if ( '' !== $to && preg_match( '/^\d{4}-\d{2}-\d{2}$/', $to ) ) {
			$where[] = 'criado_em <= %s';
			$val[]   = self::para_utc( $to, '23:59:59' );
		}

		$choice = isset( $params['choice'] ) ? trim( (string) $params['choice'] ) : '';
		if ( 'all' === $choice ) {
			$where[] = 'aceita_analise = 1 AND aceita_publicidade = 1 AND aceita_personalizacao = 1';
		} elseif ( 'none' === $choice ) {
			$where[] = 'aceita_analise = 0 AND aceita_publicidade = 0 AND aceita_personalizacao = 0';
		} elseif ( 'partial' === $choice ) {
			$where[] = "NOT (aceita_analise = 1 AND aceita_publicidade = 1 AND aceita_personalizacao = 1)
			            AND NOT (aceita_analise = 0 AND aceita_publicidade = 0 AND aceita_personalizacao = 0)";
		}

		return array(
			'where' => implode( ' AND ', $where ),
			'val'   => $val,
		);
	}

	/**
	 * Converte data local (America/Sao_Paulo, como o painel exibe) para UTC,
	 * no formato Y-m-d H:i:s, para filtrar a coluna criado_em (gravada em UTC).
	 */
	private static function para_utc( $data, $hora ) {
		try {
			$dt = new DateTimeImmutable( $data . ' ' . $hora, new DateTimeZone( self::FUSO ) );
			return $dt->setTimezone( new DateTimeZone( 'UTC' ) )->format( 'Y-m-d H:i:s' );
		} catch ( Exception $e ) {
			return $data . ' ' . $hora;
		}
	}

	/**
	 * Formata um criado_em (UTC) para exibicao no fuso do painel (America/Sao_Paulo).
	 */
	private static function formatar_fuso( $utc, $formato = 'd/m/Y H:i:s' ) {
		try {
			$dt = new DateTimeImmutable( $utc, new DateTimeZone( 'UTC' ) );
			return $dt->setTimezone( new DateTimeZone( self::FUSO ) )->format( $formato );
		} catch ( Exception $e ) {
			return $utc;
		}
	}

	/**
	 * GET /cc/v1/logs
	 */
	public static function listar( WP_REST_Request $request ) {
		self::sem_cache();
		global $wpdb;
		$tabela = self::tabela();

		$f        = self::filtros( $request->get_params() );
		$page     = max( 1, absint( $request->get_param( 'page' ) ) );
		$per_page = min( 100, max( 1, absint( $request->get_param( 'per_page' ) ) ) );
		$offset   = ( $page - 1 ) * $per_page;

		// Usa FOUND_ROWS para contar o total sem fazer query separada
		$wpdb->query( 'SET SESSION SQL_BIG_SELECTS = 1' );
		$total = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$tabela} WHERE {$f['where']}", $f['val'] ) );

		$stats_raw = $wpdb->get_results( $wpdb->prepare( "SELECT aceita_analise, aceita_publicidade, aceita_personalizacao FROM {$tabela} WHERE {$f['where']}", $f['val'] ), ARRAY_A );

		$rows = $wpdb->get_results(
			$wpdb->prepare( "SELECT * FROM {$tabela} WHERE {$f['where']} ORDER BY id DESC LIMIT %d OFFSET %d", array_merge( $f['val'], array( $per_page, $offset ) ) ),
			ARRAY_A
		);

		$all = $none = $partial = 0;
		foreach ( $stats_raw as $r ) {
			if ( $r['aceita_analise'] && $r['aceita_publicidade'] && $r['aceita_personalizacao'] ) {
				$all++;
			} elseif ( ! $r['aceita_analise'] && ! $r['aceita_publicidade'] && ! $r['aceita_personalizacao'] ) {
				$none++;
			} else {
				$partial++;
			}
		}
		$rate = $total > 0 ? round( ( $all / $total ) * 100, 1 ) : 0;

		$items = array();
		foreach ( $rows as $r ) {
			$item           = array_map( function ( $v ) { return maybe_unserialize( $v ); }, $r );
			$item['criado_em_local'] = self::formatar_fuso( $item['criado_em'] );
			$items[] = $item;
		}

		$response = rest_ensure_response(
			array(
				'items' => $items,
				'total' => $total,
				'stats' => array(
					'total'   => $total,
					'all'     => $all,
					'none'    => $none,
					'partial' => $partial,
					'rate'    => $rate,
				),
				'_timestamp' => time(), // Força atualização
			)
		);
		
		// Adiciona headers anti-cache na resposta REST
		$response->header( 'Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0' );
		$response->header( 'Pragma', 'no-cache' );
		
		return $response;
	}

	/**
	 * Garante que a resposta nunca seja cacheada (nem pelo CDN nem pelo navegador).
	 */
	private static function sem_cache() {
		nocache_headers();
		header( 'Cache-Control: no-store, no-cache, must-revalidate, max-age=0' );
		header( 'Pragma: no-cache' );
		header( 'Expires: 0' );
	}

	/**
	 * DELETE /cc/v1/logs/<id>
	 */
	public static function excluir( WP_REST_Request $request ) {
		self::sem_cache();
		global $wpdb;
		$tabela = self::tabela();
		$id     = absint( $request['id'] );
		
		// Verifica se o registro existe antes de excluir
		$existe = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$tabela} WHERE id = %d", $id ) );
		if ( ! $existe ) {
			return new WP_Error( 'tm_consent_not_found', 'Registro não encontrado.', array( 'status' => 404 ) );
		}
		
		$excluiu = $wpdb->delete( $tabela, array( 'id' => $id ), array( '%d' ) );
		if ( false === $excluiu ) {
			return new WP_Error( 'tm_consent_db', 'Falha ao excluir registro: ' . $wpdb->last_error, array( 'status' => 500 ) );
		}
		
		// Limpa qualquer cache que possa estar ativo
		wp_cache_delete( 'tm_consent_lista', 'tm_consent' );
		
		return rest_ensure_response( array( 'ok' => true, 'excluido' => (int) $excluiu, 'id' => $id ) );
	}

	/**
	 * POST /cc/v1/logs — gravado pelo banner do front (sem nonce, IP anonimizado no servidor).
	 */
	public static function gravar_rest( WP_REST_Request $request ) {
		$dados = array(
			'acao'                  => sanitize_key( (string) $request->get_param( 'acao' ) ),
			'aceita_analise'        => $request->get_param( 'aceita_analise' ),
			'aceita_publicidade'    => $request->get_param( 'aceita_publicidade' ),
			'aceita_personalizacao' => $request->get_param( 'aceita_personalizacao' ),
			'versao_politica'       => sanitize_text_field( (string) ( $request->get_param( 'versao_politica' ) ? $request->get_param( 'versao_politica' ) : self::VERSAO_POLITICA ) ),
			'origem'                => 'front',
		);
		if ( '' === $dados['acao'] ) {
			$dados['acao'] = 'outro';
		}
		$resultado = self::gravar( $dados );
		if ( is_wp_error( $resultado ) ) {
			return $resultado;
		}
		return rest_ensure_response( $resultado );
	}

	/**
	 * GET /cc/v1/export?format=csv|json
	 */
	public static function exportar( WP_REST_Request $request ) {
		self::sem_cache();
		global $wpdb;
		$tabela = self::tabela();
		$f      = self::filtros( $request->get_params() );
		$format = 'json' === $request->get_param( 'format' ) ? 'json' : 'csv';

		$rows = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$tabela} WHERE {$f['where']} ORDER BY id ASC", $f['val'] ), ARRAY_A );
		if ( ! $rows ) {
			$rows = array();
		}

		$linhas = array();
		foreach ( $rows as $r ) {
			$linhas[] = array(
				'consentimento_id'      => $r['consentimento_id'],
				'data_hora'             => self::formatar_fuso( $r['criado_em'] ),
				'data_hora_utc'         => $r['criado_em'],
				'usuario_id'            => (int) $r['usuario_id'],
				'aceita_analise'        => (bool) $r['aceita_analise'],
				'aceita_publicidade'    => (bool) $r['aceita_publicidade'],
				'aceita_personalizacao' => (bool) $r['aceita_personalizacao'],
				'acao'                  => $r['acao'],
				'versao_politica'       => $r['versao_politica'],
				'ip_anonimizado'        => $r['ip_anonimizado'],
				'origem'                => $r['origem'],
				'user_agent'            => isset( $r['user_agent'] ) ? $r['user_agent'] : '',
				'geo_pais'              => isset( $r['geo_pais'] ) ? $r['geo_pais'] : '',
				'geo_regiao'            => isset( $r['geo_regiao'] ) ? $r['geo_regiao'] : '',
				'geo_cidade'            => isset( $r['geo_cidade'] ) ? $r['geo_cidade'] : '',
				'geo_isp'               => isset( $r['geo_isp'] ) ? $r['geo_isp'] : '',
				'geo_lat'               => isset( $r['geo_lat'] ) ? (float) $r['geo_lat'] : 0,
				'geo_lon'               => isset( $r['geo_lon'] ) ? (float) $r['geo_lon'] : 0,
			);
		}

		if ( 'csv' === $format ) {
			$cab     = array( 'consentimento_id', 'data_hora (America/Sao_Paulo)', 'usuario_id', 'aceita_analise', 'aceita_publicidade', 'aceita_personalizacao', 'acao', 'versao_politica', 'ip_anonimizado', 'origem', 'user_agent', 'geo_pais', 'geo_regiao', 'geo_cidade', 'geo_isp', 'geo_lat', 'geo_lon' );
			$out     = fopen( 'php://memory', 'r+' );
			fputcsv( $out, $cab, ';' );
			foreach ( $linhas as $l ) {
				fputcsv( $out, array(
					$l['consentimento_id'],
					$l['data_hora'],
					$l['usuario_id'],
					$l['aceita_analise'] ? 'sim' : 'nao',
					$l['aceita_publicidade'] ? 'sim' : 'nao',
					$l['aceita_personalizacao'] ? 'sim' : 'nao',
					$l['acao'],
					$l['versao_politica'],
					$l['ip_anonimizado'],
					$l['origem'],
					$l['user_agent'],
					$l['geo_pais'],
					$l['geo_regiao'],
					$l['geo_cidade'],
					$l['geo_isp'],
					$l['geo_lat'],
					$l['geo_lon'],
				), ';' );
			}
			rewind( $out );
			$conteudo = stream_get_contents( $out );
			fclose( $out );

			header( 'Content-Type: text/csv; charset=utf-8' );
			header( 'Content-Disposition: attachment; filename="consentimentos-' . gmdate( 'Y-m-d' ) . '.csv"' );
			echo "\xEF\xBB\xBF" . $conteudo;
			exit;
		}

		header( 'Content-Type: application/json; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename="consentimentos-' . gmdate( 'Y-m-d' ) . '.json"' );
		echo wp_json_encode( $linhas, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT );
		exit;
	}

	/**
	 * Cria/atualiza a tabela (roda no admin_init).
	 */
	public static function criar_tabela() {
		if ( get_option( '_tm_consent_tabela' ) === self::VERSAO_TABELA ) {
			return;
		}
		global $wpdb;
		$tabela   = self::tabela();
		$charset  = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE {$tabela} (
			id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
			consentimento_id VARCHAR(36) NOT NULL,
			usuario_id BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
			aceita_analise TINYINT(1) NOT NULL DEFAULT 0,
			aceita_publicidade TINYINT(1) NOT NULL DEFAULT 0,
			aceita_personalizacao TINYINT(1) NOT NULL DEFAULT 0,
			acao VARCHAR(24) NOT NULL DEFAULT 'outro',
			versao_politica VARCHAR(20) NOT NULL DEFAULT '1.0',
			ip_anonimizado VARCHAR(64) NOT NULL DEFAULT '',
			origem VARCHAR(20) NOT NULL DEFAULT 'front',
			criado_em DATETIME NOT NULL,
			user_agent VARCHAR(255) NOT NULL DEFAULT '',
			geo_pais VARCHAR(100) NOT NULL DEFAULT '',
			geo_regiao VARCHAR(100) NOT NULL DEFAULT '',
			geo_cidade VARCHAR(120) NOT NULL DEFAULT '',
			geo_isp VARCHAR(150) NOT NULL DEFAULT '',
			geo_lat DECIMAL(10,6) NOT NULL DEFAULT 0,
			geo_lon DECIMAL(10,6) NOT NULL DEFAULT 0,
			PRIMARY KEY  (id),
			KEY consentimento_id (consentimento_id),
			KEY criado_em (criado_em),
			KEY origem (origem)
		) {$charset};";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );

		update_option( '_tm_consent_tabela', self::VERSAO_TABELA );
	}
}