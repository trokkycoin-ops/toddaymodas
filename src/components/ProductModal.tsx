import React, { useState } from 'react';
import { Product } from '../types';
import {
  X,
  ShoppingBag,
  Zap,
  Ruler,
  Truck,
  ShieldCheck,
  Heart,
  Share2,
  Check,
  ChevronRight,
  ZoomIn,
  Copy,
  Info,
  Sparkles,
} from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  allProducts: Product[];
  onClose: () => void;
  onAddToCart: (product: Product, size?: string, color?: string, qty?: number) => void;
  onQuickCheckout: (product: Product, size?: string, color?: string, qty?: number) => void;
  onSelectProduct: (p: Product) => void;
}

export function ProductModal({
  product,
  allProducts = [],
  onClose,
  onAddToCart,
  onQuickCheckout,
  onSelectProduct,
}: ProductModalProps) {
  if (!product) return null;

  const initialSize = product.available_sizes?.[0] || product.size || 'M';
  const initialColor = product.available_colors?.[0]?.name || product.color || '';

  const [selectedSize, setSelectedSize] = useState(initialSize);
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [isZoomed, setIsZoomed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'measures' | 'shipping' | 'care'>('desc');
  const [cepInput, setCepInput] = useState('');
  const [isCalculatingCep, setIsCalculatingCep] = useState(false);
  const [cepResult, setCepResult] = useState<{ pac: number; sedex: number } | null>(null);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const pixPrice = product.price * 0.9;
  const pixDiscount = product.price - pixPrice;
  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  const handleSimulateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cepInput || cepInput.replace(/\D/g, '').length < 8) return;
    setIsCalculatingCep(true);
    setTimeout(() => {
      setIsCalculatingCep(false);
      setCepResult({
        pac: 19.9,
        sedex: 34.5,
      });
    }, 500);
  };

  const handleCopyCoupon = () => {
    navigator.clipboard?.writeText('BEMVINDA10');
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Confira ${product.name} na Todday Modas!`,
          url: window.location.href,
        })
        .catch(() => copyLink());
    } else {
      copyLink();
    }
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      id="product-detail-modal"
    >
      <div
        className="bg-white rounded-3xl w-full max-w-5xl max-h-[94vh] shadow-2xl border border-[#EBDDF0] relative flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-[#dac9df]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 text-gray-400 hover:text-[#271E2D] hover:bg-white shadow-md transition-all cursor-pointer"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-8">
          {/* Gallery Column */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div
              className="relative aspect-3/4 rounded-2xl overflow-hidden bg-slate-100 border border-[#EBDDF0] group cursor-zoom-in"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <img
                src={selectedImage}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'group-hover:scale-105'
                }`}
              />
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[11px] font-medium flex items-center gap-1.5 opacity-90">
                <ZoomIn className="w-3.5 h-3.5 text-[#dac9df]" />
                <span>Passe o cursor ou clique para zoom</span>
              </div>
              <div className="absolute top-3 left-3 bg-[#271E2D] text-[#dac9df] text-xs font-bold px-3 py-1 rounded-full shadow-md">
                {product.condition}
              </div>
            </div>

            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedImage(img);
                      setIsZoomed(false);
                    }}
                    className={`relative w-16 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      selectedImage === img
                        ? 'border-[#271E2D] scale-102 shadow-xs'
                        : 'border-[#EBDDF0] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {product.video && (
              <div className="rounded-2xl border border-[#EBDDF0] bg-[#FAF7FA] p-2">
                <p className="px-2 pb-2 text-[11px] font-black uppercase tracking-wider text-[#846391]">Vídeo da peça</p>
                <video src={product.video} controls playsInline preload="metadata" className="w-full rounded-xl bg-black" />
              </div>
            )}

            {/* Trust highlights */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7FA] border border-[#EBDDF0]/70 text-xs text-gray-700">
                <Ruler className="w-4 h-4 text-[#846391] shrink-0" />
                <span className="text-[11px] leading-tight font-medium">Medidas reais na fita métrica</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7FA] border border-[#EBDDF0]/70 text-xs text-gray-700">
                <ShieldCheck className="w-4 h-4 text-[#846391] shrink-0" />
                <span className="text-[11px] leading-tight font-medium">Peça única higienizada</span>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Brand & Category */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#846391]">
                  {product.brand}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#271E2D] hover:bg-[#FAF7FA] transition-colors cursor-pointer"
                    title="Compartilhar"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  {copiedLink && (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Link copiado!
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-serif font-black text-slate-900 leading-snug mb-3">
                {product.name}
              </h1>

              {/* Pricing Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF7FA] to-white border border-[#EBDDF0] mb-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-serif font-black text-[#271E2D]">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  {product.regular_price && product.regular_price > product.price && (
                    <span className="text-sm text-gray-400 line-through">
                      R$ {product.regular_price.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>

                {/* PIX box */}
                <div className="mt-2.5 pt-2.5 border-t border-[#EBDDF0] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md font-bold text-[#271E2D] bg-[#dac9df] text-[10px]">
                      PIX 10% OFF
                    </span>
                    <span className="font-bold text-emerald-700 text-sm">
                      R$ {pixPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500">
                    Economia de R$ {pixDiscount.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="mt-2 text-[11px] text-gray-500 flex items-center justify-between">
                  <span>ou 3x de R$ {(product.price / 3).toFixed(2).replace('.', ',')} sem juros</span>
                  <button
                    onClick={handleCopyCoupon}
                    className="text-[#846391] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedCoupon ? 'Copiado!' : 'Cupom: BEMVINDA10'}</span>
                  </button>
                </div>
              </div>

              {/* Size Selector */}
              {product.available_sizes && product.available_sizes.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-800">
                      Tamanho: <span className="text-[#846391]">{selectedSize}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('measures')}
                      className="text-xs font-bold text-[#846391] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Guia de Medidas</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.available_sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedSize === sz
                            ? 'bg-[#271E2D] text-white shadow-xs'
                            : 'bg-[#FAF7FA] text-gray-700 border border-[#EBDDF0] hover:border-[#dac9df]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.available_colors && product.available_colors.length > 0 && (
                <div className="mb-4">
                  <span className="text-xs font-bold text-gray-800 block mb-2">
                    Cor: <span className="text-[#846391]">{selectedColor}</span>
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {product.available_colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                          selectedColor === c.name
                            ? 'border-[#271E2D] bg-[#FAF7FA] font-bold text-[#271E2D] shadow-xs'
                            : 'border-[#EBDDF0] text-gray-600 hover:border-[#dac9df]'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-2xs"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-bold text-gray-800">Quantidade:</span>
                <div className="flex items-center border border-[#EBDDF0] rounded-xl text-xs bg-[#FAF7FA]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-gray-600 hover:bg-[#EBDDF0] font-bold transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 font-bold text-slate-800">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 text-gray-600 hover:bg-[#EBDDF0] font-bold transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] text-gray-500">
                  {product.stock > 0 ? `${product.stock} em estoque` : 'Peça única'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product, selectedSize, selectedColor, quantity);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-xs text-[#271E2D] border-2 border-[#271E2D] hover:bg-[#FAF7FA] transition-all shadow-xs active:scale-98 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Adicionar à Sacola</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onQuickCheckout(product, selectedSize, selectedColor, quantity);
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-xs text-white bg-[#271E2D] hover:bg-[#382343] transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-[#dac9df]" />
                  <span>Comprar Agora</span>
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="border-b border-[#EBDDF0] flex gap-4 text-xs font-bold text-gray-500 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('desc')}
                  className={`pb-2 transition-colors cursor-pointer ${
                    activeTab === 'desc'
                      ? 'border-b-2 border-[#271E2D] text-[#271E2D]'
                      : 'hover:text-gray-900'
                  }`}
                >
                  Descrição &amp; Detalhes
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('measures')}
                  className={`pb-2 transition-colors cursor-pointer ${
                    activeTab === 'measures'
                      ? 'border-b-2 border-[#271E2D] text-[#271E2D]'
                      : 'hover:text-gray-900'
                  }`}
                >
                  Medidas Reais
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('shipping')}
                  className={`pb-2 transition-colors cursor-pointer ${
                    activeTab === 'shipping'
                      ? 'border-b-2 border-[#271E2D] text-[#271E2D]'
                      : 'hover:text-gray-900'
                  }`}
                >
                  Frete
                </button>
              </div>

              {/* Tab Contents */}
              <div className="text-xs text-gray-600 leading-relaxed mb-6">
                {activeTab === 'desc' && (
                  <div className="space-y-2">
                    <p>{product.description}</p>
                    {product.fabric && (
                      <p className="pt-2">
                        <strong className="text-gray-800">Composição do Tecido:</strong>{' '}
                        {product.fabric}
                      </p>
                    )}
                    {product.care_instructions && (
                      <p>
                        <strong className="text-gray-800">Cuidados:</strong>{' '}
                        {product.care_instructions}
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'measures' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      {product.measurements?.bust && (
                        <div className="p-2 rounded-xl bg-[#FAF7FA] border border-[#EBDDF0]">
                          <span className="block text-[10px] uppercase text-gray-400 font-bold">
                            Busto
                          </span>
                          <span className="font-bold text-slate-800">
                            {product.measurements.bust}
                          </span>
                        </div>
                      )}
                      {product.measurements?.waist && (
                        <div className="p-2 rounded-xl bg-[#FAF7FA] border border-[#EBDDF0]">
                          <span className="block text-[10px] uppercase text-gray-400 font-bold">
                            Cintura
                          </span>
                          <span className="font-bold text-slate-800">
                            {product.measurements.waist}
                          </span>
                        </div>
                      )}
                      {product.measurements?.length && (
                        <div className="p-2 rounded-xl bg-[#FAF7FA] border border-[#EBDDF0]">
                          <span className="block text-[10px] uppercase text-gray-400 font-bold">
                            Comprimento
                          </span>
                          <span className="font-bold text-slate-800">
                            {product.measurements.length}
                          </span>
                        </div>
                      )}
                      {product.measurements?.shoulder && (
                        <div className="p-2 rounded-xl bg-[#FAF7FA] border border-[#EBDDF0]">
                          <span className="block text-[10px] uppercase text-gray-400 font-bold">
                            Ombro
                          </span>
                          <span className="font-bold text-slate-800">
                            {product.measurements.shoulder}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 italic">
                      Todas as medidas são aferidas manualmente peça por peça com fita métrica sobre a bancada sem esticar o tecido.
                    </p>
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div>
                    <form onSubmit={handleSimulateShipping} className="flex gap-2 max-w-sm mb-3">
                      <input
                        type="text"
                        value={cepInput}
                        onChange={(e) => setCepInput(e.target.value)}
                        placeholder="Digite seu CEP (ex: 01310-100)"
                        maxLength={9}
                        className="flex-1 px-3 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl text-xs focus:outline-none focus:border-[#271E2D]"
                      />
                      <button
                        type="submit"
                        disabled={isCalculatingCep}
                        className="px-4 py-2 bg-[#271E2D] text-white text-xs font-bold rounded-xl hover:bg-[#382343] transition-all cursor-pointer"
                      >
                        {isCalculatingCep ? 'Cotando...' : 'Calcular'}
                      </button>
                    </form>

                    {cepResult && (
                      <div className="space-y-1.5 p-3 rounded-xl bg-[#FAF7FA] border border-[#EBDDF0] text-xs">
                        <div className="flex justify-between items-center">
                          <span>📦 Correios PAC (5 a 8 dias úteis)</span>
                          <strong className="text-slate-800">
                            R$ {cepResult.pac.toFixed(2).replace('.', ',')}
                          </strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>⚡ Correios SEDEX (2 a 3 dias úteis)</span>
                          <strong className="text-slate-800">
                            R$ {cepResult.sedex.toFixed(2).replace('.', ',')}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Related products */}
              {relatedProducts.length > 0 && (
                <div className="pt-4 border-t border-[#EBDDF0]">
                  <span className="text-xs font-bold text-gray-800 block mb-3">
                    Você também pode gostar
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {relatedProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onSelectProduct(p)}
                        className="text-left group cursor-pointer"
                      >
                        <div className="aspect-3/4 rounded-xl overflow-hidden bg-slate-100 border border-[#EBDDF0] mb-1.5">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <h4 className="text-[11px] font-bold text-gray-800 line-clamp-1 group-hover:text-[#846391]">
                          {p.name}
                        </h4>
                        <span className="text-[11px] font-bold text-[#271E2D]">
                          R$ {p.price.toFixed(2).replace('.', ',')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
