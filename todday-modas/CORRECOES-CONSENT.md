# 🔧 Correções no Sistema de Consentimentos (LGPD)

## 📋 Problemas Identificados e Corrigidos

### 1. **Problema: Novos consentimentos não aparecem no painel**
**Causa**: Cache agressivo do navegador/CDN e falta de feedback de erro no frontend

**Correções aplicadas**:
- ✅ Adicionado timestamp nas requisições da API (`_t=`) para evitar cache
- ✅ Melhorado tratamento de erros no frontend com retry automático
- ✅ Adicionado logs no console para debug
- ✅ Mudança na ordem: agora salva localmente PRIMEIRO e depois envia para o servidor
- ✅ Headers anti-cache mais agressivos na API REST
- ✅ Adicionado `_timestamp` na resposta da API para forçar atualização

### 2. **Problema: Exclusão aparenta funcionar mas o registro não é apagado**
**Causa**: Possível problema de cache ou erro silencioso no banco de dados

**Correções aplicadas**:
- ✅ Adicionada verificação se o registro existe antes de excluir
- ✅ Mensagens de erro mais detalhadas incluindo erro do MySQL
- ✅ Feedback visual melhorado (botão mostra "Excluindo...")
- ✅ Log detalhado no console do navegador
- ✅ Limpeza de cache WordPress após exclusão
- ✅ Delay de 300ms antes de recarregar para garantir que a exclusão foi processada

### 3. **Melhorias adicionais**:
- ✅ UUID gerado antes da inserção (evita query extra)
- ✅ Logs de erro no PHP (error_log) para debug
- ✅ Script de diagnóstico completo

---

## 🧪 Como Testar as Correções

### **Passo 1: Executar o Script de Diagnóstico**

Acesse no navegador (logado como administrador):
```
https://seusite.com/wp-admin/admin-ajax.php?action=tm_debug_consent
```

Este script vai:
- ✅ Verificar se a tabela existe e mostrar sua estrutura
- ✅ Listar os registros existentes
- ✅ Testar uma inserção de teste
- ✅ Verificar as rotas REST API
- ✅ Verificar permissões do usuário
- ✅ Mostrar configurações do WordPress

**O que verificar**:
1. Se a tabela existe
2. Se os registros antigos aparecem
3. Se a inserção de teste funciona
4. Se há algum erro do MySQL

---

### **Passo 2: Testar o Frontend (Novo Consentimento)**

1. Abra o site em uma **janela anônima** (Ctrl+Shift+N no Chrome)
2. Abra o **Console do navegador** (F12 → Console)
3. Aceite o banner de cookies
4. Verifique no console se aparece: `Consentimento registrado: {id: X, consentimento_id: "..."}`
5. Se houver erro, aparecerá: `Erro ao gravar consentimento: ...`

**Teste em outro dispositivo/navegador**:
- Celular
- Outro computador
- Outro navegador

---

### **Passo 3: Testar a Exclusão no Painel**

1. Acesse o painel de consentimentos
2. Abra o **Console do navegador** (F12 → Console)
3. Clique em "Excluir" em um registro
4. Verifique no console:
   - `Resultado da exclusão: {ok: true, excluido: 1, id: X}`
   - Se houver erro: `Erro ao excluir: ...`
5. Aguarde o painel recarregar (deve remover o registro)

**Se o registro não sumir**:
- Verifique se aparece algum erro no console
- Verifique se o ID está correto
- Tente atualizar a página manualmente (F5)
- Execute novamente o script de diagnóstico

---

### **Passo 4: Testar o Cache**

Se os problemas persistirem, limpe todos os caches:

1. **Cache do navegador**:
   - Chrome: Ctrl+Shift+Delete → Limpar cache
   - Ou: Abrir DevTools (F12) → Clique direito no botão Atualizar → "Limpar cache e recarregar"

2. **Cache do WordPress**:
   ```php
   wp_cache_flush();
   ```

3. **Cache de plugins** (se usar W3 Total Cache, WP Rocket, etc):
   - Limpar cache do plugin
   - Desativar temporariamente para teste

4. **Cache do CDN** (Cloudflare, etc):
   - Purge all cache no painel do CDN
   - Ou adicione regra para não cachear `/wp-json/*`

---

## 🔍 Debug Avançado

### **Ver logs do PHP**

Se o `WP_DEBUG_LOG` estiver ativo, verifique:
```
wp-content/debug.log
```

Procure por linhas com `TM Consent Error:` que mostrarão erros do MySQL.

### **Testar a API diretamente**

**GET - Listar consentimentos**:
```bash
curl -X GET "https://seusite.com/wp-json/cc/v1/logs" \
  -H "X-WP-Nonce: SEU_NONCE_AQUI"
```

**POST - Criar consentimento**:
```bash
curl -X POST "https://seusite.com/wp-json/cc/v1/logs" \
  -H "Content-Type: application/json" \
  -d '{
    "acao": "aceitar_todos",
    "aceita_analise": 1,
    "aceita_publicidade": 1,
    "aceita_personalizacao": 1,
    "versao_politica": "1.0"
  }'
```

**DELETE - Excluir consentimento**:
```bash
curl -X DELETE "https://seusite.com/wp-json/cc/v1/logs/8" \
  -H "X-WP-Nonce: SEU_NONCE_AQUI"
```

### **Verificar a tabela no banco de dados**

Via phpMyAdmin ou MySQL CLI:
```sql
-- Ver todos os registros
SELECT * FROM wp_tm_consents ORDER BY id DESC;

-- Ver total de registros
SELECT COUNT(*) FROM wp_tm_consents;

-- Excluir um registro específico
DELETE FROM wp_tm_consents WHERE id = 8;

-- Limpar todos os registros (CUIDADO!)
TRUNCATE TABLE wp_tm_consents;
```

---

## 📝 Checklist Final

Após aplicar as correções, verifique:

- [ ] Script de diagnóstico executa sem erros
- [ ] Novos consentimentos aparecem no painel imediatamente
- [ ] Consentimentos de outros dispositivos são registrados
- [ ] Exclusão remove o registro permanentemente
- [ ] Não aparecem erros no console do navegador
- [ ] Estatísticas (Total, Taxa de aceite) estão corretas
- [ ] Exportação CSV/JSON funciona

---

## 🚀 Próximos Passos (Opcional)

Se tudo estiver funcionando, você pode:

1. **Remover o script de debug** (comentar a linha no todday-modas.php):
   ```php
   // require_once TM_PLUGIN_DIR . 'includes/debug-consent.php';
   ```

2. **Desativar logs do console** no frontend (tm-public.js):
   - Remover ou comentar os `console.log()` e `console.error()`

3. **Monitorar por alguns dias** para garantir que está tudo funcionando

---

## ❓ Problemas Comuns

### "Erro 403 Forbidden na API"
- Verifique se está logado como administrador
- Limpe o cache do navegador
- Verifique se o nonce está válido

### "Registro não existe / 404"
- O ID pode estar incorreto
- O registro pode já ter sido excluído
- Execute o script de diagnóstico para ver os IDs reais

### "Erro ao registrar consentimento"
- Verifique se a tabela existe (script de diagnóstico)
- Verifique os logs do PHP (debug.log)
- Verifique permissões da tabela no MySQL

### "Painel mostra dados antigos"
- Limpe completamente o cache do navegador
- Desative cache de plugins WordPress
- Limpe cache do CDN (se usar)

---

## 📧 Suporte

Se após todas as correções o problema persistir, colete:

1. Screenshot do script de diagnóstico
2. Erros do console do navegador (F12 → Console)
3. Conteúdo do wp-content/debug.log (se existir)
4. Versão do WordPress, PHP e MySQL

---

**Data das correções**: 05/09/2026
**Arquivos modificados**:
- `includes/class-tm-consent.php`
- `includes/panel/assets/js/admin-panel.js`
- `public/assets/js/tm-public.js`
- `includes/debug-consent.php` (novo)
- `todday-modas.php`
