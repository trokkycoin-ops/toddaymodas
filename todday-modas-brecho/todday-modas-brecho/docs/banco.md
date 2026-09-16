# Estrutura de Banco de Dados

## Filosofia de Persistência
O plugin segue a diretriz de **respeito total ao WooCommerce**:
- Produtos, pedidos, clientes e cupons são manipulados exclusivamente através das APIs oficiais do WooCommerce (com total compatibilidade com o sistema HPOS / High-Performance Order Storage).
- Nenhuma tabela paralela ou duplicada é criada para dados já gerenciados pelo ecossistema do WooCommerce.

## Tabela Própria do Plugin: `todday_activity_log`
Utilizada para trilha de auditoria e conformidade em conformidade com o requisito 4.14.

```sql
CREATE TABLE {$wpdb->prefix}todday_activity_log (
    id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    user_id bigint(20) unsigned DEFAULT 0,
    user_login varchar(60) NOT NULL DEFAULT '',
    action varchar(100) NOT NULL,
    object_type varchar(50) NOT NULL DEFAULT '',
    object_id varchar(50) NOT NULL DEFAULT '',
    meta_data longtext DEFAULT NULL,
    ip_address varchar(45) NOT NULL DEFAULT '',
    created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY  (id),
    KEY user_id (user_id),
    KEY action (action),
    KEY created_at (created_at)
);
```

## Opções do WordPress (`wp_options`):
- `todday_db_version`: Versão atual do banco (guarda de migração em `init`).
- `todday_settings_general`: Dados da loja.
- `todday_settings_mercadopago`: Credenciais criptografadas do Mercado Pago.
- `todday_settings_melhorenvio`: Tokens e opções de envio.
- `todday_settings_whatsapp`: Telefone e mensagens padrão.
- `todday_delete_data`: Confirmação explícita para remoção de dados na desinstalação.
