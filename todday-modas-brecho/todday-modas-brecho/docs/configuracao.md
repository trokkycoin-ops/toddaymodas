# Guia de Configuração — Todday Modas Brechó

## 1. Configuração do Mercado Pago
1. Acesse o **Painel de Gestão** (`/painel-gestao-tm/`) ou o menu **Todday Modas > Configurações**.
2. Na aba de integrações, selecione o ambiente (**Sandbox** para testes ou **Produção** para vendas reais).
3. Insira sua **Public Key** e **Access Token** obtidos no painel do Mercado Pago Developers.
4. Para ativar a validação de assinatura do Webhook, insira o **Webhook Secret Key**.
5. Configure a URL de Webhook no painel do Mercado Pago apontando para:
   `https://seusite.com.br/wp-json/todday/v1/webhooks/mp`

## 2. Configuração do Melhor Envio
1. Obtenha seu Token de Acesso da API do Melhor Envio (ambiente Sandbox ou Produção).
2. Insira o token no campo correspondente nas configurações.
3. Defina o **CEP de Origem** do brechó (de onde as encomendas serão despachadas).
4. Defina o valor de contingência (**Fallback Flat Rate**), que será usado graciosamente caso a API do Melhor Envio fique momentaneamente indisponível.

## 3. Configuração do WhatsApp
1. Insira o número oficial de WhatsApp no formato internacional completo com DDD (ex: `5511999998888`).
2. Defina a mensagem padrão para os clientes que clicarem no botão flutuante.
