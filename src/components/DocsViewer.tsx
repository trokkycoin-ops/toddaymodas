import React, { useState } from 'react';
import { BookOpen, ChevronRight, FileCode } from 'lucide-react';

interface DocItem {
  id: string;
  title: string;
  description: string;
  content: string;
}

const DOCS_LIST: DocItem[] = [
  {
    id: 'api-rest',
    title: 'API REST (todday/v1)',
    description: 'Especificação das rotas RESTful para vitrine, pedidos, relatórios, configurações e webhooks.',
    content: `### API REST Todday Modas Brechó (Namespace: todday/v1)

Todas as requisições autenticadas exigem o cabeçalho:
\`\`\`http
X-WP-Nonce: [seu_nonce_aqui]
Content-Type: application/json
\`\`\`

#### Endpoints Principais:
- **GET /wp-json/todday/v1/vitrine**: Retorna catálogo de peças com filtros de categoria, condição e busca.
- **GET /wp-json/todday/v1/produtos/(?P<id>\\d+)**: Detalhes completos de uma peça, medidas e estoque.
- **POST /wp-json/todday/v1/carrinho/adicionar**: Adiciona item respeitando a unicidade de estoque (peça única).
- **POST /wp-json/todday/v1/checkout/finalizar**: Processa compra com suporte a HPOS e gateway Mercado Pago.
- **POST /wp-json/todday/v1/frete/calcular**: Cotação em tempo real com Melhor Envio e fallback de contingência.
- **GET /wp-json/todday/v1/pedidos/(?P<id>\\d+)/recibo**: Gera e retorna o recibo em PDF 1.4 do pedido.
- **POST /wp-json/todday/v1/webhooks/mercadopago**: Webhook com verificação de assinatura HMAC-SHA256 e idempotência.`
  },
  {
    id: 'integracoes',
    title: 'Integrações Brasileiras',
    description: 'Mercado Pago (PIX/Cartão), Melhor Envio, ViaCEP e WhatsApp.',
    content: `### Ecossistema de Integrações Nacionais

#### 1. Mercado Pago SDK & Webhooks
- Suporte a PIX com aprovação instantânea via QR Code dinâmico.
- Cartão de crédito transparente com tokenização client-side.
- Validação rigorosa de assinatura HMAC-SHA256 no webhook e verificação de chave de idempotência para evitar cobranças duplicadas.

#### 2. Melhor Envio API v2
- Cotação simultânea para Correios (PAC e SEDEX) e transportadoras privadas (Jadlog).
- Taxa fixa de contingência (fallback) automática caso a API externa sofra timeout ou instabilidade.

#### 3. ViaCEP
- Auto-preenchimento instantâneo de logradouro, bairro, cidade e estado a partir dos 8 dígitos do CEP.

#### 4. Notificações WhatsApp
- Disparo de links pré-formatados com número de pedido, itens selecionados e link de rastreio.`
  },
  {
    id: 'banco',
    title: 'Banco de Dados & HPOS',
    description: 'Tabelas customizadas com dbDelta e compatibilidade total com WooCommerce HPOS.',
    content: `### Arquitetura de Banco de Dados

O plugin cria 3 tabelas customizadas com charset/collate do WordPress via \`dbDelta()\`:

1. **\`wp_todday_activity_log\`**: Trilha de auditoria (user_id, action, object_type, object_id, ip_address, created_at).
2. **\`wp_todday_item_reviews\`**: Avaliações de clientes por peça (rating 1-5, comment, status).
3. **\`wp_todday_vendor_commissions\`**: Controle de repasses e comissões dos vendedores parceiros.

#### WooCommerce HPOS
Compatibilidade declarada via \`Automattic\\WooCommerce\\Utilities\\FeaturesUtil::declare_compatibility('custom_order_tables', ...)\`.
Todas as leituras e gravações de pedidos utilizam exclusivamente \`wc_get_order()\` e a classe de pedidos do WooCommerce.`
  },
  {
    id: 'permissoes',
    title: 'Matriz de Permissões (RBAC)',
    description: 'Roles e capabilities isoladas para Administrador, Vendedor e Cliente.',
    content: `### Matriz de Capabilities

| Capability | Administrador | Vendedor | Cliente |
|---|:---:|:---:|:---:|
| \`manage_todday_brecho\` | ✓ | ✗ | ✗ |
| \`edit_todday_products\` | ✓ | ✓ | ✗ |
| \`view_todday_vendor_orders\` | ✓ | ✓ | ✗ |
| \`view_todday_own_orders\` | ✓ | ✗ | ✓ |
| \`rate_todday_items\` | ✓ | ✗ | ✓ |

O acesso ao Painel de Gestão SPA (\`/painel-gestao-tm/\`) e rotas administrativas é protegido pela sessão privada do painel e pela matriz de permissões.`
  }
];

export function DocsViewer() {
  const [activeDoc, setActiveDoc] = useState<DocItem>(DOCS_LIST[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white p-6 rounded-2xl border border-purple-100 mb-8 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-[#7C3AED]" />
          <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
            Documentação Técnica do Plugin
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">Manuais &amp; Guias de Integração</h1>
        <p className="text-xs text-slate-500">
          Documentação completa de arquitetura, banco de dados, API REST e conformidade com WooCommerce HPOS.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-2">
          {DOCS_LIST.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setActiveDoc(doc)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between cursor-pointer ${
                activeDoc.id === doc.id
                  ? 'bg-white border-[#7C3AED] ring-2 ring-[#7C3AED]/10 shadow-xs'
                  : 'bg-white/60 border-slate-200 hover:bg-white'
              }`}
            >
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 mb-1">{doc.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{doc.description}</p>
              </div>
              <ChevronRight
                className={`w-4 h-4 mt-1 shrink-0 ${
                  activeDoc.id === doc.id ? 'text-[#7C3AED]' : 'text-slate-300'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-purple-100 shadow-2xs">
          <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-purple-50 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-[#7C3AED]" />
            <span>{activeDoc.title}</span>
          </h2>
          <div className="prose prose-sm max-w-none text-slate-700 text-xs leading-relaxed space-y-4">
            <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap">
              {activeDoc.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
