# Matriz de Permissões e Segurança

## Papéis e Capacidades no Servidor

| Recurso / Módulo | Administrador (`manage_options`) | Gerente (`todday_gerente_panel`) | Vendedor (`todday_vendedor_panel`) | Cliente (`customer`) |
|---|---|---|---|---|
| **Configurações Globais e Chaves de API** | ✓ | ✗ | ✗ | ✗ |
| **Dashboard e Métricas de Vendas** | ✓ | ✓ | Somente atribuídos a ele | ✗ |
| **Listagem e Status de Pedidos** | ✓ | ✓ | Somente atribuídos a ele | Somente os próprios |
| **Emissão de PDF de Fatura/Recibo** | ✓ | ✓ | Somente atribuídos a ele | Somente os próprios |
| **Gestão de Produtos e Estoque** | ✓ | ✓ | ✗ | ✗ |
| **Importação / Exportação CSV** | ✓ | ✓ | ✗ | ✗ |
| **Gestão de Cupons de Desconto** | ✓ | ✓ | ✗ | ✗ |
| **Logs de Auditoria do Sistema** | ✓ | ✓ | ✗ | ✗ |
| **Meus Pedidos e Perfil** | — | — | — | ✓ |

## Regras Críticas de Segurança:
- O frontend nunca é utilizado como mecanismo de segurança: todas as rotas da API REST validam `permission_callback` no backend.
- Chaves de acesso sensíveis (Access Tokens) são criptografadas em repouso no banco de dados via AES-256-CBC com sal do WordPress (`wp_salt`).
- Requisições REST autenticadas por cookie exigem o cabeçalho `X-WP-Nonce`.
