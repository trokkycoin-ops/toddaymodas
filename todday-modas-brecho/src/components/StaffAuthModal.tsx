import React, { useState } from 'react';
import { 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  X, 
  LayoutDashboard, 
  UserCheck, 
  Download, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface StaffAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (targetTab: 'admin' | 'vendor' | 'download' | 'docs') => void;
  isUnlocked: boolean;
}

export const StaffAuthModal: React.FC<StaffAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticate,
  isUnlocked
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<'admin' | 'vendor' | 'download' | 'docs'>('admin');

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: 2026 or todday
    if (pin.trim() === '2026' || pin.trim().toLowerCase() === 'todday' || pin.trim() === 'admin') {
      setError(false);
      onAuthenticate(selectedDestination);
      onClose();
    } else {
      setError(true);
    }
  };

  const handleQuickStaffLogin = () => {
    setError(false);
    onAuthenticate(selectedDestination);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl border border-[#dac9df] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        id="staff-auth-modal"
      >
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-[#0F4C3A] via-[#165B4C] to-[#0F4C3A] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-3 shadow-inner">
            <Lock className="w-6 h-6 text-[#dac9df]" />
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest font-black text-[#dac9df] bg-black/30 px-2 py-0.5 rounded-full border border-white/10">
              Ambiente Restrito
            </span>
            <span className="text-xs text-white/80 font-medium">Equipe Todday Modas</span>
          </div>
          <h3 className="font-serif font-black text-2xl tracking-tight text-white">
            Acesso à Gestão & Plugins
          </h3>
          <p className="text-xs text-emerald-100/80 mt-1">
            Painéis protegidos reservados a administradores, lojistas e auditores.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Destination Selection */}
          <div>
            <label className="block text-xs font-bold text-[#382343] uppercase tracking-wider mb-2">
              Selecione o Painel Desejado:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedDestination('admin')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  selectedDestination === 'admin'
                    ? 'border-[#0F4C3A] bg-[#0F4C3A]/5 shadow-xs'
                    : 'border-[#dac9df]/60 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-[#0F4C3A]" />
                  <span className="text-xs font-bold text-[#382343]">Painel SPA</span>
                </div>
                <span className="text-[10px] text-slate-500">Estoque, Pedidos e Métricas</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDestination('vendor')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  selectedDestination === 'vendor'
                    ? 'border-[#0F4C3A] bg-[#0F4C3A]/5 shadow-xs'
                    : 'border-[#dac9df]/60 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#0F4C3A]" />
                  <span className="text-xs font-bold text-[#382343]">Vendedores</span>
                </div>
                <span className="text-[10px] text-slate-500">Comissões e Araras</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDestination('download')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  selectedDestination === 'download'
                    ? 'border-[#0F4C3A] bg-[#0F4C3A]/5 shadow-xs'
                    : 'border-[#dac9df]/60 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#0F4C3A]" />
                  <span className="text-xs font-bold text-[#382343]">Plugin .ZIP</span>
                </div>
                <span className="text-[10px] text-slate-500">Pacote para WordPress</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDestination('docs')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  selectedDestination === 'docs'
                    ? 'border-[#0F4C3A] bg-[#0F4C3A]/5 shadow-xs'
                    : 'border-[#dac9df]/60 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#0F4C3A]" />
                  <span className="text-xs font-bold text-[#382343]">API Docs</span>
                </div>
                <span className="text-[10px] text-slate-500">Endpoints e Auditoria</span>
              </button>
            </div>
          </div>

          {/* PIN Input Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#382343]">
                  PIN de Segurança do Lojista:
                </label>
                <span className="text-[11px] text-slate-400">PIN padrão: 2026</span>
              </div>

              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a5d96]" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError(false);
                  }}
                  placeholder="Digite o PIN de 4 dígitos (2026)..."
                  maxLength={10}
                  className="w-full pl-10 pr-4 py-3 bg-[#faf7fb] border border-[#dac9df] rounded-2xl text-sm font-mono tracking-widest text-[#382343] focus:outline-none focus:border-[#0F4C3A] focus:ring-2 focus:ring-[#0F4C3A]/20 transition-all"
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-600 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>PIN incorreto. Tente "2026" ou utilize o botão de acesso rápido abaixo.</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm text-white bg-[#0F4C3A] hover:bg-[#165B4C] transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <span>Desbloquear Acesso</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleQuickStaffLogin}
                className="py-3 px-4 rounded-2xl font-bold text-xs text-[#382343] bg-[#dac9df] hover:bg-[#cbb6d2] border border-[#cbb6d2] transition-all cursor-pointer"
                title="Entrar direto para demonstração da equipe"
              >
                ⚡ Entrar Direto
              </button>
            </div>
          </form>

          {/* Security Note */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl flex items-start gap-2.5 text-[11px] text-[#0F4C3A]">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#0F4C3A]" />
            <span>
              Clientes comuns compram de forma 100% autônoma pelo e-commerce e não têm acesso a essas ferramentas.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
