import React, { useState } from 'react';
import { 
  ShoppingBag, 
  User, 
  Search, 
  Sparkles, 
  Truck, 
  ShieldCheck, 
  Lock,
  ArrowLeft,
  Crown,
  Shirt,
  Baby,
  BookOpen,
  Footprints,
  ChevronRight
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'store' | 'admin' | 'vendor' | 'customer' | 'download' | 'docs';
  onSelectTab: (tab: 'store' | 'admin' | 'vendor' | 'customer' | 'download' | 'docs') => void;
  cartCount: number;
  onOpenCart: () => void;
  onSearchSubmit?: (query: string) => void;
  onOpenStaffModal?: () => void;
  isStaffUnlocked?: boolean;
  onCustomerPortal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  cartCount,
  onOpenCart,
  onSearchSubmit,
  onOpenStaffModal,
  isStaffUnlocked = false,
  onCustomerPortal
}) => {
  const [headerSearch, setHeaderSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit && headerSearch.trim()) {
      onSelectTab('store');
      onSearchSubmit(headerSearch.trim());
    }
  };

  const isStaffTab = currentTab === 'admin' || currentTab === 'vendor' || currentTab === 'download' || currentTab === 'docs';

  return (
    <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-[#EBDDF0] shadow-xs">
      {/* 1. Barra de Aviso Superior (Top Bar By Sophi Style) */}
      <div className="bg-[#271E2D] text-white py-2 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold border-b border-[#1E1624]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span 
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-[#271E2D]"
              style={{ backgroundColor: '#dac9df' }}
            >
              <Sparkles className="w-2.5 h-2.5 text-[#271E2D]" /> Cupom VIP
            </span>
            <span className="text-purple-100 font-medium text-[11px] sm:text-xs">
              Use o cupom <strong className="text-white bg-white/20 px-1.5 py-0.5 rounded border border-white/20 font-bold">BEMVINDA10</strong> para 10% OFF
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-[11px] text-purple-200">
            <span className="inline-flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-[#dac9df]" /> Frete Rápido para Todo o Brasil
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-[#dac9df]" /> Peças com Medidas Reais na Fita
            </span>
          </div>
        </div>
      </div>

      {/* 2. Banner de Modo Equipe (apenas se aba restrita estiver ativa) */}
      {isStaffTab && (
        <div className="bg-[#3D2C47] text-white px-4 py-2 text-xs flex items-center justify-between border-b border-purple-900/50">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#dac9df]" />
              <span className="font-bold">Painel de Gestão da Loja</span>
              <span className="text-purple-200 text-[11px]">({currentTab.toUpperCase()})</span>
            </div>
            <button
              onClick={() => onSelectTab('store')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[#271E2D] font-bold text-[11px] transition-all cursor-pointer shadow-xs"
              style={{ backgroundColor: '#dac9df' }}
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Voltar à Loja Virtual</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Header Principal da Loja Virtual */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-3 sm:gap-4">
          {/* Logo da Loja Brechó */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
            onClick={() => onSelectTab('store')}
            id="tdm-brand-logo"
          >
            <div className="relative">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-[#271E2D] font-serif font-black text-lg sm:text-xl shadow-sm border border-[#cbb6d2] group-hover:scale-105 transition-transform"
                style={{ backgroundColor: '#dac9df' }}
              >
                TM
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#271E2D] border-2 border-white flex items-center justify-center">
                <Crown className="w-2 h-2 text-[#dac9df]" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-black text-xl sm:text-2xl tracking-tight text-[#271E2D]">
                  Todday Modas Brechó
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium flex items-center gap-1">
                <span>Moda Feminina</span>
                <span className="text-[#dac9df]">•</span>
                <span>Infantil</span>
                <span className="text-[#dac9df]">•</span>
                <span>Cristã</span>
              </p>
            </div>
          </div>

          {/* Barra de Busca */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Buscar vestidos mídi, infantil, capas de bíblia..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7FA] border border-[#EBDDF0] rounded-2xl text-xs sm:text-sm text-[#271E2D] placeholder:text-gray-400 focus:outline-none focus:border-[#dac9df] transition-all"
              />
            </form>
          </div>

          {/* Ações: Pedidos e Sacola */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Rastrear / Meus Pedidos */}
            <button
              onClick={() => (onCustomerPortal ? onCustomerPortal() : onSelectTab('customer'))}
              className={`flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-bold transition-all border ${
                currentTab === 'customer'
                  ? 'text-white bg-[#271E2D] border-[#271E2D] shadow-xs'
                  : 'text-gray-700 border-[#EBDDF0] bg-white hover:bg-[#FAF7FA]'
              }`}
              title="Acompanhar meus pedidos"
            >
              <User className="w-4 h-4 text-[#846391]" />
              <span className="hidden sm:inline">Meus Pedidos</span>
            </button>

            {/* Sacola de Compras */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[#271E2D] font-black text-xs sm:text-sm shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer border border-[#cbb6d2]"
              style={{ backgroundColor: '#dac9df' }}
              id="tdm-cart-button"
            >
              <ShoppingBag className="w-4 h-4 text-[#271E2D]" />
              <span className="hidden sm:inline">Sacola</span>
              {cartCount > 0 ? (
                <span className="w-5 h-5 rounded-full bg-[#271E2D] text-white text-[11px] flex items-center justify-center font-black">
                  {cartCount}
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full bg-white/70 text-[#271E2D] text-[11px] flex items-center justify-center font-bold">
                  0
                </span>
              )}
            </button>

            {/* Botão Discreto de Gestão (Protegido com PIN) */}
            {onOpenStaffModal && (
              <button
                onClick={onOpenStaffModal}
                className="p-2 sm:p-2.5 rounded-xl border border-[#EBDDF0] text-gray-400 hover:text-[#271E2D] hover:bg-purple-50 transition-colors"
                title="Acesso de Gestão (Equipe)"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 4. Araras de Navegação da Loja Virtual com Ícones Lucide Refinados */}
        <nav className="border-t border-[#EBDDF0] py-2 sm:py-2.5 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none text-xs font-semibold text-gray-700">
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => {
                onSelectTab('store');
                if (onSearchSubmit) onSearchSubmit('');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'store' 
                  ? 'text-white bg-[#271E2D] font-bold shadow-xs' 
                  : 'text-gray-700 hover:text-[#271E2D] hover:bg-[#FAF7FA]'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${currentTab === 'store' ? 'text-[#dac9df]' : 'text-[#846391]'}`} />
              <span>Início</span>
            </button>

            <button
              onClick={() => {
                onSelectTab('store');
                const el = document.getElementById('sessao-adulto');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else if (onSearchSubmit) onSearchSubmit('Moda Feminina');
              }}
              className="px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-gray-700 hover:text-[#271E2D] hover:bg-[#FAF7FA] cursor-pointer whitespace-nowrap group"
            >
              <Shirt className="w-3.5 h-3.5 text-[#846391] group-hover:text-[#271E2D] group-hover:scale-110 transition-all" />
              <span>Moda Adulto</span>
            </button>

            <button
              onClick={() => {
                onSelectTab('store');
                const el = document.getElementById('sessao-kids');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else if (onSearchSubmit) onSearchSubmit('Moda Infantil');
              }}
              className="px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-gray-700 hover:text-[#271E2D] hover:bg-[#FAF7FA] cursor-pointer whitespace-nowrap group"
            >
              <Baby className="w-3.5 h-3.5 text-[#846391] group-hover:text-[#271E2D] group-hover:scale-110 transition-all" />
              <span>Moda Infantil (Kids)</span>
            </button>

            <button
              onClick={() => {
                onSelectTab('store');
                const el = document.getElementById('sessao-cristao');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else if (onSearchSubmit) onSearchSubmit('Acessórios Cristãos');
              }}
              className="px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-gray-700 hover:text-[#271E2D] hover:bg-[#FAF7FA] cursor-pointer whitespace-nowrap group"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#846391] group-hover:text-[#271E2D] group-hover:scale-110 transition-all" />
              <span>Espaço Cristão & Capas</span>
            </button>

            <button
              onClick={() => {
                onSelectTab('store');
                const el = document.getElementById('sessao-calcados');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else if (onSearchSubmit) onSearchSubmit('Calçados');
              }}
              className="px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-gray-700 hover:text-[#271E2D] hover:bg-[#FAF7FA] cursor-pointer whitespace-nowrap group"
            >
              <Footprints className="w-3.5 h-3.5 text-[#846391] group-hover:text-[#271E2D] group-hover:scale-110 transition-all" />
              <span>Calçados</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-[#271E2D] bg-[#FAF7FA] px-3.5 py-1.5 rounded-xl border border-[#EBDDF0] shrink-0 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#846391] animate-ping" />
            <span className="font-bold text-[#846391]">Peças Únicas Selecionadas</span>
            <span className="text-gray-400">&bull;</span>
            <span className="text-gray-600">Envio para todo o Brasil</span>
          </div>
        </nav>
      </div>
    </header>
  );
};
