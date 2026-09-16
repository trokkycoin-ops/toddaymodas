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
  Crown
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
  pillars: Array<{ title: string; desc: string }>;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'moda-modesta-principal',
    badge: 'Proposta de Valor Exclusiva • Moda Modesta',
    titlePrefix: 'Elegância e Graça para Celebrar a Sua Essência com',
    highlight: 'Modéstia e Dignidade',
    subtitle: 'Vestidos mídi plissados, saias estruturadas e alfaiataria fina especialmente selecionados com medidas reais na fita métrica, caimento seguro e zero transparência para cultos e celebrações.',
    tagline: 'Modelagens que valorizam você sem abrir mão dos seus princípios e valores.',
    measurementPill: 'Medidas Reais na Fita • Comprimentos Mídi Seguros',
    biblicalVerse: 'Vestida de força e dignidade — Provérbios 31:25',
    ctaText: 'Explorar Moda Modesta',
    secondaryCtaText: 'Ver Vestidos Mídi',
    categoryTarget: 'Moda Feminina (Adulto)',
    sectionTarget: 'sessao-adulto',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85',
    ratingScore: '4.9',
    ratingCount: '+1.200 irmãs atendidas',
    pillars: [
      { title: 'Medidas na Fita', desc: 'Busto, cintura e mídi' },
      { title: 'Zero Transparência', desc: 'Tecidos encorpados' },
      { title: 'Peças Impecáveis', desc: 'Higienizadas e revisadas' },
    ]
  },
  {
    id: 'alfaiataria-e-saias',
    badge: 'Cortes Nobres & Decotes Respeitosos',
    titlePrefix: 'A Perfeita Sintonia entre o Clássico e a',
    highlight: 'Postura Cristã Virtuosa',
    subtitle: 'Saias godê evasê, camisas de tecido nobre e sobreposições elegantes. Peças únicas com acabamento primoroso prontas para vestir você com respeito e sofisticação.',
    tagline: 'Tecidos encorpados de alta qualidade que não marcam e proporcionam total liberdade de movimento.',
    measurementPill: 'Cintura Alta Anatômica • Caimento Impecável',
    biblicalVerse: 'Beleza que reflete serenidade e propósito',
    ctaText: 'Conhecer Alfaiataria',
    secondaryCtaText: 'Ver Saias Godê',
    categoryTarget: 'Moda Feminina (Adulto)',
    sectionTarget: 'sessao-adulto',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
    ratingScore: '5.0',
    ratingCount: 'Seleção 100% aprovada',
    pillars: [
      { title: 'Tecido Encorpado', desc: 'Não marca o corpo' },
      { title: 'Alfaiataria Fina', desc: 'Cortes alinhados' },
      { title: 'Peças Únicas', desc: 'Exclusividade de brechó' },
    ]
  },
  {
    id: 'linha-infantil-modesta',
    badge: 'Delicadeza Infantil • Kids com Conforto',
    titlePrefix: 'Pureza, Liberdade & Ternura para Vestir',
    highlight: 'Crianças com Muito Amor',
    subtitle: 'Vestidinhos encantadores para meninas e conjuntinhos sociais de algodão respirável para meninos. A pureza da infância celebrada com graciosidade.',
    tagline: 'Modelagens infantis confortáveis para ir à igreja, encontros de família e momentos alegres.',
    measurementPill: '100% Algodão Suave • Costuras Antialérgicas',
    biblicalVerse: 'Ensina a criança no caminho em que deve andar',
    ctaText: 'Ver Linha Infantil',
    secondaryCtaText: 'Vestidinhos Kids',
    categoryTarget: 'Moda Infantil',
    sectionTarget: 'sessao-kids',
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1200&q=85',
    ratingScore: '4.9',
    ratingCount: 'Conforto infantil comprovado',
    pillars: [
      { title: '100% Algodão', desc: 'Toque macio na pele' },
      { title: 'Conforto Total', desc: 'Liberdade para brincar' },
      { title: 'Modelagem Doce', desc: 'Elegância infantil' },
    ]
  },
  {
    id: 'artigos-cristaos-biblia',
    badge: 'Espaço Cristão • Artigos de Fé',
    titlePrefix: 'Zelo e Carinho para Guardar e Proteger as',
    highlight: 'Sagradas Escrituras',
    subtitle: 'Capas acolchoadas em matelassê, couro ecológico nobre e semijoias com passagens bíblicas. Um toque de reverência ao seu momento devocional diário.',
    tagline: 'Fechamento com zíper duplo reforçado e compartimento para caneta e marcadores de leitura.',
    measurementPill: 'Compatível com Bíblias Médias e Grandes',
    biblicalVerse: 'Lâmpada para os meus pés é tua palavra — Sl 119:105',
    ctaText: 'Ver Artigos de Fé',
    secondaryCtaText: 'Capas para Bíblia',
    categoryTarget: 'Acessórios Cristãos',
    sectionTarget: 'sessao-cristao',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=85',
    ratingScore: '5.0',
    ratingCount: 'Proteção comprovada',
    pillars: [
      { title: 'Alta Proteção', desc: 'Zíper reforçado' },
      { title: 'Couro Ecológico', desc: 'Matelassê resistente' },
      { title: 'Compartimento Útil', desc: 'Marcadores e caneta' },
    ]
  }
];

export const HeroStore: React.FC<HeroStoreProps> = ({ 
  onExploreClick, 
  onSelectCategory,
  onScrollToSection 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const totalSlides = HERO_SLIDES.length;

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Troca automática de banners a cada 6 segundos, pausada ao passar o mouse ou focar
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      handleNext();
    }, 6000);
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
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      // Arrastou para a esquerda -> próximo slide
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Arrastou para a direita -> slide anterior
      handlePrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleAction = (slide: HeroSlide, targetType: 'primary' | 'secondary' = 'primary') => {
    if (targetType === 'secondary' && onScrollToSection && slide.sectionTarget) {
      onScrollToSection(slide.sectionTarget);
      return;
    }

    if (onScrollToSection && slide.sectionTarget) {
      onScrollToSection(slide.sectionTarget);
    } else if (onSelectCategory && slide.categoryTarget) {
      onSelectCategory(slide.categoryTarget);
    } else {
      onExploreClick();
    }
  };

  return (
    <section 
      className="relative w-full max-w-full overflow-hidden rounded-2xl sm:rounded-3xl mb-8 sm:mb-12 shadow-2xl border border-[#3D2C47] bg-gradient-to-br from-[#1E1624] via-[#271E2D] to-[#150F1A]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Carrossel Principal de Moda Modesta"
      id="tdm-hero-carousel"
    >
      {/* Background Decorativo com Padrões Suaves e Blur */}
      <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#DAC9DF]/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#DFBA5A]/10 blur-3xl" />
      </div>

      {/* ============================================================ */}
      {/* TRILHO DE TRANSIÇÃO LATERAL (SLIDER TRACK)                   */}
      {/* Cada slide ocupa exatamente 100% da largura do contêiner     */}
      {/* Desliza suavemente sem cortes, vazios ou overflow lateral   */}
      {/* ============================================================ */}
      <div 
        className="flex w-full transition-transform duration-600 ease-out will-change-transform"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {HERO_SLIDES.map((slide, idx) => (
          <div 
            key={slide.id}
            className="w-full min-w-full shrink-0 flex-none box-border"
            aria-hidden={idx !== currentSlide}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[460px] sm:min-h-[520px] lg:min-h-[540px]">
              
              {/* ---------------------------------------------------- */}
              {/* COLUNA ESQUERDA: PROPOSTA DE VALOR & CTAs           */}
              {/* ---------------------------------------------------- */}
              <div className="lg:col-span-7 p-5 sm:p-8 md:p-10 lg:p-12 xl:p-14 flex flex-col justify-center relative z-10">
                {/* 1. Badge Superior com Emblema e Versículo */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
                  <div 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#271E2D] shadow-sm border border-white/60 shrink-0"
                    style={{ backgroundColor: '#DAC9DF' }}
                  >
                    <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#271E2D]" />
                    <span>{slide.badge}</span>
                  </div>

                  {slide.biblicalVerse && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium text-purple-200/90 bg-white/10 backdrop-blur-md border border-white/15">
                      <Heart className="w-3 h-3 text-[#DAC9DF]" />
                      <span>{slide.biblicalVerse}</span>
                    </span>
                  )}
                </div>

                {/* 2. Título Principal em Tipografia Serifada */}
                <h1 className="font-serif text-2xl sm:text-3.5xl md:text-4xl lg:text-4.5xl xl:text-5xl font-black text-white leading-tight sm:leading-[1.15] mb-3 sm:mb-4 tracking-tight">
                  {slide.titlePrefix}{' '}
                  <span className="text-[#DAC9DF] relative inline-block underline decoration-[#DAC9DF]/50 decoration-2 sm:decoration-4 underline-offset-4">
                    {slide.highlight}
                  </span>
                </h1>

                {/* 3. Subtítulo Explicativo da Proposta de Valor */}
                <p className="text-xs sm:text-sm md:text-base text-purple-100/90 leading-relaxed mb-5 sm:mb-6 max-w-xl font-normal">
                  {slide.subtitle}
                </p>

                {/* 4. Os 3 Pilares da Proposta de Valor */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 mb-6 sm:mb-7 py-2.5 sm:py-3 px-3 sm:px-3.5 rounded-2xl bg-black/25 backdrop-blur-sm border border-white/10 text-left">
                  {slide.pillars.map((pillar, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#DAC9DF]/20 flex items-center justify-center shrink-0">
                        {pIdx === 0 ? (
                          <Ruler className="w-3.5 h-3.5 text-[#DAC9DF]" />
                        ) : pIdx === 1 ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-[#DAC9DF]" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#DAC9DF]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <strong className="block text-white text-[11px] font-bold leading-tight truncate">
                          {pillar.title}
                        </strong>
                        <span className="text-[10px] text-purple-200/70 truncate block">
                          {pillar.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 5. Botões de Chamada para Ação (CTAs) */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
                  <button
                    type="button"
                    onClick={() => handleAction(slide, 'primary')}
                    className="group flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-black text-xs sm:text-sm text-[#271E2D] transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-[#DAC9DF]/30 cursor-pointer border-2 border-white/60 min-w-[170px]"
                    style={{ backgroundColor: '#DAC9DF' }}
                    id={`hero-cta-btn-${slide.id}`}
                  >
                    <ShoppingBag className="w-4 h-4 text-[#271E2D] group-hover:rotate-6 transition-transform" />
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="w-4 h-4 text-[#271E2D] group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAction(slide, 'secondary')}
                    className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-full font-bold text-xs sm:text-sm text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 transition-all cursor-pointer hover:border-white/50 active:scale-95"
                  >
                    <span>{slide.secondaryCtaText}</span>
                  </button>
                </div>

                {/* 6. Avaliação e Prova Social */}
                <div className="flex items-center gap-2 sm:gap-3 mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-white/10 text-xs text-purple-200/80">
                  <div className="flex items-center gap-0.5 text-[#DFBA5A]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#DFBA5A]" />
                    ))}
                  </div>
                  <span className="text-white font-bold">{slide.ratingScore}</span>
                  <span className="text-purple-300">•</span>
                  <span>{slide.ratingCount}</span>
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* COLUNA DIREITA: VITRINE VISUAL EDITORIAL             */}
              {/* ---------------------------------------------------- */}
              <div className="lg:col-span-5 relative min-h-[300px] sm:min-h-[380px] lg:min-h-[500px] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <div className="relative w-full h-full min-h-[280px] sm:min-h-[360px] lg:min-h-[460px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/20 group">
                  <img
                    src={slide.image}
                    alt={slide.highlight}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradiente de proteção para textos sobre a foto */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E1624] via-transparent to-black/25" />

                  {/* Tag Flutuante Superior de Medidas Reais */}
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20 bg-[#271E2D]/90 backdrop-blur-md border border-[#DAC9DF]/50 px-3 sm:px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg text-[10px] sm:text-[11px] font-bold text-white max-w-[90%] truncate">
                    <Ruler className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#DAC9DF] shrink-0" />
                    <span className="truncate">{slide.measurementPill}</span>
                  </div>

                  {/* Card Flutuante Inferior com Ícone de Cabide da Todday Modas */}
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 z-20 bg-[#1E1624]/92 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Logo variant="symbol" size="sm" theme="dark" />
                      <div className="min-w-0">
                        <strong className="block text-white text-xs font-serif font-black truncate">
                          Todday Modas Ateliê
                        </strong>
                        <span className="text-[10px] text-purple-200/80 line-clamp-1">
                          {slide.tagline}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAction(slide, 'primary')}
                      className="px-3 py-1.5 rounded-xl font-bold text-[11px] text-[#271E2D] bg-[#DAC9DF] hover:bg-white transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                      Ver Peças
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* BOTÕES DE NAVEGAÇÃO LATERAL (ANTERIOR / PRÓXIMO)             */}
      {/* Dimensionados e posicionados sem cortes ou bugs visuais      */}
      {/* ============================================================ */}
      <button
        type="button"
        onClick={handlePrev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-[#271E2D] text-white flex items-center justify-center backdrop-blur-md border border-white/25 transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95"
        title="Coleção Anterior"
        aria-label="Slide Anterior"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-[#271E2D] text-white flex items-center justify-center backdrop-blur-md border border-white/25 transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95"
        title="Próxima Coleção"
        aria-label="Próximo Slide"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      {/* ============================================================ */}
      {/* INDICADORES EM PONTOS (DOTS DE PAGINAÇÃO)                   */}
      {/* ============================================================ */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2 bg-black/45 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
        {HERO_SLIDES.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              idx === currentSlide 
                ? 'w-6 sm:w-8 bg-[#DAC9DF] shadow-sm' 
                : 'w-2 bg-white/40 hover:bg-white/75'
            }`}
            title={`Slide ${idx + 1}: ${item.highlight}`}
            aria-label={`Ir para Slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
