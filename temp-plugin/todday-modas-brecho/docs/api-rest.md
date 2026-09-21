# Contrato REST API — Namespace `todday/v1`

Todas as respostas seguem o padrão padronizado:
- Sucesso: `{ "success": true, "data": { ... } }`
- Erro: `{ "success": false, "code": "string", "message": "string" }`

## 1. Autenticação
- `POST /todday/v1/auth/login` — Autentica via cookie real do WordPress.
- `POST /todday/v1/auth/register` — Cria conta de cliente real.
- `POST /todday/v1/auth/lost-password` — Dispara recuperação de senha.
- `GET /todday/v1/auth/me` — Retorna dados do usuário autenticado.

## 2. Catálogo e Produtos
- `GET /todday/v1/catalog` — Vitrine pública com filtros (categoria, busca, preço, condição brechó, ordenação, paginação).
- `GET /todday/v1/catalog/taxonomies` — Categorias e condições disponíveis.
- `GET /todday/v1/catalog/products/{id}` — Detalhes completos de uma peça.

## 3. Carrinho
- `GET /todday/v1/cart` — Itens da sacola, subtotal e descontos.
- `POST /todday/v1/cart/add` — Adiciona produto com verificação de estoque.
- `POST /todday/v1/cart/update` — Atualiza quantidade.
- `POST /todday/v1/cart/remove` — Remove item.
- `POST /todday/v1/cart/apply-coupon` — Aplica cupom WooCommerce.

## 4. Checkout e Envio
- `POST /todday/v1/shipping/quote` — Consulta CEP no ViaCEP e cota frete no Melhor Envio.
- `POST /todday/v1/checkout/place` — Cria pedido real no WooCommerce HPOS.
- `POST /todday/v1/checkout/payment` — Processa pagamento via Mercado Pago (PIX / Cartão).

## 5. Pedidos e Relatórios
- `GET /todday/v1/orders` — Listagem filtrada por matriz de capacidades.
- `GET /todday/v1/orders/{id}` — Detalhes do pedido.
- `PUT /todday/v1/orders/{id}/status` — Atualização de status.
- `GET /todday/v1/orders/{id}/pdf` — Emissão server-side de PDF.
- `POST /todday/v1/orders/{id}/notify` — Disparo de notificação WhatsApp / E-mail.
- `GET /todday/v1/reports/summary` — KPIs e receita para o Chart.js.

## 6. Webhooks
- `POST /todday/v1/webhooks/mp` — Webhook Mercado Pago com validação HMAC e idempotência.
- `POST /todday/v1/webhooks/me` — Webhook Melhor Envio com rastreamento.
