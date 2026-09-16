import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Truck, 
  CreditCard, 
  Lock, 
  Mail, 
  Check, 
  Crown,
  Ruler,
  PhoneCall,
  RotateCcw
} from 'lucide-react';

interface FooterLuxuryProps {
  onSelectTab: (tab: 'store' | 'admin' | 'vendor' | 'customer' | 'download' | 'docs') => void;
  onOpenStaffModal?: () => void;
  onFilterCategory?: (category: string) => void;
}

export const FooterLuxury: React.FC<FooterLuxuryProps> = ({
  onSelectTab,
  onOpenStaffModal,
  onFilterCategory
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
    }
  };

  return (
    <footer className="bg-[#1E1624] text-[#dac9df] text-xs border-t border-[#2F2238] mt-16 sm:mt-24 relative overflow-hidden">
      {/* 1. Barra de Vantagens do Rodapé */}
      <div className="border-b border-[#2F2238] py-8 bg-[#17101C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[#271E2D] shadow-sm"
                style={{ backgroundColor: '#dac9df' }}
              >
                <Truck className="w-5 h-5 text-[#271E2D]" />
              </div>
              <div>
                <strong className="block text-white font-bold text-xs sm:text-sm">
                  Envio para Todo o Brasil
                </strong>
                <span className="text-purple-200/70 text-[11px]">
                  Correios e transportadoras com seguro
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[#271E2D] shadow-sm"
                style={{ backgroundColor: '#dac9df' }}
              >
                <Ruler className="w-5 h-5 text-[#271E2D]" />
              </div>
              <div>
                <strong className="block text-white font-bold text-xs sm:text-sm">
                  Medidas na Fita Métrica
                </strong>
                <span className="text-purple-200/70 text-[11px]">
                  Peças únicas medidas com precisão
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[#271E2D] shadow-sm"
                style={{ backgroundColor: '#dac9df' }}
              >
                <RotateCcw className="w-5 h-5 text-[#271E2D]" />
              </div>
              <div>
                <strong className="block text-white font-bold text-xs sm:text-sm">
                  Troca Fácil em 7 Dias
                </strong>
                <span className="text-purple-200/70 text-[11px]">
                  Garantia total para o seu pedido
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[#271E2D] shadow-sm"
                style={{ backgroundColor: '#dac9df' }}
              >
                <ShieldCheck className="w-5 h-5 text-[#271E2D]" />
              </div>
              <div>
                <strong className="block text-white font-bold text-xs sm:text-sm">
                  Pagamento 100% Seguro
                </strong>
                <span className="text-purple-200/70 text-[11px]">
                  Criptografia SSL de ponta a ponta
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Newsletter VIP By Sophi Style */}
      <div className="border-b border-[#2F2238] py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#271E2D] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#3D2C47] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-[#dac9df] uppercase tracking-wider mb-1">
                <Crown className="w-4 h-4 text-[#dac9df]" />
                <span>Clube VIP Todday Modas</span>
              </div>
              <h3 className="font-serif font-black text-xl sm:text-2xl text-white">
                Cadastre-se e Receba 10% OFF na Primeira Compra
              </h3>
              <p className="text-xs text-purple-200/80 mt-1">
                Receba novidades, reposições de vestidos mídi e peças infantis antes de todo mundo.
              </p>
            </div>

            <div className="w-full md:w-auto">
              {!newsletterSubscribed ? (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Digite seu e-mail..."
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#1E1624] border border-[#3D2C47] rounded-xl text-xs text-white placeholder:text-purple-300/50 focus:outline-none focus:border-[#dac9df] transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs text-[#271E2D] transition-all shadow-md active:scale-98 whitespace-nowrap cursor-pointer hover:bg-white"
                    style={{ backgroundColor: '#dac9df' }}
                  >
                    Quero Meu Desconto
                  </button>
                </form>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#1E1624] border border-[#dac9df] text-xs text-purple-100 flex items-center gap-3">
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[#271E2D]"
                    style={{ backgroundColor: '#dac9df' }}
                  >
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-white">Inscrição Confirmada!</strong>
                    <span>Use o cupom: <strong className="text-[#271E2D] bg-[#dac9df] px-2 py-0.5 rounded font-mono font-bold">BEMVINDA10</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Colunas de Navegação e Informações da Loja */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Identidade da Marca */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#271E2D] font-serif font-black text-base shadow-sm"
                style={{ backgroundColor: '#dac9df' }}
              >
                TM
              </div>
              <span className="font-serif font-black text-white text-xl tracking-tight">
                Todday Modas Brechó
              </span>
            </div>

            <p className="text-purple-200/80 text-xs leading-relaxed mb-4">
              Loja virtual especializada em moda modesta feminina, vestidos mídi, moda infantil e artigos de fé. Peças selecionadas com medidas reais e muito carinho.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-purple-200/70">
              <Sparkles className="w-3.5 h-3.5 text-[#dac9df]" />
              <span>"Vestida de força e dignidade" (Pv 31:25)</span>
            </div>
          </div>

          {/* Categorias da Loja */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3.5">
              Departamentos
            </h4>
            <ul className="space-y-2 text-xs text-purple-200/80">
              <li>
                <button 
                  onClick={() => {
                    onSelectTab('store');
                    const el = document.getElementById('sessao-adulto');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Moda Adulto & Vestidos Mídi
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    onSelectTab('store');
                    const el = document.getElementById('sessao-kids');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Moda Infantil (Kids)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    onSelectTab('store');
                    const el = document.getElementById('sessao-cristao');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Capas de Bíblia & Espaço Cristão
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    onSelectTab('store');
                    const el = document.getElementById('sessao-calcados');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Calçados & Sapatos de Conforto
                </button>
              </li>
            </ul>
          </div>

          {/* Atendimento e Ajuda */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3.5">
              Atendimento & Suporte
            </h4>
            <ul className="space-y-2 text-xs text-purple-200/80">
              <li>
                <button 
                  onClick={() => onSelectTab('customer')}
                  className="hover:text-white transition-colors cursor-pointer font-bold text-[#dac9df]"
                >
                  📦 Meus Pedidos & Rastreamento
                </button>
              </li>
              <li>
                <span className="text-purple-200/60 block">
                  Segunda a Sexta: 09h às 18h
                </span>
              </li>
              <li>
                <span className="text-purple-200/60 block">
                  Envio para todo o território nacional
                </span>
              </li>
              <li className="pt-1">
                <a
                  href="https://wa.me/5511999998888?text=Ol%C3%A1%20Todday%20Modas%2C%20preciso%20de%20ajuda%20com%20um%20pedido."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#dac9df] hover:text-white transition-colors font-medium"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Suporte a Pedidos</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Formas de Pagamento & Segurança */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3.5">
              Formas de Pagamento
            </h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['PIX', 'Visa', 'Mastercard', 'Elo', 'Boleto'].map((method) => (
                <span 
                  key={method}
                  className="px-2.5 py-1 rounded bg-[#271E2D] border border-[#3D2C47] text-white text-[11px] font-bold"
                >
                  {method}
                </span>
              ))}
            </div>

            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              Segurança
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-purple-200/70">
              <ShieldCheck className="w-4 h-4 text-[#dac9df]" />
              <span>Certificado SSL 256 bits</span>
            </div>
          </div>
        </div>

        {/* 4. Linha de Copyright & Acesso da Equipe */}
        <div className="pt-6 border-t border-[#2F2238] flex flex-col sm:flex-row items-center justify-between text-[11px] text-purple-200/60 gap-3">
          <p>© 2026 Todday Modas Brechó. Todos os direitos reservados.</p>
          
          <div className="flex items-center gap-4">
            <span>Moda modesta com elegância</span>
            
            {/* Botão de Acesso Equipe com PIN (apenas quando habilitado) */}
            {onOpenStaffModal && (
              <button
                onClick={onOpenStaffModal}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300 hover:text-white border border-white/10 transition-colors cursor-pointer text-[10px]"
                title="Acesso da Equipe"
              >
                <Lock className="w-3 h-3 text-[#dac9df]" />
                <span>Acesso Equipe</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
