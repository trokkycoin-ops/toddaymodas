<?php
namespace Zaya\AdminPanel;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Painel dedicado Todday Modas — interface propria fora do wp-admin.
 * URL padrao /painel-todday, login com identidade da marca,
 * app standalone (proprio head/CSS/JS) consumindo a REST API zaya/v1.
 * (Fork do painel Zaya; nomes tecnicos internos mantidos por estabilidade.)
 */
class Admin_Panel {

	const ROLE = 'tm_manager';

	public function __construct() {
		add_action( 'init', array( $this, 'register_route' ), 5 );
		add_action( 'init', array( $this, 'serve_gestao_files' ), 1 );
		add_filter( 'query_vars', array( $this, 'add_query_var' ) );
		add_action( 'template_redirect', array( $this, 'maybe_render' ), 1 );
		add_action( 'after_setup_theme', array( $this, 'ensure_role' ) );
		add_filter( 'login_redirect', array( $this, 'login_redirect' ), 10, 3 );
		add_action( 'admin_init', array( $this, 'block_admin_for_manager' ) );

		// Tela de login do WP com a identidade da loja.
		add_action( 'login_enqueue_scripts', array( $this, 'brand_login_screen' ) );
		add_filter( 'login_headertext', array( $this, 'login_header_text' ) );

		new Rest_Api();
	}

	/**
	 * Serve o manifest e o service worker do app de gestao (escopo /painel-todday/).
	 */
	public function serve_gestao_files() {
		$uri  = isset( $_SERVER['REQUEST_URI'] ) ? strtok( sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ), '?' ) : '';
		$path = rtrim( $uri, '/' );

		if ( preg_match( '#/painel-todday-gestao\.json$#', $path ) ) {
			$manifest = array(
				'name'             => 'Todday Modas — Gestão da Loja',
				'short_name'       => 'Todday Gestão',
				'description'      => __( 'Painel de gestão da loja Todday Modas: produtos, pedidos e categorias.', 'todday-modas' ),
				'id'               => '/painel-todday/',
				'start_url'        => home_url( '/painel-todday/' ),
				'scope'            => home_url( '/painel-todday/' ),
				'display'          => 'standalone',
				'display_override' => array( 'standalone', 'minimal-ui', 'browser' ),
				'orientation'      => 'any',
				'lang'             => 'pt-BR',
				'background_color' => '#faf8f5',
				'theme_color'      => '#23201c',
				'categories'       => array( 'business', 'shopping' ),
				'icons'            => array(
					array(
						'src'     => TM_PLUGIN_URL . 'includes/panel/assets/img/icon-sacola-192.png',
						'sizes'   => '192x192',
						'type'    => 'image/png',
						'purpose' => 'any',
					),
					array(
						'src'     => TM_PLUGIN_URL . 'includes/panel/assets/img/icon-sacola-512.png',
						'sizes'   => '512x512',
						'type'    => 'image/png',
						'purpose' => 'any',
					),
					array(
						'src'     => TM_PLUGIN_URL . 'includes/panel/assets/img/icon-sacola-512.png',
						'sizes'   => '512x512',
						'type'    => 'image/png',
						'purpose' => 'maskable',
					),
				),
			);

			status_header( 200 );
			header( 'Content-Type: application/manifest+json; charset=utf-8' );
			header( 'Cache-Control: no-cache' );
			echo wp_json_encode( $manifest );
			exit;
		}

		if ( preg_match( '#/painel-todday/sw\.js$#', $path ) ) {
			$sw = TM_PLUGIN_DIR . 'includes/panel/assets/js/sw-gestao.js';
			if ( file_exists( $sw ) ) {
				status_header( 200 );
				header( 'Content-Type: text/javascript; charset=utf-8' );
				header( 'Service-Worker-Allowed: /painel-todday/' );
				header( 'Cache-Control: no-cache, max-age=0, must-revalidate' );
				header( 'CDN-Cache-Control: no-cache' );
				readfile( $sw ); // phpcs:ignore WordPress.WP.AlternativeFunctions
			}
			exit;
		}
	}

	public function brand_login_screen() {
		wp_enqueue_style(
			'zaya-panel-brand',
			add_query_arg( 'ver', TM_VERSION, TM_PLUGIN_URL . 'includes/panel/assets/css/admin-panel.css' )
		);
	}

	public function login_header_text() {
		return 'Todday';
	}

	public static function slug() {
		return sanitize_title( get_option( 'tm_panel_slug', 'painel-todday' ) ?: 'painel-todday' );
	}

	/**
	 * Frases de apoio exibidas no painel (gerenciaveis via option).
	 * Uma por linha; rodizio a cada login.
	 */
	public static function get_phrases() {
		$raw     = (string) get_option( 'tm_panel_phrases', '' );
		$phrases = array_values( array_filter( array_map( 'trim', preg_split( '/\r\n|\r|\n/', $raw ) ) ) );

		if ( count( $phrases ) === 1 && mb_strlen( $phrases[0] ) > 140 ) {
			$parts = preg_split( '/(?<=[.!?,])\s+/', $phrases[0] );
			if ( is_array( $parts ) && count( $parts ) > 1 ) {
				$phrases = array_values( array_filter( array_map( 'trim', $parts ) ) );
			}
		}

		if ( empty( $phrases ) ) {
			return array(
				'Cada peça escolhida com carinho é uma nova história.',
				'Vender é ajudar alguém a se sentir ainda mais bonita.',
				'A confiança das clientes é o nosso melhor cartão de visitas.',
				'Moda circular: o que já teve dono ainda tem muito a viver.',
				'Seleção boa é aquela que encanta duas vezes.',
				'Constância hoje, sucesso amanhã.',
				'Detalhes encantam. Clientes voltam.',
				'Bom atendimento transforma compra em fidelidade.',
			);
		}
		return $phrases;
	}

	public static function url() {
		return home_url( '/' . self::slug() . '/' );
	}

	/**
	 * Logo oficial da marca (biblioteca de midia do site).
	 */
	public static function logo_url() {
		$logo_id = (int) get_option( 'tm_logo_id', 0 );
		if ( $logo_id ) {
			$url = wp_get_attachment_image_url( $logo_id, 'full' );
			if ( $url ) {
				return esc_url_raw( $url );
			}
		}
		if ( has_custom_logo() ) {
			$url = wp_get_attachment_image_url( get_theme_mod( 'custom_logo' ), 'full' );
			if ( $url ) {
				return esc_url_raw( $url );
			}
		}
		return esc_url_raw( TM_PLUGIN_URL . 'public/assets/img/logo.svg' );
	}

	public function register_route() {
		add_rewrite_rule( '^' . preg_quote( self::slug(), '#' ) . '/?$', 'index.php?tm_panel_route=1', 'top' );
		if ( ! get_option( 'tm_panel_flushed_v1' ) ) {
			flush_rewrite_rules( false );
			update_option( 'tm_panel_flushed_v1', 1 );
		}
	}

	public function add_query_var( $vars ) {
		$vars[] = 'tm_panel_route';
		return $vars;
	}

	/* ═════════════ PAPEL GERENTE TODDAY ═════════════ */

	public function ensure_role() {
		if ( get_role( self::ROLE ) ) {
			return;
		}
		add_role( self::ROLE, __( 'Gerente Todday', 'todday-modas' ), array(
			'read'                   => true,
			'upload_files'           => true,
			'moderate_comments'      => true,
			'edit_posts'             => true,
			'edit_published_posts'   => true,
			'publish_posts'          => true,
			// WooCommerce
			'edit_products'          => true,
			'edit_others_products'   => true,
			'publish_products'       => true,
			'delete_products'        => true,
			'manage_product_terms'   => true,
			'assign_product_terms'   => true,
			'read_private_products'  => true,
			'manage_woocommerce'     => true,
			'view_woocommerce_reports' => true,
			// Painel
			'tm_panel'               => true,
		) );
	}

	public function login_redirect( $redirect_to, $requested, $user ) {
		if ( $user instanceof \WP_User && ! is_wp_error( $user )
			&& $user->has_cap( 'tm_panel' ) && ! $user->has_cap( 'manage_options' ) ) {
			return self::url();
		}
		return $redirect_to;
	}

	/**
	 * A gerente NUNCA acessa o wp-admin nativo — redirecionada ao painel.
	 * admin-ajax e REST continuam funcionando (o painel depende deles).
	 */
	public function block_admin_for_manager() {
		if ( wp_doing_ajax() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
			return;
		}
		$user = wp_get_current_user();
		if ( $user->exists() && $user->has_cap( 'tm_panel' ) && ! $user->has_cap( 'manage_options' ) ) {
			wp_safe_redirect( self::url() );
			exit;
		}
	}

	/* ═════════════ RENDERIZACAO ═════════════ */

	public function maybe_render() {
		$is_panel = get_query_var( 'tm_panel_route' );

		/* Redundancia a prova de falhas: detecta o slug direto na URL. */
		if ( ! $is_panel && isset( $_SERVER['REQUEST_URI'] ) ) {
			$path = trim( (string) parse_url( esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) ), PHP_URL_PATH ), '/' );
			if ( $path === self::slug() ) {
				$is_panel = true;
				set_query_var( 'tm_panel_route', 1 );
			}
		}

		if ( ! $is_panel ) {
			return;
		}

		nocache_headers();

		if ( ! is_user_logged_in() ) {
			// Modo stealth: anonimo ve 404 indistinguivel de qualquer URL
			// inexistente — ninguem descobre que o painel existe.
			$this->render_fake_404();
			exit;
		}

		if ( ! Rest_Api::can_use_panel() ) {
			$this->render_denied();
			exit;
		}

		$this->render_shell();
		exit;
	}

	private function head_common( $title ) {
		$ver_css = filemtime( TM_PLUGIN_DIR . 'includes/panel/assets/css/admin-panel.css' );
		$css_url = add_query_arg( 'ver', $ver_css ? $ver_css : TM_VERSION, TM_PLUGIN_URL . 'includes/panel/assets/css/admin-panel.css' );
		echo '<!DOCTYPE html><html lang="pt-BR"><head>';
		echo '<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">';
		echo '<meta name="robots" content="noindex,nofollow">';
		echo '<title>' . esc_html( $title ) . '</title>';
		echo '<link rel="stylesheet" href="' . esc_url( $css_url ) . '">';
		echo '<link rel="preconnect" href="https://fonts.googleapis.com">';
		echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>';
		echo '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">';
		echo '<meta name="theme-color" content="#23201c">' . "\n";
		echo '<link rel="manifest" href="' . esc_url( home_url( '/painel-todday-gestao.json' ) ) . '">' . "\n";
		echo '<link rel="apple-touch-icon" href="' . esc_url( TM_PLUGIN_URL . 'includes/panel/assets/img/icon-sacola-180.png' ) . '?v=' . esc_attr( TM_VERSION ) . '">' . "\n";
		echo '</head>';
	}

	private function render_fake_404() {
		status_header( 404 );
		nocache_headers();
		global $wp_query;
		if ( $wp_query ) {
			$wp_query->set_404();
		}
		$template = get_404_template();
		if ( $template ) {
			load_template( $template, true );
		} else {
			echo '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>P&aacute;gina n&atilde;o encontrada</title></head><body><h1>404 &mdash; P&aacute;gina n&atilde;o encontrada</h1><p><a href="' . esc_url( home_url( '/' ) ) . '">Voltar ao in&iacute;cio</a></p></body></html>';
		}
		exit;
	}

	private function render_denied() {
		$this->head_common( 'Acesso restrito — Painel Todday' );
		?>
		<body class="zp-login-body zp-light">
			<div class="zp-login-card">
				<div class="zp-login-logo"><img src="<?php echo esc_url( self::logo_url() ); ?>" alt="Todday" class="zp-logo-img" /></div>
				<h1 class="zp-denied-title">Você não tem acesso a este painel</h1>
				<p class="zp-login-sub">Sua conta não possui permissão para operar a loja. Solicite acesso a um administrador.</p>
				<a class="zp-btn zp-btn-ghost" href="<?php echo esc_url( wp_logout_url( home_url( '/' ) ) ); ?>">Sair da conta</a>
			</div>
		</body></html>
		<?php
	}

	private function render_shell() {
		$user    = wp_get_current_user();
		$ver_js  = filemtime( TM_PLUGIN_DIR . 'includes/panel/assets/js/admin-panel.js' );
		$js_url  = add_query_arg( 'ver', $ver_js ? $ver_js : TM_VERSION, TM_PLUGIN_URL . 'includes/panel/assets/js/admin-panel.js' );

		$this->head_common( 'Painel Todday — ' . get_bloginfo( 'name' ) );
		?>
		<body class="zp-app<?php echo ( 'dark' === get_user_meta( $user->ID, 'tm_panel_theme', true ) ? '' : ' zp-light' ); ?>">
			<aside class="zp-sidebar" id="zp-sidebar">
				<div class="zp-sidebar-brand">
					<span class="zp-logo"><img src="<?php echo esc_url( self::logo_url() ); ?>" alt="Todday" class="zp-logo-img zp-logo-img-sidebar" /></span>
					<button class="zp-collapse-btn" id="zp-collapse" aria-label="Recolher menu">&#10094;</button>
					<button class="zp-sidebar-close" id="zp-sidebar-close" aria-label="Fechar menu">&#10005;</button>
				</div>
				<nav class="zp-nav" id="zp-nav"></nav>
				<div class="zp-sidebar-foot">
					<button class="zp-theme-toggle" id="zp-theme-toggle" title="Alternar tema">&#9789;</button>
					<button type="button" id="zp-install-app" hidden style="display:none;align-items:center;justify-content:center;gap:7px;width:100%;padding:9px 12px;margin-bottom:8px;border-radius:12px;border:1px solid rgba(198,161,91,.6);background:linear-gradient(135deg,#8a3d1d,#b4552d);color:#fff;font-size:12px;font-weight:600;cursor:pointer;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M12 8v6"/><path d="m9.5 11.5 2.5 2.5 2.5-2.5"/></svg> Instalar App</button>
					<a class="zp-sidebar-logout" href="<?php echo esc_url( wp_logout_url( self::url() ) ); ?>">Sair</a>
				</div>
			</aside>

			<main class="zp-main">
				<header class="zp-topbar">
					<button class="zp-burger" id="zp-burger" aria-label="Abrir menu">&#9776;</button>
					<button class="zp-search-icon" id="zp-palette-trigger" title="Buscar (Ctrl+K)" aria-label="Buscar">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
					</button>
					<div class="zp-user">
						<?php
						$avatar_url = get_avatar_url( $user->ID, array( 'size' => 64 ) );
						?>
						<div class="zp-avatar-col">
							<span class="zp-avatar-wrap">
								<img src="<?php echo esc_url( $avatar_url ); ?>" alt="" width="36" height="36" id="zp-avatar-img" />
							</span>
							<span class="zp-user-role-under"><?php echo esc_html( implode( ', ', (array) $user->roles ) === self::ROLE ? 'Gerente Todday' : 'Administrador(a)' ); ?></span>
						</div>
					</div>
				</header>

				<section class="zp-view" id="zp-view">
					<!-- SPA renderiza aqui -->
				</section>
			</main>

			<!-- Paleta de comando -->
			<div class="zp-palette" id="zp-palette" hidden>
				<div class="zp-palette-box">
					<input type="text" id="zp-palette-input" placeholder="Buscar produtos, pedidos ou executar ação..." autocomplete="off" />
					<ul class="zp-palette-list" id="zp-palette-list"></ul>
				</div>
			</div>

			<div class="zp-backdrop" id="zp-backdrop"></div>
			<div class="zp-toasts" id="zp-toasts"></div>

			<script>
			window.zayaPanel = {
				restUrl: "<?php echo esc_url_raw( rest_url( 'zaya/v1/' ) ); ?>",
				nonce: "<?php echo esc_js( wp_create_nonce( 'wp_rest' ) ); ?>",
				logoutUrl: "<?php echo esc_js( wp_logout_url( self::url() ) ); ?>",
				userName: <?php echo wp_json_encode( $user->display_name ); ?>,
				isAdmin: <?php echo current_user_can( 'manage_options' ) ? 'true' : 'false'; ?>,
				robot: false,
				posterEnabled: false,
				phrases: <?php echo wp_json_encode( self::get_phrases() ); ?>
			};
			/* Registra o service worker do app de gestao (escopo do painel).
			   ?v=TM_VERSION forca o navegador a buscar o sw.js mais recente
			   (cache-busting tambem no SW, nao so nos assets). */
			if ('serviceWorker' in navigator) {
				window.addEventListener('load', function () {
					navigator.serviceWorker.register('/painel-todday/sw.js?v=<?php echo esc_js( TM_VERSION ); ?>', { scope: '/painel-todday/', updateViaCache: 'none' }).catch(function () {});
				});
			}
			/* Instalacao como app: splash da marca + botao "Instalar App". */
			(function () {
				var standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
				var deferred = null;
				var btn = document.getElementById('zp-install-app');
				window.addEventListener('beforeinstallprompt', function (e) {
					e.preventDefault();
					deferred = e;
					if (btn && !standalone) { btn.hidden = false; btn.style.display = 'flex'; }
				});
				if (btn) {
					btn.addEventListener('click', function () {
						if (!deferred) {
							btn.textContent = 'Use o menu do navegador: Adicionar a tela inicial';
							return;
						}
						deferred.prompt();
						deferred.userChoice.then(function () { deferred = null; });
					});
				}
				window.addEventListener('appinstalled', function () {
					if (btn) { btn.hidden = true; }
				});
				if (standalone) {
					var s = document.createElement('div');
					s.id = 'zp-gestao-splash';
					s.innerHTML = '<img src="<?php echo esc_url( self::logo_url() ); ?>" alt="Todday" /><span>Carregando o painel&hellip;</span>';
					document.addEventListener('DOMContentLoaded', function () {
						document.body.appendChild(s);
						setTimeout(function () {
							s.classList.add('is-done');
							setTimeout(function () { if (s.parentNode) { s.parentNode.removeChild(s); } }, 500);
						}, 1600);
					});
				}
			})();
			</script>
			<script src="<?php echo esc_url( $js_url ); ?>"></script>
		</body></html>
		<?php
	}
}
