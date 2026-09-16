# Guia de Instalação — Todday Modas Brechó

## Requisitos do Servidor
- **PHP**: 8.1 ou superior (com extensões `curl`, `mbstring`, `openssl`).
- **Banco de Dados**: MySQL 5.7+ ou MariaDB 10.3+.
- **WordPress**: 6.0 ou superior.
- **WooCommerce**: 8.0+ (com suporte ativo a High-Performance Order Storage - HPOS).
- **Elementor**: 3.16+ (opcional para uso dos widgets drag-and-drop).

## Passo a Passo via Painel WordPress (wp-admin)
1. Acesse o painel administrativo do seu WordPress (`/wp-admin`).
2. Navegue até **Plugins > Adicionar Novo**.
3. Clique no botão **Enviar Plugin** no topo da tela.
4. Selecione o arquivo `todday-modas-brecho.zip` e clique em **Instalar Agora**.
5. Após o upload, clique em **Ativar Plugin**.

## O que o Plugin Executa na Ativação:
- Cria a tabela dedicada de auditoria `$wpdb->prefix . 'todday_activity_log'` via `dbDelta()`.
- Registra os papéis de usuário `todday_gerente` e `todday_vendedor`.
- Atribui as capacidades de gerenciamento e matriz de segurança.
- Declara compatibilidade formal com HPOS.
- Cria regras de reescrita amigáveis para os painéis:
  - `/todday-painel/` (Painel de Gestão)
  - `/todday-vendedor/` (Painel do Vendedor)
  - `/todday-cliente/` (Portal do Cliente)
- Executa `flush_rewrite_rules()` uma única vez.
