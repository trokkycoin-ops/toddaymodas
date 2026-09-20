import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { StoreFront } from './components/StoreFront';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminSpaPanel } from './components/AdminSpaPanel';
import { VendorSpaPanel } from './components/VendorSpaPanel';
import { CustomerSpaPanel } from './components/CustomerSpaPanel';
import { PluginDownloader } from './components/PluginDownloader';
import { DocsViewer } from './components/DocsViewer';
import { FooterLuxury } from './components/FooterLuxury';
import { INITIAL_PRODUCTS } from './data/products';
import { INITIAL_ORDERS, INITIAL_LOGS, INITIAL_SETTINGS } from './data/mockStoreState';
import { Product, CartItem, Order, ActivityLog, PluginSettings } from './types';
import { Sparkles } from 'lucide-react';
import { getConfig, panelUrl } from './lib/api';
import { usePanelData } from './hooks/usePanelData';

export function App() {
  const mode = getConfig().appMode;
  const panel = usePanelData(mode);
  const [currentTab, setCurrentTab] = useState<'store' | 'admin' | 'vendor' | 'customer' | 'download' | 'docs'>('store');
  
  // Dados do Estado da Aplicação
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);
  const [settings, setSettings] = useState<PluginSettings>(INITIAL_SETTINGS);

  // Carga real de produtos a partir da REST do plugin, com fallback para o mock
  useEffect(() => {
    const apiBase = (window as any).tdmConfig?.restUrl || `${window.location.origin}/wp-json/todday/v1`;
    fetch(`${apiBase}/catalog?limit=100&orderby=date&order=DESC`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && Array.isArray(json.data?.products) && json.data.products.length > 0) {
          const mapped: Product[] = json.data.products.map((p: any) => ({
            id: Number(p.id),
            name: p.name,
            slug: p.slug || String(p.id),
            price: Number(p.price) || 0,
            regular_price: p.regular_price && Number(p.regular_price) > 0 ? Number(p.regular_price) : undefined,
            category: (p.categories && p.categories[0]) || 'Moda Feminina (Adulto)',
            condition: p.condition || 'Seminovo Impecável',
            size: p.size || 'M',
            available_sizes: p.size ? [p.size] : ['M'],
            color: '',
            available_colors: [],
            brand: 'Todday Modas Brechó',
            description: p.short_description || p.name,
            image: p.image || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80',
            gallery: p.gallery && p.gallery.length ? p.gallery : [p.image],
            rating: Number(p.rating) || 0,
            review_count: Number(p.rating_count) || 0,
            stock: Number.isFinite(p.stock_quantity) ? Number(p.stock_quantity) : (p.in_stock ? 1 : 0),
          }));
          setProducts(mapped);
        }
      })
      .catch(() => {
        /* mantém INITIAL_PRODUCTS como demonstrativo legado */
      });
  }, []);

  // Busca disparada do Header
  const [headerSearchQuery, setHeaderSearchQuery] = useState<string>('');

  // Sacola e Carrinho
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);

  // Checkout e Pedido Concluído
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState<number>(0);
  const [checkoutCoupon, setCheckoutCoupon] = useState<string>('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Autenticação de Equipe / Painéis Restritos
  const [isStaffModalOpen, setIsStaffModalOpen] = useState<boolean>(false);
  const [isStaffUnlocked, setIsStaffUnlocked] = useState<boolean>(false);

  // Notificação Toast Rápida
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Manipulação de Sacola com Suporte a Tamanho, Cor e Quantidade Selecionados
  const handleAddToCart = (
    product: Product, 
    selectedSize?: string, 
    selectedColor?: string, 
    quantity: number = 1
  ) => {
    const chosenSize = selectedSize || product.available_sizes?.[0] || product.size;
    const chosenColor = selectedColor || product.available_colors?.[0]?.name || product.color;
    const qtyToAdd = Math.max(1, quantity);

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === chosenSize && item.selectedColor === chosenColor
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qtyToAdd,
        };
        showToast(`Quantidade de "${product.name}" (${chosenSize}) atualizada (+${qtyToAdd}) na sacola!`);
        return updated;
      }

      showToast(`Peça "${product.name}" (${chosenSize} • ${chosenColor}) adicionada à sacola!`);
      return [
        ...prev,
        {
          product,
          quantity: qtyToAdd,
          selectedSize: chosenSize,
          selectedColor: chosenColor,
        },
      ];
    });

    setIsCartOpen(true);
  };

  // Compra Imediata (Atalho direto do Modal para o Checkout)
  const handleQuickCheckout = (
    product: Product, 
    selectedSize?: string, 
    selectedColor?: string, 
    quantity: number = 1
  ) => {
    handleAddToCart(product, selectedSize, selectedColor, quantity);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Peça removida da sacola');
  };

  const handleProceedToCheckout = (discountAmount: number, couponCode: string) => {
    setCheckoutDiscount(discountAmount);
    setCheckoutCoupon(couponCode);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setCompletedOrder(newOrder);

    // Registra na trilha de auditoria
    const newLog: ActivityLog = {
      id: logs.length + 1,
      user_login: 'cliente_checkout',
      action: 'order_created',
      object_type: 'wc_order',
      object_id: String(newOrder.id),
      ip_address: '187.54.12.98',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      meta_data: JSON.stringify({ total: newOrder.total, method: newOrder.payment_method }),
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: number, status: Order['status'], trackingCode?: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, ...(trackingCode ? { tracking_code: trackingCode } : {}) } : o))
    );
    showToast(`Status do pedido #${orderId} atualizado para "${status}"`);
  };

  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    const id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 100;
    const fullProduct: Product = { ...newProduct, id };
    setProducts((prev) => [fullProduct, ...prev]);
    showToast(`Produto "${fullProduct.name}" cadastrado com sucesso!`);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    showToast(`Produto "${updatedProduct.name}" atualizado com sucesso!`);
  };

  const handleDeleteProduct = (productId: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast(`Produto removido do catálogo com sucesso.`);
  };

  const handleUpdateSettings = (newSettings: PluginSettings) => {
    setSettings(newSettings);
    showToast('Configurações atualizadas e salvas com sucesso');
  };

  const handleAuthenticateStaff = (targetTab: 'admin' | 'vendor' | 'download' | 'docs') => {
    setIsStaffUnlocked(true);
    setCurrentTab(targetTab);
    showToast(`Acesso autenticado ao painel: ${targetTab.toUpperCase()}`);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ── Páginas dedicadas de painel (fora da vitrine) ─────────────────────────
  if (mode !== 'store') {
    return (
      <div className="min-h-screen bg-[#faf7fb] text-slate-800 font-sans">
        {panel.error && (
          <div className="max-w-7xl mx-auto px-4 pt-6">
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl px-4 py-3">
              {panel.error}
            </div>
          </div>
        )}
        {mode === 'admin' && (
          <AdminSpaPanel
            orders={panel.orders}
            products={panel.products}
            logs={panel.logs}
            settings={panel.settings}
            onUpdateOrderStatus={panel.updateOrderStatus}
            onAddProduct={panel.addProduct}
            onUpdateProduct={panel.updateProduct}
            onDeleteProduct={panel.deleteProduct}
            onUpdateSettings={panel.updateSettings}
          />
        )}
        {mode === 'vendor' && <VendorSpaPanel orders={panel.orders} />}
        {mode === 'customer' && (
          <CustomerSpaPanel
            orders={panel.orders}
            loading={panel.loading}
            error={panel.error}
            onRefresh={panel.reload}
          />
        )}
        {mode === 'download' && <PluginDownloader />}
        {mode === 'docs' && <DocsViewer />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7fb] text-slate-800 flex flex-col font-sans selection:bg-[#dac9df] selection:text-[#382343]">
      {/* Toast Notification Flutuante */}
      {toastMessage && (
        <div 
          className="fixed bottom-6 right-6 z-50 text-[#271E2D] bg-white px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 border border-[#dac9df] animate-in fade-in slide-in-from-bottom-2"
        >
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[#271E2D]"
            style={{ backgroundColor: '#dac9df' }}
          >
            <Sparkles className="w-3 h-3 text-[#271E2D]" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Principal de Grife Brechó com Verde Botânico & Lilás #dac9df */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onSearchSubmit={(query) => {
          setHeaderSearchQuery(query);
          setCurrentTab('store');
        }}
        onCustomerPortal={() => {
          window.location.href = panelUrl('todday-cliente/');
        }}
      />

      {/* Conteúdo Principal de acordo com a Aba Selecionada */}
      <main className="flex-1">
        {currentTab === 'store' && (
          <StoreFront
            key={headerSearchQuery}
            products={products}
            initialSearch={headerSearchQuery}
            onSelectProduct={(product) => setSelectedProductModal(product)}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentTab === 'admin' && (
          <AdminSpaPanel
            orders={orders}
            products={products}
            logs={logs}
            settings={settings}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {currentTab === 'vendor' && (
          <VendorSpaPanel orders={orders} />
        )}

        {currentTab === 'customer' && (
          <CustomerSpaPanel orders={orders} />
        )}

        {currentTab === 'download' && (
          <PluginDownloader />
        )}

        {currentTab === 'docs' && (
          <DocsViewer />
        )}
      </main>

      {/* Rodapé de Alta Grife com Verde Botânico, Lilás #dac9df e Acesso Protegido */}
      <FooterLuxury
        onSelectTab={setCurrentTab}
      />

      {/* Modal de Detalhes da Peça Estilo By Sophi com Galeria Zoom, Box Pix, Medidas e Simulador de Frete */}
      <ProductModal
        product={selectedProductModal}
        allProducts={products}
        onClose={() => setSelectedProductModal(null)}
        onAddToCart={handleAddToCart}
        onQuickCheckout={handleQuickCheckout}
        onSelectProduct={(p) => setSelectedProductModal(p)}
      />

      {/* Drawer Lateral da Sacola de Compras de Grife */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Modal de Checkout Seguro Autônomo */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        discountAmount={checkoutDiscount}
        couponCode={checkoutCoupon}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Modal de Confirmação de Pedido Concluído */}
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
        onGoToCustomerPortal={() => {
          setCompletedOrder(null);
          window.location.href = panelUrl('todday-cliente/');
        }}
      />
    </div>
  );
}

export default App;
