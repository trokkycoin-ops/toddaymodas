# Auditoria de Consentimento LGPD - Todday Modas

## 1. Escopo
Registro e auditoria de consentimento de cookies para conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).

## 2. Estrutura de Armazenamento
- Tabela dedicada: `wp_tm_consent_log`
- Campos de auditoria: ID, hash de IP anonimizado, User Agent, categorias aceitas (essenciais, analíticos, marketing), timestamp UTC.
- Criptografia/Anonimização: Endereços IP são processados com salt criptográfico via `TM_Crypto`.

## 3. Conformidade
- Sem cookies invasivos antes do opt-in ativo.
- Consulta e exportação em formato de auditoria estritamente em modo leitura.
