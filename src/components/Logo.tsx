import React from 'react';

interface LogoProps {
  variant?: 'horizontal' | 'stacked' | 'symbol';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark';
  className?: string;
  showTagline?: boolean;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  theme = 'light',
  className = '',
  showTagline = true,
  onClick,
}) => {
  // Configuração dimensional do emblema de cabide
  const dimensions = {
    sm: { symbolSize: 34, titleClass: 'text-base sm:text-lg', subtitleClass: 'text-[9px]', badgeSize: 'text-[9px] px-1 py-0.2' },
    md: { symbolSize: 44, titleClass: 'text-lg sm:text-xl md:text-2xl', subtitleClass: 'text-[10px] sm:text-[11px]', badgeSize: 'text-[10px] sm:text-xs px-1.5 py-0.5' },
    lg: { symbolSize: 54, titleClass: 'text-2xl sm:text-3xl', subtitleClass: 'text-xs', badgeSize: 'text-xs px-2 py-0.5' },
    xl: { symbolSize: 68, titleClass: 'text-3xl sm:text-4xl', subtitleClass: 'text-xs sm:text-sm', badgeSize: 'text-xs sm:text-sm px-2.5 py-1' },
  }[size];

  const isDark = theme === 'dark';

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
      return;
    }
    // Comportamento padrão: rola suavemente para o topo e aciona navegação para Home se aplicável
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const homeTabBtn = document.querySelector('[data-tab="store"]') as HTMLButtonElement | null;
    if (homeTabBtn) homeTabBtn.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as unknown as React.MouseEvent);
    }
  };

  // Ícone de Cabide de Alta Costura e Ateliê em Vetor SVG
  const HangerIcon = (
    <div 
      className="relative shrink-0 select-none group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
      style={{ width: dimensions.symbolSize, height: dimensions.symbolSize }}
    >
      <svg 
        viewBox="0 0 120 120" 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Gradiente de fundo do medalhão de luxo */}
          <radialGradient id={`hangerBg-${theme}-${size}`} cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#3F2A4C"/>
            <stop offset="65%" stopColor="#271E2D"/>
            <stop offset="100%" stopColor="#150E1A"/>
          </radialGradient>
          
          {/* Ouro nobre lapidado */}
          <linearGradient id={`hangerGold-${theme}-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF4D4"/>
            <stop offset="35%" stopColor="#E2C16B"/>
            <stop offset="70%" stopColor="#B3891D"/>
            <stop offset="100%" stopColor="#F5DF9E"/>
          </linearGradient>

          {/* Lavanda suave luminosa */}
          <linearGradient id={`hangerLavender-${theme}-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF"/>
            <stop offset="60%" stopColor="#EBDDF0"/>
            <stop offset="100%" stopColor="#DAC9DF"/>
          </linearGradient>

          {/* Brilho suave */}
          <filter id={`hangerGlow-${theme}-${size}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        {/* Círculo do Medalhão de Fundo */}
        <circle 
          cx="60" 
          cy="60" 
          r="56" 
          fill={`url(#hangerBg-${theme}-${size})`} 
          stroke={`url(#hangerGold-${theme}-${size})`} 
          strokeWidth="1.8"
        />

        {/* Anel de Costura de Alfaiataria Pontilhado */}
        <circle 
          cx="60" 
          cy="60" 
          r="50.5" 
          fill="none" 
          stroke="#DAC9DF" 
          strokeWidth="0.8" 
          strokeDasharray="2 3" 
          opacity="0.75"
        />

        {/* =================================================== */}
        {/* ÍCONE DE CABIDE MODERNO & ELEGANTE                 */}
        {/* =================================================== */}
        <g id="hanger-symbol" filter={`url(#hangerGlow-${theme}-${size})`}>
          {/* Esfera decorativa no topo do gancho */}
          <circle 
            cx="60" 
            cy="23" 
            r="3.2" 
            fill={`url(#hangerGold-${theme}-${size})`}
          />

          {/* Gancho Curvado de Alfaiataria */}
          <path 
            d="M 60,24 C 54,24 49.5,28 49.5,33.5 C 49.5,39 53.5,43 58.5,43.5 L 60,44.5 L 60,52" 
            fill="none" 
            stroke={`url(#hangerGold-${theme}-${size})`} 
            strokeWidth="3.2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />

          {/* Triângulo / Ombros do Cabide com Linhas Fluidas */}
          {/* Ombros externos com cantos arredondados */}
          <path 
            d="M 60,52 
               C 62,52 64,53.5 67,55 
               L 95,69 
               C 99,71 100,74.5 98,77.5 
               C 96.5,79.5 93.5,80.5 90.5,80.5 
               L 29.5,80.5 
               C 26.5,80.5 23.5,79.5 22,77.5 
               C 20,74.5 21,71 25,69 
               L 53,55 
               C 56,53.5 58,52 60,52 Z" 
            fill="none" 
            stroke={`url(#hangerGold-${theme}-${size})`} 
            strokeWidth="3.2" 
            strokeLinejoin="round"
          />

          {/* Barra Horizontal Inferior do Cabide (Suporte de Calças/Saias) */}
          <line 
            x1="28" 
            y1="80.5" 
            x2="92" 
            y2="80.5" 
            stroke={`url(#hangerLavender-${theme}-${size})`} 
            strokeWidth="2.4" 
            strokeLinecap="round"
          />

          {/* Detalhe Central: Estrela de Fé / Diamante no Vértice */}
          <g transform="translate(60, 64)">
            <path 
              d="M 0,-4.5 L 1.3,-1.2 L 4.5,0 L 1.3,1.2 L 0,4.5 L -1.3,1.2 L -4.5,0 L -1.3,-1.2 Z" 
              fill={`url(#hangerGold-${theme}-${size})`}
            />
            <circle cx="0" cy="0" r="0.8" fill="#FFFFFF"/>
          </g>

          {/* Marcadores de Entalhes de Alça de Vestidos Mídi */}
          <path 
            d="M 40,63 L 42,65" 
            stroke={`url(#hangerLavender-${theme}-${size})`} 
            strokeWidth="1.8" 
            strokeLinecap="round"
          />
          <path 
            d="M 80,63 L 78,65" 
            stroke={`url(#hangerLavender-${theme}-${size})`} 
            strokeWidth="1.8" 
            strokeLinecap="round"
          />

          {/* Laço Delicado Inferior de Fita Métrica / Base */}
          <path 
            d="M 50,88 C 55,90 65,90 70,88" 
            fill="none" 
            stroke={`url(#hangerGold-${theme}-${size})`} 
            strokeWidth="1.2" 
            strokeLinecap="round"
          />
          <circle cx="60" cy="89" r="1" fill="#FFFFFF"/>
        </g>
      </svg>
    </div>
  );

  if (variant === 'symbol') {
    return (
      <div 
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        title="Todday Modas - Início"
        aria-label="Todday Modas - Ir para a Página Inicial"
        className={`inline-flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-[#DAC9DF] rounded-full ${className}`}
      >
        {HangerIcon}
      </div>
    );
  }

  return (
    <div 
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      title="Todday Modas - Ir para a Página Inicial"
      aria-label="Todday Modas - Ir para a Página Inicial"
      className={`inline-flex items-center gap-2.5 sm:gap-3.5 group select-none cursor-pointer transition-opacity hover:opacity-90 active:scale-[0.99] outline-none focus-visible:ring-2 focus-visible:ring-[#DAC9DF] rounded-2xl p-1 -m-1 ${
        variant === 'stacked' ? 'flex-col text-center' : 'flex-row text-left'
      } ${className}`}
    >
      {HangerIcon}

      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span 
            className={`font-serif font-black tracking-tight ${dimensions.titleClass} ${
              isDark ? 'text-white' : 'text-[#271E2D]'
            }`}
          >
            Todday Modas
          </span>
          <span 
            className={`font-serif italic font-bold rounded-full border leading-none self-center ${dimensions.badgeSize}`}
            style={{
              backgroundColor: isDark ? 'rgba(218, 201, 223, 0.15)' : '#FAF7FA',
              borderColor: isDark ? 'rgba(218, 201, 223, 0.3)' : '#EBDDF0',
              color: isDark ? '#EBDDF0' : '#846391'
            }}
          >
            Brechó
          </span>
        </div>

        {showTagline && (
          <div 
            className={`flex items-center gap-1 mt-1 font-semibold tracking-wider uppercase ${dimensions.subtitleClass} ${
              isDark ? 'text-[#dac9df]/85' : 'text-[#6b4b7a]'
            }`}
          >
            <span className="text-[#C5A059] font-bold">♦</span>
            <span>Moda Modesta</span>
            <span className="text-[#DAC9DF]">•</span>
            <span>Infantil</span>
            <span className="text-[#DAC9DF]">•</span>
            <span>Cristã</span>
          </div>
        )}
      </div>
    </div>
  );
};
