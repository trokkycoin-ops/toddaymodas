import React, { useState } from 'react';
import { Package, Truck, CheckCircle2, Star, FileText, Sparkles, MessageCircle, AlertCircle } from 'lucide-react';
import { Order } from '../types';
import { generateOrderReceipt } from '../utils/pdfGenerator';

interface CustomerSpaPanelProps {
  orders: Order[];
}

export const CustomerSpaPanel: React.FC<CustomerSpaPanelProps> = ({ orders }) => {
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSuccess(true);
    setTimeout(() => {
      setReviewSuccess(false);
      setReviewOrder(null);
      setReviewText('');
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Topo do Portal do Cliente */}
      <div className="bg-white p-6 rounded-2xl border border-purple-100 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED] animate-pulse"></span>
            <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
              Área do Cliente (/todday-cliente/)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Meus Pedidos & Peças</h1>
          <p className="text-xs text-slate-500">
            Acompanhe o status do envio, baixe seus recibos em PDF e avalie suas compras com carinho.
          </p>
        </div>
      </div>

      {/* Lista de Pedidos do Cliente */}
      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-purple-200 p-12 text-center">
            <Package className="w-12 h-12 text-purple-300 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-800">Nenhum pedido realizado ainda</h3>
            <p className="text-xs text-slate-500 mt-1">Quando você finalizar sua compra na vitrine, ela aparecerá aqui.</p>
          </div>
        ) : (
          orders.map((order) => {
            const statusStep =
              order.status === 'completed'
                ? 4
                : order.status === 'shipped'
                ? 3
                : order.status === 'processing'
                ? 2
                : 1;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-purple-100 p-6 shadow-2xs hover:border-[#C4B5FD] transition-colors"
              >
                {/* Cabeçalho do Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-purple-50 gap-2">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-extrabold text-base text-slate-900">
                        Pedido #{order.order_number}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{order.date}</span>
                    </div>
                    <span className="text-xs text-[#7C3AED] font-semibold">
                      Pagamento: {order.payment_method === 'pix' ? 'PIX Instantâneo' : 'Cartão de Crédito'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => generateOrderReceipt(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 text-xs font-bold text-[#7C3AED] hover:bg-purple-50 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#7C3AED]" />
                      <span>Baixar Recibo PDF</span>
                    </button>

                    <button
                      onClick={() => setReviewOrder(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] text-xs font-bold text-[#7C3AED] hover:bg-[#EDE9FE] transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 fill-[#7C3AED]" />
                      <span>Avaliar Peça</span>
                    </button>
                  </div>
                </div>

                {/* Linha do Tempo de Rastreamento */}
                <div className="mb-6 py-2">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className={`p-2 rounded-xl ${statusStep >= 1 ? 'bg-purple-50 text-[#7C3AED] font-bold' : 'text-slate-400'}`}>
                      1. Pedido Criado
                    </div>
                    <div className={`p-2 rounded-xl ${statusStep >= 2 ? 'bg-purple-50 text-[#7C3AED] font-bold' : 'text-slate-400'}`}>
                      2. Em Preparação
                    </div>
                    <div className={`p-2 rounded-xl ${statusStep >= 3 ? 'bg-purple-50 text-[#7C3AED] font-bold' : 'text-slate-400'}`}>
                      3. Despachado
                    </div>
                    <div className={`p-2 rounded-xl ${statusStep >= 4 ? 'bg-purple-50 text-[#7C3AED] font-bold' : 'text-slate-400'}`}>
                      4. Entregue
                    </div>
                  </div>
                  {order.tracking_code && (
                    <div className="mt-3 text-xs text-center text-slate-500 bg-purple-50/50 py-2 rounded-xl border border-purple-100">
                      Código de Rastreamento (Melhor Envio / Correios):{' '}
                      <strong className="font-mono text-[#7C3AED]">{order.tracking_code}</strong>
                    </div>
                  )}
                </div>

                {/* Lista de Itens */}
                <div className="space-y-2 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-700">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-bold">R$ {item.price.toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-sm font-extrabold text-[#7C3AED] pt-2 border-t border-purple-50">
                    <span>Total do Pedido</span>
                    <span>R$ {order.total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Avaliação de Produto */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-purple-100 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-2">Avaliar Peças do Pedido</h3>
            <p className="text-slate-500 mb-4">
              Conte o que achou da peça, do cheirinho e da rapidez da entrega.
            </p>

            {reviewSuccess ? (
              <div className="p-6 text-center text-purple-900 font-bold bg-purple-50 rounded-xl border border-purple-200">
                <CheckCircle2 className="w-8 h-8 text-[#7C3AED] mx-auto mb-2" />
                <p>Muito obrigada! Sua avaliação foi publicada com carinho.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nota da Compra</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating ? 'fill-amber-400' : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Comentário</label>
                  <textarea
                    required
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={3}
                    placeholder="Ex: A peça veio impecável, com cheirinho suave de carinho e serviu perfeitamente!"
                    className="w-full p-2.5 border border-purple-200 rounded-xl focus:border-[#7C3AED] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewOrder(null)}
                    className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#7C3AED] text-white rounded-xl font-bold hover:bg-[#6D28D9] shadow-sm"
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
