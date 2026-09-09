<?php
namespace Zaya\AdminPanel;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REST API do painel — namespace zaya/v1.
 * Toda acao do painel passa por aqui; os endpoints chamam as funcoes
 * nativas de WordPress/WooCommerce (orquestracao via Agents).
 */
class Rest_Api {

	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public static function can_use_panel() {
		if ( ! is_user_logged_in() ) {
			return false;
		}
		if ( current_user_can( 'manage_options' ) || current_user_can( 'tm_panel' ) ) {
			return true;
		}
		// Lista de usuarios autorizados definida no wp-admin -> Zaya -> Avancado.
		$allowed = (array) get_option( 'tm_panel_users', array() );
		return in_array( get_current_user_id(), array_map( 'intval', $allowed ), true );
	}

	public function permission() {
		return self::can_use_panel();
	}

	/**
	 * Body unificado: aceita JSON real e params de formulario/testes.
	 */
	public function body( $request ) {
		$json = $request->get_json_params();
		if ( is_array( $json ) ) { return $json; }
		$params = $request->get_body_params();
		return is_array( $params ) && $params ? $params : array();
	}

	/* â•â•â•â•â•â•â•â•â•â•â•â•â• GRUPOS DE CONFIGURACOES â•â•â•â•â•â•â•â•â•â•â•â•â• */

	public static function settings_map() {
		return array(
			'identidade' => array(
				'label' => 'Identidade Visual',
				'fields' => self::identity_fields(),
			),
			// banners / marcas / selos: editores visuais dedicados (ver rotas
			// /banners, /brands, /trust) — sem JSON na interface da operadora.
			'vitrines' => array(
				'label' => 'Vitrines',
				'fields' => array(
					'tm_pix_discount'          => array( 'label' => 'Desconto Pix (%)', 'type' => 'number' ),
					'zaya_module_shop_showcase'  => array( 'label' => 'Modulo vitrines ativo', 'type' => 'bool' ),
					'zaya_module_product_card'   => array( 'label' => 'Modulo cards ativo', 'type' => 'bool' ),
				),
			),
			// marcas / selos / banners: editores visuais dedicados (rotas /brands,
			// /trust, /banners) — a operadora nunca lida com JSON.
			'idade' => array(
				'label' => 'Verificacao de Idade',
				'fields' => array(
					'zaya_module_age_gate'     => array( 'label' => 'Age gate ativo', 'type' => 'bool' ),
					'zaya_age_gate_min_age'    => array( 'label' => 'Idade minima', 'type' => 'number' ),
					'zaya_age_gate_title'      => array( 'label' => 'Titulo', 'type' => 'text' ),
					'zaya_age_gate_text'       => array( 'label' => 'Texto', 'type' => 'textarea' ),
				),
			),
			'social' => array(
				'label' => 'Contato / Social',
				'fields' => array(
					'zaya_instagram_username' => array( 'label' => 'Instagram (@)', 'type' => 'text' ),
					'zaya_whatsapp_number'    => array( 'label' => 'WhatsApp (DDD+numero)', 'type' => 'text' ),
					'zaya_facebook_url'       => array( 'label' => 'Facebook (URL)', 'type' => 'text' ),
					'zaya_tiktok_url'         => array( 'label' => 'TikTok (URL)', 'type' => 'text' ),
					'zaya_contact_email'      => array( 'label' => 'E-mail de contato', 'type' => 'text' ),
				),
			),
			// Postador: publica produtos no Facebook e no Instagram Business.
			'poster' => array(
				'label' => 'Postador (Facebook & Instagram)',
				'fields' => array(
					'zaya_sp_enabled'      => array( 'label' => 'Ativar postador', 'type' => 'bool' ),
					'zaya_sp_auto_post'    => array( 'label' => 'Postar automaticamente ao publicar produto', 'type' => 'bool' ),
					'zaya_fb_page_id'      => array( 'label' => 'ID da Pagina do Facebook', 'type' => 'text', 'placeholder' => '123456789012345' ),
					'zaya_fb_token'        => array( 'label' => 'Access Token da Pagina (longo prazo)', 'type' => 'password', 'placeholder' => 'EAA...' ),
					'zaya_ig_account_id'   => array( 'label' => 'ID da Conta Instagram Business (opcional)', 'type' => 'text', 'placeholder' => '17841400000000000' ),
					'zaya_sp_link_type'    => array( 'label' => 'Link usado na legenda', 'type' => 'select', 'options' => array(
						'product' => 'Pagina do produto na loja',
						'pressell' => 'Pressell (URL abaixo)',
						'store'   => 'Home da loja',
					) ),
					'zaya_sp_pressell_url' => array( 'label' => 'URL da pressell (se escolheu Pressell)', 'type' => 'text', 'placeholder' => 'https://zaya.oficinas.online/pressell/' ),
					'zaya_sp_caption'      => array( 'label' => 'Template da legenda', 'type' => 'textarea', 'placeholder' => '{name} {short} {price} {pix} {link} {site}. Vazio usa o padrao.' ),
				),
			),
			// Endereco de origem da loja: grava direto nas opcoes nativas do
			// WooCommerce (frete/impostos leem daqui). Endereco fica opcional
			// por privacidade — CEP + cidade bastam para calcular frete.
			'loja' => array(
				'label' => 'Endereço da Loja',
				'fields' => array(
					'woocommerce_default_country' => array(
						'label'   => 'Estado onde a loja despacha',
						'type'    => 'select',
						'options' => array(
							'BR:AC' => 'Acre', 'BR:AL' => 'Alagoas', 'BR:AP' => 'Amapá', 'BR:AM' => 'Amazonas',
							'BR:BA' => 'Bahia', 'BR:CE' => 'Ceará', 'BR:DF' => 'Distrito Federal', 'BR:ES' => 'Espírito Santo',
							'BR:GO' => 'Goiás', 'BR:MA' => 'Maranhão', 'BR:MT' => 'Mato Grosso', 'BR:MS' => 'Mato Grosso do Sul',
							'BR:MG' => 'Minas Gerais', 'BR:PA' => 'Pará', 'BR:PB' => 'Paraíba', 'BR:PR' => 'Paraná',
							'BR:PE' => 'Pernambuco', 'BR:PI' => 'Piauí', 'BR:RJ' => 'Rio de Janeiro', 'BR:RN' => 'Rio Grande do Norte',
							'BR:RS' => 'Rio Grande do Sul', 'BR:RO' => 'Rondônia', 'BR:RR' => 'Roraima', 'BR:SC' => 'Santa Catarina',
							'BR:SP' => 'São Paulo', 'BR:SE' => 'Sergipe', 'BR:TO' => 'Tocantins',
						),
					),
					'woocommerce_store_postcode' => array( 'label' => 'CEP de origem (calcula o frete) — não aparece no site', 'type' => 'text' ),
					'woocommerce_store_city'     => array( 'label' => 'Cidade — não aparece no site', 'type' => 'text' ),
					'woocommerce_store_address'  => array( 'label' => 'Rua e número (opcional, deixe vazio se preferir)', 'type' => 'text' ),
				),
			),
			// Mercado Pago: credenciais coladas do painel do MP
			// (mercadopago.com.br/panel/credentials). Ao salvar, os gateways
			// Pix e cartao sao ativados automaticamente (ver after_save()).
			'pagamentos' => array(
				'label' => 'Mercado Pago',
				'fields' => array(
					'_mp_access_token_prod' => array( 'label' => 'Access Token de PRODUCAO', 'type' => 'password', 'placeholder' => 'Cole aqui. Comeca com APP_USR-...' ),
					'_mp_public_key_prod'   => array( 'label' => 'Public Key de PRODUCAO', 'type' => 'text', 'placeholder' => 'Cole aqui. Tambem comeca com APP_USR-...' ),
					'_mp_access_token_test' => array( 'label' => 'Access Token de TESTE (opcional)', 'type' => 'password', 'placeholder' => 'Cole aqui. Comeca com TEST-...' ),
					'_mp_public_key_test'   => array( 'label' => 'Public Key de TESTE (opcional)', 'type' => 'text', 'placeholder' => 'Cole aqui. Tambem comeca com TEST-...' ),
				),
			),
			// E-mail da loja: SMTP nativo sem plugin externo. Brevo/Gmail/Zoho.
			'email' => array(
				'label' => 'E-mail da Loja',
				'fields' => array(
					'tm_smtp_host'       => array( 'label' => 'Servidor SMTP', 'type' => 'text', 'placeholder' => 'Brevo: smtp-relay.brevo.com | Gmail: smtp.gmail.com' ),
					'tm_smtp_port'       => array( 'label' => 'Porta', 'type' => 'number', 'placeholder' => '587' ),
					'tm_smtp_user'       => array( 'label' => 'Usuario SMTP', 'type' => 'text', 'placeholder' => 'Seu login/e-mail no servico' ),
					'tm_smtp_pass'       => array( 'label' => 'Senha / chave SMTP', 'type' => 'password', 'placeholder' => 'No Brevo e a chave SMTP, nao sua senha do site' ),
					'tm_smtp_secure'     => array(
						'label'   => 'Criptografia',
						'type'    => 'select',
						'options' => array( 'tls' => 'TLS (recomendado)', 'ssl' => 'SSL', 'none' => 'Nenhuma' ),
					),
					'tm_smtp_from_email' => array( 'label' => 'Remetente dos pedidos', 'type' => 'text', 'placeholder' => 'ex.: contato@sualoja.com.br (vazio = usuario SMTP)' ),
					'tm_smtp_from_name'  => array( 'label' => 'Nome do remetente', 'type' => 'text', 'placeholder' => 'ex.: Zaya (vazio = nome da loja)' ),
				),
			),
			// Frete da loja: chaves sinteticas que leem/escrevem nas opcoes
			// reais dos metodos de envio do WooCommerce (ver sync_shipping).
			'frete' => array(
				'label' => 'Frete da Loja',
				'fields' => array(
					'zaya_ship_free_enabled'   => array( 'label' => 'Frete gratis ativo', 'type' => 'bool' ),
					'zaya_ship_free_mode'      => array(
						'label'   => 'Quando liberar o frete gratis',
						'type'    => 'select',
						'options' => array(
							'min_amount' => 'A partir de um valor minimo de compra',
							'none'       => 'Sempre gratis (modo teste)',
						),
					),
					'zaya_ship_free_min'       => array( 'label' => 'Valor minimo para o frete gratis (R$) — vale para todas as regioes', 'type' => 'number' ),
					'zaya_ship_flat_enabled'   => array( 'label' => 'Frete fixo ativo (cobre pedidos pequenos)', 'type' => 'bool' ),
					'zaya_ship_flat_cost'      => array( 'label' => 'Frete fixo Sudeste e Sul (R$)', 'type' => 'number' ),
					'zaya_ship_flat_cost_nn'   => array( 'label' => 'Frete fixo Norte, Nordeste e Centro-Oeste (R$)', 'type' => 'number' ),
					'zaya_ship_flat_cost_resto'=> array( 'label' => 'Frete fixo Resto do Brasil (R$)', 'type' => 'number' ),
					'zaya_ship_flat_title'     => array( 'label' => 'Nome do frete fixo no checkout', 'type' => 'text' ),
				),
			),
			// Taxas padrao usadas na Calculadora de Preco (editaveis pelo lojista,
			// pois o Mercado Pago ajusta os percentuais por plano).
			'calc' => array(
				'label' => 'Calculadora de Preço',
				'fields' => array(
					'zaya_fee_pix'    => array( 'label' => 'Taxa Pix (%) — padrao 0,99', 'type' => 'number' ),
					'zaya_fee_card'   => array( 'label' => 'Taxa Cartão de crédito (%) — padrao 2,99', 'type' => 'number' ),
					'zaya_fee_boleto' => array( 'label' => 'Taxa Boleto (%) — padrao 3,99', 'type' => 'number' ),
				),
			),
			'robo' => array(
				'label' => 'Rob\u00f4 Conselheiro',
				'fields' => array(
					'tm_robot_enabled' => array(
						'label'   => 'Estado do conselheiro',
						'type'    => 'select',
						'options' => array( 'acordado' => 'Acordado (mensagens no dashboard)', 'dormindo' => 'Dormindo (tela limpa)' ),
					),
				),
			),
			'splash' => array(
				'label' => 'Splash do App',
				'fields' => array(
					'zaya_splash_mode'      => array(
						'label'   => 'Modo da tela de abertura',
						'type'    => 'select',
						'options' => array( 'logo' => 'Logo padrao (animado)', 'video' => 'Video promocional (rotacao aleatoria)', 'imagem' => 'Imagem estatica (pagina de parceiro)' ),
					),
					'zaya_splash_image_url' => array( 'label' => 'URL da imagem (JPG/PNG)', 'type' => 'text' ),

					'zaya_splash_duration'  => array( 'label' => 'Duracao em segundos (2 a 7) — conta a partir de quando a midia carrega', 'type' => 'number' ),
					'zaya_splash_expires'   => array( 'label' => 'Expira em (vazio = nunca) — ao expirar, a midia e deletada do site', 'type' => 'date' ),
				),
			),
			// 'avancado' removido do painel de gestao: configuracoes de modulo,
			// slug e categoria Sexy sao exclusivas do wp-admin (Zaya -> Avancado).
		);
	}

	private static function identity_fields() {
		$fields = array();
		foreach ( array( 'light', 'dark' ) as $ctx ) {
			$fields[ "zaya_{$ctx}_primary_color" ]   = array( 'label' => ucfirst( $ctx ) . ': cor primaria', 'type' => 'color' );
			$fields[ "zaya_{$ctx}_secondary_color" ] = array( 'label' => ucfirst( $ctx ) . ': cor secundaria', 'type' => 'color' );
			$fields[ "zaya_{$ctx}_accent_color" ]    = array( 'label' => ucfirst( $ctx ) . ': cor de destaque', 'type' => 'color' );
			$fields[ "zaya_{$ctx}_bg_color" ]        = array( 'label' => ucfirst( $ctx ) . ': fundo', 'type' => 'color' );
			$fields[ "zaya_{$ctx}_text_color" ]      = array( 'label' => ucfirst( $ctx ) . ': texto', 'type' => 'color' );
			$fields[ "zaya_{$ctx}_heading_font" ]    = array( 'label' => ucfirst( $ctx ) . ': fonte titulos', 'type' => 'text' );
			$fields[ "zaya_{$ctx}_body_font" ]       = array( 'label' => ucfirst( $ctx ) . ': fonte corpo', 'type' => 'text' );
		}
		return $fields;
	}

	/* â•â•â•â•â•â•â•â•â•â•â•â•â• ROTAS â•â•â•â•â•â•â•â•â•â•â•â•â• */

	public function register_routes() {
		$perm  = array( $this, 'permission' );

	register_rest_route( 'zaya/v1', '/dashboard', array(
		'methods'             => 'GET',
		'permission_callback' => $perm,
		'callback'            => array( $this, 'dashboard' ),
	) );

	// Diagnostico da integracao Mercado Pago: valida credencial e simula
	// a criacao de um Pix minimo para expor o motivo exato de falhas.
	register_rest_route( 'zaya/v1', '/mp-diagnose', array(
		array( 'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'mp_diagnose' ) ),
	) );


		register_rest_route( 'zaya/v1', '/products', array(
			array( 'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'products_list' ) ),
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'product_save' ) ),
		) );
		register_rest_route( 'zaya/v1', '/products/(?P<id>\d+)', array(
			array( 'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'product_get' ) ),
			array( 'methods' => 'PUT, POST, PATCH', 'permission_callback' => $perm, 'callback' => array( $this, 'product_save' ) ),
			array( 'methods' => 'DELETE', 'permission_callback' => $perm, 'callback' => array( $this, 'product_delete' ) ),
		) );

		// Postador: publica um produto no Facebook e no Instagram.
		register_rest_route( 'zaya/v1', '/products/(?P<id>\d+)/post', array(
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'product_post_social' ) ),
		) );
		register_rest_route( 'zaya/v1', '/poster-config', array(
			array( 'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'poster_config' ) ),
		) );
		register_rest_route( 'zaya/v1', '/poster-test', array(
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'poster_test' ) ),
		) );
		register_rest_route( 'zaya/v1', '/poster-posts', array(
			array( 'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'poster_posts' ) ),
		) );

	register_rest_route( 'zaya/v1', '/orders', array(
		'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'orders_list' ),
	) );
	register_rest_route( 'zaya/v1', '/orders/(?P<id>\d+)/details', array(
		'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'order_details' ),
	) );
	register_rest_route( 'zaya/v1', '/orders/(?P<id>\d+)/tracking', array(
		array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'order_save_tracking' ) ),
		array( 'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'order_details' ) ),
	) );
	register_rest_route( 'zaya/v1', '/orders/find', array(
		'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'orders_find' ),
	) );

	// Combos do "Monte o Look": configuracao dos produtos de cada combo.
	register_rest_route( 'zaya/v1', '/look-combos', array(
		array( 'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'look_combos_get' ) ),
		array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'look_combos_save' ) ),
	) );
		register_rest_route( 'zaya/v1', '/orders/(?P<id>\d+)/status', array(
			'methods' => 'POST, PUT', 'permission_callback' => $perm, 'callback' => array( $this, 'order_status' ),
		) );

		register_rest_route( 'zaya/v1', '/categories', array(
			array( 'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'categories_list' ) ),
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'category_save' ) ),
		) );
		register_rest_route( 'zaya/v1', '/categories/(?P<id>\d+)', array(
			'methods' => 'DELETE', 'permission_callback' => $perm, 'callback' => array( $this, 'category_delete' ),
		) );

		register_rest_route( 'zaya/v1', '/reviews', array(
			'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'reviews_list' ),
		) );
		register_rest_route( 'zaya/v1', '/reviews/(?P<id>\d+)', array(
			'methods' => 'POST, PUT, DELETE', 'permission_callback' => $perm, 'callback' => array( $this, 'review_action' ),
		) );

		register_rest_route( 'zaya/v1', '/settings/(?P<group>[a-z_-]+)', array(
			array( 'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'settings_get' ) ),
			array( 'methods' => 'POST, PUT', 'permission_callback' => $perm, 'callback' => array( $this, 'settings_save' ) ),
		) );

		// Upload de video para o splash do app (salva a URL na opcao direto).
		register_rest_route( 'zaya/v1', '/splash-video', array(
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'splash_video_upload' ) ),
		) );

		// Upload de imagem estatica para o splash (sem pipeline de imagens).
		register_rest_route( 'zaya/v1', '/splash-image', array(
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'splash_image_upload' ) ),
		) );

		// Deleta a midia do splash (arquivo + biblioteca) e limpa a opcao.
		register_rest_route( 'zaya/v1', '/splash-delete-media', array(
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'splash_delete_media' ) ),
		) );

		// Remove um video especifico da rotacao do splash.
		register_rest_route( 'zaya/v1', '/splash-video-delete', array(
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'splash_video_delete' ) ),
		) );

		// Lista os videos da rotacao do splash.
		register_rest_route( 'zaya/v1', '/splash-videos', array(
			array( 'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'splash_videos_list' ) ),
		) );

		// Define inicio/fim de exibicao de um video especifico.
		register_rest_route( 'zaya/v1', '/splash-video-schedule', array(
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'splash_video_schedule' ) ),
		) );

		// Aniversarios/aniversarios-de-cadastro que chegam amanha ou hoje.
		register_rest_route( 'zaya/v1', '/bday-alerts', array(
			array( 'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'bday_alerts' ) ),
		) );

		// Historico de midias do splash (adicionadas/deletadas, por quem).
		register_rest_route( 'zaya/v1', '/splash-media-log', array(
			array( 'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'splash_media_log' ) ),
		) );

		// Avatar do perfil do painel (upload direto, sem gravatar).
		register_rest_route( 'zaya/v1', '/profile-avatar', array(
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'profile_avatar_upload' ) ),
		) );

		// Robo conselheiro: dormir/acordar por usuario.
		register_rest_route( 'zaya/v1', '/robot-sleep', array(
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'robot_sleep_toggle' ) ),
		) );

		// Saudacoes por periodo (bom dia/tarde/noite): listar, salvar, deletar.
		register_rest_route( 'zaya/v1', '/splash-greet', array(
			array( 'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'splash_greet_get' ) ),
		) );
		register_rest_route( 'zaya/v1', '/splash-greet-save', array(
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'splash_greet_save' ) ),
		) );
		register_rest_route( 'zaya/v1', '/splash-greet-delete', array(
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'splash_greet_delete' ) ),
		) );

		// Splash personalizado para um usuario especifico (ex.: parabens).
		register_rest_route( 'zaya/v1', '/bday-personal', array(
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'bday_personal' ) ),
		) );

		register_rest_route( 'zaya/v1', '/activity', array(
			'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'activity' ),
		) );

		// Assistente do feed do Instagram: cola o link curto do Behold,
		// o sistema monta o embed sozinho.
		register_rest_route( 'zaya/v1', '/instagram-widget', array(
			array( 'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'ig_widget_get' ) ),
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'ig_widget_save' ) ),
		) );

		// Videos de fundo do hero (rotacao com texto animado).
		register_rest_route( 'zaya/v1', '/hero-videos', array(
			array( 'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'hero_videos_get' ) ),
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'hero_videos_save' ) ),
		) );

		register_rest_route( 'zaya/v1', '/hero-mode', array(
			'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'hero_mode_save' ),
		) );

		// Hero da Home (conteúdo editorial da primeira dobra, painel).
		register_rest_route( 'zaya/v1', '/hero-config', array(
			array( 'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'hero_config_get' ) ),
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'hero_config_save' ) ),
		) );

		// Ofertas de checkout: order bump e upsell gerenciados pelo painel.
		register_rest_route( 'zaya/v1', '/ofertas-config', array(
			array( 'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'ofertas_config_get' ) ),
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'ofertas_config_save' ) ),
		) );

		// Modo curadoria: escolher fotos da biblioteca (sem senha, sem servico externo).
		register_rest_route( 'zaya/v1', '/media-library', array(
			'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'media_library_list' ),
		) );
		register_rest_route( 'zaya/v1', '/instagram-media', array(
			array( 'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'ig_media_get' ) ),
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'ig_media_save' ) ),
		) );

		// Editores estruturados (sem JSON na interface).
		register_rest_route( 'zaya/v1', '/banners', array(
			array( 'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'banners_get' ) ),
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'banners_save' ) ),
		) );
		register_rest_route( 'zaya/v1', '/brands', array(
			array( 'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'brands_get' ) ),
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'brands_save' ) ),
		) );
		register_rest_route( 'zaya/v1', '/trust', array(
			array( 'methods' => 'GET', 'permission_callback' => $perm, 'callback' => array( $this, 'trust_get' ) ),
			array( 'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'trust_save' ) ),
		) );

		// Upload avulso de imagem (banners, marcas, selos...).
		register_rest_route( 'zaya/v1', '/media', array(
			'methods' => 'POST', 'permission_callback' => $perm, 'callback' => array( $this, 'media_upload' ),
		) );
	}

	/* â•â•â•â•â•â•â•â•â•â•â•â•â• DASHBOARD â•â•â•â•â•â•â•â•â•â•â•â•â• */

	public function dashboard() {
		$today_start = strtotime( 'today', current_time( 'timestamp' ) );
		$month_start = strtotime( date_i18n( 'Y-m-01', current_time( 'timestamp' ) ) );

		$orders_today = wc_get_orders( array(
			'date_created' => '>' . $today_start,
			'limit'        => -1,
			'status'       => array_keys( wc_get_order_statuses() ),
		) );
		$revenue_today = 0;
		foreach ( $orders_today as $o ) { if ( ! $o->is_paid() === false ) { $revenue_today += (float) $o->get_total(); } }

		$orders_month = wc_get_orders( array(
			'date_created' => '>' . $month_start,
			'limit'        => -1,
			'status'       => array( 'wc-processing', 'wc-completed' ),
		) );
		$revenue_month = 0;
		foreach ( $orders_month as $o ) { $revenue_month += (float) $o->get_total(); }

		// Estoque baixo (<=5 unidades).
		$low_stock = [];
		foreach ( wc_get_products( array( 'limit' => 100, 'status' => 'publish' ) ) as $p ) {
			if ( $p->get_manage_stock() && null !== $p->get_stock_quantity() && $p->get_stock_quantity() <= 5 ) {
				$low_stock[] = [ 'id' => $p->get_id(), 'name' => $p->get_name(), 'stock' => (int) $p->get_stock_quantity(), 'url' => get_edit_post_link( $p->get_id(), 'raw' ) ];
			}
		}

		$pending_reviews = get_comments( array( 'status' => 'hold', 'type' => 'review', 'count' => true ) );

		return rest_ensure_response( array(
			'orders_today'    => count( $orders_today ),
			'revenue_today'   => $revenue_today,
			'revenue_month'   => $revenue_month,
			'currency_symbol' => html_entity_decode( get_woocommerce_currency_symbol() ),
			'low_stock'       => array_slice( $low_stock, 0, 10 ),
			'pending_reviews' => (int) $pending_reviews,
			'total_products'  => wp_count_posts( 'product' )->publish ?? 0,
			'activity'        => Activity_Log::recent( 8 ),
			'recommended_actions' => $this->recommended_actions( (int) $pending_reviews, $low_stock ),
		) );
	}

	private function recommended_actions( $pending_reviews, $low_stock ) {
		$actions = [];
		if ( $pending_reviews > 0 ) {
			$actions[] = sprintf( '%d avaliacao(oes) aguardando aprovacao na aba Reviews.', $pending_reviews );
		}
		if ( $low_stock ) {
			$actions[] = sprintf( '%d produto(s) com estoque baixo (<=5).', count( $low_stock ) );
		}

		return $actions;
	}

	/* â•â•â•â•â•â•â•â•â•â•â•â•â• PRODUTOS â•â•â•â•â•â•â•â•â•â•â•â•â• */

	private 	function serialize_product( $p ) {
		$cats = get_the_terms( $p->get_id(), 'product_cat' );
		return array(
			'id'           => $p->get_id(),
			'name'         => $p->get_name(),
			'sku'          => $p->get_sku(),
			'status'       => $p->get_status(),
			'price'        => (float) $p->get_price(),
			'regular_price'=> (float) $p->get_regular_price(),
			'sale_price'   => (float) $p->get_sale_price(),
			'stock_qty'    => $p->get_manage_stock() ? (int) $p->get_stock_quantity() : null,
			'on_sale'      => $p->is_on_sale(),
			'image'        => Media::best_url( $p->get_image_id(), 'thumbnail' ) ?: '',
			'categories'   => ( $cats && ! is_wp_error( $cats ) ) ? implode( ', ', wp_list_pluck( $cats, 'name' ) ) : '',
			'edit_link'    => get_edit_post_link( $p->get_id(), 'raw' ),
			'poster'       => array(
				'ok' => false,
				'at' => '',
				'fb' => '',
				'ig' => '',
			),
		);
	}

	/**
	 * Postador: publica um produto no Facebook e no Instagram a partir do painel.
	 */
	public function product_post_social( $request ) {
		$id = absint( $request['id'] );
		$p  = wc_get_product( $id );
		if ( ! $p ) {
			return new \WP_Error( 'not_found', 'Produto nao encontrado.', array( 'status' => 404 ) );
		}
		$result = \Zaya\Social_Poster::post_product( $id, true );
		if ( empty( $result['ok'] ) ) {
			return new \WP_Error( 'post_failed', $result['message'], array( 'status' => 400 ) );
		}
		return rest_ensure_response( array( 'ok' => true, 'message' => $result['message'] ) );
	}

	/**
	 * Estado do postador (ativado/desativado) para o painel exibir o botao.
	 */
	public function poster_config() {
		return rest_ensure_response( array(
			'enabled' => \Zaya\Social_Poster::enabled(),
			'has_creds' => \Zaya\Social_Poster::has_credentials(),
		) );
	}

	/**
	 * Testa o token da Meta salvo (Graph /me) e mostra o nome vinculado.
	 */
	public function poster_test() {
		$token = trim( (string) get_option( 'zaya_fb_token', '' ) );
		if ( '' === $token ) {
			return rest_ensure_response( array( 'ok' => false, 'message' => 'Nenhum token salvo. Cole o Access Token da pagina primeiro.' ) );
		}

		$res = wp_remote_get( 'https://graph.facebook.com/v21.0/me?fields=id,name&access_token=' . rawurlencode( $token ), array( 'timeout' => 30 ) );
		if ( is_wp_error( $res ) ) {
			return rest_ensure_response( array( 'ok' => false, 'message' => $res->get_error_message() ) );
		}

		$code = (int) wp_remote_retrieve_response_code( $res );
		$body = json_decode( (string) wp_remote_retrieve_body( $res ), true );

		if ( $code < 200 || $code >= 300 || ! empty( $body['error'] ) ) {
			$msg = isset( $body['error']['message'] ) ? $body['error']['message'] : 'HTTP ' . $code;
			return rest_ensure_response( array( 'ok' => false, 'message' => $msg ) );
		}

		$page = trim( (string) get_option( 'zaya_fb_page_id', '' ) );
		$ig   = trim( (string) get_option( 'zaya_ig_account_id', '' ) );

		$notes = array();
		if ( '' === $page ) {
			$notes[] = 'Falta o ID da Pagina do Facebook.';
		}
		if ( '' === $ig ) {
			$notes[] = 'Sem Instagram (opcional) — vai postar so no Facebook.';
		}

		return rest_ensure_response( array(
			'ok'      => true,
			'name'    => $body['name'] ?? '',
			'message' => 'Token valido — ' . ( $body['name'] ?? 'conta' ) . ( $notes ? ' | ' . implode( ' ', $notes ) : '' ),
			'notes'   => $notes,
		) );
	}

	/**
	 * Historico de postagens: produtos publicados com o status do postador
	 * (postado ou nao, data, mensagens do Facebook/Instagram).
	 */
	public function poster_posts( $request ) {
		$args = array(
			'limit'   => min( 100, max( 1, (int) ( $request['per_page'] ?? 50 ) ) ),
			'page'    => max( 1, (int) ( $request['page'] ?? 1 ) ),
			'status'  => 'publish',
			'orderby' => 'date',
			'order'   => 'DESC',
		);
		if ( ! empty( $request['search'] ) ) { $args['search'] = sanitize_text_field( $request['search'] ); }

		$products = wc_get_products( $args );

		$items = array();
		foreach ( $products as $p ) {
			$status = \Zaya\Social_Poster::status( $p->get_id() );
			$fb = is_array( $status['fb'] ?? null ) ? $status['fb'] : array();
			$ig = is_array( $status['ig'] ?? null ) ? $status['ig'] : array();
			$items[] = array(
				'id'     => $p->get_id(),
				'name'   => $p->get_name(),
				'image'  => Media::best_url( $p->get_image_id(), 'thumbnail' ) ?: '',
				'posted' => ! empty( $status['ok'] ),
				'at'     => (string) ( $status['at'] ?? '' ),
				'by'     => (string) ( $status['by'] ?? '' ),
				'fb'     => array( 'ok' => ! empty( $fb['ok'] ), 'message' => (string) ( $fb['message'] ?? '' ) ),
				'ig'     => array( 'ok' => ! empty( $ig['ok'] ), 'message' => (string) ( $ig['message'] ?? '' ) ),
				'link'   => get_permalink( $p->get_id() ),
			);
		}

		return rest_ensure_response( array(
			'items'      => $items,
			'total'      => (int) wp_count_posts( 'product' )->publish ?? 0,
			'posted'     => $this->count_posted_products(),
			'enabled'    => \Zaya\Social_Poster::enabled() && \Zaya\Social_Poster::has_credentials(),
		) );
	}

	private function count_posted_products() {
		$args = array(
			'limit'        => -1,
			'status'       => 'publish',
			'return'       => 'ids',
			'meta_key'     => \Zaya\Social_Poster::META,
			'meta_compare' => 'EXISTS',
		);
		$ids = wc_get_products( $args );
		$n = 0;
		foreach ( $ids as $id ) {
			$st = \Zaya\Social_Poster::status( $id );
			if ( ! empty( $st['ok'] ) ) { $n++; }
		}
		return $n;
	}

	public function products_list( $request ) {
		$args = array(
			'limit'   => min( 50, max( 1, (int) ( $request['per_page'] ?? 20 ) ) ),
			'page'    => max( 1, (int) ( $request['page'] ?? 1 ) ),
			'status'  => isset( $request['status'] ) ? sanitize_key( $request['status'] ) : array( 'publish', 'draft' ),
			'orderby' => 'date',
			'order'   => 'DESC',
		);
		if ( ! empty( $request['search'] ) ) { $args['search'] = sanitize_text_field( $request['search'] ); }

		$products = wc_get_products( $args );
		$data = array_map( array( $this, 'serialize_product' ), $products );
		return rest_ensure_response( array_values( $data ) );
	}

	public function product_get( $request ) {
		$p = wc_get_product( absint( $request['id'] ) );
		if ( ! $p ) { return new \WP_Error( 'not_found', 'Produto nao encontrado.', array( 'status' => 404 ) ); }
		$data = $this->serialize_product( $p );
		$data['description']  = $p->get_description();
		$data['short_desc']   = $p->get_short_description();
		$data['manage_stock'] = $p->get_manage_stock();
		return rest_ensure_response( $data );
	}

	public function product_save( $request ) {
		$data  = $this->body( $request );
		$files = $request->get_file_params();

		$id = Agents::save_product( $data, $files );
		if ( is_wp_error( $id ) ) {
			return new \WP_Error( $id->get_error_code(), $id->get_error_message(), array( 'status' => 400 ) );
		}
		return rest_ensure_response( array( 'ok' => true, 'id' => $id ) );
	}

	public function product_delete( $request ) {
		$id = absint( $request['id'] );
		$p  = wc_get_product( $id );
		if ( ! $p ) { return new \WP_Error( 'not_found', 'Produto nao encontrado.', array( 'status' => 404 ) ); }
		$name = $p->get_name();
		$p->delete( true );
		Activity_Log::log( 'product_deleted', 'product', $id, $name );
		return rest_ensure_response( array( 'ok' => true ) );
	}

	/* â•â•â•â•â•â•â•â•â•â•â•â•â• PEDIDOS â•â•â•â•â•â•â•â•â•â•â•â•â• */

	public function orders_list( $request ) {
		$statuses = ! empty( $request['status'] )
			? array( 'wc-' . sanitize_key( str_replace( 'wc-', '', $request['status'] ) ) )
			: array_keys( wc_get_order_statuses() );

		$orders = wc_get_orders( array(
			'limit'   => min( 50, max( 1, (int) ( $request['per_page'] ?? 25 ) ) ),
			'status'  => $statuses,
			'orderby' => 'date',
			'order'   => 'DESC',
		) );

		$data = array_map( function( $o ) {
			$products = array();
			foreach ( $o->get_items() as $item ) {
				$img = '';
				$pid = $item->get_product_id();
				if ( $pid ) {
					$img = (string) get_the_post_thumbnail_url( $pid, 'thumbnail' );
				}
				if ( '' === $img ) {
					$img = (string) wc_placeholder_img_src( 'thumbnail' );
				}
				$products[] = array(
					'name'  => $item->get_name(),
					'qty'   => $item->get_quantity(),
					'total' => (float) $item->get_total(),
					'image' => $img,
				);
			}
			return array(
				'id'      => $o->get_id(),
				'number'  => $o->get_order_number(),
				'status'  => $o->get_status(),
				'status_label' => wc_get_order_status_name( $o->get_status() ),
				'total'   => (float) $o->get_total(),
				'customer'=> trim( $o->get_billing_first_name() . ' ' . $o->get_billing_last_name() ),
				'email'   => $o->get_billing_email(),
				'date'    => $o->get_date_created() ? $o->get_date_created()->date_i18n( 'd/m/Y H:i' ) : '',
				'items'   => count( $o->get_items() ),
				'payment_method' => $o->get_payment_method_title(),
				'products'=> $products,
			);
		}, $orders );

		return rest_ensure_response( array_values( $data ) );
	}

	public function order_status( $request ) {
		$body = $this->body( $request );
		$result = Agents::update_order_status( absint( $request['id'] ), $body['status'] ?? '' );
		if ( is_wp_error( $result ) ) {
			return new \WP_Error( $result->get_error_code(), $result->get_error_message(), array( 'status' => 400 ) );
		}
		return rest_ensure_response( array( 'ok' => true ) );
	}

	/**
	 * Busca pedidos por codigo de rastreio, e-mail, telefone ou numero.
	 * Usada quando a cliente pergunta "onde esta meu pedido?".
	 */
	public function orders_find( $request ) {
		$q = sanitize_text_field( trim( (string) ( $request['q'] ?? '' ) ) );
		if ( strlen( $q ) < 3 ) {
			return new \WP_Error( 'too_short', 'Digite pelo menos 3 caracteres.', array( 'status' => 400 ) );
		}
		$qdigits = preg_replace( '/\D/', '', $q );

		$orders = wc_get_orders( array(
			'limit'   => 300,
			'status'  => array_keys( wc_get_order_statuses() ),
			'orderby' => 'date',
			'order'   => 'DESC',
		) );

		$out = array();
		foreach ( $orders as $o ) {
			$track  = (string) $o->get_meta( '_zaya_tracking_code' );
			$email  = (string) $o->get_billing_email();
			$phone  = preg_replace( '/\D/', '', (string) $o->get_billing_phone() );
			$number = (string) $o->get_order_number();
			if ( false === stripos( $track, $q )
				&& false === stripos( $email, $q )
				&& ( '' === $qdigits || false === strpos( $phone, $qdigits ) )
				&& false === stripos( $number, $q ) ) {
				continue;
			}
			$out[] = array(
				'id'       => $o->get_id(),
				'number'   => $number,
				'customer' => trim( $o->get_billing_first_name() . ' ' . $o->get_billing_last_name() ),
				'email'    => $email,
				'date'     => $o->get_date_created() ? $o->get_date_created()->date_i18n( 'd/m/Y H:i' ) : '',
				'total'    => (float) $o->get_total(),
				'status'   => $o->get_status(),
				'status_label' => wc_get_order_status_name( $o->get_status() ),
				'tracking' => $track,
			);
			if ( count( $out ) >= 10 ) { break; }
		}
		return rest_ensure_response( $out );
	}

	/**
	 * Combos do "Monte o Look": retorna a configuracao + catalogo de produtos.
	 */
	public function look_combos_get() {
		$combos = \Zaya\Look_Combo::get_config();
		if ( empty( $combos ) ) {
			$combos = array( array( 'name' => '', 'products' => array() ) );
		}
		$catalog = array();
		foreach ( wc_get_products( array( 'status' => 'publish', 'limit' => -1, 'orderby' => 'name', 'order' => 'ASC', 'return' => 'objects' ) ) as $p ) {
			$catalog[] = array(
				'id'    => $p->get_id(),
				'name'  => $p->get_name(),
				'price' => (float) $p->get_price(),
				'image' => (string) wp_get_attachment_image_url( $p->get_image_id(), 'thumbnail' ),
			);
		}
		return rest_ensure_response( array( 'combos' => $combos, 'catalog' => $catalog ) );
	}

	/**
	 * Salva a configuracao dos combos.
	 */
	public function look_combos_save( $request ) {
		$body = $this->body( $request );
		$combos = $body['combos'] ?? array();
		$saved = \Zaya\Look_Combo::save_config( $combos );
		Agents::log_settings_saved( 'look' );
		return rest_ensure_response( array( 'ok' => true, 'combos' => $saved ) );
	}

	/**
	 * Salva o codigo de rastreio do pedido (campo proprio, compativel com
	 * o fluxo manual do Melhor Envio: colar o codigo quando a etiqueta sai).
	 */
	public function order_save_tracking( $request ) {
		$order = wc_get_order( absint( $request['id'] ) );
		if ( ! $order ) {
			return new \WP_Error( 'not_found', 'Pedido nao encontrado.', array( 'status' => 404 ) );
		}
		$body = $this->body( $request );
		$code = sanitize_text_field( trim( (string) ( $body['code'] ?? '' ) ) );
		if ( '' !== $code && strlen( $code ) > 60 ) {
			return new \WP_Error( 'too_long', 'Codigo de rastreio muito longo.', array( 'status' => 400 ) );
		}
		$order->update_meta_data( '_zaya_tracking_code', $code );
		$order->save();
		Activity_Log::log( 'order_tracking_saved', 'order', $order->get_id(), 'Rastreio: ' . ( '' !== $code ? $code : '(limpo)' ) );
		return rest_ensure_response( array( 'ok' => true, 'tracking' => $code ) );
	}

	/**
	 * Ficha completa do pedido para separacao/preparacao/envio: enderecos,
	 * contato, itens com foto, pagamento, entrega e observacao da cliente.
	 */
	public function order_details( $request ) {
		$order = wc_get_order( absint( $request['id'] ) );
		if ( ! $order ) {
			return new \WP_Error( 'not_found', 'Pedido nao encontrado.', array( 'status' => 404 ) );
		}

		$items = array();
		foreach ( $order->get_items() as $item ) {
			$img  = '';
			$pid  = $item->get_product_id();
			$sku  = '';
			if ( $pid ) {
				$img = (string) get_the_post_thumbnail_url( $pid, 'thumbnail' );
				$product = wc_get_product( $pid );
				if ( $product ) { $sku = (string) $product->get_sku(); }
			}
			if ( '' === $img ) { $img = (string) wc_placeholder_img_src( 'thumbnail' ); }
			$items[] = array(
				'name'  => $item->get_name(),
				'sku'   => $sku,
				'qty'   => $item->get_quantity(),
				'total' => (float) $item->get_total(),
				'image' => $img,
			);
		}

		$addr = function ( string $type ) use ( $order ): array {
			$a = $order->get_address( $type );
			return array(
				'name'    => trim( ( $a['first_name'] ?? '' ) . ' ' . ( $a['last_name'] ?? '' ) ),
				'address' => trim( ( $a['address_1'] ?? '' ) . ( ! empty( $a['address_2'] ) ? ' - ' . $a['address_2'] : '' ) ),
				'city'    => (string) ( $a['city'] ?? '' ),
				'state'   => (string) ( $a['state'] ?? '' ),
				'postcode'=> (string) ( $a['postcode'] ?? '' ),
				'country' => (string) ( $a['country'] ?? '' ),
			);
		};

		$shipping_method = '';
		foreach ( $order->get_shipping_methods() as $sm ) {
			$shipping_method = $sm->get_method_title() ?: $sm->get_name();
			break;
		}

		return rest_ensure_response( array(
			'id'          => $order->get_id(),
			'number'      => $order->get_order_number(),
			'status'      => $order->get_status(),
			'status_label'=> wc_get_order_status_name( $order->get_status() ),
			'date'        => $order->get_date_created() ? $order->get_date_created()->date_i18n( 'd/m/Y \a\s H:i' ) : '',
			'email'       => $order->get_billing_email(),
			'phone'       => $order->get_billing_phone(),
			'customer'    => trim( $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() ),
			'payment'     => $order->get_payment_method_title(),
			'shipping'    => $shipping_method,
			'note'        => $order->get_customer_note(),
			'tracking'    => (string) $order->get_meta( '_zaya_tracking_code' ),
			'billing'     => $addr( 'billing' ),
			'shipping_addr' => $addr( 'shipping' ),
			'items'       => $items,
			'totals'      => array(
				'subtotal'  => (float) $order->get_subtotal(),
				'discount'  => (float) $order->get_discount_total(),
				'shipping'  => (float) $order->get_shipping_total(),
				'total'     => (float) $order->get_total(),
			),
		) );
	}

	/* â•â•â•â•â•â•â•â•â•â•â•â•â• CATEGORIAS â•â•â•â•â•â•â•â•â•â•â•â•â• */

	public function categories_list() {
		$out = [];
		foreach ( get_terms( array( 'taxonomy' => 'product_cat', 'hide_empty' => false ) ) as $t ) {
			if ( is_wp_error( $t ) ) { continue; }
			$out[] = array(
				'id'      => (int) $t->term_id,
				'name'    => $t->name,
				'slug'    => $t->slug,
				'parent'  => (int) $t->parent,
				'count'   => (int) $t->count,
				'context' => get_term_meta( $t->term_id, 'tm_context', true ) ?: 'light',
				'link'    => get_term_link( $t ),
			);
		}
		return rest_ensure_response( $out );
	}

	public function category_save( $request ) {
		$data = $this->body( $request );
		$result = Agents::save_category( $data );
		if ( is_wp_error( $result ) ) {
			return new \WP_Error( $result->get_error_code(), $result->get_error_message(), array( 'status' => 400 ) );
		}
		return rest_ensure_response( array( 'ok' => true ) + $result );
	}

	public function category_delete( $request ) {
		$id   = absint( $request['id'] );
		$term = get_term( $id, 'product_cat' );
		if ( ! $term || is_wp_error( $term ) ) {
			return new \WP_Error( 'not_found', 'Categoria nao encontrada.', array( 'status' => 404 ) );
		}
		if ( (int) $term->count > 0 ) {
			return new \WP_Error(
				'not_empty',
				sprintf( '"%s" tem %d produto(s). Mova os produtos antes de excluir.', $term->name, (int) $term->count ),
				array( 'status' => 400 )
			);
		}
		$name = $term->name;
		$result = wp_delete_term( $id, 'product_cat' );
		if ( is_wp_error( $result ) ) {
			return new \WP_Error( 'delete_failed', $result->get_error_message(), array( 'status' => 400 ) );
		}
		Activity_Log::log( 'category_deleted', 'category', $id, $name );
		return rest_ensure_response( array( 'ok' => true ) );
	}

	/* â•â•â•â•â•â•â•â•â•â•â•â•â• REVIEWS â•â•â•â•â•â•â•â•â•â•â•â•â• */

	public function reviews_list( $request ) {
		$status = in_array( $request['status'] ?? '', array( 'hold', 'approve', 'spam', 'trash' ), true ) ? $request['status'] : 'all';
		$args = array(
			'type'   => 'review',
			'status' => 'all' === $status ? 'all' : $status,
			'number' => min( 50, max( 1, (int) ( $request['per_page'] ?? 25 ) ) ),
		);
		$comments = get_comments( $args );

		$data = array_map( function( $c ) {
			return array(
				'id'       => (int) $c->comment_ID,
				'author'   => $c->comment_author,
				'email'    => $c->comment_author_email,
				'content'  => $c->comment_content,
				'date'     => mysql2date( 'd/m/Y H:i', $c->comment_date ),
				'status'   => wp_get_comment_status( $c->comment_ID ),
				'rating'   => (int) get_comment_meta( $c->comment_ID, 'rating', true ),
				'product'  => get_the_title( $c->comment_post_ID ),
				'product_image' => (string) get_the_post_thumbnail_url( $c->comment_post_ID, 'thumbnail' ),
				'photos'   => array_values( array_filter( array_map( function ( $p ) {
					return is_numeric( $p ) ? (string) wp_get_attachment_image_url( (int) $p, 'thumbnail' ) : (string) $p;
				}, (array) get_comment_meta( $c->comment_ID, 'zaya_review_photos', true ) ) ) ),
				'verified' => (bool) get_comment_meta( $c->comment_ID, 'verified', true ),
			);
		}, $comments );

		return rest_ensure_response( array_values( $data ) );
	}

	public function review_action( $request ) {
		$id    = absint( $request['id'] );
		$body  = $this->body( $request );
		$action= sanitize_key( $body['action'] ?? ( 'DELETE' === $request->get_method() ? 'delete' : '' ) );

		switch ( $action ) {
			case 'approve':
				wp_set_comment_status( $id, 'approve' );
				break;
			case 'unapprove':
				wp_set_comment_status( $id, 'hold' );
				break;
			case 'spam':
				wp_spam_comment( $id );
				break;
			case 'delete':
				wp_delete_comment( $id, true );
				break;
			default:
				return new \WP_Error( 'invalid_action', 'Acao invalida. Use approve, unapprove, spam ou delete.', array( 'status' => 400 ) );
		}

		Activity_Log::log( 'review_' . $action, 'review', $id, substr( wp_strip_all_tags( get_comment_text( $id ) ?: '' ), 0, 80 ) );
		return rest_ensure_response( array( 'ok' => true ) );
	}

	/* â•â•â•â•â•â•â•â•â•â•â•â•â• SETTINGS â•â•â•â•â•â•â•â•â•â•â•â•â• */

	/**
	 * Upload de video do splash: valida MIME/tamanho, salva na midia
	 * e grava a URL direto na opcao. Nunca passa pelo pipeline de imagens.
	 */
	/**
	 * Armazena midia do splash em uploads/zaya-splash/ FORA da biblioteca
	 * de midia (nao polui a galeria) e retorna url + caminho relativo.
	 */
	private function splash_store_upload( $file, $mimes, $max_mb ) {
		if ( ! empty( $file['error'] ) ) {
			return new \WP_Error( 'upload_error', 'Erro no envio do arquivo.', array( 'status' => 400 ) );
		}
		if ( $file['size'] > $max_mb * 1024 * 1024 ) {
			return new \WP_Error( 'too_large', sprintf( 'Arquivo grande demais (max %dMB).', $max_mb ), array( 'status' => 400 ) );
		}
		$check = wp_check_filetype( sanitize_file_name( $file['name'] ), $mimes );
		if ( empty( $check['ext'] ) || empty( $check['type'] ) ) {
			return new \WP_Error( 'invalid_type', 'Tipo de arquivo nao permitido.', array( 'status' => 400 ) );
		}
		$up  = wp_upload_dir();
		$dir = $up['basedir'] . '/zaya-splash';
		if ( ! wp_mkdir_p( $dir ) ) {
			return new \WP_Error( 'mkdir_fail', 'Nao foi possivel criar a pasta de midia.', array( 'status' => 500 ) );
		}
		$name = 'splash-' . gmdate( 'Ymd-His' ) . '-' . wp_generate_password( 6, false, false ) . '.' . $check['ext'];
		$dest = $dir . '/' . $name;
		if ( ! @move_uploaded_file( $file['tmp_name'], $dest ) ) { // phpcs:ignore
			return new \WP_Error( 'move_fail', 'Falha ao salvar o arquivo.', array( 'status' => 500 ) );
		}
		@chmod( $dest, 0644 ); // phpcs:ignore
		return array(
			'url' => esc_url_raw( $up['baseurl'] . '/zaya-splash/' . $name ),
			'p'   => 'zaya-splash/' . $name,
		);
	}

	public function splash_video_upload( $request ) {
		if ( empty( $_FILES['video'] ) || ! is_array( $_FILES['video'] ) ) {
			return new \WP_Error( 'no_file', 'Nenhum video recebido.', array( 'status' => 400 ) );
		}
		$file = $_FILES['video']; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
		$mimes = array(
			'mp4|m4v' => 'video/mp4',
			'webm'    => 'video/webm',
			'mov|qt'  => 'video/quicktime',
		);
		$stored = $this->splash_store_upload( $file, $mimes, 32 );
		if ( is_wp_error( $stored ) ) {
			return $stored;
		}
		$url = $stored['url'];

		// Adiciona a lista de videos em rotacao (sorteio aleatorio por abertura).
		// Fora da biblioteca de midia: exclusao apaga o arquivo direto.
		$list    = self::splash_videos();
		$cur     = wp_get_current_user();
		$list[]  = array(
			'u'  => $url,
			'p'  => $stored['p'],
			'by' => $cur->exists() ? $cur->display_name : '',
			'at' => current_time( 'mysql' ),
			's'  => '',
			'e'  => '',
		);
		update_option( 'zaya_splash_videos', wp_json_encode( $list ) );
		\Zaya\Assets::log_splash_action( 'add', 'video', $url );

		Activity_Log::log( 'settings_saved', 'settings', 0, 'Splash do app: novo video enviado (' . count( $list ) . ' na rotacao).' );
		return rest_ensure_response( array( 'ok' => true, 'url' => $url, 'total' => count( $list ) ) );
	}

	/**
	 * Lista de videos do splash: array de {u: url, a: attachment_id}.
	 */
	public static function splash_videos() {
		$raw  = get_option( 'zaya_splash_videos', '[]' );
		$list = json_decode( (string) $raw, true );

		// Migracao: option antiga de video unico entra na rotacao uma vez.
		if ( ! is_array( $list ) || ! $list ) {
			$legacy = esc_url_raw( (string) get_option( 'zaya_splash_video_url', '' ) );
			if ( '' !== $legacy ) {
				$legacy_att = (int) get_option( 'zaya_splash_video_att', 0 );
				$list       = array( array( 'u' => $legacy, 'a' => $legacy_att ) );
				update_option( 'zaya_splash_videos', wp_json_encode( $list ) );
			} else {
				$list = array();
			}
		}
		return $list;
	}

	/**
	 * Lista os videos da rotacao do splash.
	 */
	public function splash_videos_list() {
		return rest_ensure_response( array( 'videos' => self::splash_videos() ) );
	}

	/**
	 * Historico de midias do splash: ativos + deletados (auditoria).
	 */
	public function splash_media_log() {
		$log = get_option( 'zaya_splash_media_log', array() );
		return rest_ensure_response( array( 'log' => is_array( $log ) ? $log : array() ) );
	}

	/**
	 * Upload de avatar do perfil: salva fora da biblioteca e grava no usuario.
	 */
	public function profile_avatar_upload( $request ) {
		$user_id = get_current_user_id();
		if ( ! $user_id || empty( $_FILES['avatar'] ) || ! is_array( $_FILES['avatar'] ) ) { // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
			return new \WP_Error( 'no_file', 'Nenhuma imagem recebida.', array( 'status' => 400 ) );
		}
		$mimes  = array( 'jpg|jpeg|jpe' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp' );
		$stored = $this->splash_store_upload( $_FILES['avatar'], $mimes, 4 ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
		if ( is_wp_error( $stored ) ) {
			return $stored;
		}
		// Remove o avatar anterior se for nosso.
		$old_p = (string) get_user_meta( $user_id, 'zaya_avatar_p', true );
		if ( '' !== $old_p ) {
			$up   = wp_upload_dir();
			$path = wp_normalize_path( $up['basedir'] . '/' . ltrim( $old_p, '/' ) );
			if ( strpos( $path, wp_normalize_path( $up['basedir'] ) ) === 0 && file_exists( $path ) ) {
				wp_delete_file( $path );
			}
		}
		update_user_meta( $user_id, 'tm_avatar_url', $stored['url'] );
		update_user_meta( $user_id, 'zaya_avatar_p', $stored['p'] );
		return rest_ensure_response( array( 'ok' => true, 'url' => $stored['url'] ) );
	}

	/**
	 * Saudacoes por periodo: morning/day/evening.
	 */
	public static function splash_greet() {
		$g = get_option( 'zaya_splash_greet', array() );
		return is_array( $g ) ? $g : array();
	}

	public function splash_greet_get() {
		$g   = self::splash_greet();
		$out = array();
		foreach ( $g as $k => $v ) {
			$out[ $k ] = is_array( $v ) ? (string) ( isset( $v['u'] ) ? $v['u'] : '' ) : (string) $v;
		}
		return rest_ensure_response( $out );
	}

	public function splash_greet_save( $request ) {
		$period = sanitize_key( $request->get_param( 'period' ) ?? '' );
		if ( ! in_array( $period, array( 'morning', 'day', 'evening' ), true ) ) {
			return new \WP_Error( 'invalid_period', 'Periodo invalido.', array( 'status' => 400 ) );
		}
		$url = '';
		$p   = '';
		if ( ! empty( $_FILES['media'] ) ) { // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
			$isvid = false !== strpos( (string) $_FILES['media']['type'], 'video' ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
			$mimes = $isvid
				? array( 'mp4|m4v' => 'video/mp4', 'webm' => 'video/webm' )
				: array( 'jpg|jpeg|jpe' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp' );
			$stored = $this->splash_store_upload( $_FILES['media'], $mimes, 16 ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
			if ( is_wp_error( $stored ) ) {
				return $stored;
			}
			$url = $stored['url'];
			$p   = $stored['p'];
		} else {
			$url = esc_url_raw( $request->get_param( 'url' ) ?? '' );
		}
		if ( '' === $url ) {
			return new \WP_Error( 'no_media', 'Envie um arquivo ou informe uma URL.', array( 'status' => 400 ) );
		}
		$g            = self::splash_greet();
		$g[ $period ] = array( 'u' => $url, 'p' => $p );
		update_option( 'zaya_splash_greet', $g );
		Activity_Log::log( 'settings_saved', 'settings', 0, 'Splash: saudacao "' . $period . '" atualizada.' );
		return rest_ensure_response( array( 'ok' => true, 'url' => $url ) );
	}

	public function splash_greet_delete( $request ) {
		$period = sanitize_key( $request->get_param( 'period' ) ?? '' );
		if ( ! in_array( $period, array( 'morning', 'day', 'evening' ), true ) ) {
			return new \WP_Error( 'invalid_period', 'Periodo invalido.', array( 'status' => 400 ) );
		}
		$g = self::splash_greet();
		if ( ! empty( $g[ $period ] ) ) {
			$item = is_array( $g[ $period ] ) ? $g[ $period ] : array( 'u' => $g[ $period ] );
			\Zaya\Assets::delete_splash_file_item( $item );
		}
		unset( $g[ $period ] );
		update_option( 'zaya_splash_greet', $g );
		return rest_ensure_response( array( 'ok' => true ) );
	}

	/**
	 * Define janela de exibicao (inicio/fim) de um video da rotacao.
	 */
	public function splash_video_schedule( $request ) {
		$body = $this->body( $request );
		$url  = esc_url_raw( $body['url'] ?? '' );
		if ( '' === $url ) {
			return new \WP_Error( 'invalid_url', 'URL invalida.', array( 'status' => 400 ) );
		}
		$s    = sanitize_text_field( $body['s'] ?? '' );
		$e    = sanitize_text_field( $body['e'] ?? '' );
		foreach ( array( $s, $e ) as $dt ) {
			if ( '' !== $dt && ! preg_match( '/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/', $dt ) ) {
				return new \WP_Error( 'invalid_date', 'Data/hora invalida.', array( 'status' => 400 ) );
			}
		}
		$list = self::splash_videos();
		foreach ( $list as $i => $item ) {
			if ( isset( $item['u'] ) && hash_equals( $item['u'], $url ) ) {
				$list[ $i ]['s'] = $s;
				$list[ $i ]['e'] = $e;
				update_option( 'zaya_splash_videos', wp_json_encode( $list ) );
				return rest_ensure_response( array( 'ok' => true ) );
			}
		}
		return new \WP_Error( 'not_found', 'Video nao encontrado.', array( 'status' => 404 ) );
	}

	/**
	 * Alertas de aniversario (cliente) e aniversario de cadastro Zaya:
	 * quem faz anos hoje ou amanha, para a gerencia preparar o splash.
	 */
	public function bday_alerts() {
		$alerts = \Zaya\Assets::bday_alerts();
		return rest_ensure_response( array( 'alerts' => $alerts ) );
	}

	/**
	 * Associa uma midia personalizada a um usuario especifico
	 * (ex.: video de parabens que so ele ve na abertura do app).
	 */
	public function bday_personal( $request ) {
		$user_id = absint( $request->get_param( 'user_id' ) ?? 0 );
		if ( ! $user_id || ! get_userdata( $user_id ) ) {
			return new \WP_Error( 'invalid_user', 'Usuario invalido.', array( 'status' => 400 ) );
		}
		$url = esc_url_raw( $request->get_param( 'url' ) ?? '' );

		// Upload direto de midia personalizada (video ou imagem).
		if ( '' === $url && ! empty( $_FILES['media'] ) ) { // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
						$isvid = false !== strpos( (string) $_FILES['media']['type'], 'video' ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
			$mimes = $isvid
				? array( 'mp4|m4v' => 'video/mp4', 'webm' => 'video/webm', 'mov|qt' => 'video/quicktime' )
				: array( 'jpg|jpeg|jpe' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp' );
			$stored = $this->splash_store_upload( $_FILES['media'], $mimes, 32 ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
			if ( is_wp_error( $stored ) ) {
				return $stored;
			}
			$url = $stored['url'];
		}
		if ( '' === $url ) {
			return new \WP_Error( 'no_media', 'Envie um arquivo ou informe uma URL.', array( 'status' => 400 ) );
		}

		$kind   = ( false !== strpos( $url, '.mp4' ) || false !== strpos( $url, '.webm' ) || false !== strpos( $url, '.mov' ) ) ? 'video' : 'imagem';
		$until  = sanitize_text_field( $request->get_param( 'until' ) ?? '' );
		if ( '' === $until || strtotime( $until ) === false ) {
			$until = gmdate( 'Y-m-d', strtotime( '+2 days' ) );
		}

		$personals   = get_option( 'zaya_splash_personals', array() );
		$personals   = is_array( $personals ) ? $personals : array();
		$personals[ $user_id ] = array(
			'u'     => $url,
			'p'     => isset( $stored ) ? $stored['p'] : '',
			'kind'  => $kind,
			'until' => $until,
			'set_at'=> current_time( 'mysql' ),
		);
		update_option( 'zaya_splash_personals', $personals );

		Activity_Log::log( 'settings_saved', 'settings', 0, sprintf( 'Splash pessoal programado para usuario #%d (ate %s).', $user_id, $until ) );
		return rest_ensure_response( array( 'ok' => true, 'url' => $url, 'kind' => $kind, 'until' => $until ) );
	}

	/**
	 * Remove um video especifico da rotacao e o deleta do site.
	 */
	public function splash_video_delete( $request ) {
		$url = esc_url_raw( $request['url'] ?? '' );
		if ( '' === $url ) {
			return new \WP_Error( 'invalid_url', 'URL invalida.', array( 'status' => 400 ) );
		}
		$list  = self::splash_videos();
		$found = false;
		$rest  = array();
		foreach ( $list as $item ) {
			if ( ! $found && isset( $item['u'] ) && hash_equals( $item['u'], $url ) ) {
				$found = true;
				continue;
			}
			$rest[] = $item;
		}
		if ( ! $found ) {
			return new \WP_Error( 'not_found', 'Video nao encontrado na rotacao.', array( 'status' => 404 ) );
		}

		// Deleta arquivo fisico + anexo.
		\Zaya\Assets::delete_splash_file_item( $item );

		update_option( 'zaya_splash_videos', wp_json_encode( $rest ) );
		update_option( 'zaya_splash_video_url', $rest ? $rest[0]['u'] : '' );
		\Zaya\Assets::log_splash_action( 'del', 'video', $url, isset( $item['by'] ) ? $item['by'] : '' );
		Activity_Log::log( 'settings_saved', 'settings', 0, 'Splash do app: video removido da rotacao.' );
		return rest_ensure_response( array( 'ok' => true, 'total' => count( $rest ) ) );
	}

	/**
	 * Apaga arquivo fisico de URL dentro de /uploads.
	 */
	private static function delete_splash_file_by_url( $url ) {
		$maybe_id = attachment_url_to_postid( $url );
		if ( $maybe_id ) {
			wp_delete_attachment( (int) $maybe_id, true );
			return;
		}
		$path = str_replace( content_url(), untrailingslashit( WP_CONTENT_DIR ), $url );
		$path = wp_normalize_path( $path );
		if ( strpos( $path, wp_normalize_path( WP_CONTENT_DIR ) ) === 0 && file_exists( $path ) ) {
			wp_delete_file( $path );
		}
	}

	/**
	 * Upload de imagem estatica do splash: valida MIME/tamanho e grava a URL.
	 */
	public function splash_image_upload( $request ) {
		if ( empty( $_FILES['image'] ) || ! is_array( $_FILES['image'] ) ) {
			return new \WP_Error( 'no_file', 'Nenhuma imagem recebida.', array( 'status' => 400 ) );
		}
		$file = $_FILES['image']; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
		$mimes = array(
			'jpg|jpeg|jpe' => 'image/jpeg',
			'png'          => 'image/png',
			'webp'         => 'image/webp',
		);
		$stored = $this->splash_store_upload( $file, $mimes, 8 );
		if ( is_wp_error( $stored ) ) {
			return $stored;
		}
		update_option( 'zaya_splash_image_url', $stored['url'] );
		update_option( 'zaya_splash_image_p', $stored['p'] );
		\Zaya\Assets::log_splash_action( 'add', 'imagem', $stored['url'] );
		return rest_ensure_response( array( 'ok' => true, 'url' => $stored['url'] ) );
	}

	/**
	 * Deleta a midia do splash: arquivo fisico + anexo da biblioteca + opcao.
	 */
	public function splash_delete_media( $request ) {
		$type = sanitize_key( $request['type'] ?? '' );
		if ( ! in_array( $type, array( 'video', 'image' ), true ) ) {
			return new \WP_Error( 'invalid_type', 'Tipo invalido.', array( 'status' => 400 ) );
		}
		if ( 'video' === $type ) {
			// Limpa a rotacao inteira de videos.
			foreach ( self::splash_videos() as $item ) {
				if ( ! empty( $item['u'] ) ) {
					\Zaya\Assets::log_splash_action( 'del', 'video', $item['u'] );
					\Zaya\Assets::delete_splash_file_item( $item );
				}
			}
			update_option( 'zaya_splash_videos', '[]' );
			update_option( 'zaya_splash_video_url', '' );
			delete_option( 'zaya_splash_video_att' );
		} else {
			$img = (string) get_option( 'zaya_splash_image_url', '' );
			\Zaya\Assets::delete_splash_media( 'image' );
			if ( '' !== $img ) { \Zaya\Assets::log_splash_action( 'del', 'imagem', $img ); }
		}
		Activity_Log::log( 'settings_saved', 'settings', 0, 'Splash do app: midia deletada (' . $type . ').' );
		return rest_ensure_response( array( 'ok' => true ) );
	}

	public function settings_get( $request ) {
		$map = self::settings_map();
		$group = sanitize_key( $request['group'] );
		if ( ! isset( $map[ $group ] ) ) {
			return new \WP_Error( 'invalid_group', 'Grupo invalido.', array( 'status' => 404 ) );
		}
		if ( ! empty( $map[ $group ]['admin_only'] ) && ! current_user_can( 'manage_options' ) ) {
			return new \WP_Error( 'forbidden', 'Apenas administradores.', array( 'status' => 403 ) );
		}

		$values = [];
		foreach ( $map[ $group ]['fields'] as $key => $field ) {
			$values[ $key ] = get_option( $key, '' );
		}
		if ( 'frete' === $group ) {
			$values = $this->shipping_values( $values );
		}
		return rest_ensure_response( array(
			'label'  => $map[ $group ]['label'],
			'fields' => $map[ $group ]['fields'],
			'values' => $values,
		) );
	}

	/**
	 * Frete: preenche os valores sinteticos com o estado REAL dos metodos
	 * de envio configurados no WooCommerce.
	 */
	private function shipping_values( $values ) {
		$free_list = $this->zone_method_instances( 'free_shipping' );
		if ( ! empty( $free_list ) ) {
			$cfg = $free_list[0]['cfg'];
			// Chave 'enabled' ausente = ativo (comportamento padrao do WC).
			$values['zaya_ship_free_enabled'] = ( ! isset( $cfg['enabled'] ) || 'yes' === $cfg['enabled'] ) ? '1' : '0';
			if ( isset( $cfg['requires'] ) && 'min_amount' === $cfg['requires'] ) {
				$values['zaya_ship_free_mode'] = 'min_amount';
			} else {
				$values['zaya_ship_free_mode'] = 'none';
			}
			$values['zaya_ship_free_min'] = ( isset( $cfg['min_amount'] ) && '' !== $cfg['min_amount'] ) ? $cfg['min_amount'] : 99.90;
		}

		$flat_list = $this->zone_method_instances( 'flat_rate' );
		$cost_keys = array( 'zaya_ship_flat_cost', 'zaya_ship_flat_cost_nn', 'zaya_ship_flat_cost_resto' );
		foreach ( $flat_list as $i => $inst ) {
			$cfg  = $inst['cfg'];
			$key  = $cost_keys[ $i ] ?? end( $cost_keys );
			$def  = array( 14.90, 24.90, 24.90 )[ min( $i, 2 ) ];
			$values[ $key ] = ( isset( $cfg['cost'] ) && '' !== $cfg['cost'] ) ? $cfg['cost'] : $def;
			if ( 0 === $i ) {
				$values['zaya_ship_flat_enabled'] = ( ! isset( $cfg['enabled'] ) || 'yes' === $cfg['enabled'] ) ? '1' : '0';
				$values['zaya_ship_flat_title']   = isset( $cfg['title'] ) ? $cfg['title'] : 'Entrega padrão';
			}
		}
		return $values;
	}

	/**
	 * Todas as instancias de um metodo de envio, ordenadas pela ordem das
	 * zonas (a mais especifica primeiro).
	 */
	private function zone_method_instances( $method_id ) {
		$out = array();
		if ( ! class_exists( '\WC_Shipping_Zones' ) ) {
			return $out;
		}
		foreach ( \WC_Shipping_Zones::get_zones() as $zone ) {
			foreach ( $zone['shipping_methods'] as $method ) {
				if ( $method->id !== $method_id ) {
					continue;
				}
				$option = 'woocommerce_' . $method_id . '_' . $method->instance_id . '_settings';
				$config = get_option( $option, array() );
				$out[]  = array(
					'option'     => $option,
					'cfg'        => is_array( $config ) ? $config : array(),
					'zone_id'    => $zone['zone_id'],
					'zone_order' => (int) $zone['zone_order'],
					'zone_name'  => $zone['zone_name'],
				);
			}
		}
		usort( $out, function ( $a, $b ) { return $a['zone_order'] <=> $b['zone_order']; } );
		return $out;
	}

	/**
	 * Localiza a primeira instancia de um metodo de envio nas zonas e
	 * retorna [option_name, config] ou null se nao existir.
	 */
	private function zone_method_config( $method_id ) {
		$list = $this->zone_method_instances( $method_id );
		if ( empty( $list ) ) {
			return null;
		}
		return array( $list[0]['option'], $list[0]['cfg'] );
	}

	public function settings_save( $request ) {
		$map   = self::settings_map();
		$group = sanitize_key( $request['group'] );
		if ( ! isset( $map[ $group ] ) ) {
			return new \WP_Error( 'invalid_group', 'Grupo invalido.', array( 'status' => 404 ) );
		}
		if ( ! empty( $map[ $group ]['admin_only'] ) && ! current_user_can( 'manage_options' ) ) {
			return new \WP_Error( 'forbidden', 'Apenas administradores.', array( 'status' => 403 ) );
		}

		$body  = $this->body( $request );
		$saved = 0;
		foreach ( $map[ $group ]['fields'] as $key => $field ) {
			if ( ! array_key_exists( $key, $body ) ) { continue; }
			update_option( $key, $this->sanitize_by_type( $body[ $key ], $field['type'] ) );
			$saved++;
		}

		// Slug do painel alterado -> regrava rewrite rules.
		if ( ! empty( $body['tm_panel_slug'] ?? '' ) ) {
			flush_rewrite_rules( false );
		}

		Agents::log_settings_saved( $group );

		if ( 'pagamentos' === $group ) {
			$this->sync_mercadopago_gateways();
		}
		if ( 'frete' === $group ) {
			$this->sync_shipping();
		}

		return rest_ensure_response( array( 'ok' => true, 'saved' => $saved ) );
	}

	/**
	 * Frete: grava as chaves sinteticas nas opcoes reais dos metodos de
	 * envio. Cria o metodo na zona Brasil se ele ainda nao existir.
	 */
	private function sync_shipping() {
		// â”€â”€ Frete gratis: mesmas regras em TODAS as zonas â”€â”€
		$free_list = $this->zone_method_instances( 'free_shipping' );
		if ( empty( $free_list ) ) {
			$created = $this->create_zone_method( 'free_shipping', 'Frete grátis' );
			if ( $created ) {
				$free_list = array( array( 'option' => $created[0], 'cfg' => $created[1] ) );
			}
		}
		if ( ! empty( $free_list ) ) {
			$enabled = (string) get_option( 'zaya_ship_free_enabled', '1' ) === '1';
			foreach ( $free_list as $inst ) {
				$config = $inst['cfg'];
				$config['title']   = isset( $config['title'] ) && '' !== $config['title'] ? $config['title'] : 'Frete grátis';
				$config['enabled'] = $enabled ? 'yes' : 'no';
				if ( $enabled && 'min_amount' === (string) get_option( 'zaya_ship_free_mode', 'min_amount' ) ) {
					$config['requires']         = 'min_amount';
					$config['min_amount']       = (string) max( 0, (float) get_option( 'zaya_ship_free_min', 99.90 ) );
					$config['ignore_discounts'] = 'yes';
				} else {
					$config['requires'] = '';
					unset( $config['min_amount'], $config['ignore_discounts'] );
				}
				update_option( $inst['option'], $config );
			}
		}

		// â”€â”€ Frete fixo: titulo/ativo iguais, custo por regiao (ordem das zonas) â”€â”€
		$flat_list = $this->zone_method_instances( 'flat_rate' );
		if ( empty( $flat_list ) ) {
			$created = $this->create_zone_method( 'flat_rate', 'Entrega padrão' );
			if ( $created ) {
				$flat_list = array( array( 'option' => $created[0], 'cfg' => $created[1] ) );
			}
		}
		if ( ! empty( $flat_list ) ) {
			$enabled  = (string) get_option( 'zaya_ship_flat_enabled', '1' ) === '1';
			$title    = trim( (string) get_option( 'zaya_ship_flat_title', '' ) );
			if ( '' === $title ) { $title = 'Entrega padrão'; }
			$cost_keys = array( 'zaya_ship_flat_cost', 'zaya_ship_flat_cost_nn', 'zaya_ship_flat_cost_resto' );
			$defaults  = array( 14.90, 24.90, 24.90 );
			foreach ( $flat_list as $i => $inst ) {
				$config           = $inst['cfg'];
				$config['title']  = $title;
				$config['cost']   = (string) max( 0, (float) get_option( $cost_keys[ min( $i, 2 ) ], $defaults[ min( $i, 2 ) ] ) );
				$config['tax_status'] = isset( $config['tax_status'] ) ? $config['tax_status'] : 'taxable';
				$config['enabled']    = $enabled ? 'yes' : 'no';
				update_option( $inst['option'], $config );
			}
		}

		delete_transient( 'wc_shipping_method_count' );
		if ( class_exists( '\WC_Cache_Helper' ) ) {
			\WC_Cache_Helper::get_transient_version( 'shipping', true );
		}
	}

	/**
	 * Cria um metodo de envio na primeira zona (Brasil) e retorna no mesmo
	 * formato de zone_method_config().
	 */
	private function create_zone_method( $method_id, $default_title ) {
		$zones = \WC_Shipping_Zones::get_zones();
		if ( empty( $zones ) ) {
			return null;
		}
		$zone    = new \WC_Shipping_Zone( $zones[0]['zone_id'] );
		$instance = $zone->add_shipping_method( $method_id );
		return array(
			'woocommerce_' . $method_id . '_' . $instance . '_settings',
			array( 'title' => $default_title ),
		);
	}

	/**
	 * Diagnostico Mercado Pago: valida a credencial salva, identifica a
	 * conta e simula um Pix de R$ 0,50 para expor o motivo EXATO de falhas
	 * (ex.: 13253 = conta sem chave Pix cadastrada).
	 */
	public function mp_diagnose() {
		$checks  = array();
		$is_test = 'yes' === get_option( 'checkbox_checkout_test_mode', 'yes' );
		$option  = $is_test ? '_mp_access_token_test' : '_mp_access_token_prod';
		$token   = trim( (string) get_option( $option, '' ) );
		$mode    = $is_test ? 'modo TESTE' : 'modo PRODUCAO';

		if ( '' === $token ) {
			$alt = trim( (string) get_option( $is_test ? '_mp_access_token_prod' : '_mp_access_token_test', '' ) );
			$checks[] = array(
				'label'  => "Credencial ($mode)",
				'status' => 'fail',
				'detail' => '' === $alt
					? 'Nenhuma Access Token salva. Cole no formulario acima e salve.'
					: 'As credenciais estao salvas no outro modo. Salve o formulario novamente para o painel reclassificar automaticamente.',
			);
			return rest_ensure_response( array( 'ok' => false, 'checks' => $checks ) );
		}
		$checks[] = array(
			'label'  => "Credencial salva ($mode)",
			'status' => 'ok',
			'detail' => 'Token presente (' . substr( $token, 0, 10 ) . '...)',
		);

		// Quem e o dono do token?
		$r     = wp_remote_get( 'https://api.mercadopago.com/users/me', array(
			'headers' => array( 'Authorization' => 'Bearer ' . $token ),
			'timeout' => 20,
		) );
		$code  = wp_remote_retrieve_response_code( $r );
		$body  = json_decode( wp_remote_retrieve_body( $r ), true );
		if ( 200 === $code && ! empty( $body['id'] ) ) {
			$checks[] = array(
				'label'  => 'Conta conectada',
				'status' => 'ok',
				'detail' => 'Conta #' . $body['id'] . ' (' . ( $body['nickname'] ?? 'sem apelido' ) . ')',
			);
		} elseif ( 401 === $code ) {
			$checks[] = array(
				'label'  => 'Conta conectada',
				'status' => 'fail',
				'detail' => 'Token invalido ou expirado. Copie novamente em mercadopago.com.br/developers/panel/app e cole aqui.',
			);
			return rest_ensure_response( array( 'ok' => false, 'checks' => $checks ) );
		} else {
			$checks[] = array(
				'label'  => 'Conta conectada',
				'status' => 'fail',
				'detail' => 'Falha ao validar a credencial (HTTP ' . $code . '). Tente novamente em instantes.',
			);
			return rest_ensure_response( array( 'ok' => false, 'checks' => $checks ) );
		}

		// Simula a criacao de um Pix minimo — replica exatamente o checkout.
		$p  = wp_remote_post( 'https://api.mercadopago.com/v1/payments', array(
			'headers' => array(
				'Authorization'     => 'Bearer ' . $token,
				'Content-Type'      => 'application/json',
				'X-Idempotency-Key' => wp_generate_uuid4(),
			),
			'timeout' => 25,
			'body'    => wp_json_encode( array(
				'transaction_amount' => 0.5,
				'description'        => 'Diagnostico Zaya (nao pagar)',
				'payment_method_id'  => 'pix',
				'payer'              => array( 'email' => get_option( 'admin_email' ) ?: 'diagnostico@zaya.local' ),
			) ),
		) );
		$pc = wp_remote_retrieve_response_code( $p );
		$pb = json_decode( wp_remote_retrieve_body( $p ), true );
		if ( $pc >= 200 && $pc < 300 && ! empty( $pb['id'] ) ) {
			$has_qr = isset( $pb['point_of_interaction']['transaction_data']['qr_code'] );
			$checks[] = array(
				'label'  => 'Pix funcionando',
				'status' => 'ok',
				'detail' => $has_qr
					? 'QR Code gerado com sucesso! A cobranca de teste de R$ 0,50 expira sozinha se nao for paga.'
					: 'Pagamento aceito pelo Mercado Pago.',
			);
		} else {
			$cause_codes = '';
			foreach ( (array) ( $pb['cause'] ?? array() ) as $c ) {
				if ( ! empty( $c['code'] ) ) { $cause_codes .= trim( (string) $c['code'] ) . ' '; }
			}
			$msg     = (string) ( $pb['message'] ?? ( 'HTTP ' . $pc ) );
			$haystack = strtolower( $msg . ' ' . $cause_codes );
			if ( false !== strpos( $haystack, '13253' ) || false !== strpos( $haystack, 'without key' ) ) {
				$detail = 'A conta do Mercado Pago NAO tem chave Pix cadastrada. Abra o app do Mercado Pago (nessa mesma conta) -> Pix -> Cadastrar chave aleatoria. Leva 1 minuto.';
			} elseif ( 401 === $pc ) {
				$detail = 'Token invalido na hora de cobrar. Gere novas credenciais de producao no site do MP e cole aqui.';
			} else {
				$detail = 'Erro ' . trim( $cause_codes ) . ': ' . $msg;
			}
			$checks[] = array( 'label' => 'Pix funcionando', 'status' => 'fail', 'detail' => $detail );
		}

		foreach ( $checks as $c ) {
			if ( 'ok' !== $c['status'] ) {
				return rest_ensure_response( array( 'ok' => false, 'checks' => $checks ) );
			}
		}
		return rest_ensure_response( array( 'ok' => true, 'checks' => $checks ) );
	}

	/**
	 * Classifica as credenciais pelo prefixo e move para o slot correto:
	 * APP_USR-* e sempre producao, TEST-* e sempre teste — independente do
	 * campo onde foram coladas.
	 */
	private function normalize_mp_credentials() {
		foreach ( array( '_mp_access_token', '_mp_public_key' ) as $base ) {
			$prod = trim( (string) get_option( $base . '_prod', '' ) );
			$test = trim( (string) get_option( $base . '_test', '' ) );
			if ( '' === $prod && 0 === strpos( $test, 'APP_USR' ) ) {
				update_option( $base . '_prod', $prod === '' ? $test : $prod );
				update_option( $base . '_test', '' );
				continue;
			}
			if ( '' === $test && 0 === strpos( $prod, 'TEST' ) ) {
				update_option( $base . '_test', $prod );
				update_option( $base . '_prod', '' );
			}
		}
	}

	/**
	 * Ativa/desativa os gateways do Mercado Pago conforme a presenca do
	 * Access Token de producao — a operadora nunca mexe no WooCommerce.
	 * Replicacao do onboarding oficial do plugin MP:
	 * checkout_country, checkbox_checkout_test_mode, credenciais _mp_* e
	 * opcoes woocommerce_woo-mercado-pago-{basic,pix}_settings.
	 */
	private function sync_mercadopago_gateways() {
		$this->normalize_mp_credentials();
		$token_prod  = trim( (string) get_option( '_mp_access_token_prod', '' ) );
		$token_test  = trim( (string) get_option( '_mp_access_token_test', '' ) );
		$has_prod    = ( '' !== $token_prod && 0 === strpos( $token_prod, 'APP_USR' ) );
		$has_any     = $has_prod || ( '' !== $token_test && 0 === strpos( $token_test, 'TEST' ) );

		// Pais do checkout no onboarding do MP (deriva do pais base da loja).
		if ( ! get_option( 'checkout_country' ) ) {
			update_option( 'checkout_country', substr( (string) get_option( 'woocommerce_default_country', 'BR' ), 0, 2 ) ?: 'BR' );
		}

		// Modo teste do MP: ligado so quando NAO ha token de producao.
		update_option( 'checkbox_checkout_test_mode', $has_prod ? 'no' : 'yes' );

		foreach ( array(
			'woo-mercado-pago-basic' => 'Cartão de crédito',
			'woo-mercado-pago-pix'   => 'Pix',
		) as $gateway_id => $default_title ) {
			$option = 'woocommerce_' . $gateway_id . '_settings';
			$config = get_option( $option, array() );
			if ( ! is_array( $config ) ) { $config = array(); }
			$config['enabled'] = $has_any ? 'yes' : 'no';
			if ( $has_any && ( empty( $config['title'] ) || ! is_string( $config['title'] ) ) ) {
				$config['title'] = $default_title;
			}
			update_option( $option, $config, $has_any ? false : true );
		}
	}

	private function sanitize_by_type( $value, $type ) {
		switch ( $type ) {
			case 'number':
				return is_numeric( $value ) ? $value + 0 : '';
			case 'bool':
				return ( '1' === (string) $value || true === $value || 'true' === $value ) ? '1' : '0';
			case 'color':
				return sanitize_hex_color( $value ) ?: '';
			case 'password':
				return trim( (string) preg_replace( '/[\r\n\t]+/', '', is_scalar( $value ) ? (string) $value : '' ) );
			case 'select':
				return sanitize_text_field( $value );
			case 'json':
				if ( is_array( $value ) ) { return wp_json_encode( $value ); }
				json_decode( $value );
				return JSON_ERROR_NONE === json_last_error() ? $value : '';
			default:
				return sanitize_textarea_field( $value );
		}
	}

	/* â•â•â•â•â•â•â•â•â•â•â•â•â• EDITORES ESTRUTURADOS (sem JSON) â•â•â•â•â•â•â•â•â•â•â•â•â• */

	public function banners_get() {
		$slides = get_option( 'zaya_hero_slides', [] );
		return rest_ensure_response( array( 'slides' => is_array( $slides ) ? array_values( $slides ) : [] ) );
	}

	public function banners_save( $request ) {
		$slides = $this->body( $request )['slides'] ?? null;
		if ( ! is_array( $slides ) ) {
			return new \WP_Error( 'invalid', 'Formato invalido.', array( 'status' => 400 ) );
		}
		$clean = [];
		foreach ( $slides as $s ) {
			if ( ! is_array( $s ) || empty( $s['img_desktop'] ) ) { continue; }
			$clean[] = array(
				'img_desktop' => esc_url_raw( $s['img_desktop'] ),
				'img_mobile'  => esc_url_raw( $s['img_mobile'] ?? $s['img_desktop'] ),
				'title'       => sanitize_text_field( $s['title'] ?? '' ),
				'subtitle'    => sanitize_text_field( $s['subtitle'] ?? '' ),
				'cta_text'    => sanitize_text_field( $s['cta_text'] ?? '' ),
				'cta_link'    => esc_url_raw( $s['cta_link'] ?? '' ),
			);
		}
		update_option( 'zaya_hero_slides', $clean );
		Activity_Log::log( 'settings_saved', 'settings', 0, sprintf( 'Banners atualizados (%d slides).', count( $clean ) ) );
		return rest_ensure_response( array( 'ok' => true, 'total' => count( $clean ) ) );
	}

	public function brands_get() {
		$brands = get_option( 'zaya_brands', [] );
		return rest_ensure_response( array( 'brands' => is_array( $brands ) ? array_values( $brands ) : [] ) );
	}

	public function brands_save( $request ) {
		$brands = $this->body( $request )['brands'] ?? null;
		if ( ! is_array( $brands ) ) {
			return new \WP_Error( 'invalid', 'Formato invalido.', array( 'status' => 400 ) );
		}
		$clean = [];
		foreach ( $brands as $b ) {
			if ( ! is_array( $b ) || empty( $b['image'] ) ) { continue; }
			$clean[] = array(
				'name'  => sanitize_text_field( $b['name'] ?? '' ),
				'image' => esc_url_raw( $b['image'] ),
				'url'   => esc_url_raw( $b['url'] ?? '' ),
			);
		}
		update_option( 'zaya_brands', $clean );
		Activity_Log::log( 'settings_saved', 'settings', 0, sprintf( 'Marcas atualizadas (%d itens).', count( $clean ) ) );
		return rest_ensure_response( array( 'ok' => true, 'total' => count( $clean ) ) );
	}

	public function trust_get() {
		$badges = get_option( 'zaya_trust_badges', [] );
		return rest_ensure_response( array( 'badges' => is_array( $badges ) ? array_values( $badges ) : [] ) );
	}

	public function trust_save( $request ) {
		$badges = $this->body( $request )['badges'] ?? null;
		if ( ! is_array( $badges ) ) {
			return new \WP_Error( 'invalid', 'Formato invalido.', array( 'status' => 400 ) );
		}
		$clean = [];
		foreach ( $badges as $b ) {
			if ( ! is_array( $b ) ) { continue; }
			if ( empty( $b['title'] ) && empty( $b['icon'] ) ) { continue; }
			$clean[] = array(
				'icon'     => esc_url_raw( $b['icon'] ?? '' ),
				'title'    => sanitize_text_field( $b['title'] ?? '' ),
				'subtitle' => sanitize_text_field( $b['subtitle'] ?? '' ),
			);
		}
		update_option( 'zaya_trust_badges', $clean );
		Activity_Log::log( 'settings_saved', 'settings', 0, sprintf( 'Selos de confianca atualizados (%d itens).', count( $clean ) ) );
		return rest_ensure_response( array( 'ok' => true, 'total' => count( $clean ) ) );
	}

	public function media_upload( $request ) {
		$files = $request->get_file_params();
		if ( empty( $files['image'] ) ) {
			return new \WP_Error( 'no_file', 'Nenhuma imagem enviada.', array( 'status' => 400 ) );
		}
		$id = Media::handle_single( $files['image'] );
		if ( is_wp_error( $id ) ) {
			return new \WP_Error( $id->get_error_code(), $id->get_error_message(), array( 'status' => 400 ) );
		}
		return rest_ensure_response( array(
			'id'  => $id,
			'url' => Media::best_url( $id, 'full' ),
		) );
	}

	/* â•â•â•â•â•â•â•â•â•â•â•â•â• ASSISTENTE DO FEED DO INSTAGRAM â•â•â•â•â•â•â•â•â•â•â•â•â• */

	public function ig_widget_get() {
		return rest_ensure_response( array(
			'embed' => (string) get_option( 'zaya_instagram_embed', '' ),
			'media_ids' => array_map( 'intval', (array) get_option( 'zaya_ig_media_ids', [] ) ),
		) );
	}

	/* â”€â”€ Modo curadoria: biblioteca de midia + selecao de fotos â”€â”€ */

	public function media_library_list( $request ) {
		$posts = get_posts( array(
			'post_type'      => 'attachment',
			'post_mime_type' => 'image',
			'numberposts'    => min( 60, max( 1, (int) ( $request['per_page'] ?? 30 ) ) ),
			'post_status'    => 'inherit',
			'orderby'        => 'date',
			'order'          => 'DESC',
		) );
		$out = [];
		foreach ( $posts as $p ) {
			$thumb = wp_get_attachment_image_url( $p->ID, 'thumbnail' );
			if ( ! $thumb ) { continue; }
			$out[] = [ 'id' => (int) $p->ID, 'thumb' => $thumb, 'title' => $p->post_title ];
		}
		return rest_ensure_response( array_values( $out ) );
	}

	public function ig_media_get() {
		return rest_ensure_response( array( 'ids' => array_map( 'intval', (array) get_option( 'zaya_ig_media_ids', [] ) ) ) );
	}

	public function ig_media_save( $request ) {
		$body = $this->body( $request );
		$ids  = array_filter( array_map( 'absint', (array) ( $body['ids'] ?? [] ) ) );
		update_option( 'zaya_ig_media_ids', array_values( $ids ) );

		if ( empty( $ids ) ) {
			Activity_Log::log( 'settings_saved', 'settings', 0, 'Grid do Instagram: modo curadoria esvaziado.' );
		} else {
			Activity_Log::log( 'settings_saved', 'settings', 0, sprintf( 'Grid do Instagram atualizado com %d fotos escolhidas na biblioteca.', count( $ids ) ) );
		}
		return rest_ensure_response( array( 'ok' => true, 'total' => count( $ids ) ) );
	}

	/**
	 * Aceita tres formatos e converte sozinho:
	 * 1. Link curto do Behold  -> https://services.behold.so/link/g0r2h
	 * 2. ID puro               -> g0r2h
	 * 3. Codigo embed completo -> salva como veio
	 */
	public function ig_widget_save( $request ) {
		$body = $this->body( $request );
		$raw  = trim( (string) ( $body['link'] ?? '' ) );

		if ( '' === $raw ) {
			update_option( 'zaya_instagram_embed', '' );
			Activity_Log::log( 'settings_saved', 'settings', 0, 'Feed do Instagram removido.' );
			return rest_ensure_response( array( 'ok' => true, 'mode' => 'cleared' ) );
		}

		// 1. Link curto do Behold (services./app. — qualquer subdominio)
		if ( preg_match( '/behold\.so\/(?:link|widget|feed)\/([a-z0-9]+)/i', $raw, $m ) ) {
			$id = strtolower( $m[1] );
			$embed = '<script src="https://cdn.behold.so/widget.js" type="module"></script>' . "\n"
				. '<div data-behold-id="' . esc_attr( $id ) . '"></div>';
			update_option( 'zaya_instagram_embed', $embed );
			Activity_Log::log( 'settings_saved', 'settings', 0, sprintf( 'Feed do Instagram conectado via Behold (widget %s).', $id ) );
			return rest_ensure_response( array( 'ok' => true, 'mode' => 'behold', 'id' => $id ) );
		}

		// 2. Codigo embed completo colado direto
		if ( strpos( $raw, '<' ) !== false ) {
			// Segurança: scripts/iframes só do CDN oficial do Behold (bloqueia JS arbitrário).
			$allowed = array(
				'script' => array( 'src' => true, 'type' => true, 'async' => true ),
				'iframe' => array( 'src' => true, 'width' => true, 'height' => true, 'frameborder' => true, 'scrolling' => true, 'style' => true, 'allowtransparency' => true, 'title' => true ),
				'div'    => array( 'data-behold-id' => true, 'class' => true, 'id' => true, 'style' => true ),
				'a'      => array( 'href' => true, 'target' => true ),
			);
			$clean = wp_kses( $raw, $allowed, [ 'http', 'https' ] );
			if ( '' === trim( $clean ) ) {
				return new \WP_Error( 'invalid_embed', 'Nao reconheci o codigo. Use o link curto do Behold (services.behold.so/link/...).', array( 'status' => 400 ) );
			}
			// Valida src de script/iframe contra allowlist de dominios confiaveis.
			if ( preg_match_all( '#(?:script|iframe)[^>]*src=["\']([^"\']+)["\']#i', $clean, $srcs ) ) {
				foreach ( $srcs[1] as $src_url ) {
					$host = wp_parse_url( $src_url, PHP_URL_HOST );
					if ( ! $host || ! preg_match( '/(^|\.)behold\.so$/i', $host ) ) {
						return new \WP_Error( 'invalid_embed', 'Apenas codigo de incorporacao oficial do Behold (cdn.behold.so) e aceito.', array( 'status' => 400 ) );
					}
				}
			}
			update_option( 'zaya_instagram_embed', $clean );
			Activity_Log::log( 'settings_saved', 'settings', 0, 'Feed do Instagram conectado via codigo de incorporacao.' );
			return rest_ensure_response( array( 'ok' => true, 'mode' => 'embed' ) );
		}

		// 3. ID puro do Behold
		if ( preg_match( '/^[a-z0-9]{4,12}$/i', $raw ) ) {
			$id = strtolower( $raw );
			$embed = '<script src="https://cdn.behold.so/widget.js" type="module"></script>' . "\n"
				. '<div data-behold-id="' . esc_attr( $id ) . '"></div>';
			update_option( 'zaya_instagram_embed', $embed );
			return rest_ensure_response( array( 'ok' => true, 'mode' => 'behold', 'id' => $id ) );
		}

		return new \WP_Error( 'unrecognized', 'Nao reconheci esse link. Cole o link do widget Behold (ex: https://services.behold.so/link/g0r2h).', array( 'status' => 400 ) );
	}

	/* â•â•â•â•â•â•â•â•â•â•â•â•â• VIDEOS DE FUNDO DO HERO â•â•â•â•â•â•â•â•â•â•â•â•â• */

	public function hero_videos_get() {
		$videos = get_option( 'zaya_hero_videos', [] );
		return rest_ensure_response( array(
			'videos' => is_array( $videos ) ? array_values( $videos ) : [],
			'mode'   => get_option( 'zaya_hero_mode', 'videos' ),
		) );
	}

	public function hero_mode_save( $request ) {
		$mode = sanitize_key( $this->body( $request )['mode'] ?? 'videos' );
		if ( ! in_array( $mode, [ 'videos', 'imagens', 'off' ], true ) ) {
			return new \WP_Error( 'invalid_mode', 'Modo invalido.', array( 'status' => 400 ) );
		}
		update_option( 'zaya_hero_mode', $mode );
		Activity_Log::log( 'settings_saved', 'settings', 0, sprintf( 'Modo do hero: %s.', $mode ) );
		return rest_ensure_response( array( 'ok' => true, 'mode' => $mode ) );
	}

	/**
	 * Hero da Home: ler configuração atual (sempre com defaults preenchidos).
	 *
	 * @return \WP_REST_Response
	 */
	public function hero_config_get() {
		return rest_ensure_response( \TM_Hero::get_config() );
	}

	/**
	 * Hero da Home: grava configuração do painel.
	 *
	 * @param \WP_REST_Request $request Requisição.
	 * @return \WP_REST_Response
	 */
	public function hero_config_save( $request ) {
		$body   = $this->body( $request );
		$clean  = \TM_Hero::save_config( $body );
		Activity_Log::log( 'settings_saved', 'settings', 0, 'Hero da Home atualizado.' );
		return rest_ensure_response( array( 'ok' => true, 'config' => \TM_Hero::get_config() ) );
	}

	/**
	 * Ofertas de checkout (bump + upsell): devolve a configuração ao painel.
	 *
	 * @return \WP_REST_Response
	 */
	public function ofertas_config_get() {
		return rest_ensure_response( \TM_Ofertas::get_config() );
	}

	/**
	 * Ofertas de checkout: grava configuração do painel.
	 *
	 * @param \WP_REST_Request $request Requisição.
	 * @return \WP_REST_Response
	 */
	public function ofertas_config_save( $request ) {
		$body  = $this->body( $request );
		$clean = \TM_Ofertas::save_config( $body );
		Activity_Log::log( 'settings_saved', 'settings', 0, 'Ofertas de checkout atualizadas.' );
		return rest_ensure_response( array( 'ok' => true, 'config' => \TM_Ofertas::get_config() ) );
	}

	public function hero_videos_save( $request ) {
		$body   = $this->body( $request );
		$videos = $body['videos'] ?? null;
		if ( ! is_array( $videos ) ) {
			return new \WP_Error( 'invalid', 'Formato invalido.', array( 'status' => 400 ) );
		}

		$clean = [];
		foreach ( $videos as $v ) {
			if ( ! is_array( $v ) ) { continue; }
			if ( empty( $v['video_url'] ) || empty( $v['texto'] ) ) { continue; } // incompletos sao descartados
			$clean[] = array(
				'video_url' => esc_url_raw( $v['video_url'] ),
				'poster'    => esc_url_raw( $v['poster'] ?? '' ),
				'texto'     => sanitize_text_field( $v['texto'] ),
				'cta_text'  => sanitize_text_field( $v['cta_text'] ?? '' ),
				'cta_link'  => esc_url_raw( $v['cta_link'] ?? '' ),
			);
		}

		// Nunca falha em silencio: se veio conteudo mas nada era valido, avisa.
		if ( ! empty( $videos ) && empty( $clean ) ) {
			return new \WP_Error(
				'nothing_valid',
				'Nenhum card tinha video E texto animado preenchidos. Complete os cards destacados.',
				array( 'status' => 400 )
			);
		}

		update_option( 'zaya_hero_videos', $clean );
		Activity_Log::log( 'settings_saved', 'settings', 0, sprintf( 'Videos do hero atualizados (%d itens).', count( $clean ) ) );
		return rest_ensure_response( array( 'ok' => true, 'total' => count( $clean ), 'descartados' => count( $videos ) - count( $clean ) ) );
	}

	/* â•â•â•â•â•â•â•â•â•â•â•â•â• ATIVIDADE â•â•â•â•â•â•â•â•â•â•â•â•â• */

	public function activity( $request ) {
		return rest_ensure_response( Activity_Log::recent( (int) ( $request['limit'] ?? 30 ) ) );
	}
}
