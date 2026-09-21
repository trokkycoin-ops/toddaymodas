import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight, 
  Ruler, 
  ShieldCheck, 
  Heart, 
  Star,
  CheckCircle2,
  Crown,
  Leaf,
  Gem,
  Award
} from 'lucide-react';
import { Logo } from './Logo';

interface HeroStoreProps {
  onExploreClick: () => void;
  onSelectCategory?: (category: string) => void;
  onScrollToSection?: (sectionId: string) => void;
}

interface HeroSlide {
  id: string;
  badge: string;
  titlePrefix: string;
  highlight: string;
  subtitle: string;
  tagline: string;
  measurementPill: string;
  biblicalVerse?: string;
  ctaText: string;
  secondaryCtaText: string;
  categoryTarget: string;
  sectionTarget: string;
  image: string;
  ratingScore: string;
  ratingCount: string;
  pillars: Array<{ title: string; desc: string; icon: React.ReactNode }>;
  gradient: string;
  accentColor: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'moda-modesta-principal',
    badge: 'COLEÇÃO EXCLUSIVA • MODA MODESTA PREMIUM',
    titlePrefix: 'Elegância e Graça para Celebrar a Sua Essência com',
    highlight: 'Modéstia e Dignidade',
    subtitle: 'Vestidos mídi plissados, saias estruturadas e alfaiataria fina especialmente selecionados com medidas reais na fita métrica, caimento seguro e zero transparência para cultos e celebrações.',
    tagline: 'Modelagens que valorizam você sem abrir mão dos seus princípios e valores.',
    measurementPill: 'Medidas Reais na Fita • Comprimentos Mídi Seguros',
    biblicalVerse: '"Vestida de força e dignidade" — Provérbios 31:25',
    ctaText: 'Explorar Moda Modesta',
    secondaryCtaText: 'Ver Vestidos Mídi',
    categoryTarget: 'Moda Feminina (Adulto)',
    sectionTarget: 'sessao-adulto',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1920&q=85',
    ratingScore: '4.9',
    ratingCount: '+1.200 irmãs atendidas',
    pillars: [
      { title: 'Medidas na Fita', desc: 'Busto, cintura e mídi', icon: <Ruler className="w-5 h-5" /> },
      { title: 'Zero Transparência', desc: 'Tecidos encorpados', icon: <ShieldCheck className="w-5 h-5" /> },
      { title: 'Peças Impecáveis', desc: 'Higienizadas e revisadas', icon: <Gem className="w-5 h-5" /> },
    ],
    gradient: 'from-[#271E2D] via-[#3B0764] to-[#1A0F1E]',
    accentColor: '#DFBA5A',
  },
  {
    id: 'alfaiataria-e-saias',
    badge: 'CORTES NOBRES & DECOTES RESPEITOSOS',
    titlePrefix: 'A Perfeita Sintonia entre o Clássico e a',
    highlight: 'Postura Cristã Virtuosa',
    subtitle: 'Saias godê evasê, camisas de tecido nobre e sobreposições elegantes. Peças únicas com acabamento primoroso prontas para vestir você com respeito e sofisticação.',
    tagline: 'Tecidos encorpados de alta qualidade que não marcam e proporcionam total liberdade de movimento.',
    measurementPill: 'Cintura Alta Anatômica • Caimento Impecável',
    biblicalVerse: '"Beleza que reflete serenidade e propósito"',
    ctaText: 'Conhecer Alfaiataria',
    secondaryCtaText: 'Ver Saias Godê',
    categoryTarget: 'Moda Feminina (Adulto)',
    sectionTarget: 'sessao-adulto',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=85',
    ratingScore: '5.0',
    ratingCount: 'Seleção 100% aprovada',
    pillars: [
      { title: 'Tecido Encorpado', desc: 'Não marca o corpo', icon: <Leaf className="w-5 h-5" /> },
      { title: 'Alfaiataria Fina', desc: 'Cortes alinhados', icon: <Award className="w-5 h-5" /> },
      { title: 'Peças Únicas', desc: 'Exclusividade de brechó', icon: <Gem className="w-5 h-5" /> },
    ],
    gradient: 'from-[#1A0F1E] via-[#2D1B3D] to-[#3B0764]',
    accentColor: '#DAC9DF',
  },
  {
    id: 'linha-infantil-modesta',
    badge: 'DELICADEZA INFANTIL • KIDS COM CONFORTO',
    titlePrefix: 'Pureza, Liberdade & Ternura para Vestir',
    highlight: 'Crianças com Muito Amor',
    subtitle: 'Vestidinhos encantadores para meninas e conjuntinhos sociais de algodão respirável para meninos. A pureza da infância celebrada com graciosidade.',
    tagline: 'Modelagens infantis confortáveis para ir à igreja, encontros de família e momentos alegres.',
    measurementPill: '100% Algodão Suave • Costuras Antialérgicas',
    biblicalVerse: '"Ensina a criança no caminho em que deve andar"',
    ctaText: 'Ver Linha Infantil',
    secondaryCtaText: 'Vestidinhos Kids',
    categoryTarget: 'Moda Infantil',
    sectionTarget: 'sessao-kids',
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1920&q=85',
    ratingScore: '4.9',
    ratingCount: 'Conforto infantil comprovado',
    pillars: [
      { title: '100% Algodão', desc: 'Toque macio na pele', icon: <Leaf className="w-5 h-5" /> },
      { title: 'Conforto Total', desc: 'Liberdade para brincar', icon: <Heart className="w-5 h-5" /> },
      { title: 'Modelagem Doce', desc: 'Elegância infantil', icon: <Sparkles className="w-5 h-5" /> },
    ],
    gradient: 'from-[#F5EFF7] via-[#FAF7FB] to-[#F0E6F5]',
    accentColor: '#8A5D96',
  },
  {
    id: 'artigos-cristaos-biblia',
    badge: 'ESPAÇO CRISTÃO • ARTIGOS DE FÉ PREMIUM',
    titlePrefix: 'Zelo e Carinho para Guardar e Proteger as',
    highlight: 'Sagradas Escrituras',
    subtitle: 'Capas acolchoadas em matelassê, couro ecológico nobre e semijoias com passagens bíblicas. Um toque de reverência ao seu momento devocional diário.',
    tagline: 'Fechamento com zíper duplo reforçado e compartimento para caneta e marcadores de leitura.',
    measurementPill: 'Compatível com Bíblias Médias e Grandes',
    biblicalVerse: '"Lâmpada para os meus pés é tua palavra" — Sl 119:105',
    ctaText: 'Ver Artigos de Fé',
    secondaryCtaText: 'Capas para Bíblia',
    categoryTarget: 'Acessórios Cristãos',
    sectionTarget: 'sessao-cristao',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1920&q=85',
    ratingScore: '5.0',
    ratingCount: 'Proteção comprovada',
    pillars: [
      { title: 'Alta Proteção', desc: 'Zíper reforçado', icon: <ShieldCheck className="w-5 h-5" /> },
      { title: 'Couro Ecológico', desc: 'Matelassê resistente', icon: <Leaf className="w-5 h-5" /> },
      { title: 'Compartimento Útil', desc: 'Marcadores e caneta', icon: <Gem className="w-5 h-5" /> },
    ],
    gradient: 'from-[#271E2D] via-[#1A0F1E] to-[#0D080F]',
    accentColor: '#DFBA5A',
  }
];

export const HeroStore: React.FC<HeroStoreProps> = ({ 
  onExploreClick, 
  onSelectCategory,
  onScrollToSection 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const slideRef = useRef<HTMLDivElement>(null);

  const totalSlides = HERO_SLIDES.length;
  const slide = HERO_SLIDES[currentSlide];

  const handleNext = useCallback(() => {
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setTimeout(() => setIsAnimating(false), 600);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setTimeout(() => setIsAnimating(false), 600);
  }, [totalSlides]);

  const goToSlide = useCallback((index: number) => {
    if (index === currentSlide) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 600);
  }, [currentSlide]);

  // Troca automática de banners a cada 7 segundos, pausada ao passar o mouse ou focar
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      handleNext();
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused, handleNext]);

  // Suporte a swipe por toque (touch gestures) para celulares e tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };

  return (
    <section 
      ref={slideRef}
      className="relative w-full overflow-hidden rounded-3xl mb-10 sm:mb-14"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Carrossel de destaque Todday Modas"
    >
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={slide.image}
          alt=""
          className={`w-full h-full object-cover transition-all duration-1000 ease-out ${isAnimating ? 'scale-105 opacity-50' : 'scale-100 opacity-100'}`}
          loading={currentSlide === 0 ? 'eager' : 'lazy'}
        />
        <div className="absolute inset-0 bg-gradient-to-r" style={{ background: slide.gradient }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(39,30,45,0.4)_100%)]" />
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 z-5 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-5 w-24 h-24 rounded-full opacity-10 animate-pulse-slow" style={{ backgroundColor: slide.accentColor, animationDuration: '8s' }} />
        <div className="absolute bottom-1/3 right-10 w-32 h-32 rounded-full opacity-5 animate-float" style={{ backgroundColor: slide.accentColor, animationDuration: '12s' }} />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full opacity-10 animate-pulse-slow" style={{ backgroundColor: slide.accentColor, animationDuration: '10s' }} />
        <div className="absolute bottom-20 left-1/3 w-20 h-20 rounded-full opacity-5 animate-float" style={{ backgroundColor: slide.accentColor, animationDuration: '15s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-[520px] sm:min-h-[600px] flex items-center p-6 sm:p-10 lg:p-16">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Copy */}
            <div className="text-white animate-slide-up" style={{ animationDelay: isAnimating ? '200ms' : '0ms' }}>
              {/* Badge */}
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] border backdrop-blur-sm"
                style={{ backgroundColor: `${slide.accentColor}20`, borderColor: `${slide.accentColor}40`, color: slide.accentColor }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: slide.accentColor }} />
                {slide.badge}
              </span>

              {/* Title */}
              <h1 className="mt-6 font-serif font-black leading-[1.1] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight">
                <span className="block text-white/90">{slide.titlePrefix}</span>
                <span className="block relative inline-block" style={{ color: slide.accentColor }}>
                  {slide.highlight}
                  <span className="absolute bottom-0 left-0 right-0 h-1.5 -translate-y-1/2 opacity-30" style={{ backgroundColor: slide.accentColor }} />
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-lg sm:text-xl text-white/80 leading-relaxed max-w-xl">
                {slide.subtitle}
              </p>

              {/* Tagline */}
              <p className="mt-5 text-base sm:text-lg italic text-white/60 leading-relaxed max-w-xl border-l-2 pl-4" style={{ borderColor: slide.accentColor }}>
                {slide.tagline}
              </p>

              {/* Measurement Pill */}
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-sm"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', borderWidth: '1px', borderStyle: 'solid', color: slide.accentColor }}
                >
                  <Ruler className="w-4 h-4" />
                  {slide.measurementPill}
                </span>
              </div>

              {/* Rating & Social Proof */}
              <div className="mt-8 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1" aria-hidden="true">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" style={{ color: slide.accentColor }} />
                    ))}
                  </div>
                  <span className="text-xl font-black" style={{ color: slide.accentColor }}>{slide.ratingScore}</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-white/70 text-sm">{slide.ratingCount}</p>
                  {slide.biblicalVerse && (
                    <p className="text-white/50 text-xs italic mt-0.5">{slide.biblicalVerse}</p>
                  )}
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(slide.categoryTarget);
                    if (onScrollToSection) onScrollToSection(slide.sectionTarget);
                    onExploreClick();
                  }}
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-base sm:text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-[#271E2D]"
                  style={{ backgroundColor: slide.accentColor, color: '#271E2D' }}
                >
                  <span className="relative z-10">{slide.ctaText}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  <span className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(slide.categoryTarget);
                    if (onScrollToSection) onScrollToSection(slide.sectionTarget);
                  }}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-base sm:text-lg transition-all duration-300 border-2 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-[#271E2D]"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  <span className="relative z-10">{slide.secondaryCtaText}</span>
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>

              {/* Pillars */}
              <div className="mt-12 grid grid-cols-3 gap-4 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                {slide.pillars.map((pillar, i) => (
                  <div key={i} className="text-center group" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 transition-all duration-300 group-hover:scale-110"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: '1px', borderStyle: 'solid', color: slide.accentColor }}
                    >
                      {pillar.icon}
                    </div>
                    <h4 className="font-bold text-white text-sm mb-1">{pillar.title}</h4>
                    <p className="text-white/60 text-xs leading-tight">{pillar.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative animate-fade-in" style={{ animationDelay: '300ms' }}>
              {/* Decorative Frame */}
              <div className="relative">
                {/* Corner Accents */}
                <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 rounded-tl-xl transition-opacity duration-300" style={{ borderColor: slide.accentColor, opacity: 0.6 }} />
                <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 rounded-tr-xl transition-opacity duration-300" style={{ borderColor: slide.accentColor, opacity: 0.6 }} />
                <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 rounded-bl-xl transition-opacity duration-300" style={{ borderColor: slide.accentColor, opacity: 0.6 }} />
                <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 rounded-br-xl transition-opacity duration-300" style={{ borderColor: slide.accentColor, opacity: 0.6 }} />

                {/* Main Image with Parallax Effect */}
                <div className="relative aspect-[3/4] sm:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br" style={{ boxShadow: `0 25px 50px -12px ${slide.accentColor}40` }}>
                  <img
                    src={slide.image}
                    alt={slide.badge}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out hover:scale-102"
                    loading="eager"
                  />
                  {/* Gradient overlay on image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>

                {/* Floating badges on image */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(39,30,45,0.9)', color: slide.accentColor, borderColor: 'rgba(255,255,255,0.1)', borderWidth: '1px', borderStyle: 'solid' }}
                  >
                    PEÇA ÚNICA
                  </span>
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', borderColor: 'rgba(255,255,255,0.2)', borderWidth: '1px', borderStyle: 'solid' }}
                  >
                    EXCLUSIVO TODDAY
                  </span>
                </div>

                {/* Bottom right - Rating */}
                <div className="absolute bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl"
                  style={{ backgroundColor: 'rgba(39,30,45,0.85)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: '1px', borderStyle: 'solid' }}
                >
                  <div className="flex items-center gap-1" style={{ color: slide.accentColor }}>
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-white text-sm">{slide.ratingScore}</p>
                    <p className="text-white/70 text-[11px]">{slide.ratingCount}</p>
                  </div>
                </div>
              </div>

              {/* Slide Indicators */}
              <div className="mt-8 flex items-center justify-center gap-2">
                {HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToSlide(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2`}
                    style={{
                      backgroundColor: i === currentSlide ? slide.accentColor : 'rgba(255,255,255,0.3)',
                      width: i === currentSlide ? '2rem' : '0.625rem',
                      borderRadius: i === currentSlide ? '9999px' : '9999px',
                    }}
                    aria-label={`Ir para slide ${i + 1}`}
                    aria-current={i === currentSlide ? 'true' : 'false'}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={handlePrev}
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{ 
          backgroundColor: 'rgba(39,30,45,0.7)', 
          color: 'white',
          borderColor: 'rgba(255,255,255,0.2)',
          borderWidth: '1px',
          borderStyle: 'solid',
          opacity: isPaused ? 1 : 0.7,
        }}
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        type="button"
        onClick={handleNext}
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{ 
          backgroundColor: 'rgba(39,30,45,0.7)', 
          color: 'white',
          borderColor: 'rgba(255,255,255,0.2)',
          borderWidth: '1px',
          borderStyle: 'solid',
          opacity: isPaused ? 1 : 0.7,
        }}
        aria-label="Próximo slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-gentle">
        <div className="w-6 h-10 border-2 rounded-full flex justify-center pt-2" style={{ borderColor: 'rgba(255,255,255,0.4)' }}>
          <div className="w-1.5 h-1.5 rounded-full animate-scroll-indicator" style={{ backgroundColor: slide.accentColor }} />
        </div>
      </div>
    </section>
  );
};