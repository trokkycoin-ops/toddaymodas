import React from 'react';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
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

  return (
    <div 
      className="group bg-white rounded-2xl sm:rounded-3xl border border-[#EBDDF0] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#dac9df] transition-all duration-300 flex flex-col hover:-translate-y-1"
      id={`tdm-card-${product.id}`}
    >
      {/* Container da Imagem com Badges e Botão Favorito */}
      <div 
        className="relative aspect-[3/4] bg-[#FAF7FA] overflow-hidden cursor-pointer"
        onClick={() => onSelectProduct(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badge de Desconto ou Peça Única */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 z-10">
          {discountPercent && discountPercent > 0 && (
            <span 
              className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#271E2D] shadow-xs border border-white/60 backdrop-blur-xs"
              style={{ backgroundColor: '#dac9df' }}
            >
              -{discountPercent}%
            </span>
          )}

          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-bold text-white bg-[#271E2D]/80 backdrop-blur-xs">
            {product.condition}
          </span>
        </div>

        {/* Botão de Favoritar */}
        <button
          type="button"
          onClick={(e) => onToggleFavorite(product.id, e)}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 rounded-full bg-white/90 hover:bg-white text-gray-600 shadow-sm transition-all z-10 cursor-pointer"
          title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart 
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-400 hover:text-rose-500'
            }`} 
          />
        </button>

        {/* Botão Flutuante de Espiada Rápida no Desktop */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectProduct(product);
          }}
          className="hidden md:flex absolute bottom-3 left-3 right-3 py-2 px-3 rounded-xl bg-white/95 text-[#271E2D] font-bold text-xs shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 items-center justify-center gap-1.5 backdrop-blur-xs cursor-pointer hover:bg-[#271E2D] hover:text-white"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Ver Detalhes & Medidas</span>
        </button>
      </div>

      {/* Informações da Peça com Layout Otimizado para 2 Colunas no Mobile */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {/* Marca e Avaliação */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 font-semibold mb-1">
          <span className="truncate pr-1 font-bold text-[#846391]">{product.brand}</span>
          <span className="flex items-center gap-0.5 text-amber-500 shrink-0 font-bold">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{product.rating}</span>
          </span>
        </div>

        {/* Título do Produto */}
        <h3
          onClick={() => onSelectProduct(product)}
          className="font-serif font-bold text-gray-900 text-xs sm:text-sm mb-1.5 line-clamp-2 hover:text-[#846391] cursor-pointer transition-colors leading-tight min-h-[32px] sm:min-h-[38px]"
        >
          {product.name}
        </h3>

        {/* Tamanho e Cores */}
        <div className="flex items-center justify-between gap-1 mb-2.5 text-[10px] sm:text-xs">
          <span 
            className="px-2 py-0.5 rounded-md font-semibold text-gray-800 bg-[#FAF7FA] border border-[#EBDDF0] truncate"
            title={product.available_sizes?.join(', ') || product.size}
          >
            {getSizesLabel()}
          </span>

          {product.available_colors && product.available_colors.length > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              {product.available_colors.slice(0, 3).map((col) => (
                <span
                  key={col.name}
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-black/20"
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                />
              ))}
              {product.available_colors.length > 3 && (
                <span className="text-[9px] font-bold text-gray-400">
                  +{product.available_colors.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Preço e Botão de Compra */}
        <div className="mt-auto pt-2 border-t border-[#EBDDF0] flex items-center justify-between gap-1">
          <div>
            {product.regular_price && (
              <span className="text-[10px] text-gray-400 line-through block leading-none">
                R$ {product.regular_price.toFixed(2).replace('.', ',')}
              </span>
            )}
            <div className="text-sm sm:text-base font-serif font-black text-[#271E2D] leading-tight">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </div>
            <div className="text-[9px] sm:text-[10px] text-gray-500 font-medium">
              3x de R$ {installmentValue}
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onAddToCart) {
                onAddToCart(product);
              } else {
                onSelectProduct(product);
              }
            }}
            className="flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-black text-[#271E2D] shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer border border-[#cbb6d2] shrink-0"
            style={{ backgroundColor: '#dac9df' }}
            title="Comprar agora"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#271E2D]" />
            <span className="hidden sm:inline sm:ml-1.5">Comprar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
