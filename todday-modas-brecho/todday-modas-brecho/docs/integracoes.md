# Integrações Brasileiras — Todday Modas Brechó

## 1. Mercado Pago
- Suporte a PIX com QR Code dinâmico e código Copia e Cola.
- Suporte a Cartão de Crédito com parcelamento e tokenização.
- Tratamento de Webhook com verificação de assinatura HMAC-SHA256 (`x-signature`).
- Chave de idempotência (`X-Idempotency-Key`) em cada requisição de pagamento para evitar cobrança duplicada.
- Registro de logs de erro e alterações de status de pagamento.

## 2. Melhor Envio
- Integração com a API v2 oficial do Melhor Envio.
- Cotação em tempo real para Correios (PAC, SEDEX) e transportadoras parceiras (Jadlog, etc.).
- **Fallback Gracioso**: Se o token não for informado ou a API externa estiver fora do ar, o plugin automaticamente ativa o método de contingência local com taxa configurável pelo administrador, sem nunca travar o checkout do cliente.

## 3. ViaCEP
- Consulta em tempo real do logradouro, bairro, cidade e estado a partir do CEP informado pelo cliente.
- Cache com transiente do WordPress de 7 dias por CEP consultado, reduzindo requisições externas e acelerando a resposta.
- Degradação graciosa para digitação manual caso o serviço nacional apresente lentidão.

## 4. WhatsApp
- Links dinâmicos contextuais `https://wa.me/{numero}?text={mensagem}`.
- Botão flutuante na loja virtual com ícone SVG leve.
- Botão de acompanhamento direto no resumo do pedido do cliente e do painel.
