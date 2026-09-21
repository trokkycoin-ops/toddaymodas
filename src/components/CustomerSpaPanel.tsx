import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Star, 
  FileText, 
  Sparkles, 
  MessageCircle, 
  Copy, 
  Check, 
  Search, 
  Clock, 
  ShieldCheck, 
  Heart,
  ChevronRight,
  ExternalLink,
  MapPin,
  CreditCard,
  QrCode
} from 'lucide-react';
import { Order } from '../types';
import { generateOrderReceipt } from '../utils/pdfGenerator';
import { Logo } from './Logo';
import { getConfig } from '../lib/api';

interface CustomerSpaPanelProps {
  orders: Order[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export const CustomerSpaPanel: React.FC<CustomerSpaPanelProps> = ({ orders, loading = false, error = null, onRefresh }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal de Avaliação
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [selectedPraise, setSelectedPraise] = useState<string[]>([]);

  const praiseTags = [
    'Medidas Exatas na Fita',
    'Peça Impecável',
    'Tecido Encorpado',
    'Entrega Rápida',
    'Embalagem com Carinho',
    'Zero Transparência'
  ];

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const togglePraise = (tag: string) => {
    setSelectedPraise((prev) => 
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSuccess(true);
    setTimeout(() => {
      setReviewSuccess(false);
      setReviewOrder(null);
      setReviewText('');
      setSelectedPraise([]);
    }, 2200);
  };

  // Filtragem de pedidos
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'completed' && order.status === 'completed') ||
        (filterStatus === 'shipped' && order.status === 'shipped') ||
        (filterStatus === 'processing' && (order.status === 'processing' || order.status === 'pending'));

      const matchesSearch =
        searchQuery.trim() === '' ||
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesSearch;
    });
  }, [orders, filterStatus, searchQuery]);

  // Estatísticas do Usuário
  const totalSpent = useMemo(() => {
    return orders.reduce((acc, o) => acc + o.total, 0);
  }, [orders]);

  const totalItemsCount = useMemo(() => {
    return orders.reduce((acc, o) => acc + o.items.reduce((sum, i) => sum + i.quantity, 0), 0);
  }, [orders]);

  const pendingPaymentCount = orders.filter((order) => order.payment_status === 'pending' || order.status === 'pending').length;
  const activeOrderCount = orders.filter((order) => ['processing', 'shipped'].includes(order.status)).length;
  const deliveredOrderCount = orders.filter((order) => order.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* ============================================================ */}
      {/* 1. TOPO: PAINEL EXCLUSIVO DA CLIENTE                         */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-br from-[#271E2D] via-[#2F2336] to-[#1E1624] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-[#3D2C47] mb-8 relative overflow-hidden">
        {/* Glow decorativo de fundo */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#DAC9DF]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DAC9DF] animate-pulse"></span>
              <span 
                className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full text-[#271E2D] shadow-xs"
                style={{ backgroundColor: '#DAC9DF' }}
              >
                Área da Cliente
              </span>
              <span className="text-xs text-purple-200/70 hidden sm:inline">• Todday Modas Brechó</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-serif tracking-tight text-white mb-2">
              Meus Pedidos & Peças
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed font-sans">
              Acompanhe suas compras em tempo real, baixe recibos oficiais com a marca d'água da loja e avalie suas peças especiais com facilidade.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-bold text-purple-100/80">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#DAC9DF]" /> Compra protegida
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                <Truck className="h-3.5 w-3.5 text-[#DFBA5A]" /> Rastreio atualizado
              </span>
            </div>
          </div>

          {/* Cards de Métricas da Cliente */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3 sm:p-4 rounded-2xl text-center">
              <span className="block text-lg sm:text-2xl font-black font-serif text-[#DAC9DF]">
                {orders.length}
              </span>
              <span className="text-[10px] sm:text-[11px] text-purple-200/80 font-medium leading-tight">
                Pedidos Feitos
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3 sm:p-4 rounded-2xl text-center">
              <span className="block text-lg sm:text-2xl font-black font-serif text-[#DFBA5A]">
                {totalItemsCount}
              </span>
              <span className="text-[10px] sm:text-[11px] text-purple-200/80 font-medium leading-tight">
                Peças Especiais
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3 sm:p-4 rounded-2xl text-center">
              <span className="block text-xs sm:text-sm font-black font-serif text-white pt-1">
                R$ {totalSpent.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-[10px] sm:text-[11px] text-purple-200/80 font-medium leading-tight">
                Total em Compras
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Aguardando pagamento', value: pendingPaymentCount, tone: 'text-amber-700 bg-amber-50 border-amber-100' },
          { label: 'Em andamento', value: activeOrderCount, tone: 'text-blue-700 bg-blue-50 border-blue-100' },
          { label: 'Entregues', value: deliveredOrderCount, tone: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
          { label: 'Itens comprados', value: totalItemsCount, tone: 'text-[#6d5276] bg-[#FAF7FA] border-[#EBDDF0]' },
        ].map((metric) => (
          <div key={metric.label} className={`rounded-2xl border px-4 py-3 ${metric.tone}`}>
            <span className="block text-xl font-black">{metric.value}</span>
            <span className="text-[11px] font-bold opacity-80">{metric.label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
          <span>{error}</span>
          {onRefresh && <button onClick={onRefresh} className="rounded-xl bg-white px-3 py-2 text-red-700 shadow-2xs">Tentar novamente</button>}
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. BARRA DE BUSCA E FILTROS DE STATUS                        */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#EBDDF0] shadow-xs">
        {/* Campo de Busca */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por número do pedido (#TDM...) ou nome da peça..."
            className="w-full pl-10 pr-4 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl text-xs text-[#271E2D] placeholder:text-gray-400 focus:outline-none focus:border-[#DAC9DF] transition-all"
          />
        </div>

        {/* Abas Rápidas de Status */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Todos os Pedidos' },
            { id: 'processing', label: 'Em Preparação' },
            { id: 'shipped', label: 'A Caminho' },
            { id: 'completed', label: 'Entregues' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-[#271E2D] text-white shadow-xs'
                  : 'bg-[#FAF7FA] text-gray-600 hover:bg-[#EBDDF0]/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. LISTAGEM DE PEDIDOS DA CLIENTE                            */}
      {/* ============================================================ */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white rounded-3xl border border-[#EBDDF0] p-12 text-center">
            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-[#EBDDF0] border-t-[#846391]" />
            <p className="text-sm font-bold text-[#271E2D]">Carregando seus pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-[#DAC9DF] p-10 sm:p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#FAF7FA] border border-[#EBDDF0] flex items-center justify-center mx-auto mb-4 text-[#846391]">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-black text-lg text-[#271E2D] mb-1">
              Nenhum pedido encontrado
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto mb-5">
              {searchQuery 
                ? 'Nenhum resultado corresponde à sua pesquisa. Tente usar outro termo ou número de pedido.' 
                : 'Você ainda não possui pedidos com este status. Suas compras na loja virtual aparecerão aqui automaticamente.'}
            </p>
            <a
              href={`${getConfig().homeUrl.replace(/\/?$/, '/') }#tdm-hero-carousel`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black text-[#271E2D] bg-[#DAC9DF] hover:bg-white border border-[#271E2D]/20 shadow-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#271E2D]" />
              <span>Ver Vitrine de Peças</span>
            </a>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusStep =
              order.status === 'completed'
                ? 4
                : order.status === 'shipped'
                ? 3
                : order.status === 'processing'
                ? 2
                : 1;

            const isPix = order.payment_method === 'pix';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-[#EBDDF0] shadow-xs hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Cabeçalho do Pedido */}
                <div className="p-5 sm:p-6 bg-[#FAF7FA] border-b border-[#EBDDF0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                      <span className="font-mono font-extrabold text-base sm:text-lg text-[#271E2D]">
                        Pedido #{order.order_number}
                      </span>
                      
                      {/* Badge de Status */}
                      <span 
                        className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold ${
                          order.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : order.status === 'shipped'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {order.status === 'completed' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Entregue com Sucesso</span>
                          </>
                        ) : order.status === 'shipped' ? (
                          <>
                            <Truck className="w-3.5 h-3.5 text-blue-600" />
                            <span>A Caminho do Seu Endereço</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Em Preparação & Embalagem</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span>Data: <strong className="text-gray-700">{order.date}</strong></span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        {isPix ? (
                          <>
                            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                            <strong className="text-gray-700">PIX Instantâneo</strong>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                            <strong className="text-gray-700">Cartão de Crédito</strong>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Ações do Pedido: Recibo e Avaliação */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => generateOrderReceipt(order)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#EBDDF0] bg-white hover:bg-[#FAF7FA] text-xs font-bold text-[#271E2D] transition-colors cursor-pointer shadow-2xs"
                      title="Gerar e Imprimir Recibo Oficial em PDF"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#846391]" />
                      <span>Recibo PDF</span>
                    </button>

                    <button
                      onClick={() => setReviewOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#271E2D] bg-[#DAC9DF] hover:bg-[#cbb6d2] transition-colors cursor-pointer shadow-2xs"
                    >
                      <Star className="w-3.5 h-3.5 fill-[#271E2D] text-[#271E2D]" />
                      <span>Avaliar Peças</span>
                    </button>
                  </div>
                </div>

                {/* Conteúdo Principal do Card */}
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Linha do Tempo Visual de Rastreamento (Timeline) */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                      Status do Rastreio
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { step: 1, label: '1. Pedido Confirmado', desc: 'Pagamento aprovado' },
                        { step: 2, label: '2. Embalagem com Amor', desc: 'Revisado e dobrado' },
                        { step: 3, label: '3. Despachado', desc: 'Postado nos Correios' },
                        { step: 4, label: '4. Entregue', desc: 'Recebido com alegria' }
                      ].map((s) => (
                        <div
                          key={s.step}
                          className={`p-3 rounded-2xl border transition-all ${
                            statusStep >= s.step
                              ? 'bg-[#FAF7FB] border-[#DAC9DF] text-[#271E2D] shadow-2xs'
                              : 'bg-gray-50 border-gray-100 text-gray-400 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <div 
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                statusStep >= s.step
                                  ? 'bg-[#271E2D] text-[#DAC9DF]'
                                  : 'bg-gray-200 text-gray-500'
                              }`}
                            >
                              {statusStep > s.step ? '✓' : s.step}
                            </div>
                            <span className="text-xs font-bold truncate">{s.label}</span>
                          </div>
                          <span className="text-[10px] text-gray-500 block truncate">{s.desc}</span>
                        </div>
                      ))}
                    </div>

                    {/* Código de Rastreio com Botão de Copiar */}
                    {order.tracking_code && (
                      <div className="mt-3 p-3 bg-[#FAF7FA] rounded-2xl border border-[#EBDDF0] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-[#846391]" />
                          <span className="text-gray-600">Código de Rastreamento (Correios / Transportadora):</span>
                          <strong className="font-mono text-[#271E2D] bg-white px-2 py-0.5 rounded-md border border-[#EBDDF0]">
                            {order.tracking_code}
                          </strong>
                        </div>

                        <button
                          onClick={() => handleCopyTracking(order.tracking_code!)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#846391] hover:text-[#271E2D] transition-colors self-start sm:self-auto cursor-pointer"
                        >
                          {copiedCode === order.tracking_code ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Código Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar Código</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Detalhes de Endereço de Entrega & Itens Comprados */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-[#EBDDF0]">
                    {/* Endereço */}
                    <div className="md:col-span-5 bg-[#FAF7FA] p-4 rounded-2xl border border-[#EBDDF0]/70 text-xs">
                      <div className="flex items-center gap-2 mb-2 font-bold text-[#271E2D]">
                        <MapPin className="w-4 h-4 text-[#846391]" />
                        <span>Destinatária & Endereço de Entrega</span>
                      </div>
                      <p className="font-semibold text-gray-800">{order.customer_name}</p>
                      <p className="text-gray-600 mt-1">
                        {order.shipping_address.street}, {order.shipping_address.number} {order.shipping_address.complement && `(${order.shipping_address.complement})`}
                      </p>
                      <p className="text-gray-600">
                        {order.shipping_address.neighborhood} — {order.shipping_address.city}/{order.shipping_address.state}
                      </p>
                      <p className="text-gray-500 font-mono text-[11px] mt-1">
                        CEP: {order.shipping_address.cep}
                      </p>
                    </div>

                    {/* Lista de Peças */}
                    <div className="md:col-span-7 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                          Peças Inclusas no Pedido
                        </h4>
                        {order.items.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between text-xs py-1.5 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-[#FAF7FA] border border-[#EBDDF0] text-[#271E2D] font-bold flex items-center justify-center text-[11px] shrink-0">
                                {item.quantity}x
                              </span>
                              <span className="font-medium text-gray-800">{item.name}</span>
                            </div>
                            <span className="font-bold text-[#271E2D] shrink-0 ml-2">
                              R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Totalizador */}
                      <div className="pt-3 mt-3 border-t border-[#EBDDF0] flex items-center justify-between text-sm">
                        <span className="font-bold text-gray-600">Total Pago</span>
                        <span className="font-serif font-black text-base text-[#271E2D]">
                          R$ {order.total.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ============================================================ */}
      {/* 4. MODAL ELEGANTE DE AVALIAÇÃO DE COMPRA                     */}
      {/* ============================================================ */}
      {reviewOrder && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
          onClick={() => setReviewOrder(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#EBDDF0] text-xs relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#EBDDF0]">
              <div className="flex items-center gap-2">
                <Logo variant="symbol" size="sm" theme="light" />
                <div>
                  <h3 className="text-base font-serif font-black text-[#271E2D]">
                    Avaliar Pedido #{reviewOrder.order_number}
                  </h3>
                  <p className="text-[11px] text-gray-500">Sua opinião ajuda outras irmãs e clientes a escolherem suas peças</p>
                </div>
              </div>
              <button
                onClick={() => setReviewOrder(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="Fechar"
              >
                ✕
              </button>
            </div>

            {reviewSuccess ? (
              <div className="py-8 text-center bg-[#FAF7FB] rounded-2xl border border-[#DAC9DF]">
                <CheckCircle2 className="w-12 h-12 text-[#271E2D] mx-auto mb-3" />
                <h4 className="font-serif font-bold text-base text-[#271E2D]">Muito obrigada pela sua avaliação!</h4>
                <p className="text-xs text-gray-600 mt-1">Sua mensagem foi registrada com carinho na comunidade Todday Modas.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Estrelas de Nota */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">
                    Como foi a sua experiência com a compra?
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-115 transition-transform cursor-pointer"
                        title={`${star} estrelas`}
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= reviewRating 
                              ? 'fill-[#DFBA5A] text-[#DFBA5A]' 
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-[#846391] ml-2">
                      {reviewRating === 5 ? 'Excelente!' : reviewRating === 4 ? 'Muito Boa' : `${reviewRating} estrelas`}
                    </span>
                  </div>
                </div>

                {/* Tags de Elogio Rápido */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">
                    Destaques da peça (opcional):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {praiseTags.map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => togglePraise(tag)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer border ${
                          selectedPraise.includes(tag)
                            ? 'bg-[#271E2D] text-[#DAC9DF] border-[#271E2D]'
                            : 'bg-[#FAF7FA] text-gray-600 border-[#EBDDF0] hover:bg-[#EBDDF0]/40'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comentário Livre */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">
                    Seu comentário sincero:
                  </label>
                  <textarea
                    required
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={3}
                    placeholder="Ex: O vestido mídi serviu perfeitamente! As medidas na fita métrica estavam certinhas, o tecido não marca e veio muito bem embalado."
                    className="w-full p-3 bg-[#FAF7FA] border border-[#EBDDF0] rounded-2xl text-xs text-[#271E2D] placeholder:text-gray-400 focus:outline-none focus:border-[#DAC9DF] transition-all resize-none"
                  />
                </div>

                {/* Botões de Ação do Modal */}
                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewOrder(null)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-[#271E2D] font-black text-xs transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                    style={{ backgroundColor: '#DAC9DF' }}
                  >
                    Publicar Avaliação
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
