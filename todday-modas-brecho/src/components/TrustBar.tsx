import React from 'react';
import { Truck, CreditCard, RotateCcw, ShieldCheck } from 'lucide-react';

export const TrustBar: React.FC = () => {
  return (
    <div className="w-full bg-white rounded-2xl border border-[#EBDDF0] shadow-sm p-4 sm:p-6 mb-8 sm:mb-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: '#dac9df' }}
          >
            <Truck className="w-5 h-5 text-[#271E2D]" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#271E2D]">Frete para todo o Brasil</h4>
            <p className="text-[11px] text-gray-500">Envio seguro pelos Correios & Transportadoras</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: '#dac9df' }}
          >
            <CreditCard className="w-5 h-5 text-[#271E2D]" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#271E2D]">Até 6x Sem Juros</h4>
            <p className="text-[11px] text-gray-500">No cartão de crédito ou desconto no Pix</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: '#dac9df' }}
          >
            <RotateCcw className="w-5 h-5 text-[#271E2D]" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#271E2D]">Troca Fácil em 7 Dias</h4>
            <p className="text-[11px] text-gray-500">Garantia total para suas compras</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: '#dac9df' }}
          >
            <ShieldCheck className="w-5 h-5 text-[#271E2D]" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#271E2D]">Compra 100% Segura</h4>
            <p className="text-[11px] text-gray-500">Ambiente protegido e dados criptografados</p>
          </div>
        </div>
      </div>
    </div>
  );
};
