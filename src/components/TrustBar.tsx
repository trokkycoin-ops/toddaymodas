import React from 'react';
import { Truck, CreditCard, RotateCcw, ShieldCheck, Leaf, Award, Heart, Sparkles } from 'lucide-react';

interface TrustItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
  iconComponent: React.ReactNode;
}

const TRUST_ITEMS: TrustItem[] = [
  {
    icon: <Truck className="w-6 h-6" />,
    title: 'Frete para Todo o Brasil',
    description: 'Envio seguro pelos Correios & Transportadoras parceiras',
    accentColor: '#DFBA5A',
    iconComponent: <Truck className="w-6 h-6" />,
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    title: 'Até 6x Sem Juros',
    description: 'No cartão de crédito ou 10% OFF no Pix',
    accentColor: '#8A5D96',
    iconComponent: <CreditCard className="w-6 h-6" />,
  },
  {
    icon: <RotateCcw className="w-6 h-6" />,
    title: 'Troca Fácil em 7 Dias',
    description: 'Garantia total para suas compras sem burocracia',
    accentColor: '#DAC9DF',
    iconComponent: <RotateCcw className="w-6 h-6" />,
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Compra 100% Segura',
    description: 'Ambiente protegido, dados criptografados e LGPD',
    accentColor: '#DFBA5A',
    iconComponent: <ShieldCheck className="w-6 h-6" />,
  },
];

export const TrustBar: React.FC = () => {
  return (
    <section className="relative w-full mb-12 sm:mb-16" aria-label="Benefícios e garantias Todday Modas">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full opacity-5 blur-3xl" style={{ backgroundColor: '#DFBA5A', animation: 'float 20s ease-in-out infinite' }} />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full opacity-5 blur-3xl" style={{ backgroundColor: '#8A5D96', animation: 'float 25s ease-in-out infinite reverse' }} />
        <div className="absolute top-1/2 left-0 w-96 h-96 rounded-full opacity-3 blur-3xl" style={{ backgroundColor: '#DAC9DF', animation: 'float 18s ease-in-out infinite' }} />
      </div>

      <div className="relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] border backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(223,186,90,0.1)', borderColor: 'rgba(223,186,90,0.3)', color: '#DFBA5A' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: '#DFBA5A' }} />
            NOSSOS COMPROMISSOS
          </span>
          <h2 className="mt-4 font-serif font-black text-3xl sm:text-4xl lg:text-5xl text-[#271E2D] leading-tight">
            Por que milhares de mulheres<br />confiam na <span style={{ color: '#8A5D96' }}>Todday Modas</span>
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Cada detalhe pensado para sua tranquilidade: da curadoria das peças à entrega na sua porta.
          </p>
        </div>

        {/* Trust Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {TRUST_ITEMS.map((item, index) => (
            <article
              key={item.title}
              className="group relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all duration-500 hover:-translate-y-1"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both',
              }}
            >
              {/* Background Glow */}
              <div 
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(ellipse at center, ${item.accentColor}15 0%, transparent 70%)` }}
              />
              
              {/* Border Gradient */}
              <div className="absolute inset-0 rounded-3xl p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-full h-full rounded-[inherit] border" style={{ 
                  borderColor: `${item.accentColor}30`,
                  background: `linear-gradient(135deg, ${item.accentColor}10 0%, transparent 50%, ${item.accentColor}05 100%)`
                }} />
              </div>

              {/* Subtle Pattern Overlay */}
              <div className="absolute inset-0 rounded-3xl opacity-5" style={{ 
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V0h4zm10-2h4v-2h-4v2h-4v-2h4zm-10 20h4v-2h-4v2h-4v-2h4z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                backgroundSize: '60px 60px',
              }} />

              <div className="relative z-10 flex flex-col h-full">
                {/* Icon Container */}
                <div className="relative mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                    style={{ 
                      background: `linear-gradient(135deg, ${item.accentColor}20 0%, ${item.accentColor}05 100%)`,
                      borderColor: `${item.accentColor}30`,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                    }}
                  >
                    <div className="relative z-10" style={{ color: item.accentColor }}>
                      {item.iconComponent}
                    </div>
                    {/* Ring Animation */}
                    <div className="absolute inset-0 rounded-2xl border-2 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" style={{ borderColor: `${item.accentColor}40` }} />
                    <div className="absolute inset-0 rounded-2xl border-2 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-1000 delay-150" style={{ borderColor: `${item.accentColor}20` }} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#271E2D] mb-3 group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300"
                  style={{ backgroundImage: 'linear-gradient(135deg, #271E2D 0%, #8A5D96 100%)' }}
                >
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base flex-1">
                  {item.description}
                </p>

                {/* Accent Line */}
                <div className="mt-6 pt-4 border-t transition-all duration-300 group-hover:scale-x-100 scale-x-0 origin-left"
                  style={{ borderColor: `${item.accentColor}30` }}
                >
                  <div className="h-0.5 rounded-full transform origin-left transition-transform duration-500 group-hover:scale-x-100 scale-x-0"
                    style={{ backgroundColor: item.accentColor }}
                  />
                </div>
              </div>
            </article>
          ))}

          {/* Bonus: Stats Bar */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatItem 
                number="+5.000" 
                label="Clientes Satisfeitas" 
                icon={<Heart className="w-5 h-5" />}
                accentColor="#E91E63"
                delay={0}
              />
              <StatItem 
                number="98%" 
                label="Taxa de Aprovação" 
                icon={<Award className="w-5 h-5" />}
                accentColor="#DFBA5A"
                delay={100}
              />
              <StatItem 
                number="+10.000" 
                label="Peças Entregues" 
                icon={<Sparkles className="w-5 h-5" />}
                accentColor="#8A5D96"
                delay={200}
              />
              <StatItem 
                number="7 Dias" 
                label="Garantia de Troca" 
                icon={<RotateCcw className="w-5 h-5" />}
                accentColor="#10B981"
                delay={300}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface StatItemProps {
  number: string;
  label: string;
  icon: React.ReactNode;
  accentColor: string;
  delay: number;
}

const StatItem: React.FC<StatItemProps> = ({ number, label, icon, accentColor, delay }) => (
  <div 
    className="relative group rounded-2xl p-5 sm:p-6 text-center transition-all duration-300 hover:-translate-y-1"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{ background: `linear-gradient(135deg, ${accentColor}10 0%, transparent 100%)` }} />
    <div className="relative z-10">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 mx-auto transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
      >
        {icon}
      </div>
      <div className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-[#271E2D] mb-1">{number}</div>
      <div className="text-slate-600 text-sm sm:text-base font-medium">{label}</div>
      <div className="mt-3 h-px w-12 mx-auto rounded-full origin-center transition-transform duration-500 group-hover:scale-x-125 scale-x-0" style={{ backgroundColor: accentColor }} />
    </div>
  </div>
);