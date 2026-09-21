import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Sparkles, 
  ArrowRight,
  Star,
  ChevronRight,
  Filter,
  CheckCircle2,
  Shirt,
  Baby,
  BookOpen,
  Footprints
} from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES, CONDITIONS } from '../data/products';
import { HeroStore } from './HeroStore';
import { TrustBar } from './TrustBar';
import { ProductCard } from './ProductCard';

interface StoreFrontProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, selectedSize?: string, selectedColor?: string) => void;
  initialSearch?: string;
}

export const StoreFront: React.FC<StoreFrontProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  initialSearch = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos os Itens');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<'date' | 'price-asc' | 'price-desc' | 'rating'>('date');
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Separação de produtos por sessões requeridas pelo usuário:
  const adultProducts = useMemo(() => {
    return products.filter(p => 
      p.category === 'Moda Feminina (Adulto)' || 
      p.category === 'Moda Masculina (Adulto)'
    );
  }, [products]);

  const kidsProducts = useMemo(() => {
    return products.filter(p => p.category === 'Moda Infantil');
  }, [products]);

  const christianProducts = useMemo(() => {
    return products.filter(p => p.category === 'Acessórios Cristãos');
  }, [products]);

  const shoesAndBazaarProducts = useMemo(() => {
    return products.filter(p => p.category === 'Calçados');
  }, [products]);

  // Filtro geral caso o usuário busque por termo ou filtre uma categoria específica
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory =
          selectedCategory === 'Todos os Itens' || product.category === selectedCategory;
        const matchesCondition =
          selectedCondition === 'all' || product.condition === selectedCondition;
        const matchesSize =
          selectedSizeFilter === 'all' ||
          product.size.toLowerCase().includes(selectedSizeFilter.toLowerCase()) ||
          product.available_sizes?.some(s => s.toLowerCase().includes(selectedSizeFilter.toLowerCase()));
        const matchesSearch =
          !searchQuery.trim() ||
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.color.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesCondition && matchesSize && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return b.id - a.id;
      });
  }, [products, selectedCategory, selectedCondition, selectedSizeFilter, searchQuery, sortBy]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isFiltering = selectedCategory !== 'Todos os Itens' || 
                      selectedCondition !== 'all' || 
                      selectedSizeFilter !== 'all' || 
                      searchQuery.trim().length > 0;

  const latestProducts = useMemo(() => [...products].sort((a, b) => b.id - a.id).slice(0, 4), [products]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* 1. Carrossel Automático de Banners de Moda (By Sophi Style) */}
      <HeroStore 
        onExploreClick={() => scrollToSection('sessao-adulto')}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          scrollToSection('catalogo-filtro');
        }}
        onScrollToSection={scrollToSection}
      />

      {/* 2. Barra de Vantagens e Confiança */}
      <TrustBar />

      {!isFiltering && latestProducts.length > 0 && (
        <section className="mb-10 sm:mb-14 rounded-3xl border border-[#DAC9DF] bg-[#271E2D] p-5 sm:p-7 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#DFBA5A]">Curadoria da semana</span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black font-serif">Peças que acabaram de chegar</h2>
              <p className="mt-1 text-xs text-[#DAC9DF]">Novidades selecionadas para você garimpar antes que desapareçam.</p>
            </div>
            <button type="button" onClick={() => scrollToSection('catalogo-filtro')} className="inline-flex items-center gap-2 self-start rounded-xl bg-[#DAC9DF] px-4 py-2.5 text-xs font-black text-[#271E2D]">
              Ver catálogo <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {latestProducts.map((product) => (
              <button key={product.id} type="button" onClick={() => onSelectProduct(product)} className="overflow-hidden rounded-2xl border border-white/10 bg-white/10 text-left backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/15">
                <img src={product.image} alt={product.name} className="aspect-[4/5] w-full object-cover" />
                <span className="block truncate px-3 pt-2 text-xs font-bold">{product.name}</span>
                <span className="block px-3 pb-3 pt-1 text-sm font-black text-[#DFBA5A]">R$ {product.price.toFixed(2).replace('.', ',')}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 3. Navegação Rápida por Círculos de Categorias (Estilo Boutique) */}
      <section className="mb-10 sm:mb-14">
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h3 className="text-lg sm:text-2xl font-serif font-black text-[#271E2D]">
              Navegue por Categoria
            </h3>
            <p className="text-xs text-gray-500">Encontre com facilidade o que você procura</p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-4">
          {[
            { 
              id: 'cat-adulto', 
              name: 'Moda Adulto', 
              target: 'sessao-adulto',
              catFilter: 'Moda Feminina (Adulto)',
              img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=300&q=80',
              count: `${adultProducts.length} peças`
            },
            { 
              id: 'cat-kids', 
              name: 'Moda Infantil', 
              target: 'sessao-kids',
              catFilter: 'Moda Infantil',
              img: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=300&q=80',
              count: `${kidsProducts.length} peças`
            },
            { 
              id: 'cat-cristao', 
              name: 'Espaço Cristão', 
              target: 'sessao-cristao',
              catFilter: 'Acessórios Cristãos',
              img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80',
              count: `${christianProducts.length} itens`
            },
            { 
              id: 'cat-calcados', 
              name: 'Calçados', 
              target: 'sessao-calcados',
              catFilter: 'Calçados',
              img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=300&q=80',
              count: `${shoesAndBazaarProducts.length} pares`
            },
            { 
              id: 'cat-masculino', 
              name: 'Masculino', 
              target: 'sessao-adulto',
              catFilter: 'Moda Masculina (Adulto)',
              img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=300&q=80',
              count: 'Alfaiataria'
            },
            { 
              id: 'cat-bazar', 
              name: 'Ver Tudo', 
              target: 'catalogo-filtro',
              catFilter: 'Todos os Itens',
              img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=300&q=80',
              count: 'Catálogo'
            }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                if (cat.target === 'catalogo-filtro') {
                  setSelectedCategory('Todos os Itens');
                  scrollToSection('catalogo-filtro');
                } else {
                  scrollToSection(cat.target);
                }
              }}
              className="flex flex-col items-center p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAC9DF] hover:border-[#8A5D96] hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2 border-2 border-[#DAC9DF] group-hover:scale-105 transition-transform shadow-xs">
                <img 
                  src={cat.img} 
                  alt={cat.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <strong className="text-[11px] sm:text-xs font-bold text-[#271E2D] group-hover:text-[#8A5D96] transition-colors text-center line-clamp-1">
                {cat.name}
              </strong>
              <span className="text-[10px] text-gray-500 mt-0.5">{cat.count}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Barra de Busca e Filtros Rápidos */}
      <section id="catalogo-filtro" className="scroll-mt-24 mb-8">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DAC9DF] shadow-xs">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Campo de Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por vestido mídi, saia, capa de bíblia, infantil, tamanho..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl text-xs sm:text-sm text-[#271E2D] placeholder:text-gray-400 focus:outline-none focus:border-[#dac9df] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Ordenação */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-500 font-medium">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl text-xs font-bold text-[#271E2D] focus:outline-none cursor-pointer"
              >
                <option value="date">✨ Mais Recentes</option>
                <option value="price-asc">💵 Menor Preço</option>
                <option value="price-desc">💎 Maior Preço</option>
                <option value="rating">⭐ Mais Bem Avaliados</option>
              </select>
            </div>
          </div>

          {/* Filtros em Pílulas */}
          <div className="flex items-center gap-2 overflow-x-auto pt-3 mt-3 border-t border-[#EBDDF0]/70 scrollbar-none text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'text-white bg-[#271E2D] shadow-xs'
                    : 'bg-[#FAF7FA] text-gray-600 hover:bg-[#EBDDF0] border border-[#EBDDF0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Se o usuário estiver filtrando ativamente ou pesquisando, mostra a lista filtrada em destaque */}
      {isFiltering ? (
        <section className="mb-14">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-[#271E2D]">
                Resultados da Busca
              </h2>
              <p className="text-xs text-gray-500">
                Encontrados {filteredProducts.length} produtos correspondentes aos filtros
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('Todos os Itens');
                setSelectedCondition('all');
                setSelectedSizeFilter('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-[#846391] hover:underline"
            >
              Limpar Filtros
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-[#EBDDF0] p-6">
              <Sparkles className="w-10 h-10 text-[#846391] mx-auto mb-2" />
              <h3 className="text-base font-bold text-[#271E2D] mb-1">Nenhuma peça encontrada</h3>
              <p className="text-xs text-gray-500 mb-4">
                Tente buscar com outras palavras ou remover os filtros de categoria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('Todos os Itens');
                  setSearchQuery('');
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#271E2D]"
              >
                Ver Todas as Peças
              </button>
            </div>
          ) : (
            /* GRID RESPONSIVO: 2 CARDS NO MOBILE (grid-cols-2) */
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={toggleFavorite}
                  onSelectProduct={onSelectProduct}
                  onAddToCart={() => onAddToCart(product)}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        /* SESSÕES SEPARADAS DA HOME: ADULTO, KIDS, CRISTÃO, CALÇADOS */
        <div className="space-y-12 sm:space-y-16">
          {/* ======================================================== */}
          {/* SESSÃO 1: MODA ADULTO (FEMININA & MASCULINA)             */}
          {/* ======================================================== */}
          <section id="sessao-adulto" className="scroll-mt-24">
            <div className="flex items-end justify-between mb-4 sm:mb-6 border-b border-[#EBDDF0] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-[#271E2D]"
                    style={{ backgroundColor: '#dac9df' }}
                  >
                    Destaques
                  </span>
                  <span className="text-xs font-bold text-[#846391] uppercase tracking-wider">
                    Moda Modesta & Alfaiataria
                  </span>
                </div>
                <h2 className="text-xl sm:text-3xl font-serif font-black text-[#271E2D]">
                  Moda Adulto (Feminina & Masculina)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Vestidos mídi, saias godê e camisas sofisticadas com medidas reais na fita métrica
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('Moda Feminina (Adulto)');
                  scrollToSection('catalogo-filtro');
                }}
                className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#271E2D] hover:text-[#846391] transition-colors"
              >
                <span>Ver Todos</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* GRID RESPONSIVO: 2 CARDS NO MOBILE (grid-cols-2) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
              {adultProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={toggleFavorite}
                  onSelectProduct={onSelectProduct}
                  onAddToCart={() => onAddToCart(product)}
                />
              ))}
            </div>
          </section>

          {/* ======================================================== */}
          {/* BANNER INTERMEDIÁRIO PROMOCIONAL 1: LINHA KIDS           */}
          {/* ======================================================== */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-[#3D2C47] to-[#271E2D] text-white p-6 sm:p-10 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8">
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase text-[#271E2D] mb-3"
                  style={{ backgroundColor: '#dac9df' }}
                >
                  <Baby className="w-3.5 h-3.5 text-[#271E2D]" />
                  <span>Especial Crianças & Família</span>
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-black mb-2 text-white">
                  Vestidinhos & Conjuntos com Conforto para os Pequenos
                </h3>
                <p className="text-xs sm:text-sm text-purple-200 mb-4 max-w-xl">
                  Peças leves, tecidos em algodão puro que não pinicam o corpo delicado da criança e modelagens encantadoras para cultos e festividades.
                </p>
                <button
                  type="button"
                  onClick={() => scrollToSection('sessao-kids')}
                  className="px-6 py-2.5 rounded-full text-xs font-black text-[#271E2D] transition-transform hover:scale-105 shadow-md cursor-pointer"
                  style={{ backgroundColor: '#dac9df' }}
                >
                  Ir para a Linha Kids
                </button>
              </div>

              <div className="md:col-span-4 hidden md:block">
                <img
                  src="https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=500&q=80"
                  alt="Moda Infantil"
                  className="w-full h-44 object-cover rounded-2xl border-2 border-white/30 shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SESSÃO 2: MODA INFANTIL (KIDS)                           */}
          {/* ======================================================== */}
          <section id="sessao-kids" className="scroll-mt-24">
            <div className="flex items-end justify-between mb-4 sm:mb-6 border-b border-[#EBDDF0] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase text-[#271E2D]"
                    style={{ backgroundColor: '#dac9df' }}
                  >
                    <Baby className="w-3 h-3 text-[#271E2D]" />
                    <span>Linha Infantil</span>
                  </span>
                  <span className="text-xs font-bold text-[#846391] uppercase tracking-wider">
                    Para Príncipes & Princesas
                  </span>
                </div>
                <h2 className="text-xl sm:text-3xl font-serif font-black text-[#271E2D]">
                  Moda Infantil (Kids)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Vestidinhos rodados, camisas sociais infantis e conjuntos confortáveis
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('Moda Infantil');
                  scrollToSection('catalogo-filtro');
                }}
                className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#271E2D] hover:text-[#846391] transition-colors"
              >
                <span>Ver Todos Kids</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* GRID RESPONSIVO: 2 CARDS NO MOBILE (grid-cols-2) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
              {kidsProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={toggleFavorite}
                  onSelectProduct={onSelectProduct}
                  onAddToCart={() => onAddToCart(product)}
                />
              ))}
            </div>
          </section>

          {/* ======================================================== */}
          {/* BANNER INTERMEDIÁRIO PROMOCIONAL 2: ESPAÇO CRISTÃO       */}
          {/* ======================================================== */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-[#201826] via-[#2E2036] to-[#1E1624] text-white p-6 sm:p-10 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8">
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase text-[#271E2D] mb-3"
                  style={{ backgroundColor: '#dac9df' }}
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#271E2D]" />
                  <span>Devoção & Fé</span>
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-black mb-2 text-white">
                  Capas Acolchoadas para Bíblia & Artigos Religiosos
                </h3>
                <p className="text-xs sm:text-sm text-purple-200 mb-4 max-w-xl">
                  Proteja as Sagradas Escrituras com capas resistentes feitas com zíper reforçado, repartição para caneta e lindo acabamento. Semijoias banhadas a ouro 18k.
                </p>
                <button
                  type="button"
                  onClick={() => scrollToSection('sessao-cristao')}
                  className="px-6 py-2.5 rounded-full text-xs font-black text-[#271E2D] transition-transform hover:scale-105 shadow-md cursor-pointer"
                  style={{ backgroundColor: '#dac9df' }}
                >
                  Conhecer Acessórios de Fé
                </button>
              </div>

              <div className="md:col-span-4 hidden md:block">
                <img
                  src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=500&q=80"
                  alt="Capas de Bíblia"
                  className="w-full h-44 object-cover rounded-2xl border-2 border-white/30 shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SESSÃO 3: ESPAÇO CRISTÃO & CAPAS DE BÍBLIA               */}
          {/* ======================================================== */}
          <section id="sessao-cristao" className="scroll-mt-24">
            <div className="flex items-end justify-between mb-4 sm:mb-6 border-b border-[#EBDDF0] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase text-[#271E2D]"
                    style={{ backgroundColor: '#dac9df' }}
                  >
                    <BookOpen className="w-3 h-3 text-[#271E2D]" />
                    <span>Artigos de Fé</span>
                  </span>
                  <span className="text-xs font-bold text-[#846391] uppercase tracking-wider">
                    Capas de Bíblia & Semijoias
                  </span>
                </div>
                <h2 className="text-xl sm:text-3xl font-serif font-black text-[#271E2D]">
                  Espaço Cristão & Acessórios
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Capas acolchoadas com zíper, colares com crucifixo 18k e pulseiras com berloques
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('Acessórios Cristãos');
                  scrollToSection('catalogo-filtro');
                }}
                className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#271E2D] hover:text-[#846391] transition-colors"
              >
                <span>Ver Todos os Artigos</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* GRID RESPONSIVO: 2 CARDS NO MOBILE (grid-cols-2) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
              {christianProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={toggleFavorite}
                  onSelectProduct={onSelectProduct}
                  onAddToCart={() => onAddToCart(product)}
                />
              ))}
            </div>
          </section>

          {/* ======================================================== */}
          {/* SESSÃO 4: CALÇADOS & BAZAR SELECIONADO                   */}
          {/* ======================================================== */}
          <section id="sessao-calcados" className="scroll-mt-24">
            <div className="flex items-end justify-between mb-4 sm:mb-6 border-b border-[#EBDDF0] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase text-[#271E2D]"
                    style={{ backgroundColor: '#dac9df' }}
                  >
                    <Footprints className="w-3 h-3 text-[#271E2D]" />
                    <span>Conforto & Estilo</span>
                  </span>
                  <span className="text-xs font-bold text-[#846391] uppercase tracking-wider">
                    Calçados Selecionados
                  </span>
                </div>
                <h2 className="text-xl sm:text-3xl font-serif font-black text-[#271E2D]">
                  Calçados & Sapatos de Conforto
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Scarpins salto bloco, sandálias de festa e sapatos Oxford masculinos
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('Calçados');
                  scrollToSection('catalogo-filtro');
                }}
                className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#271E2D] hover:text-[#846391] transition-colors"
              >
                <span>Ver Todos os Calçados</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* GRID RESPONSIVO: 2 CARDS NO MOBILE (grid-cols-2) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
              {shoesAndBazaarProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={toggleFavorite}
                  onSelectProduct={onSelectProduct}
                  onAddToCart={() => onAddToCart(product)}
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* 5. Depoimentos Verificados Estilo By Sophi */}
      <section className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-[#EBDDF0] shadow-xs my-12 sm:my-16">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#271E2D] mb-2"
            style={{ backgroundColor: '#dac9df' }}
          >
            <Star className="w-3.5 h-3.5 fill-[#271E2D]" />
            <span>Opinião das Nossas Clientes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#271E2D]">
            Quem Compra, Recomenda
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Veja a experiência de quem já comprou no Todday Modas Brechó
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-[#FAF7FA] p-5 sm:p-6 rounded-2xl border border-[#EBDDF0] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic mb-4">
                "Comprei o vestido mídi plissado para um congresso. A peça chegou super bem embalada, cheirosa e com medidas exatas na fita. Amei!"
              </p>
            </div>
            <div className="border-t border-[#DAC9DF] pt-3">
              <strong className="block text-xs font-bold text-[#271E2D]">Sarah Ribeiro</strong>
              <span className="text-[11px] text-[#8A5D96]">São Paulo - SP • Compra Verificada</span>
            </div>
          </div>

          <div className="bg-[#FAF7FB] p-5 sm:p-6 rounded-2xl border border-[#DAC9DF] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic mb-4">
                "A capa de Bíblia acolchoada em couro é de altíssima qualidade. O zíper é super macio e coube perfeitamente na minha Bíblia de estudo."
              </p>
            </div>
<div className="border-t border-[#DAC9DF] pt-3">
              <strong className="block text-xs font-bold text-[#271E2D]">Débora Silveira</strong>
              <span className="text-[11px] text-[#8A5D96]">Curitiba - PR • Compra Verificada</span>
            </div>
          </div>
          <div className="bg-[#FAF7FB] p-5 sm:p-6 rounded-2xl border border-[#DAC9DF] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic mb-4">
                "O vestidinho infantil da minha filha é maravilhoso. Não pinica nada e ela amou usar na igreja. O atendimento da loja é nota 10!"
              </p>
            </div>
            <div className="border-t border-[#DAC9DF] pt-3">
              <strong className="block text-xs font-bold text-[#271E2D]">Maria Aparecida</strong>
              <span className="text-[11px] text-[#8A5D96]">Belo Horizonte - MG • Compra Verificada</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
