import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Ruler, 
  Sparkles, 
  Star, 
  Check, 
  Truck, 
  RotateCcw, 
  Lock,
  ArrowRight,
  Flame,
  Tag,
  Heart,
  Share2,
  Copy,
  ChevronRight,
  ShieldCheck,
  Maximize2,
  Minimize2,
  ZoomIn,
  Package,
  ThumbsUp,
  Bell,
  FileText,
  Minus,
  Plus
} from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  allProducts?: Product[];
  onClose: () => void;
  onAddToCart: (product: Product, selectedSize?: string, selectedColor?: string, quantity?: number) => void;
  onQuickCheckout?: (product: Product, selectedSize?: string, selectedColor?: string, quantity?: number) => void;
  onSelectProduct?: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  allProducts = [],
  onClose,
  onAddToCart,
  onQuickCheckout,
  onSelectProduct
}) => {
  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState<string>(
    product.available_sizes?.[0] || product.size
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product.available_colors?.[0]?.name || product.color
  );
  const [showMeasureGuide, setShowMeasureGuide] = useState<boolean>(false);
  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [isExpandedFull, setIsExpandedFull] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'measures' | 'care' | 'reviews'>('desc');
  
  // Quantidade selecionada (By Sophi)
  const [quantity, setQuantity] = useState<number>(1);
  const [copiedCoupon, setCopiedCoupon] = useState<boolean>(false);

  // Alerta de Preço
  const [priceAlertActive, setPriceAlertActive] = useState<boolean>(false);
  const [showPriceAlertModal, setShowPriceAlertModal] = useState<boolean>(false);
  const [priceAlertContact, setPriceAlertContact] = useState<string>('');

  // Provador Virtual (Sizebay / By Sophi Style)
  const [showVirtualFitting, setShowVirtualFitting] = useState<boolean>(false);
  const [vfHeight, setVfHeight] = useState<string>('165');
  const [vfWeight, setVfWeight] = useState<string>('64');
  const [vfAge, setVfAge] = useState<string>('35');
  const [vfShape, setVfShape] = useState<string>('regular');
  const [vfResult, setVfResult] = useState<string | null>(null);

  // Simulador de Frete Correios
  const [cepInput, setCepInput] = useState<string>('');
  const [shippingCalculated, setShippingCalculated] = useState<boolean>(false);
  const [shippingLoading, setShippingLoading] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showPixNoticeModal, setShowPixNoticeModal] = useState<boolean>(false);

  // Preço e Desconto Pix (Estilo By Sophi: 10% de desconto à vista no Pix)
  const pixDiscountPercent = 10;
  const pixPrice = product.price * (1 - pixDiscountPercent / 100);
  const pixSavings = product.price - pixPrice;
  const regularSavings = product.regular_price ? product.regular_price - product.price : 0;
  const totalSavings = regularSavings + pixSavings;
  const installment10x = (product.price / 10).toFixed(2).replace('.', ',');
  const installment3x = (product.price / 3).toFixed(2).replace('.', ',');
  const cashbackValue = (product.price * 0.05).toFixed(2).replace('.', ',');

  // Galeria completa de imagens
  const images = product.gallery && product.gallery.length > 0 
    ? product.gallery 
    : [product.image];

  const handleAdd = () => {
    onAddToCart(product, selectedSize, selectedColor, quantity);
    onClose();
  };

  const handleBuyNow = () => {
    if (onQuickCheckout) {
      onQuickCheckout(product, selectedSize, selectedColor, quantity);
    } else {
      onAddToCart(product, selectedSize, selectedColor, quantity);
      onClose();
    }
  };

  const handleCopyCoupon = () => {
    navigator.clipboard?.writeText?.('BEMVINDA10');
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 3000);
  };

  const handleShareSocial = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Confira ${product.name} na Todday Modas!`,
        url: window.location.href,
      }).catch(() => handleCopyShareLink());
    } else {
      handleCopyShareLink();
    }
  };

  const handleCalcProvador = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(vfWeight) || 64;
    const sizes = product.available_sizes && product.available_sizes.length > 0
      ? product.available_sizes
      : ['P (36-38)', 'M (38-40)', 'G (42-44)', 'GG (46-48)'];

    let targetCode = 'M';
    if (w < 55) targetCode = 'P';
    else if (w <= 66) targetCode = 'M';
    else if (w <= 78) targetCode = 'G';
    else targetCode = 'GG';

    const matched = sizes.find((s) => s.startsWith(targetCode) || s.includes(targetCode));
    setVfResult(matched || sizes[0] || 'M (38-40)');
  };

  const handleApplyRecommendedSize = () => {
    if (vfResult) {
      setSelectedSize(vfResult);
      setShowVirtualFitting(false);
    }
  };

  const handleCalculateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cepInput || cepInput.length < 8) return;
    setShippingLoading(true);
    setTimeout(() => {
      setShippingLoading(false);
      setShippingCalculated(true);
    }, 600);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Produtos recomendados (Combine o Look)
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`bg-white rounded-3xl w-full shadow-2xl border border-[#EBDDF0] relative flex flex-col transition-all duration-300 ${
          isExpandedFull 
            ? 'max-w-7xl h-[98vh] max-h-[98vh]' 
            : 'max-w-5xl max-h-[94vh]'
        } overflow-y-auto scrollbar-thin scrollbar-thumb-[#dac9df]`}
        onClick={(e) => e.stopPropagation()}
        id="tdm-product-modal"
      >
        {/* ======================================================== */}
        {/* BARRA SUPERIOR: BREADCRUMBS & BOTÕES DE CONTROLE         */}
        {/* ======================================================== */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3 border-b border-[#EBDDF0] flex items-center justify-between gap-3">
          {/* Breadcrumbs By Sophi Style */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto scrollbar-none whitespace-nowrap">
            <span className="font-semibold text-gray-400">Início</span>
            <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
            <span className="font-semibold text-gray-400">{product.category}</span>
            <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
            <span className="font-bold text-[#271E2D] truncate max-w-[200px] sm:max-w-xs">
              {product.name}
            </span>
          </nav>

          {/* Botões de Ação Topo: Expandir, Compartilhar e Fechar */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopyShareLink}
              className="p-2 rounded-full text-gray-500 hover:text-[#271E2D] hover:bg-[#FAF7FA] transition-colors cursor-pointer"
              title="Copiar Link da Peça"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsExpandedFull(!isExpandedFull)}
              className="hidden sm:flex p-2 rounded-full text-gray-500 hover:text-[#271E2D] hover:bg-[#FAF7FA] transition-colors cursor-pointer"
              title={isExpandedFull ? 'Modo Normal' : 'Modo Página Completa'}
            >
              {isExpandedFull ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:text-[#271E2D] hover:bg-[#dac9df]/50 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notificação flutuante de link copiado */}
        {copiedLink && (
          <div className="bg-[#271E2D] text-white text-xs font-bold py-1.5 px-4 rounded-full fixed top-16 left-1/2 -translate-x-1/2 z-50 shadow-lg animate-in fade-in">
            Link do produto copiado com sucesso!
          </div>
        )}

        {/* ======================================================== */}
        {/* CORPO DO PRODUTO (LAYOUT DE ALTA GRIFE BY SOPHI)         */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* ---------------------------------------------------- */}
            {/* COLUNA ESQUERDA: GALERIA DE FOTOS BY SOPHI           */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                
                {/* Miniaturas laterais (Desktop) / Inferiores (Mobile) */}
                {images.length > 1 && (
                  <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto max-h-[480px] scrollbar-none shrink-0">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImage(img)}
                        className={`w-14 h-18 sm:w-18 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                          activeImage === img
                            ? 'border-[#271E2D] shadow-md ring-2 ring-[#dac9df]'
                            : 'border-[#EBDDF0] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Foto Principal com Efeito de Zoom */}
                <div 
                  className="relative flex-1 aspect-[3/4] rounded-3xl overflow-hidden bg-[#FAF7FA] border border-[#EBDDF0] shadow-sm group cursor-crosshair"
                  onClick={() => setIsZoomed(!isZoomed)}
                >
                  <img
                    src={activeImage}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isZoomed ? 'scale-150 cursor-zoom-out' : 'group-hover:scale-105'
                    }`}
                  />

                  {/* Badges Flutuantes de Alta Grife */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-[#271E2D] shadow-sm border border-white/70 backdrop-blur-xs"
                      style={{ backgroundColor: '#dac9df' }}
                    >
                      10% OFF no Pix
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#271E2D]/85 backdrop-blur-xs">
                      {product.condition}
                    </span>
                  </div>

                  {/* Botão Favoritar & Ícone de Lupa */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFavorite(!isFavorite);
                      }}
                      className="p-2.5 rounded-full bg-white/90 hover:bg-white text-gray-600 shadow-md transition-all cursor-pointer"
                      title={isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
                    </button>
                    
                    <span className="p-2.5 rounded-full bg-white/80 text-gray-500 backdrop-blur-xs shadow-sm self-end hidden sm:flex">
                      <ZoomIn className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Legenda de zoom no rodapé da imagem */}
                  <div className="absolute bottom-3 inset-x-3 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] bg-black/60 text-white px-3 py-1 rounded-full font-medium backdrop-blur-xs">
                      {isZoomed ? 'Clique para diminuir o zoom' : 'Passe o cursor ou clique para zoom'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selo de Garantia da Peça Única Todday Modas */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7FA] border border-[#EBDDF0] flex items-center gap-3">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#dac9df' }}
                >
                  <ShieldCheck className="w-5 h-5 text-[#271E2D]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#271E2D]">
                    Garantia de Autenticidade & Medidas Reais
                  </div>
                  <p className="text-[11px] text-gray-500 leading-tight">
                    Peça única higienizada, com costuras revisadas e medidas conferidas milimetricamente na fita.
                  </p>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* COLUNA DIREITA: INFORMAÇÕES COMERCIAIS BY SOPHI     */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                {/* Referência e Marca */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider">
                    <span className="text-[#846391] uppercase font-black tracking-wider">
                      {product.brand}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-400 font-mono text-[11px]">
                      Ref: {product.id}
                    </span>
                  </div>

                  {/* Avaliações Verificadas */}
                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-xs font-bold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                    <span className="text-gray-400 font-normal">({product.review_count} avaliações)</span>
                  </div>
                </div>

                {/* Título Oficial da Peça */}
                <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#271E2D] mb-3 leading-snug">
                  {product.name}
                </h1>

                {/* Badge de Pronta Entrega / Peça Única */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#271E2D] bg-purple-50 border border-purple-200">
                    <Flame className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                    <span>Última Unidade Disponível</span>
                  </span>
                  <span className="text-xs text-gray-400">
                    Pronta entrega com envio imediato
                  </span>
                </div>

                {/* ==================================================== */}
                {/* BOX DE PREÇO & DESTAQUE PIX (ASSINATURA BY SOPHI)    */}
                {/* ==================================================== */}
                <div className="bg-[#FAF7FA] p-5 rounded-3xl border border-[#EBDDF0] mb-6 space-y-3">
                  {product.regular_price && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>De:</span>
                      <span className="line-through">
                        R$ {product.regular_price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}

                  {/* Preço Principal com Destaque Pix */}
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="font-serif font-black text-3xl sm:text-4xl text-[#271E2D]">
                      R$ {pixPrice.toFixed(2).replace('.', ',')}
                    </span>
                    <span 
                      className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase text-[#271E2D]"
                      style={{ backgroundColor: '#dac9df' }}
                    >
                      no Pix (-10%)
                    </span>
                  </div>

                  {/* Economia Real */}
                  <div className="text-xs font-bold text-[#846391] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#846391]" />
                    <span>
                      Economize R$ {totalSavings.toFixed(2).replace('.', ',')} comprando à vista na Todday Modas!
                    </span>
                  </div>

                  {/* Parcelamento no Cartão */}
                  <div className="pt-2 border-t border-[#EBDDF0] flex items-center justify-between text-xs text-gray-600 font-medium">
                    <span>Ou no cartão de crédito:</span>
                    <strong className="text-[#271E2D]">
                      até 10x de R$ {installment10x} sem juros
                    </strong>
                  </div>
                </div>

                {/* ==================================================== */}
                {/* ÁREA DE COMPRA (PADRÃO BY SOPHI)                     */}
                {/* ==================================================== */}
                <div className="area-buy-product flex flex-col">
                  {/* Derivações de Produto (Cores, Tamanhos, Medidas) */}
                  <div className="derivacoes-produto min-w-full">
                    <div className="area-derivacoes">

                      {/* Variação de Cor / Estampa */}
                      {product.available_colors && product.available_colors.length > 0 && (
                        <div className="variacao-area variacao-area-cor mb-2.5 mt-1">
                          <span className="font-bold title mb-2 flex items-center gap-1.5 text-sm text-gray-900">
                            Cor: <span className="font-bold text-[#846391]">{selectedColor}</span>
                          </span>
                          <div className="variacao-lista">
                            <ul className="flex flex-wrap gap-2">
                              {product.available_colors.map((c) => {
                                const isSelected = selectedColor === c.name;
                                return (
                                  <li
                                    key={c.name}
                                    data-available="true"
                                    data-type="box"
                                    onClick={() => setSelectedColor(c.name)}
                                    className={`relative flex cursor-pointer items-center gap-2 in-stock rounded-sm border box-border min-h-[32px] px-2.5 py-1 text-[13px] transition-all ${
                                      isSelected
                                        ? 'border-[#252525] shadow-[0_0_0_2px_#252525] font-bold text-gray-900 bg-gray-50'
                                        : 'border-gray-300 text-gray-700 hover:shadow-[0_0_0_2px_#252525] bg-white'
                                    }`}
                                  >
                                    <span
                                      className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                                      style={{ backgroundColor: c.hex }}
                                    />
                                    <div className="variacao-label">{c.name}</div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Variação de Tamanho */}
                      <div className="variacao-area variacao-area-1 variacao-area-id-2 variacao-tipo-box mb-2 mt-3">
                        <span className="font-bold title mb-2 flex items-center gap-1.5 text-sm text-gray-900">
                          Tamanho: <span className="font-bold text-[#846391]">{selectedSize}</span>
                        </span>
                        <div className="variacao-lista variacao-lista-2">
                          <ul className="flex flex-wrap gap-2">
                            {(product.available_sizes && product.available_sizes.length > 0
                              ? product.available_sizes
                              : ['P (36-38)', 'M (38-40)', 'G (42-44)', 'GG (46-48)']
                            ).map((sz) => {
                              const isSelected = selectedSize === sz;
                              return (
                                <li
                                  key={sz}
                                  data-available="true"
                                  data-type="box"
                                  onClick={() => setSelectedSize(sz)}
                                  className={`relative flex cursor-pointer items-center justify-center in-stock rounded-sm border box-border min-h-[32px] min-w-[32px] px-2.5 py-1 text-[13px] transition-all ${
                                    isSelected
                                      ? 'border-[#252525] shadow-[0_0_0_2px_#252525] font-bold text-gray-900 bg-gray-50'
                                      : 'border-gray-300 text-gray-700 hover:shadow-[0_0_0_2px_#252525] bg-white'
                                  }`}
                                >
                                  <div className="variacao-label">{sz}</div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>

                      {/* Botões do Provador Virtual & Tabela de Medidas */}
                      <div className="vfr__container my-2.5" id="szb-container">
                        <div className="szb-vfr-btns flex items-center gap-4">
                          <button
                            id="szb-vfr-button"
                            className="vfr__button--clean flex items-center gap-1.5 text-xs text-gray-700 hover:text-black font-semibold underline underline-offset-4 cursor-pointer"
                            type="button"
                            onClick={() => setShowVirtualFitting(true)}
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#846391]" />
                            Provador Virtual
                          </button>
                          <button
                            id="szb-measurements-button"
                            className="vfr__button--clean flex items-center gap-1.5 text-xs text-gray-700 hover:text-black font-semibold underline underline-offset-4 cursor-pointer"
                            type="button"
                            onClick={() => setShowMeasureGuide(!showMeasureGuide)}
                          >
                            <Ruler className="w-3.5 h-3.5 text-[#846391]" />
                            {showMeasureGuide ? 'Ocultar Medidas' : 'Tabela de Medidas'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabela de Medidas Inline se expandida */}
                  {showMeasureGuide && (
                    <div className="my-3 p-4 rounded-xl bg-[#FAF7FA] border border-purple-200 text-xs text-[#271E2D] animate-in fade-in duration-200 space-y-3">
                      <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-[#271E2D]">
                          <Ruler className="w-4 h-4 text-[#846391]" />
                          <span>Medidas Reais da Peça (Fita Métrica)</span>
                        </div>
                        <span 
                          className="text-[10px] font-black px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: '#dac9df', color: '#271E2D' }}
                        >
                          Peça Única
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {product.measurements?.bust && (
                          <div className="bg-white p-2 rounded-lg border border-purple-100">
                            <span className="block text-[10px] text-gray-400 font-bold uppercase">Busto</span>
                            <strong className="text-xs text-[#271E2D]">{product.measurements.bust}</strong>
                          </div>
                        )}
                        {product.measurements?.waist && (
                          <div className="bg-white p-2 rounded-lg border border-purple-100">
                            <span className="block text-[10px] text-gray-400 font-bold uppercase">Cintura</span>
                            <strong className="text-xs text-[#271E2D]">{product.measurements.waist}</strong>
                          </div>
                        )}
                        {product.detailed_measurements?.hips && (
                          <div className="bg-white p-2 rounded-lg border border-purple-100">
                            <span className="block text-[10px] text-gray-400 font-bold uppercase">Quadril</span>
                            <strong className="text-xs text-[#271E2D]">{product.detailed_measurements.hips}</strong>
                          </div>
                        )}
                        {product.measurements?.length && (
                          <div className="bg-white p-2 rounded-lg border border-purple-100">
                            <span className="block text-[10px] text-gray-400 font-bold uppercase">Comprimento</span>
                            <strong className="text-xs text-[#271E2D]">{product.measurements.length}</strong>
                          </div>
                        )}
                        {product.measurements?.shoulder && (
                          <div className="bg-white p-2 rounded-lg border border-purple-100">
                            <span className="block text-[10px] text-gray-400 font-bold uppercase">Ombro a Ombro</span>
                            <strong className="text-xs text-[#271E2D]">{product.measurements.shoulder}</strong>
                          </div>
                        )}
                        {product.detailed_measurements?.sleeve && (
                          <div className="bg-white p-2 rounded-lg border border-purple-100">
                            <span className="block text-[10px] text-gray-400 font-bold uppercase">Manga</span>
                            <strong className="text-xs text-[#271E2D]">{product.detailed_measurements.sleeve}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Container Cupom Primeira Compra */}
                  <div className="container-cupom my-2.5 border border-dashed border-[#cfb8d4] bg-[#faf6fb] rounded-sm p-3">
                    <div className="content-cupom flex items-center justify-between gap-3">
                      <div className="promo-description">
                        <p className="text-xs leading-tight text-gray-900">
                          <span className="font-bold text-xs text-[#271E2D]">Aproveite o Cupom</span> <br />
                          <span className="text-[13px] font-bold text-[#846391]">Primeira Compra</span><br />
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-medium mt-0.5">
                            <button
                              type="button"
                              onClick={() => setShowPixNoticeModal(true)}
                              className="cursor-pointer hover:scale-125 transition-transform inline-flex items-center justify-center p-0.5 -ml-0.5"
                              title="Clique no ícone de atenção para ver informações sobre o cupom e PIX"
                            >
                              <span>⚠️</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowPixNoticeModal(true)}
                              className="cursor-pointer hover:underline hover:text-amber-900 underline-offset-2 font-semibold"
                            >
                              Não soma com PIX
                            </button>
                          </span>
                        </p>
                      </div>
                      <div className="cupom-area text-right shrink-0">
                        <div
                          onClick={handleCopyCoupon}
                          id="copyButton"
                          data-cupom="BEMVINDA10"
                          className="copy-cupom bg-[#271E2D] hover:bg-black text-white font-mono font-bold text-xs px-3 py-1.5 rounded-sm cursor-pointer transition-colors shadow-xs select-none"
                        >
                          {copiedCoupon ? 'COPIADO! ✓' : 'BEMVINDA10'}
                        </div>
                        <div className="copy-message mt-1">
                          <p className="text-[10px] text-gray-500 cursor-pointer" onClick={handleCopyCoupon}>
                            {copiedCoupon ? 'Cupom pronto para o carrinho' : 'Clique para Copiar'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Box Fidegg Cashback */}
                  <div className="box-fidegg cashback inline-flex items-center gap-2 text-xs text-gray-800 my-1 w-full rounded-none bg-[#f5eff7] p-2.5 border border-[#e6d8ec]">
                    <span className="text-sm">🪙</span>
                    <p className="info-fidegg text-xs">
                      Em pedidos a partir de <span className="font-bold">R$ 0,00</span>, ganhe até{' '}
                      <strong className="text-[#271E2D] font-bold">R$ {cashbackValue} de Cashback</strong>
                    </p>
                  </div>

                  {/* Quantidade e Comprar */}
                  <div className="quantidade-comprar area-comprar mt-3 flex items-center justify-between gap-3">
                    <div className="quantidade flex w-auto items-center overflow-hidden rounded-md border border-solid border-gray-300 bg-white h-[50px]">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="flex w-9 h-full cursor-pointer items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-black font-bold text-base transition-colors"
                        name="remover"
                        title="Remover um produto"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="text"
                        name="quantidade"
                        id="prod-qtde"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value.replace(/\D/g, '')) || 1;
                          setQuantity(Math.max(1, Math.min(val, product.stock || 99)));
                        }}
                        className="qtde-product w-11 h-full border-none text-center text-sm font-bold text-gray-900 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                        className="flex w-9 h-full cursor-pointer items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-black font-bold text-base transition-colors"
                        name="adicionar"
                        title="Adicionar mais um produto"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="flex-1 border-[#5e9941] bg-[#5e9941] hover:bg-[#4d8234] button-buy button button-full h-[50px] rounded-none uppercase text-white font-black text-sm tracking-wider cursor-pointer shadow-md transition-colors flex items-center justify-center gap-2 active:scale-[0.99]"
                      title="Comprar"
                    >
                      Comprar
                    </button>
                  </div>

                  {/* Ações Produto: Favoritos & Alerta de Preço */}
                  <div className="acoes-produto flex w-full gap-2 pt-2.5">
                    <div className="action border border-solid border-gray-200 rounded-[4px] hover:bg-gray-50 flex-1" id="favoritos">
                      <div className="salvar-favoritos">
                        <button
                          type="button"
                          onClick={() => setIsFavorite(!isFavorite)}
                          className="adicionar-favorito flex w-full cursor-pointer items-center justify-center gap-2 p-2 text-xs text-gray-700 font-medium transition-colors"
                        >
                          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                          <span className="text text-xs">{isFavorite ? 'Salvo nos favoritos' : 'Adicionar aos favoritos'}</span>
                        </button>
                      </div>
                    </div>
                    <div className="alerta-preco action flex-1">
                      <button
                        type="button"
                        onClick={() => setShowPriceAlertModal(true)}
                        className="action-btn cursor-pointer font-medium uppercase text-gray-800 text-xs text-center p-2 rounded-[4px] flex items-center justify-center gap-2 border border-gray-200 price-alert w-full hover:border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <Bell className={`h-4 w-4 ${priceAlertActive ? 'text-amber-500 fill-amber-500' : 'text-gray-600'}`} />
                        <span className="text-xs normal-case">{priceAlertActive ? 'Alerta Ativo!' : 'Criar alerta de preço'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Box Frete */}
                  <div className="box-frete group mt-3 rounded-sm border border-gray-200 bg-white p-3">
                    <div className="calculo-frete flex flex-col justify-center">
                      <div className="flex content-frete items-center justify-between gap-2.5 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <div className="icon-truck text-gray-700">
                            <Truck className="w-5 h-5 text-gray-700 shrink-0" />
                          </div>
                          <div className="label-frete flex flex-col">
                            <label className="cep-label text-sm font-bold text-gray-900 leading-tight">Calcule o frete</label>
                            <span>
                              <a
                                href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                                target="_blank"
                                rel="noreferrer"
                                className="nao-sei-cep text-[11px] text-gray-500 hover:underline hover:text-black"
                              >
                                Não sei o meu CEP
                              </a>
                            </span>
                          </div>
                        </div>

                        <div className="area-calculo">
                          <form onSubmit={handleCalculateShipping} className="cep-field flex">
                            <div className="flex items-center rounded-sm justify-between overflow-hidden border border-solid bg-white border-gray-300">
                              <input
                                id="cep"
                                type="text"
                                placeholder="00000-000"
                                maxLength={9}
                                value={cepInput}
                                onChange={(e) => setCepInput(e.target.value)}
                                className="px-2.5 py-1.5 text-xs text-gray-800 w-28 sm:w-32 outline-none"
                              />
                              <button
                                type="submit"
                                disabled={shippingLoading}
                                className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                              >
                                {shippingLoading ? '...' : 'OK'}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>

                      {/* Detalhes do Frete se calculado */}
                      {shippingCalculated && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5 text-xs animate-in fade-in">
                          <div className="flex items-center justify-between py-1 px-2.5 bg-gray-50 rounded border border-gray-200">
                            <span className="text-gray-700">PAC Correios (4 a 6 dias úteis)</span>
                            <strong className="text-[#271E2D]">R$ 18,90</strong>
                          </div>
                          <div className="flex items-center justify-between py-1 px-2.5 bg-gray-50 rounded border border-gray-200">
                            <span className="text-gray-700">SEDEX Expresso (1 a 2 dias úteis)</span>
                            <strong className="text-[#271E2D]">R$ 28,50</strong>
                          </div>
                          <p className="text-[10px] text-[#846391] font-bold text-center pt-1">
                            ✨ Frete Grátis disponível para compras acima de R$ 199,00
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mini Descrição */}
                  <div className="mini-descricao mt-3.5 pt-2 border-t border-gray-100">
                    <h2 className="mb-1 text-xs font-bold text-gray-900">
                      <strong>Descrição Resumida</strong>
                    </h2>
                    <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-3">
                      {product.description}
                    </p>
                  </div>

                  {/* Link Descrição Completa */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('desc');
                      const el = document.getElementById('detalhes-produto-completo');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="descricao-completa-link mt-2.5 flex min-h-[32px] cursor-pointer items-center text-[13px] text-[#846391] hover:text-[#271E2D] font-bold group w-fit"
                  >
                    <FileText className="w-4 h-4 mr-2 text-gray-500 group-hover:text-[#271E2D]" />
                    <span className="text descricao underline underline-offset-2">Descrição completa</span>
                  </button>

                  {/* Compartilhar Produto */}
                  <div className="compartilhar-produto action mt-2.5">
                    <button
                      type="button"
                      onClick={handleShareSocial}
                      className="flex w-full items-center justify-center gap-2 rounded-sm border border-gray-200 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <Share2 className="h-4 w-4 text-gray-500" />
                      <span>{copiedLink ? 'Link copiado para compartilhar!' : 'Compartilhe nas redes sociais'}</span>
                    </button>
                  </div>

                  {/* Selos de Confiança & Garantias */}
                  <div className="grid grid-cols-3 gap-2 pt-4 mt-3 border-t border-gray-200 text-[11px] text-gray-500 text-center">
                    <div className="flex flex-col items-center gap-1 p-2 rounded-sm bg-[#FAF7FA]">
                      <ShieldCheck className="w-4 h-4 text-[#846391]" />
                      <span className="font-bold text-[#271E2D]">Compra Segura</span>
                      <span className="text-[9px] text-gray-400">Criptografia SSL</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-sm bg-[#FAF7FA]">
                      <RotateCcw className="w-4 h-4 text-[#846391]" />
                      <span className="font-bold text-[#271E2D]">1ª Troca Grátis</span>
                      <span className="text-[9px] text-gray-400">Até 7 dias</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-sm bg-[#FAF7FA]">
                      <Truck className="w-4 h-4 text-[#846391]" />
                      <span className="font-bold text-[#271E2D]">Envio Rápido</span>
                      <span className="text-[9px] text-gray-400">Em até 24h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* ABAS INFORMATIVAS INFERIORES: DESCRIÇÃO, MEDIDAS, CUIDADO*/}
          {/* ======================================================== */}
          <div className="pt-6 border-t border-[#EBDDF0]" id="detalhes-produto-completo">
            {/* Cabeçalho das Abas */}
            <div className="flex items-center gap-2 border-b border-[#EBDDF0] overflow-x-auto scrollbar-none pb-px">
              <button
                type="button"
                onClick={() => setActiveTab('desc')}
                className={`px-4 py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'desc'
                    ? 'border-[#271E2D] text-[#271E2D]'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                Descrição do Produto
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('measures')}
                className={`px-4 py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'measures'
                    ? 'border-[#271E2D] text-[#271E2D]'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                Tabela de Medidas Exata
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('care')}
                className={`px-4 py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'care'
                    ? 'border-[#271E2D] text-[#271E2D]'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                Composição & Cuidados
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'reviews'
                    ? 'border-[#271E2D] text-[#271E2D]'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                Avaliações ({product.review_count})
              </button>
            </div>

            {/* Conteúdo da Aba Selecionada */}
            <div className="py-6">
              {activeTab === 'desc' && (
                <div className="space-y-4 max-w-3xl text-gray-700 text-sm leading-relaxed">
                  <p>{product.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-[#FAF7FA] border border-[#EBDDF0]">
                      <span className="block text-xs font-bold text-[#271E2D] mb-1">Modelagem & Caimento</span>
                      <span className="text-xs text-gray-600">
                        Corte modesto com comprimento ideal para cultos, eventos formais e celebrações solenes.
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#FAF7FA] border border-[#EBDDF0]">
                      <span className="block text-xs font-bold text-[#271E2D] mb-1">Estado de Conservação</span>
                      <span className="text-xs text-gray-600">
                        {product.condition} — Sem manchas, fios puxados ou bolinhas. Pronta para vestir.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'measures' && (
                <div className="space-y-4 max-w-2xl">
                  <div className="overflow-hidden rounded-2xl border border-[#EBDDF0]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#FAF7FA] text-[#271E2D] font-bold border-b border-[#EBDDF0]">
                        <tr>
                          <th className="py-3 px-4">Parte da Peça</th>
                          <th className="py-3 px-4">Medida em Centímetros (cm)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EBDDF0]">
                        {product.measurements.bust && (
                          <tr>
                            <td className="py-2.5 px-4 font-semibold text-gray-700">Busto</td>
                            <td className="py-2.5 px-4 text-[#271E2D] font-mono font-bold">{product.measurements.bust}</td>
                          </tr>
                        )}
                        {product.measurements.waist && (
                          <tr>
                            <td className="py-2.5 px-4 font-semibold text-gray-700">Cintura</td>
                            <td className="py-2.5 px-4 text-[#271E2D] font-mono font-bold">{product.measurements.waist}</td>
                          </tr>
                        )}
                        {product.detailed_measurements?.hips && (
                          <tr>
                            <td className="py-2.5 px-4 font-semibold text-gray-700">Quadril</td>
                            <td className="py-2.5 px-4 text-[#271E2D] font-mono font-bold">{product.detailed_measurements.hips}</td>
                          </tr>
                        )}
                        {product.measurements.length && (
                          <tr>
                            <td className="py-2.5 px-4 font-semibold text-gray-700">Comprimento Total</td>
                            <td className="py-2.5 px-4 text-[#271E2D] font-mono font-bold">{product.measurements.length}</td>
                          </tr>
                        )}
                        {product.measurements.shoulder && (
                          <tr>
                            <td className="py-2.5 px-4 font-semibold text-gray-700">Ombro a Ombro</td>
                            <td className="py-2.5 px-4 text-[#271E2D] font-mono font-bold">{product.measurements.shoulder}</td>
                          </tr>
                        )}
                        {product.detailed_measurements?.sleeve && (
                          <tr>
                            <td className="py-2.5 px-4 font-semibold text-gray-700">Comprimento da Manga</td>
                            <td className="py-2.5 px-4 text-[#271E2D] font-mono font-bold">{product.detailed_measurements.sleeve}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'care' && (
                <div className="space-y-4 max-w-3xl text-sm text-gray-700">
                  {product.fabric && (
                    <div className="p-4 rounded-2xl bg-[#FAF7FA] border border-[#EBDDF0]">
                      <h4 className="font-bold text-[#271E2D] text-xs mb-1">Composição do Tecido</h4>
                      <p className="text-xs text-gray-600">{product.fabric}</p>
                    </div>
                  )}

                  {product.care_instructions && (
                    <div className="p-4 rounded-2xl bg-[#FAF7FA] border border-[#EBDDF0]">
                      <h4 className="font-bold text-[#271E2D] text-xs mb-1">Instruções de Lavagem e Conservação</h4>
                      <p className="text-xs text-gray-600">{product.care_instructions}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4 max-w-3xl">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF7FA] border border-[#EBDDF0] mb-4">
                    <div className="text-center">
                      <div className="font-serif font-black text-3xl text-[#271E2D]">5.0</div>
                      <div className="flex items-center justify-center gap-0.5 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[11px] text-gray-400">Excelente</span>
                    </div>

                    <div className="h-12 w-px bg-[#EBDDF0]" />

                    <div className="text-xs text-gray-600">
                      <p className="font-bold text-[#271E2D]">100% das clientes recomendam este modelo</p>
                      <p className="text-gray-500">Baseado em avaliações verificadas de compras no brechó.</p>
                    </div>
                  </div>

                  {/* Depoimentos */}
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl border border-[#EBDDF0] space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#271E2D]">Débora S. &middot; Curitiba/PR</span>
                        <span className="text-gray-400 text-[11px]">Compra verificada</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600">
                        &ldquo;Vestido maravilhoso! O tecido é macio, não é transparente e o caimento no corpo ficou perfeito para ir à igreja. Chegou com cheirinho delicioso!&rdquo;
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-[#EBDDF0] space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#271E2D]">Miriam R. &middot; São Paulo/SP</span>
                        <span className="text-gray-400 text-[11px]">Compra verificada</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600">
                        &ldquo;As medidas da fita métrica bateram exatamente com o que eu precisava. O atendimento foi impecável e a entrega foi super rápida.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* QUEM COMPROU ESTE PRODUTO, TAMBÉM LEVOU (BY SOPHI)       */}
          {/* ======================================================== */}
          {relatedProducts.length > 0 && (
            <div className="pt-6 border-t border-[#EBDDF0]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif font-black text-lg sm:text-xl text-[#271E2D]">
                    Combine o Look &middot; Peças Relacionadas
                  </h3>
                  <p className="text-xs text-gray-500">
                    Sugestões selecionadas para harmonizar com este visual
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedProducts.map((relProduct) => (
                  <div
                    key={relProduct.id}
                    onClick={() => {
                      if (onSelectProduct) {
                        onSelectProduct(relProduct);
                      }
                    }}
                    className="p-3 rounded-2xl border border-[#EBDDF0] bg-white hover:border-[#dac9df] hover:shadow-md transition-all cursor-pointer flex gap-3 items-center group"
                  >
                    <img
                      src={relProduct.image}
                      alt={relProduct.name}
                      className="w-16 h-20 object-cover rounded-xl shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-[#846391] uppercase block truncate">
                        {relProduct.brand}
                      </span>
                      <h4 className="text-xs font-bold text-[#271E2D] truncate group-hover:text-[#846391] transition-colors">
                        {relProduct.name}
                      </h4>
                      <div className="font-serif font-black text-xs text-[#271E2D] mt-1">
                        R$ {relProduct.price.toFixed(2).replace('.', ',')}
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {relProduct.size}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODAL INTERATIVO: PROVADOR VIRTUAL (SIZEBAY BY SOPHI)    */}
          {/* ======================================================== */}
          {showVirtualFitting && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#EBDDF0] relative animate-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    setShowVirtualFitting(false);
                    setVfResult(null);
                  }}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-[#846391]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-lg text-[#271E2D]">
                      Provador Virtual
                    </h3>
                    <p className="text-xs text-gray-500">
                      Recomendação de tamanho personalizada para você
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCalcProvador} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Sua Altura (cm)
                      </label>
                      <input
                        type="number"
                        min="120"
                        max="220"
                        value={vfHeight}
                        onChange={(e) => setVfHeight(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#846391]"
                        placeholder="Ex: 165"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Seu Peso (kg)
                      </label>
                      <input
                        type="number"
                        min="35"
                        max="180"
                        value={vfWeight}
                        onChange={(e) => setVfWeight(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#846391]"
                        placeholder="Ex: 62"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Sua Idade
                      </label>
                      <input
                        type="number"
                        min="14"
                        max="100"
                        value={vfAge}
                        onChange={(e) => setVfAge(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#846391]"
                        placeholder="Ex: 32"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Silhueta / Busto
                      </label>
                      <select
                        value={vfShape}
                        onChange={(e) => setVfShape(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#846391] bg-white"
                      >
                        <option value="regular">Padrão / Equilibrado</option>
                        <option value="bust">Busto Mais Volumoso</option>
                        <option value="hip">Quadril Mais Largo</option>
                        <option value="straight">Silhueta Reta / Slim</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#271E2D] hover:bg-[#3D2C47] text-white font-bold text-xs tracking-wide transition-colors cursor-pointer"
                  >
                    Descobrir Meu Tamanho Ideal
                  </button>
                </form>

                {vfResult && (
                  <div className="mt-4 p-4 rounded-2xl bg-purple-50 border border-purple-200 text-center animate-in fade-in">
                    <p className="text-xs text-gray-600 mb-1">
                      Com base nas medidas do modelo e no seu perfil:
                    </p>
                    <div className="text-2xl font-black text-[#271E2D] my-1">
                      Tamanho Recomendado: <span className="text-[#846391]">{vfResult}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mb-3">
                      98% de satisfação com caimento confortável e sem apertos.
                    </p>
                    <button
                      type="button"
                      onClick={handleApplyRecommendedSize}
                      className="w-full py-2.5 rounded-xl bg-[#846391] hover:bg-[#6c4e78] text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Selecionar Tamanho {vfResult} e Voltar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODAL INTERATIVO: ALERTA DE PREÇO (BY SOPHI)             */}
          {/* ======================================================== */}
          {showPriceAlertModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#EBDDF0] relative animate-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => setShowPriceAlertModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-lg text-[#271E2D]">
                      Alerta de Preço
                    </h3>
                    <p className="text-xs text-gray-500">
                      Receba um aviso quando o valor desta peça baixar
                    </p>
                  </div>
                </div>

                <div className="my-3 p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                  <span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
                  <strong className="text-gray-900 shrink-0">R$ {product.price.toFixed(2).replace('.', ',')}</strong>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!priceAlertContact) return;
                    setPriceAlertActive(true);
                    setShowPriceAlertModal(false);
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Seu WhatsApp ou E-mail
                    </label>
                    <input
                      type="text"
                      value={priceAlertContact}
                      onChange={(e) => setPriceAlertContact(e.target.value)}
                      placeholder="Ex: (11) 99999-9999 ou seu@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#846391]"
                      required
                    />
                  </div>

                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Você será notificado imediatamente se este vestido entrar em queima de estoque ou cupom relâmpago!
                  </p>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#271E2D] hover:bg-[#3D2C47] text-white font-bold text-xs tracking-wide transition-colors cursor-pointer"
                  >
                    Ativar Alerta de Promoção
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODAL INFORMATIVO: REGRA DO CUPOM & PIX                   */}
          {/* ======================================================== */}
          {showPixNoticeModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#EBDDF0] relative animate-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => setShowPixNoticeModal(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 text-base">
                    ⚠️
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-base sm:text-lg text-[#271E2D]">
                      Regras de Desconto & Cupons
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Transparência para você economizar com total clareza
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-gray-700">
                  <div className="p-3 rounded-xl bg-[#FAF7FA] border border-[#EBDDF0]">
                    <div className="flex items-center gap-1.5 font-bold text-[#271E2D] mb-1">
                      <span>🏷️</span>
                      <span>Cupom BEMVINDA10:</span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Concede <strong>10% de desconto</strong> no valor total dos produtos para a sua primeira compra em nosso brechó online.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                      <span>⚡</span>
                      <span>Desconto à Vista no PIX:</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Ao optar pelo pagamento no PIX, você já conta com <strong>10% de desconto imediato</strong> calculado direto no valor à vista.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                    <strong className="block font-bold mb-0.5 text-amber-950">Por que não são somados?</strong>
                    Como ambos representam o desconto promocional máximo da loja, as vantagens não são cumulativas. No checkout você poderá escolher o método mais vantajoso: aproveitar o PIX à vista ou aplicar o cupom no cartão de crédito em até 6x sem juros!
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPixNoticeModal(false)}
                  className="w-full mt-4 py-2.5 rounded-xl bg-[#271E2D] hover:bg-[#3D2C47] text-white font-bold text-xs tracking-wide transition-colors cursor-pointer"
                >
                  Entendido, fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
