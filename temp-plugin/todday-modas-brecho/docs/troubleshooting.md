# Resolução de Problemas (Troubleshooting)

## 1. Alerta: "WooCommerce precisa estar ativo"
- **Causa**: O plugin WooCommerce está desativado ou não foi instalado.
- **Solução**: Vá em **Plugins > Plugins Instalados** e ative o WooCommerce. O Todday Modas Brechó não gera erro fatal, mas degrada graciosamente até que o WooCommerce seja ativado.

## 2. Rota `/painel-gestao-tm/` retorna erro 404
- **Causa**: As regras de reescrita do WordPress não foram atualizadas.
- **Solução**: Acesse **Configurações > Links Permanentes** no wp-admin e clique em **Salvar Alterações** para forçar o recálculo dos permalinks.

## 3. CEP não preenche o endereço automaticamente
- **Causa**: O serviço dos Correios/ViaCEP pode estar instável ou o CEP digitado possui formato incorreto.
- **Solução**: Verifique se o CEP possui exatamente 8 dígitos. O formulário permite o preenchimento manual de qualquer campo caso a conexão externa falhe.

## 4. O frete do Melhor Envio não calcula
- **Causa**: Token de API ausente ou inválido.
- **Solução**: Verifique suas credenciais em **Todday Modas > Configurações**. Enquanto isso, o checkout utilizará automaticamente a taxa de contingência fixa definida.

## 5. Falha na geração do PDF do pedido
- **Causa**: Tentativa de acesso por usuário sem permissão.
- **Solução**: Apenas o comprador do pedido, o gerente ou o administrador possuem permissão no servidor para baixar o PDF.
