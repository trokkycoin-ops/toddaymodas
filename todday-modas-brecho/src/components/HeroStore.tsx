import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight,
  Tag
} from 'lucide-react';

interface HeroStoreProps {
  onExploreClick: () => void;
  onSelectCategory?: (category: string) => void;
  onScrollToSection?: (sectionId: string) => void;
}

interface BannerSlide {
  id: string;
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
  ctaText: string;
  categoryTarget: string;
  sectionTarget: string;
  image: string;
  discountTag?: string;
}

const BANNER_SLIDES: BannerSlide[] = [
  {
    id: 'slide-feminino',
    badge: 'Coleção Exclusiva',
    title: 'Elegância & Modéstia para',
    highlight: 'Cultos e Momentos Especiais',
    subtitle: 'Vestidos mídi plissados, saias godê e alfaiataria fina. Peças únicas com medidas reais na fita métrica.',
    ctaText: 'Ver Moda Feminina',
    categoryTarget: 'Moda Feminina (Adulto)',
    sectionTarget: 'sessao-adulto',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=85',
    discountTag: 'Peças Únicas'
  },
  {
    id: 'slide-kids',
    badge: 'Especial Kids',
    title: 'Moda Infantil com',
    highlight: 'Conforto & Delicadeza',
    subtitle: 'Vestidinhos encantadores, camisas e conjuntinhos sociais para as crianças celebrarem com conforto.',
    ctaText: 'Explorar Linha Kids',
    categoryTarget: 'Moda Infantil',
    sectionTarget: 'sessao-kids',
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1600&q=85',
    discountTag: 'Até 50% OFF'
  },
  {
    id: 'slide-cristao',
    badge: 'Artigos de Fé',
    title: 'Capas Acolchoadas para',
    highlight: 'Bíblias & Semijoias Nobres',
    subtitle: 'Proteja as Sagradas Escrituras com acabamento artesanal em couro legítimo ecológico e detalhes dourados.',
    ctaText: 'Ver Artigos Cristãos',
    categoryTarget: 'Acessórios Cristãos',
    sectionTarget: 'sessao-cristao',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1600&q=85',
    discountTag: 'Alta Proteção'
  },
  {
    id: 'slide-calcados',
    badge: 'Conforto Absoluto',
    title: 'Scarpins Salto Bloco &',
    highlight: 'Sapatos de Alfaiataria',
    subtitle: 'Palmilha anatômica e solado anti-impacto para você ficar confortável do início ao fim.',
    ctaText: 'Ver Calçados',
    categoryTarget: 'Calçados',
    sectionTarget: 'sessao-calcados',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1600&q=85',
    discountTag: 'Conforto Gel'
  }
];

export const HeroStore: React.FC<HeroStoreProps> = ({ 
  onExploreClick, 
  onSelectCategory,
  onScrollToSection 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Troca automática de banners a cada 5.5 segundos estilo By Sophi
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
  };

  const handleBannerAction = (slide: BannerSlide) => {
    if (onScrollToSection && slide.sectionTarget) {
      onScrollToSection(slide.sectionTarget);
    } else if (onSelectCategory && slide.categoryTarget) {
      onSelectCategory(slide.categoryTarget);
    } else {
      onExploreClick();
    }
  };

  const slide = BANNER_SLIDES[currentSlide];

  return (
    <div 
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden mb-8 sm:mb-12 shadow-xl border border-[#EBDDF0] bg-[#271E2D]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      id="tdm-hero-carousel"
    >
      {/* Imagem de Fundo com Transição Suave e Overlay Gradiente */}
      <div className="relative w-full min-h-[360px] sm:min-h-[440px] md:min-h-[480px] flex items-center">
        {BANNER_SLIDES.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover object-center"
            />
            {/* Gradiente escuro elegante para máxima legibilidade do texto */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1B1420]/95 via-[#231A29]/75 to-transparent sm:to-black/30" />
          </div>
        ))}

        {/* Conteúdo do Banner (Texto Comercial e Botão) */}
        <div className="relative z-20 max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-10 sm:py-16 w-full">
          <div className="max-w-xl">
            {/* Badge de Categoria do Banner em Lilás #dac9df */}
            <div className="flex items-center gap-2 mb-3">
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#271E2D] shadow-sm"
                style={{ backgroundColor: '#dac9df' }}
              >
                <Sparkles className="w-3 h-3 text-[#271E2D]" />
                <span>{slide.badge}</span>
              </span>

              {slide.discountTag && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold text-white bg-white/20 backdrop-blur-md border border-white/30">
                  <Tag className="w-3 h-3 text-[#dac9df]" />
                  <span>{slide.discountTag}</span>
                </span>
              )}
            </div>

            {/* Título de Destaque */}
            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight sm:leading-[1.15] mb-3">
              {slide.title}{' '}
              <span className="text-[#dac9df] underline decoration-[#dac9df]/50 decoration-2">
                {slide.highlight}
              </span>
            </h1>

            {/* Subtítulo Curto e Direto */}
            <p className="text-xs sm:text-sm md:text-base text-purple-100/90 mb-6 leading-relaxed max-w-lg font-sans">
              {slide.subtitle}
            </p>

            {/* Botão de Compra e Ação Direta */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleBannerAction(slide)}
                className="flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full font-black text-xs sm:text-sm text-[#271E2D] transition-all hover:scale-105 active:scale-95 shadow-lg cursor-pointer border border-white/50"
                style={{ backgroundColor: '#dac9df' }}
                id={`tdm-banner-cta-${slide.id}`}
              >
                <ShoppingBag className="w-4 h-4 text-[#271E2D]" />
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-4 h-4 text-[#271E2D]" />
              </button>

              <button
                type="button"
                onClick={onExploreClick}
                className="px-5 py-3 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 transition-all cursor-pointer"
              >
                Ver Todas as Peças
              </button>
            </div>
          </div>
        </div>

        {/* Setas de Navegação do Carrossel (Esquerda / Direita) */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-[#271E2D] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md hover:scale-110"
          title="Banner Anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-[#271E2D] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md hover:scale-110"
          title="Próximo Banner"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Indicadores em Pontos (Dots de Paginação) */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {BANNER_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentSlide 
                  ? 'w-7 sm:w-8 shadow-sm' 
                  : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              style={idx === currentSlide ? { backgroundColor: '#dac9df' } : {}}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
