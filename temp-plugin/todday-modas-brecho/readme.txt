=== Todday Modas Brechó ===
Contributors: tselaksolutions
Donate link: https://tselak.com.br
Tags: woocommerce, brecho, vintage, mercadopago, melhorenvio, viacep, elementor, pwa
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 8.1
Stable tag: 1.0.16
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Loja virtual premium sobre WooCommerce para Todday Modas Brechó. Catálogo customizado, checkout com ViaCEP, Melhor Envio e Mercado Pago, painéis SPA fora do wp-admin, PWA e widgets Elementor.

== Description ==

O plugin **Todday Modas Brechó** transforma uma instalação padrão do WordPress + WooCommerce + Elementor em uma experiência sofisticada de brechó e moda circular.

### Funcionalidades Principais:
* **Catálogo Customizado**: Vitrine moderna com filtros rápidos (categorias, condição da peça brechó, ordenação, busca instantânea).
* **Checkout Brasileiro Integrado**:
  - Consulta automática de endereço via ViaCEP.
  - Cálculo de frete dinâmico via Melhor Envio (SEDEX, PAC, transportadoras) com fallback nativo controlado.
  - Gateway de pagamento Mercado Pago nativo com suporte a PIX instantâneo e Cartão de Crédito.
* **Compatibilidade HPOS**: 100% compatível com WooCommerce High-Performance Order Storage (HPOS).
* **Painel de Gestão SPA (/painel-gestao-tm/)**:
  - Painel autônomo fora do wp-admin para Gerentes e Administradores.
  - Gráficos nativos com Chart.js local (sem CDN externo).
  - Emissão de fatura/recibo em PDF server-side embutido.
  - Gestão de pedidos, estoque, clientes e cupons nativos do WooCommerce.
* **Painel do Vendedor (/todday-vendedor/)**: Acompanhamento exclusivo de comissões e pedidos vinculados ao operador.
* **Painel do Cliente (/todday-cliente/)**: Rastreamento de pedidos, histórico e avaliações.
* **PWA Instalável**: Manifest e Service Worker registrados sob HTTPS na loja e nos painéis.
* **Widgets Elementor**: Vitrine Todday, Carrinho Todday, Checkout Todday e Botão Flutuante de WhatsApp.

== Installation ==

1. Faça o upload do arquivo `todday-modas-brecho.zip` em **Plugins > Adicionar Novo > Enviar Plugin** no seu painel WordPress.
2. Clique em **Instalar Agora** e, em seguida, em **Ativar Plugin**.
3. Certifique-se de que o **WooCommerce** esteja ativo.
4. Acesse o menu **Todday Modas > Configurações** para configurar suas credenciais do Mercado Pago e Melhor Envio.
5. O painel SPA estará disponível na URL `https://seusite.com.br/painel-gestao-tm/`.

== Frequently Asked Questions ==

= O plugin funciona sem WooCommerce? =
O plugin ativa sem quebrar o site, mas exibirá um aviso no painel informando que o WooCommerce é necessário para as operações comerciais (produtos, pedidos e checkout).

= O painel SPA requer login do WordPress? =
Sim. O painel utiliza autenticação real baseada em cookies de sessão do WordPress e validação rigorosa de permissões (matriz de capacidades) no servidor.

== Changelog ==

= 1.0.16 =
* Botão flutuante de WhatsApp restrito à página da loja (não aparece mais em posts, páginas institucionais e erros 404) e com o estilo de flutuação correto (posição fixa, verde WhatsApp, canto inferior direito) — o ícone antes era renderizado em todas as páginas sem o CSS de posicionamento, aparecendo estático no fim da página.
* Correção de layout: botão de WhatsApp agora carrega o estilo de posicionamento junto com os assets da loja.

= 1.0.15 =
* Painel de gestão acessível via URL privada /painel-gestao-tm/ — protegido por senha própria, sem depender de login no WordPress; a URL não aparece em nenhum menu público.
* Senha do painel: gerada automaticamente na primeira visita (aparece apenas uma vez) e definível em wp-admin → Configurações → Senha do painel de gestão (mínimo 8 caracteres).
* Botão de download do plugin (/todday-download/) agora também é restrito ao dono da loja.
* Corrigida a referência residual ao slug antigo (/todday-painel/) dentro do bundle JavaScript.

* Formulário de checkout sem dados de demonstração (não aparece mais o pedido fictício "Camila Albuquerque"); paginação e endereço começam em branco.
* Página de "obrigado" (confirmação da compra) só abre após a confirmação do pagamento: enquanto o pedido está aguardando pagamento, o cliente vê um aviso honesto com consulta automática do status; texto de processamento coerente e textos do PIX corrigidos.
* Resíduos de dados de demonstração (pedidos, logs e configuração falsos) removidos dos painéis.

= 1.0.13 =
* Segurança: webhook do Mercado Pago exige assinatura HMAC quando o segredo está configurado e confirma o valor pago antes de aprovar pedidos; webhook do Melhor Envio exige token de autenticação; check-out recalcula o frete no servidor, cria pedido com e-mail da conta logada e limita requisições; pagamento só nos pedidos do próprio cliente e sem duplicar pagos; avaliações só com compra verificada (moderação) e nota 1–5; preços negativos bloqueados; proteção contra injeção de fórmula em CSV; senha de webhook salva criptografada; login com limite de tentativas.
* Confiança: sem pedido fantasma no checkout (falha honesta em vez de "pago" falso); texto de status corrigido para "Aguardando pagamento".

= 1.0.12 =
* Removidas as setas sobre as imagens do carrossel do hero (ele já passa sozinho e mantém as bolinhas de navegação).

= 1.0.11 =
* Botões de banner mais discretos em lilás; ícone da seta do botão "voltar ao topo" em lilás claro.

= 1.0.10 =
* Botões "Banner Anterior"/"Próximo Banner" do carrossel na cor da marca (roxo).

= 1.0.9 =
* Botão "voltar ao topo": seta centralizada no círculo (flexbox) em todas as páginas e dispositivos.

= 1.0.8 =
* Botão "voltar ao topo": seta centralizada no círculo.

= 1.0.7 =
* Botão flutuante "voltar ao topo" (scroll-to-top do Astra) na cor da marca (roxo) — corrige o azul herdado do tema.

= 1.0.6 =
* Barra de rolagem de todo o site na cor da marca (roxo Todday) — corrige o azul herdado do tema Astra.

= 1.0.5 =
* Botão "Ir para meus pedidos" do checkout agora abre a página dedicada /todday-cliente/ (não expõe painel na vitrine).
* Página de download mostra o tamanho real do pacote e calcula o SHA-256 do arquivo baixado.

= 1.0.4 =
* Painéis separados em páginas dedicadas: /todday-painel/, /todday-vendedor/, /todday-cliente/, /todday-download/ e /todday-docs/.
* Removido o acesso público aos painéis na vitrine (sem modal de PIN nem botões de equipe).
* Painéis ligados em tempo real à REST (pedidos, produtos, clientes, logs e configurações).
* Novos endpoints REST: criar/editar e excluir produto.
* Página de download gera o pacote .zip do próprio plugin.

= 1.0.3 =
* Bundle React do storefront sincronizado com o app (botão de download do plugin atualizado para o pacote de produção).
* Nome do zip de download corrigido para 218 KB e checksum SHA-256 real.

= 1.0.2 =
* Correção do conflito com o tema: CSS do app sem cascade layers e isolamento do storefront (esconde header/footer do tema Astra na loja).
* Assets do app carregados somente na página da loja.

= 1.0.1 =
* Front da loja substituído pelo app React lilás exportado do AI Studio (bundle em assets/react/).
* Catálogo, frete e checkout ligados às rotas REST reais do plugin (catalog, shipping/quote, checkout/place).
* Aliases de shortcodes legados tm_home, tm_carrinho, tm_checkout e tm_contato.

= 1.0.0 =
* Lançamento inicial de produção.
* Suporte a HPOS, ViaCEP, Melhor Envio e Mercado Pago.
* Painéis SPA de gestão, vendedor e cliente.
* Widgets Elementor e PWA.
