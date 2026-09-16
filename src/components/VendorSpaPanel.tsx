import React from 'react';
import { Order } from '../types';
import { Award } from 'lucide-react';

interface VendorSpaPanelProps {
  orders: Order[];
}

export function VendorSpaPanel({ orders }: VendorSpaPanelProps) {
  const vendorName = 'Juliana Todday';
  const vendorOrders = orders.filter((o) => o.assigned_vendor?.includes('Juliana') || true);
  const totalSales = vendorOrders.reduce((acc, curr) => acc + curr.total, 0);
  const commission = totalSales * 0.15;
  const targetPercent = Math.min(100, Math.round((totalSales / 1000) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white p-6 rounded-2xl border border-purple-100 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED] animate-pulse" />
            <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
              Painel da Vendedora (/todday-vendedor/)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Operação de Vendas — {vendorName}
          </h1>
          <p className="text-xs text-slate-500">
            Acompanhamento de peças selecionadas, comissões de vendas e status dos pedidos atribuídos.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#F5F3FF] px-4 py-2 rounded-xl border border-[#DDD6FE] text-xs text-[#7C3AED] font-bold">
          <Award className="w-4 h-4" />
          <span>Vendedora Destaque do Mês</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Vendas Atribuídas
          </span>
          <div className="text-2xl font-black text-slate-900 mt-2">
            R$ {totalSales.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">
            {vendorOrders.length} pedidos vinculados
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Sua Comissão (15%)
          </span>
          <div className="text-2xl font-black text-[#7C3AED] mt-2">
            R$ {commission.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[11px] text-purple-700 font-semibold mt-1 inline-block">
            Disponível para repasse
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Meta Mensal
          </span>
          <div className="text-2xl font-black text-[#7C3AED] mt-2">
            {targetPercent}%
          </div>
          <div className="w-full bg-purple-50 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-[#7C3AED] h-full rounded-full transition-all"
              style={{ width: `${targetPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-extrabold text-base text-slate-900">Seus Pedidos em Andamento</h3>
          <p className="text-xs text-slate-400">Pedidos gerados por clientes com suas peças exclusivas</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Pedido</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Peças</th>
                <th className="p-4">Valor Total</th>
                <th className="p-4">Sua Comissão</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendorOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono font-bold text-slate-900">#{order.order_number}</td>
                  <td className="p-4">{order.customer_name}</td>
                  <td className="p-4">{order.items.map((i) => i.name).join(', ')}</td>
                  <td className="p-4 font-bold text-slate-800">
                    R$ {order.total.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="p-4 font-bold text-[#8B5CF6]">
                    R$ {(order.total * 0.15).toFixed(2).replace('.', ',')}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
