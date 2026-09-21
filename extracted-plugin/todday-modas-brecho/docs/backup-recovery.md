# Backup e Procedimentos de Restauração

## Política de Não Destrutividade
- A desativação do plugin **nunca** apaga dados de pedidos, clientes ou configurações.
- A desinstalação só remove a tabela de auditoria `todday_activity_log` e as opções do plugin se a opção `todday_delete_data` estiver configurada como `'yes'`.
- Pedidos e produtos do WooCommerce permanecem 100% intactos em qualquer circunstância.

## Rotina de Backup Recomendada
1. **Arquivos do Plugin**: Manter uma cópia do arquivo `todday-modas-brecho.zip` da versão correspondente.
2. **Banco de Dados**: Exportação periódica das tabelas do WordPress:
   ```bash
   wp db export todday_backup_$(date +%Y%m%d_%H%M%S).sql
   ```
3. **Restauração**:
   - Enviar novamente o ZIP `todday-modas-brecho.zip` via wp-admin.
   - Ativar o plugin.
   - O sistema de migração detectará automaticamente a versão e revalidará o schema e as capacidades no hook `init`.
