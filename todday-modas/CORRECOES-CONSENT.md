# Correções Aplicadas no Módulo de Consentimento

1. **Migração em Runtime (`init`)**: Schema instalado via `dbDelta` no hook `init` com checagem de versão `tm_db_version`.
2. **Anonimização de IP**: Adição de máscara de subnet e hash com salt do sistema via `TM_Crypto`.
3. **Isolamento de Leitura**: O script `debug-consent.php` atua estritamente com queries `SELECT` sem operações `UPDATE` ou `DELETE`.
4. **Proteção CSRF/Nonces**: Verificação obrigatória de nonces em requisições REST e AJAX de consentimento.
