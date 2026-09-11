=== Todday Modas Brechó ===
Contributors: tselaksolutions
Donate link: https://tselak.com.br
Tags: woocommerce, brecho, vintage, mercadopago, melhorenvio, viacep, elementor, pwa
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 8.1
Stable tag: 1.0.1
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
* **Painel de Gestão SPA (/todday-painel/)**:
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
5. O painel SPA estará disponível na URL `https://seusite.com.br/todday-painel/`.

== Frequently Asked Questions ==

= O plugin funciona sem WooCommerce? =
O plugin ativa sem quebrar o site, mas exibirá um aviso no painel informando que o WooCommerce é necessário para as operações comerciais (produtos, pedidos e checkout).

= O painel SPA requer login do WordPress? =
Sim. O painel utiliza autenticação real baseada em cookies de sessão do WordPress e validação rigorosa de permissões (matriz de capacidades) no servidor.

== Changelog ==

= 1.0.1 =
* Segurança: bloqueio de IDOR em /orders/{id} e /orders/{id}/pdf (acesso restrito a dono, vendedor atribuído ou gerente).
* Segurança: webhook Melhor Envio exige assinatura HMAC-SHA256 (header X-Todday-Signature) e falha fechado quando não configurado.
* Segurança: frete no checkout revalidado no servidor (ignora price enviado pelo cliente e usa cotação Melhor Envio/tarifa fixa).
* Segurança: escaping HTML no frontend (XSS via nome de produto/opções de frete eliminado).
* Segurança: resposta genérica no recuperar senha (evita enumeração de usuários).

= 1.0.0 =
* Lançamento inicial de produção.
* Suporte a HPOS, ViaCEP, Melhor Envio e Mercado Pago.
* Painéis SPA de gestão, vendedor e cliente.
* Widgets Elementor e PWA.
