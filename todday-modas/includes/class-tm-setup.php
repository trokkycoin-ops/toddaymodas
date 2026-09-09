<?php
/**
 * Seed de estrutura: cria as páginas institucionais, o menu principal e a
 * configuração de leitura (front page estática) sempre que faltarem.
 *
 * Transforma o plugin na fonte de verdade da loja: mesmo com banco recriado
 * ou ambiente novo, instalar/rodar o plugin reconstroi a estrutura do site.
 *
 * @package Todday_Modas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Garante que as páginas e o menu existam (idempotente).
 */
class TM_Setup {

	/** Versão do seed: incrementar a cada mudança de estrutura/conteúdo. */
	const VERSAO = '1.0';

	/**
	 * Registra os hooks. Tudo registrado de forma incondicional no topo.
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'seed' ), 20 );
	}

	/**
	 * Roda o seed. Guarda de versão impede trabalho repetido; se a versão
	 * do seed subir, roda de novo. A verificação por slug é idempotente.
	 */
	public static function seed() {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return;
		}
		if ( get_option( '_tm_setup_versao' ) === self::VERSAO ) {
			return;
		}

		self::criar_paginas();
		self::criar_menu();
		self::configurar_leitura();

		update_option( '_tm_setup_versao', self::VERSAO );
	}

	/**
	 * Página institucional a partir do slug com fallback de título.
	 *
	 * @param string $slug Slug esperado.
	 * @param string $titulo Título padrão.
	 * @return int ID da página criada (0 se falhou).
	 */
	private static function pagina( $slug, $titulo ) {
		$existe = get_page_by_path( $slug );
		if ( $existe ) {
			return (int) $existe->ID;
		}
		$id = wp_insert_post(
			array(
				'post_type'    => 'page',
				'post_title'   => $titulo,
				'post_name'    => $slug,
				'post_status'  => 'publish',
				'post_content' => '',
			)
		);
		if ( is_wp_error( $id ) ) {
			return 0;
		}
		return (int) $id;
	}

	/**
	 * Cria/atualiza as páginas da vitrine e institucionais.
	 */
	private static function criar_paginas() {
		$definicoes = self::paginas();

		foreach ( $definicoes as $slug => $dados ) {
			$id = self::pagina( $slug, $dados['titulo'] );
			if ( ! $id ) {
				continue;
			}
			// Conteúdo é gravado direto no banco (sem kses) para preservar
			// HTML/SVG da identidade e nunca ser "melhorado" na mão.
			$atual = get_post_field( 'post_content', $id );
			if ( $atual !== $dados['conteudo'] ) {
				global $wpdb;
				$wpdb->update(
					$wpdb->posts,
					array( 'post_content' => $dados['conteudo'] ),
					array( 'ID' => $id ),
					array( '%s' ),
					array( '%d' )
				);
				clean_post_cache( $id );
			}

			// Mantém a página de privacidade do WooCommerce apontando pra nossa.
			if ( 'politica-de-privacidade' === $slug ) {
				if ( (int) get_option( 'wp_page_for_privacy_policy' ) !== $id ) {
					update_option( 'wp_page_for_privacy_policy', $id );
				}
			}
		}
	}

	/**
	 * Configura a leitura: front page estática = página Início.
	 */
	private static function configurar_leitura() {
		$inicio = get_page_by_path( 'inicio' );
		if ( ! $inicio ) {
			return;
		}
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', (int) $inicio->ID );
	}

	/**
	 * Cria o menu principal (Início, Loja, Contato, Minha conta).
	 *
	 * O item "Categorias" com submenu é injetado dinamicamente pelo plugin
	 * (menu_add_categorias), então não precisa existir como item fixo.
	 */
	private static function criar_menu() {
		$locations = get_nav_menu_locations();
		if ( ! empty( $locations['primary'] ) ) {
			return;
		}

		$menu_existente = wp_get_nav_menu_object( 'Menu Principal' );
		if ( $menu_existente ) {
			$menu_id = (int) $menu_existente->term_id;
		} else {
			$menu_id = wp_create_nav_menu( 'Menu Principal' );
			if ( is_wp_error( $menu_id ) ) {
				return;
			}
		}

		$itens = array();
		$inicio = get_page_by_path( 'inicio' );
		if ( $inicio ) {
			$itens[] = array( 'titulo' => 'Início', 'id' => (int) $inicio->ID );
		}
		$loja = get_page_by_path( 'loja' );
		if ( $loja ) {
			$itens[] = array( 'titulo' => 'Loja', 'id' => (int) $loja->ID );
		}
		$contato = get_page_by_path( 'contato' );
		if ( $contato ) {
			$itens[] = array( 'titulo' => 'Contato', 'id' => (int) $contato->ID );
		}
		if ( function_exists( 'wc_get_page_id' ) ) {
			$conta = wc_get_page_id( 'myaccount' );
			if ( $conta ) {
				$itens[] = array( 'titulo' => 'Minha conta', 'id' => (int) $conta );
			}
		}

		foreach ( $itens as $item ) {
			$existe = self::menu_tem_item( $menu_id, $item['id'] );
			if ( ! $existe ) {
				wp_update_nav_menu_item(
					$menu_id,
					0,
					array(
						'menu-item-title'     => $item['titulo'],
						'menu-item-object'    => 'page',
						'menu-item-object-id' => $item['id'],
						'menu-item-type'      => 'post_type',
						'menu-item-status'    => 'publish',
					)
				);
			}
		}

		// Atribui às localizações do Astra (desktop + mobile).
		$atribuicoes = array(
			'primary'      => $menu_id,
			'mobile_menu'  => $menu_id,
		);
		if ( function_exists( 'wp_set_nav_menu_locations' ) ) {
			wp_set_nav_menu_locations( $atribuicoes );
		} else {
			set_theme_mod( 'nav_menu_locations', $atribuicoes );
		}
	}

	/**
	 * Verifica se o menu já tem item apontando para o object_id.
	 *
	 * @param int $menu_id ID do menu.
	 * @param int $object_id ID da página.
	 * @return bool
	 */
	private static function menu_tem_item( $menu_id, $object_id ) {
		$itens = wp_get_nav_menu_items( $menu_id );
		if ( ! $itens ) {
			return false;
		}
		foreach ( $itens as $item ) {
			if ( 'page' === $item->object && (int) $item->object_id === $object_id ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Definições das páginas da loja: Início (vitrine) e institucionais.
	 *
	 * Conteúdo em HTML puro + shortcodes do plugin (sem Gutenberg).
	 *
	 * @return array<string,array{titulo:string,conteudo:string}>
	 */
	private static function paginas() {
		$loja = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/loja/' );

		return array(
			'inicio'                => array(
				'titulo'   => 'Início',
				'conteudo' => self::conteudo_inicio(),
			),
			'sobre'                 => array(
				'titulo'   => 'Sobre nós',
				'conteudo' => self::conteudo_sobre(),
			),
			'termos-e-condicoes'    => array(
				'titulo'   => 'Termos e condições',
				'conteudo' => self::conteudo_termos(),
			),
			'politica-de-privacidade' => array(
				'titulo'   => 'Política de privacidade',
				'conteudo' => self::conteudo_privacidade(),
			),
			'faq'                   => array(
				'titulo'   => 'Perguntas frequentes',
				'conteudo' => self::conteudo_faq(),
			),
			'trocas-e-devolucoes'   => array(
				'titulo'   => 'Trocas e devoluções',
				'conteudo' => self::conteudo_trocas(),
			),
			'contato'               => array(
				'titulo'   => 'Contato',
				'conteudo' => self::conteudo_contato(),
			),
		);
	}

	/**
	 * Home da vitrine: módulos do plugin (hero, perks, banners, categorias, kids).
	 *
	 * @return string
	 */
	private static function conteudo_inicio() {
		return '[tm_hero]

<section class="tmv-perks">
	<div class="tmv-perks-inner">
		<div class="tmv-perk">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c1.6 2 3.6 3.2 5.5 4.6 1.8 1.3 2.8 2.7 2.8 4.9 0 3.4-2.4 5.5-4.9 5.9 1.3.8 2.6 1.3 3.6 2H5c1-.7 2.3-1.2 3.6-2C6.1 18 3.7 15.9 3.7 12.5c0-2.2 1-3.6 2.8-4.9C8.4 6.2 10.4 5 12 3z"/><circle cx="9" cy="11.5" r="1"/><circle cx="15" cy="11.5" r="1"/></svg>
			<strong>Seleção própria</strong>
			<span>Peças versáteis escolhidas a dedo e conferidas uma a uma.</span>
		</div>
		<div class="tmv-perk">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
			<strong>Frete para todo o Brasil</strong>
			<span>Envio rápido e rastreio simplificado para cada pedido.</span>
		</div>
		<div class="tmv-perk">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8"/><path d="M3 8h18v4H3z"/><path d="M12 8v13"/></svg>
			<strong>Troca em 7 dias</strong>
			<span>Pagamento seguro via Pix, cartão e boleto.</span>
		</div>
		<div class="tmv-perk">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z"/><path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9z"/></svg>
			<strong>Moda circular</strong>
			<span>Peças únicas com novo começo — do trabalho ao fim de semana.</span>
		</div>
	</div>
</section>

[tm_banners titulo="Destaques da semana" autoplay="5"]

<section class="tmv-band tmv-band--areia tm-fullbleed">
	<div class="tmv-band-inner">
		<h2 class="tm-secao-titulo">Categorias<span class="tmv-ornamento">✦</span></h2>
		[tm_categorias colunas="4" limit="4" contagem="1"]
	</div>
</section>

<section class="tmv-band tmv-band--kids tm-fullbleed">
	<div class="tmv-band-inner">
		[tm_kids]
	</div>
</section>';
	}

	/**
	 * Página Sobre nós.
	 *
	 * @return string
	 */
	private static function conteudo_sobre() {
		return '<section class="tmv-pagina-intro">
	<h2>Sobre a Todday Modas</h2>
	<p>A Todday Modas é um brechó de curadoria: selecionamos peças versáteis, em bom estado e com bom preço, para quem quer se vestir bem sem abrir mão da consciência — ou do bolso. Cada peça é escolhida a dedo, conferida e preparada para ganhar uma nova história.</p>
	<p>Nossa curadoria busca o equilíbrio entre estilo e praticidade: do trabalho ao fim de semana, com foco em tecidos confortáveis, modelagens atemporais e combinações fáceis.</p>
</section>

<section>
	<h2>Moda circular de verdade</h2>
	<p>Acreditar em moda circular é dar novo valor ao que já existe. Ao comprar de segunda mão, você reduz o desperdício, evita produção desnecessária e ajuda a construir um consumo mais consciente.</p>
	<ul>
		<li>Peças únicas e selecionadas uma a uma;</li>
		<li>Qualidade e limpeza verificadas antes de postar;</li>
		<li>Preços justos para peças seminovas;</li>
		<li>Envio cuidadoso para todo o Brasil.</li>
	</ul>
</section>

<section>
	<h2>Nossa seleção</h2>
	<p>Dividimos o acervo por categorias para facilitar a busca. A curadoria busca agradar desde o clássico básico até looks mais ousados, sempre com o equilíbrio entre custo e qualidade.</p>
</section>';
	}

	/**
	 * Página Termos e condições.
	 *
	 * @return string
	 */
	private static function conteudo_termos() {
		$loja = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/loja/' );
		return '<section class="tmv-pagina-intro">
	<h2>Termos e condições de uso</h2>
	<p>Este documento estabelece as condições de uso do site e das compras na toddaymodas.com.br. Ao navegar pela loja ou realizar um pedido, você concorda com os termos abaixo.</p>
</section>

<section>
	<h2>1. Sobre a loja</h2>
	<p>A Todday Modas comercializa peças seminovas selecionadas, em loja virtual operada sobre a plataforma WooCommerce. As descrições de cada produto refletem o estado real da peça, incluindo medidas e eventuais sinais de uso.</p>
</section>

<section>
	<h2>2. Preços e pagamento</h2>
	<ul>
		<li>Os preços exibidos são os oficiais do momento da compra;</li>
		<li>Entregamos por meio de <a href="' . esc_url( $loja ) . '">nosso processo de checkout</a> de forma segura;</li>
		<li>Meios de pagamento: Pix, cartões de crédito (Visa, Master, Elo, Amex, Hipercard) e boleto bancário;</li>
		<li>Situações de taxas em boleto ou cartão seguem as regras da operadora no momento da compra.</li>
	</ul>
</section>

<section>
	<h2>3. Envio e prazo</h2>
	<p>O prazo de postagem começa a contar após a confirmação do pagamento. O rastreio é informado por e-mail assim que disponível. Atrasos de transportadora e variações de prazo regional não são de nossa responsabilidade após a postagem.</p>
</section>

<section>
	<h2>4. Trocas e devoluções</h2>
	<p>O direito de arrependimento e as regras de troca seguem o Código de Defesa do Consumidor e estão detalhados na página <a href="' . esc_url( home_url( '/trocas-e-devolucoes/' ) ) . '">Trocas e devoluções</a>.</p>
</section>

<section>
	<h2>5. Uso do site</h2>
	<p>É proibido o uso do site para fins ilícitos, raspagem de dados (scraping) ou qualquer atividade que comprometa a segurança e o funcionamento da loja. Conteúdo e marca são de propriedade da Todday Modas.</p>
</section>

<section>
	<h2>6. Contato</h2>
	<p>Dúvidas sobre estes termos? Fale com a gente pela página <a href="' . esc_url( home_url( '/contato/' ) ) . '">Contato</a>.</p>
</section>';
	}

	/**
	 * Página Política de privacidade (LGPD).
	 *
	 * @return string
	 */
	private static function conteudo_privacidade() {
		return '<section class="tmv-pagina-intro">
	<h2>Política de privacidade</h2>
	<p>A sua privacidade é importante para nós. Esta política explica quais dados coletamos, para que servem e como você pode exercer seus direitos (LGPD — Lei 13.709/2018).</p>
</section>

<section>
	<h2>1. Dados que coletamos</h2>
	<ul>
		<li>Dados de cadastro: nome, e-mail, telefone e CPF quando necessários para a entrega e a nota fiscal;</li>
		<li>Dados de compra: endereço, histórico de pedidos e preferências de navegação;</li>
		<li>Dados técnicos: endereço IP, navegador e dispositivo, coletados para segurança e estatística;</li>
		<li>Dados de cookies: utilizamos cookies essenciais para o funcionamento da loja e de desempenho com base no seu consentimento.</li>
	</ul>
</section>

<section>
	<h2>2. Para que usamos</h2>
	<ul>
		<li>Processar pedidos e entregas;</li>
		<li>Emitir notas fiscais e cumprir obrigações legais;</li>
		<li>Prevenir fraudes e garantir a segurança do site;</li>
		<li>Melhorar a experiência de compra;</li>
		<li>Comunicar novidades e ofertas, apenas com autorização.</li>
	</ul>
</section>

<section>
	<h2>3. Compartilhamento</h2>
	<p>Compartilhamos dados apenas com os serviços essenciais à operação (pagamento, transporte e hospedagem), sempre dentro do necessário e com os mesmos padrões de proteção. Não vendemos dados pessoais.</p>
</section>

<section>
	<h2>4. Seus direitos</h2>
	<p>Você pode solicitar acesso, correção, exclusão, portabilidade ou o fim do tratamento dos seus dados pelo nosso canal de Contato, identificando-se para confirmação. Respondemos em até 15 dias.</p>
</section>

<section>
	<h2>5. Segurança e retenção</h2>
	<p>Utilizamos conexão segura (SSL), controle de acesso e boas práticas de segurança. Guardamos seus dados pelo tempo necessário às finalidades ou exigência legal, e então os descartamos com segurança.</p>
</section>

<section>
	<h2>6. Contato do encarregado</h2>
	<p>Para exercer seus direitos, fale com nosso canal de atendimento pela página <a href="' . esc_url( home_url( '/contato/' ) ) . '">Contato</a>.</p>
</section>';
	}

	/**
	 * Página Perguntas frequentes.
	 *
	 * @return string
	 */
	private static function conteudo_faq() {
		return '<section class="tmv-pagina-intro">
	<h2>Perguntas frequentes</h2>
	<p>Reunimos as dúvidas mais comuns sobre a loja. Não encontrou a sua? Fale com a gente pelo <a href="' . esc_url( home_url( '/contato/' ) ) . '">Contato</a>.</p>
</section>

<section>
	<h2>As peças são usadas ou novas?</h2>
	<p>Somos um brechó de curadoria. A maioria das peças é seminova, em ótimo estado e preparada com carinho. Cada anúncio descreve o estado real da peça, com medidas e eventuais sinais de uso.</p>
</section>

<section>
	<h2>Quais as formas de pagamento?</h2>
	<p>Aceitamos Pix (aprovação imediata), cartões de crédito (Visa, Master, Elo, Amex e Hipercard) e boleto bancário, com pagamento seguro via Mercado Pago.</p>
</section>

<section>
	<h2>Quanto tempo leva para enviar?</h2>
	<p>Postamos em até 2 dias úteis após a confirmação do pagamento e enviamos o código de rastreio por e-mail. O prazo de entrega depende da transportadora e da sua região.</p>
</section>

<section>
	<h2>Qual o prazo de troca?</h2>
	<p>Você tem 7 dias corridos após o recebimento para solicitar troca ou devolução, conforme detalhado em <a href="' . esc_url( home_url( '/trocas-e-devolucoes/' ) ) . '">Trocas e devoluções</a>.</p>
</section>

<section>
	<h2>Como acompanho meu pedido?</h2>
	<p>Assim que o pedido for postado, enviamos o código de rastreio por e-mail. Você acompanha direto no site da transportadora ou na área "Minha conta".</p>
</section>

<section>
	<h2>Posso devolver por arrependimento?</h2>
	<p>Sim. Pelo CDC, você pode desistir da compra em até 7 dias corridos após o recebimento, sem justificativa, e receber o reembolso integral.</p>
</section>';
	}

	/**
	 * Página Trocas e devoluções.
	 *
	 * @return string
	 */
	private static function conteudo_trocas() {
		return '<section class="tmv-pagina-intro">
	<h2>Trocas e devoluções</h2>
	<p>Queremos que você fique satisfeita com a sua peça. Se algo não ficar bom, veja abaixo como trocar ou devolver com tranquilidade.</p>
</section>

<section>
	<h2>1. Troca por tamanho ou modelo</h2>
	<ul>
		<li>Você tem <strong>7 dias corridos após o recebimento</strong> para solicitar troca;</li>
		<li>A peça deve estar sem uso, sem sinais de dano, com as etiquetas e na embalagem original;</li>
		<li>Se o valor for diferente, o ajuste é feito por diferença de preço;</li>
		<li>A troca está sujeita à disponibilidade do item desejado.</li>
	</ul>
</section>

<section>
	<h2>2. Direito de arrependimento (desistência)</h2>
	<p>Pelo <strong>Código de Defesa do Consumidor</strong>, você pode desistir da compra em até <strong>7 dias corridos após o recebimento</strong>, sem precisar justificar. O reembolso é integral, na mesma forma de pagamento, em até 5 dias úteis após a confirmação do recebimento da devolução.</p>
</section>

<section>
	<h2>3. Como solicitar</h2>
	<ol>
		<li>Envie sua solicitação pela página <a href="' . esc_url( home_url( '/contato/' ) ) . '">Contato</a>, informando o número do pedido e o motivo;</li>
		<li>Nossa equipe retorna em até 1 dia útil com as instruções de envio;</li>
		<li>Após o recebimento e conferência da peça, processamos a troca ou o reembolso.</li>
	</ol>
</section>

<section>
	<h2>4. Produto com defeito ou divergente</h2>
	<p>Se a peça chegou com defeito ou divergente do anúncio, o custo do frete de devolução é por nossa conta. Reporte em até 7 dias do recebimento com fotos, se possível.</p>
</section>

<section>
	<h2>5. Casos em que não aceitamos</h2>
	<ul>
		<li>Peças usadas, lavadas ou com odor de perfume;</li>
		<li>Ausência da embalagem ou etiquetas originais;</li>
		<li>Solicitações após o prazo de 7 dias corridos.</li>
	</ul>
</section>';
	}

	/**
	 * Página Contato (form do plugin).
	 *
	 * @return string
	 */
	private static function conteudo_contato() {
		return '<section class="tmv-pagina-intro">
	<h2>Fale com a gente</h2>
	<p>Precisa de ajuda com um pedido, quer saber sobre uma peça ou tem uma sugestão? Envie sua mensagem pelo formulário abaixo. Respondemos em até 1 dia útil.</p>
</section>

[tm_contato]';
	}
}