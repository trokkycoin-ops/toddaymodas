import React from 'react';
import { Heart, ShoppingBag, Star, Eye, Tag, Truck, RotateCcw, ShieldCheck, Gem, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: number, e: React.MouseEvent) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite,
  onToggleFavorite,
  onSelectProduct,
  onAddToCart,
}) => {
  const discountPercent = product.regular_price 
    ? Math.round(((product.regular_price - product.price) / product.regular_price) * 100)
    : null;

  const installmentValue = (product.price / 3).toFixed(2).replace('.', ',');

  const isShoe = product.category.toLowerCase().includes('calçado');
  const getSizesLabel = () => {
    if (!product.available_sizes || product.available_sizes.length === 0) {
      return product.size;
    }
    if (product.available_sizes.length === 1) {
      return product.available_sizes[0];
    }
    if (isShoe) {
      const firstNum = product.available_sizes[0].replace(/\D/g, '');
      const lastNum = product.available_sizes[product.available_sizes.length - 1].replace(/\D/g, '');
      if (firstNum && lastNum) {
        return `Nº ${firstNum} ao ${lastNum}`;
      }
    }
    const cleanSizes = product.available_sizes.map((s) => s.split(' ')[0]);
    if (cleanSizes.length <= 4) {
      return `Tam: ${cleanSizes.join(' • ')}`;
    }
    return `Tam: ${cleanSizes[0]} ao ${cleanSizes[cleanSizes.length - 1]}`;
  };

  const conditionColors: Record<string, { bg: string; text: string; border: string }> = {
    'Novo com Etiqueta': { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
    'Seminovo Impecável': { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
    'Peça Única Selecionada': { bg: '#F5EFF7', text: '#6B21A8', border: '#D8B4FE' },
    'Vintage Especial': { bg: '#FDF4FF', text: '#86198F', border: '#F5D0FE' },
  };
  const conditionStyle = conditionColors[product.condition] || conditionColors['Seminovo Impecável'];

  return (
    <article 
      className="group relative bg-white rounded-3xl border overflow-hidden shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5"
      style={{ borderColor: '#EBDDF0' }}
      id={`tdm-card-${product.id}`}
    >
      {/* Gradient Border Animation */}
      <div className="absolute inset-0 rounded-[inherit] p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="w-full h-full rounded-[inherit] bg-gradient-to-br" style={{ background: 'linear-gradient(135deg, #DFBA5A30 0%, #8A5D9620 50%, transparent 100%)' }} />
      </div>

      {/* Image Container */}
      <div 
        className="relative aspect-[3/4] bg-gradient-to-br overflow-hidden cursor-pointer"
        onClick={() => onSelectProduct(product)}
        style={{ background: 'linear-gradient(135deg, #FAF7FB 0%, #F5EFF7 100%)' }}
      >
        {/* Image with Parallax */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badges Stack */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {/* Discount Badge */}
          {discountPercent && discountPercent > 0 && (
            <span 
              className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider text-white shadow-lg backdrop-blur-sm transform transition-all duration-300 group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #E91E63 0%, #BE185D 100%)', boxShadow: '0 4px 14px rgba(233,30,99,0.4)' }}
            >
              -{discountPercent}%
            </span>
          )}

          {/* Condition Badge */}
          <span 
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-sm border transform transition-all duration-300 group-hover:scale-105"
            style={{ backgroundColor: conditionStyle.bg, color: conditionStyle.text, borderColor: conditionStyle.border, borderWidth: '1px', borderStyle: 'solid' }}
          >
            {product.condition}
          </span>

          {/* Unique Piece Indicator */}
          {product.stock === 1 && !discountPercent && (
            <span 
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-sm border transform transition-all duration-300 group-hover:scale-105"
              style={{ backgroundColor: 'rgba(223,186,90,0.15)', color: '#B8860B', borderColor: 'rgba(223,186,90,0.4)', borderWidth: '1px', borderStyle: 'solid' }}
            >
              <Gem className="w-2.5 h-2.5" style={{ color: '#DFBA5A' }} />
              PEÇA ÚNICA
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => onToggleFavorite(product.id, e)}
          className="absolute top-3 right-3 p-2 rounded-xl bg-white/95 backdrop-blur-sm shadow-lg text-slate-400 hover:text-rose-500 transition-all duration-300 group-hover:scale-110 z-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
          title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart 
            className={`w-5 h-5 transition-all duration-300 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400 group-hover:text-rose-500'}`} 
          />
          <span className="absolute inset-0 rounded-xl bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>

        {/* Quick View Button - Floating */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectProduct(product);
          }}
          className="hidden md:flex absolute bottom-4 left-4 right-4 px-4 py-3 rounded-xl bg-white/95 backdrop-blur-sm text-[#271E2D] font-bold text-sm shadow-xl opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300 items-center justify-center gap-2 cursor-pointer hover:bg-[#271E2D] hover:text-white hover:shadow-rose-500/30 focus:outline-none focus:ring-2 focus:ring-[#DFBA5A] focus:ring-offset-2"
        >
          <Eye className="w-4 h-4" />
          <span>Ver Detalhes & Medidas</span>
          <span className="absolute inset-0 bg-gradient-to-r from-[#DFBA5A] to-[#8A5D96] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>

        {/* Mobile Quick Action Bar */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm text-white font-bold text-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Detalhes</span>
          </button>
        </div>

        {/* Sold Out Overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="text-center px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 transform transition-all duration-300">
              <span className="block text-xs font-bold uppercase tracking-wider text-rose-300 mb-1">INDISPONÍVEL</span>
              <span className="block text-lg font-black text-white">Peça Esgotada</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 relative z-10">
        {/* Brand & Rating */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500 font-semibold mb-2">
          <span className="truncate pr-2 font-bold text-[#8A5D96]">{product.brand}</span>
          <div className="flex items-center gap-1 text-amber-500 shrink-0 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="text-slate-700">{product.rating}</span>
            <span className="text-slate-400">({product.review_count})</span>
          </div>
        </div>

        {/* Product Title */}
        <h3
          onClick={() => onSelectProduct(product)}
          className="font-serif font-bold text-slate-900 text-sm sm:text-base mb-2 line-clamp-2 hover:text-[#8A5D96] cursor-pointer transition-colors leading-tight min-h-[40px] sm:min-h-[48px]"
        >
          {product.name}
        </h3>

        {/* Size & Colors */}
        <div className="flex items-center justify-between gap-2 mb-3 text-[10px] sm:text-xs">
          <span 
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-semibold text-slate-800 border transition-all duration-300 group-hover:border-[#DFBA5A]"
            style={{ backgroundColor: '#FAF7FB', borderColor: '#EBDDF0' }}
            title={product.available_sizes?.join(', ') || product.size}
          >
            <Tag className="w-3 h-3 text-[#8A5D96]" />
            {getSizesLabel()}
          </span>

          {product.available_colors && product.available_colors.length > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              {product.available_colors.slice(0, 4).map((col) => (
                <span
                  key={col.name}
                  className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 shadow-sm transition-all duration-300 hover:scale-110 hover:z-10 cursor-default"
                  style={{ backgroundColor: col.hex, borderColor: 'rgba(0,0,0,0.08)' }}
                  title={col.name}
                >
                  {col.in_stock === false && (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                      <RotateCcw className="w-3 h-3 text-white/70" />
                    </div>
                  )}
                </span>
              ))}
              {product.available_colors.length > 4 && (
                <span className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-bold text-slate-500" style={{ backgroundColor: '#F5EFF7', borderColor: '#EBDDF0' }}>
                  +{product.available_colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Installments */}
        <div className="mt-auto pt-3 border-t flex items-center justify-between gap-2" style={{ borderColor: '#EBDDF0' }}>
          <div className="flex flex-col">
            {product.regular_price && product.regular_price > product.price && (
              <span className="text-[10px] text-slate-400 line-through leading-none mb-0.5">
                R$ {product.regular_price.toFixed(2).replace('.', ',')}
              </span>
            )}
            <div className="font-serif font-black text-lg sm:text-xl text-[#271E2D] leading-tight">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DFBA5A20', color: '#B8860B' }}>
                <Sparkles className="w-2.5 h-2.5" />
              </div>
              3x de R$ {installmentValue} s/ juros
            </div>
          </div>

          {/* Add to Cart Button */}
          {onAddToCart && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="flex-shrink-0 p-2.5 sm:p-3 rounded-xl bg-gradient-to-r text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#DFBA5A] focus:ring-offset-2"
              style={{ background: 'linear-gradient(135deg, #271E2D 0%, #3B0764 100%)' }}
              aria-label={`Adicionar ${product.name} à sacola`}
            >
              <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Sacola</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#DFBA5A] to-[#8A5D96] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          )}
        </div>

        {/* Trust Indicators - Only on Hover */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-1 group-hover:translate-y-0 pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-sm shadow-md text-[9px] font-medium text-slate-600" style={{ borderColor: '#EBDDF0', borderWidth: '1px', borderStyle: 'solid' }}>
            <Truck className="w-3.5 h-3.5 text-[#8A5D96]" />
            <span>Frete Calculado</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-sm shadow-md text-[9px] font-medium text-slate-600" style={{ borderColor: '#EBDDF0', borderWidth: '1px', borderStyle: 'solid' }}>
            <RotateCcw className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Troca Fácil</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-sm shadow-md text-[9px] font-medium text-slate-600" style={{ borderColor: '#EBDDF0', borderWidth: '1px', borderStyle: 'solid' }}>
            <ShieldCheck className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Compra Segura</span>
          </div>
        </div>
      </div>
    </article>
  );
};