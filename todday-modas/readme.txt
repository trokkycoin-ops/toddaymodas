=== Todday Modas ===
Contributors: Tselak Solutions
Tags: woocommerce, brecho, moda circular, elementor, mercado pago, cupons
Requires at least: 6.4
Tested up to: 6.7
Requires PHP: 8.1
Stable tag: 1.0.35
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Paineis administrativos, identidade visual e integracoes da loja Todday Modas (brecho de moda circular). Estende o WooCommerce e integra com Elementor e Mercado Pago.

== Description ==

Plugin oficial da boutique e brecho online Todday Modas.
Fornece vitrines editoriais, secoes especializadas, integracao com Mercado Pago, widgets Elementor, banner LGPD de consentimento e painel administrativo completo.

Shortcodes disponiveis:
* [tm_home] - Shortcode MASTER que renderiza a pagina inicial completa.
* [tm_hero] - Secao hero principal com slider editorial.
* [tm_categorias] - Grade visual de departamentos e categorias.
* [tm_banners] - Banners promocionais estrategicos.
* [tm_cupons] - Grid de cupons promocionais ativos.
* [tm_kids] - Vitrine especializada para moda infantil.
* [tm_contato] - Formulario seguro de contato com validacao nonce.

== Installation ==

1. Envie a pasta 'todday-modas' para o diretorio '/wp-content/plugins/' ou envie o arquivo 'todday-modas.zip' pelo painel do WordPress em Plugins > Adicionar Novo > Enviar Plugin.
2. Ative o plugin atraves do menu 'Plugins' no WordPress.
3. Certifique-se de que o WooCommerce esteja instalado e ativo.
4. Utilize o shortcode [tm_home] na sua pagina inicial.

== Changelog ==

= 1.0.35 =
* Layout oficial assumido: assets publicos do bundle de producao (tm-front.css/js) adotados como referencia de vitrine, com enqueue editorial preservado.
* Gateway Mercado Pago adicionado (includes/integrations/mercadopago/class-mp-gateway.php).
* Setup de estrutura (pags institucionais, menu e show_on_front) preservado do release 1.0.34.

= 1.0.28 =
* Adicionado shortcode master [tm_home] com controle individual de secoes via show_*.
* Correcao da criacao de tabelas em init com dbDelta.
* Compatibilidade declarada com HPOS (High-Performance Order Storage).
* Requisicao minima atualizada para WordPress 6.4 e PHP 8.1.
