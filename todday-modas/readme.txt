=== Todday Modas ===
Contributors: tselaksolutions
Tags: woocommerce, elementor, mercado-pago, moda, loja
Requires at least: 6.4
Tested up to: 6.9
Requires PHP: 8.1
Requires Plugins: woocommerce
Stable tag: 1.0.28
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Painéis administrativos, identidade visual e integrações da loja Todday Modas. Estende o WooCommerce e integra com Elementor e Mercado Pago.

== Descrição ==

Plugin oficial da loja Todday Modas. Estende o WooCommerce e integra com Elementor e Mercado Pago.

**Painéis administrativos:**
* Dashboard (vendas do dia, pedidos pendentes, estoque baixo)
* Configurações da Marca (logo, paleta de cores, tipografia)
* Gestão de Banners (upload, link, ordem, agendamento)
* Cupons e Promoções (interface simplificada sobre WC_Coupon)
* Relatórios (vendas 30 dias, top produtos)
* Configurações de Frete (frete grátis + atalhos das zonas)
* Integrações (Mercado Pago com credenciais criptografadas, WhatsApp, e-mail marketing)
* Logs & Segurança (eventos, logins falhos, alterações críticas)

**Vitrine da loja:**
* Shortcode `[tm_banners]` — slider de banners ativos (agendados)
* Shortcode `[tm_cupons]` — vitrine de cupons válidos com botão copiar
* Shortcode `[tm_categorias]` — grade de categorias com foto e contagem
* Shortcode `[tm_contato]` — formulário com nonce, honeypot e rate-limit

**Widgets Elementor:**
* TM Produto em Destaque
* TM Banner com CTA
* TM Grade de Categorias
* TM Cupons
* TM Banners (slider)

**Extras:**
* Paleta de cores como variáveis CSS (`--tm-*`) em todo o front
* Header com efeito vidro ao rolar + barra de app mobile
* Busca em tela cheia (app bar mobile e header desktop)
* Botão flutuante de WhatsApp
* Aviso de frete grátis acima de valor configurável
* Selos de confiança no checkout
* E-mails transacionais com as cores da marca
* Template 404 personalizado
* PWA (manifest + service worker + ícones reais)
* SEO: Open Graph, Twitter Card, JSON-LD de loja e meta description automática
* Compatível com HPOS

== Instalação ==

1. Envie a pasta `todday-modas` para `/wp-content/plugins/`
2. Ative o plugin no menu "Plugins"
3. Acesse o menu "Todday Modas" no wp-admin
4. Em "Configurações da Marca" ajuste logo, cores e fontes
5. Cadastre banners em "Gestão de Banners" e exiba com `[tm_banners]` ou o widget Elementor

== Changelog ==

= 1.0.28 =
* O plugin agora É o backup da estrutura do site: ao ser instalado/atualizado, cria automaticamente a página Início (hero, perks, banners, categorias e Kids), as páginas institucionais (Sobre, Termos, Política de privacidade, FAQ, Trocas e devoluções e Contato) e o menu principal, além de configurar a página inicial estática do WordPress. Banco recriado ou ambiente novo reconstroi o site sozinho.
* Correção: shortcode [tm_kids] estourava erro fatal quando a categoria Kids não existia — agora usa fallback para a vitrine.

= 1.0.11 =
* Painel de gestão vira PWA instalável: manifest "Todday Gestão", service worker com escopo /painel-todday/, botão "Instalar App" na barra lateral e splash com a logo da marca.
* Ícones de gestão novos (monograma T da marca, 180/192/512).

= 1.0.10 =
* NOVO: Painel de Gestão dedicado (fork do painel Zaya, adaptado à marca Todday) — a dona NÃO precisa entrar no WordPress.
* Endereço: /painel-todday/ com login próprio na identidade da marca (aparece 404 para quem não tem acesso).
* Papel "Gerente Todday": usuária com esse papel é redirecionada ao painel e bloqueada do wp-admin.
* Telas: Painel (métricas do dia/mês), Produtos (listar, criar, editar com fotos e categorias, excluir), Categorias (criar/editar), Pedidos (listar, detalhe, mudar status, rastreio).
* Paleta recolhida para a identidade brechó (terracota/champagne/café) nos temas claro e escuro.

= 1.0.9 =
* Menu principal agora tem o item "Categorias" com submenu (Vestidos, Camisetas, Calças, Calçados, Acessórios, Kids). 100% dinâmico: criar uma categoria nova no WooCommerce e ela aparece no menu automaticamente.
* Menu mobile corrigido: o Astra estava usando uma lista automática de páginas soltas; agora usa o mesmo Menu Principal, com o submenu de categorias expansível.

= 1.0.8 =
* Correção: faixas full-bleed (Kids, areia, oferta) saíam 40px antes da borda direita no mobile — card "Coleção Kids em breve" ficava deslocado. Agora a faixa ocupa a largura total e o card fica centralizado de verdade.
* Popup de cupom redesenhado: moldura degradê champagne→terracota, selo com anel dourado, box "Seu cupom" em destaque, título em tipografia da marca.

= 1.0.7 =
* Cupom de boas-vindas agora em POPUP elegante (1x por sessão), com código para copiar e CTA para a loja — seção de cupons removida da home.
* Responsividade: guarda anti-overflow global + grade de produtos/categorias sempre alinhada (mesmas dimensões por linha, botão na base, imagens 1:1). Nada sai da tela no celular.

= 1.0.6 =
* Correção: botões do hero (v.tmv-btn) com texto na mesma cor do fundo — visibilidade forçada.
* Correção: menu hambúrguer do mobile em azul — agora na cor da marca (café).
* Acabamento de identidade (sutil): fita terracota→champagne em categorias e cards de produto, faixa champagne na base do hero, barra degradê no topo do rodapé, inputs com foco na paleta, seleção de texto em terracota.
* Cache-Control: no-cache no HTML do front (navegador sempre revalida a página; CSS/JS seguem com cache-busting por filemtime).
* Marcador de versão discreto no rodapé.

= 1.0.5 =
* Seção Kids: categoria de produto Kids + faixa na home (shortcode [tm_kids] com estado elegante em breve até haver produtos).
* Identidade forte: faixas coloridas na home (areia, champagne e terracota suave), fundo com brilho da paleta, ornamento nos títulos.
* Remoção de TODOS os azuis de tema/menus/links/botões Elementor (paleta da marca em tudo).
* Correção crítica: overlay de busca invisível bloqueava todos os cliques do site (hidden vs display:flex).
* Selo do hero redesenhado (anel pontilhado sutil, sem girar o conteúdo).
* Badge do carrinho atualiza ao adicionar via AJAX (header e app bar).
* Categorias sem foto agora usam a foto do primeiro produto da categoria.
* Logo do header recortada (marca 3-4x maior sem aumentar o header).

= 1.0.4 =
* Slider de banners ativos no front: shortcode [tm_banners] + widget Elementor TM Banners.
* SEO profissional: JSON-LD de loja, Open Graph/Twitter Card, meta description automática e favicon da marca.
* Header refinado: badge de itens no carrinho, busca em tela cheia no desktop, comportamento app-like apenas no mobile.
* Ícones PWA reais (192/512/180/32) com a identidade da marca; manifest e apple-touch corrigidos.
* Painel Branding e CSS do admin alinhados à identidade brechó (terracota + champagne); fallbacks de cor corrigidos.
* Logo SVG do plugin atualizada para a paleta oficial.
* Correção de acentuação (encoding UTF-8) na descrição do plugin e no readme.
* Acessibilidade: navegação do slider por teclado, pausa ao passar o mouse, foco visível.

= 1.0.3 =
* Identidade visual "brechó de curadoria": nova paleta (linho, expresso, terracota, champagne) e fontes Playfair Display + Inter.
* Migração automática da paleta antiga sem pisar em personalização do cliente.
* Faixa superior animada (marquee), barra de app mobile, animações de entrada suaves.
* Rodapé com ícones oficiais das bandeiras de pagamento (SVG locais, sem CDN).
* Logo da marca aplicada e tamanho controlado no header.

= 1.0.2 =
* Rodapé com ícones oficiais das bandeiras de pagamento (SVG locais, sem CDN).
* Logo da marca aplicada e tamanho controlado no header.

= 1.0.1 =
* Rodapé profissional da marca (colunas de links, formas de pagamento, selos de confiança).
* Shortcode [tm_categorias] e [tm_contato] (formulário com nonce, honeypot e rate-limit).
* Widget Elementor TM Cupons + shortcode [tm_cupons] com botão de copiar.
* Correções de catálogo (peso/dimensões/SKU/marca aplicados na loja).

= 1.0.0 =
* Versão inicial.
