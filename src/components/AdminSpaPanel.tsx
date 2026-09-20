import React, { useEffect, useState } from 'react';
import { Order, Product, ActivityLog, PluginSettings } from '../types';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Activity,
  Settings,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Truck,
  DollarSign,
  Search,
  Filter,
  Save,
  Check,
  X,
  ExternalLink,
  LoaderCircle,
} from 'lucide-react';

interface AdminSpaPanelProps {
  orders: Order[];
  products: Product[];
  logs: ActivityLog[];
  settings: PluginSettings;
  onUpdateOrderStatus: (orderId: number, status: Order['status'], trackingCode?: string) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
  onUpdateSettings: (settings: PluginSettings) => void;
  onTestMercadoPago: (accessToken: string) => Promise<any>;
  onTestMelhorEnvio: (apiToken: string, environment: 'sandbox' | 'production') => Promise<any>;
}

export function AdminSpaPanel({
  orders,
  products,
  logs,
  settings,
  onUpdateOrderStatus,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateSettings,
  onTestMercadoPago,
  onTestMelhorEnvio,
}: AdminSpaPanelProps) {
  type AdminTab = 'dashboard' | 'orders' | 'products' | 'logs' | 'settings';
  const initialTab = typeof window !== 'undefined' && ['dashboard', 'orders', 'products', 'logs', 'settings'].includes(window.location.hash.slice(1))
    ? window.location.hash.slice(1) as AdminTab
    : 'dashboard';
  const [currentTab, setCurrentTab] = useState<AdminTab>(initialTab);

  useEffect(() => {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${currentTab}`);
  }, [currentTab]);

  // Orders tab state
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState<Order['status']>('pending');
  const [trackingInput, setTrackingInput] = useState('');

  // Products tab state
  const [productSearch, setProductSearch] = useState('');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Omit<Product, 'id'>>({
    name: '',
    slug: '',
    price: 0,
    regular_price: 0,
    category: 'Moda Feminina (Adulto)',
    condition: 'Seminovo Impecável',
    size: 'M',
    available_sizes: ['M'],
    color: 'Floral',
    available_colors: [{ name: 'Floral', hex: '#846391', in_stock: true }],
    brand: 'Todday Modas',
    description: '',
    measurements: { bust: '90 cm', waist: '74 cm', length: '110 cm' },
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    rating: 5,
    review_count: 1,
    stock: 1,
  });

  // Settings tab state
  const [localSettings, setLocalSettings] = useState<PluginSettings>(settings);
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);
  const [testingMercadoPago, setTestingMercadoPago] = useState(false);
  const [mercadoPagoTestMessage, setMercadoPagoTestMessage] = useState<string | null>(null);
  const [testingMelhorEnvio, setTestingMelhorEnvio] = useState(false);
  const [melhorEnvioTestMessage, setMelhorEnvioTestMessage] = useState<string | null>(null);

  // KPIs
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const completedOrders = orders.filter((o) => o.status === 'completed' || o.status === 'shipped').length;
  const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    setSavedSettingsSuccess(true);
    setTimeout(() => setSavedSettingsSuccess(false), 3000);
  };

  const handleTestMercadoPago = async () => {
    setTestingMercadoPago(true);
    setMercadoPagoTestMessage(null);
    try {
      const result = await onTestMercadoPago(localSettings.mercadopago.access_token);
      setLocalSettings((current) => ({ ...current, mercadopago: { ...current.mercadopago, enabled: true } }));
      setMercadoPagoTestMessage(result.message || 'Mercado Pago conectado e ativado.');
    } catch (error: any) {
      setMercadoPagoTestMessage(error?.message || 'Não foi possível conectar ao Mercado Pago.');
    } finally {
      setTestingMercadoPago(false);
    }
  };

  const handleTestMelhorEnvio = async () => {
    setTestingMelhorEnvio(true);
    setMelhorEnvioTestMessage(null);
    try {
      const result = await onTestMelhorEnvio(localSettings.melhorenvio.api_token, localSettings.melhorenvio.environment);
      setLocalSettings((current) => ({ ...current, melhorenvio: { ...current.melhorenvio, enabled: true } }));
      setMelhorEnvioTestMessage(result.message || 'Melhor Envio conectado e ativado.');
    } catch (error: any) {
      setMelhorEnvioTestMessage(error?.message || 'Não foi possível conectar ao Melhor Envio.');
    } finally {
      setTestingMelhorEnvio(false);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onUpdateProduct({ ...productForm, id: editingProduct.id });
      setEditingProduct(null);
    } else {
      onAddProduct(productForm);
      setIsAddProductOpen(false);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#EBDDF0] shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#846391] animate-pulse" />
            <span className="text-xs font-bold text-[#846391] uppercase tracking-wider">
              Painel Administrativo SPA (/painel-gestao-tm/)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Gestão Todday Modas Brechó</h1>
          <p className="text-xs text-slate-500">
            Controle de catálogo, pedidos HPOS, rastreio, integrações e trilha de auditoria.
          </p>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-[#FAF7FA] p-1.5 rounded-xl border border-[#EBDDF0]">
          <button
            type="button"
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-[#271E2D] text-white shadow-xs'
                : 'text-gray-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Resumo</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('orders')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'orders'
                ? 'bg-[#271E2D] text-white shadow-xs'
                : 'text-gray-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Pedidos ({orders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('products')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'products'
                ? 'bg-[#271E2D] text-white shadow-xs'
                : 'text-gray-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Catálogo ({products.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('logs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'logs'
                ? 'bg-[#271E2D] text-white shadow-xs'
                : 'text-gray-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Auditoria</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-[#271E2D] text-white shadow-xs'
                : 'text-gray-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Configurações</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {currentTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#EBDDF0] shadow-2xs">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Faturamento Total
              </span>
              <div className="text-2xl font-black text-slate-900 mt-2">
                R$ {totalRevenue.toFixed(2).replace('.', ',')}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                {orders.length} pedidos registrados
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EBDDF0] shadow-2xs">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Pedidos Entregues / Enviados
              </span>
              <div className="text-2xl font-black text-[#846391] mt-2">{completedOrders}</div>
              <span className="text-[11px] text-gray-400 mt-1 inline-block">
                Taxa de sucesso elevada
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EBDDF0] shadow-2xs">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Peças no Catálogo
              </span>
              <div className="text-2xl font-black text-slate-900 mt-2">{products.length}</div>
              <span className="text-[11px] text-[#846391] font-semibold mt-1 inline-block">
                Peças ativas disponíveis
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EBDDF0] shadow-2xs">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Ticket Médio
              </span>
              <div className="text-2xl font-black text-[#271E2D] mt-2">
                R$ {avgTicket.toFixed(2).replace('.', ',')}
              </div>
              <span className="text-[11px] text-gray-400 mt-1 inline-block">Média por pedido</span>
            </div>
          </div>

          {/* Recent Orders Preview */}
          <div className="bg-white rounded-2xl border border-[#EBDDF0] overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-[#EBDDF0] flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 text-sm">Últimos Pedidos HPOS</h3>
              <button
                onClick={() => setCurrentTab('orders')}
                className="text-xs font-bold text-[#846391] hover:underline"
              >
                Ver Todos
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7FA] text-gray-500 font-bold border-b border-[#EBDDF0]">
                  <tr>
                    <th className="p-3.5">Pedido</th>
                    <th className="p-3.5">Data</th>
                    <th className="p-3.5">Cliente</th>
                    <th className="p-3.5">Valor</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBDDF0]/60">
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="hover:bg-[#FAF7FA]/50">
                      <td className="p-3.5 font-mono font-bold text-slate-900">#{o.order_number}</td>
                      <td className="p-3.5 text-gray-500">{o.date}</td>
                      <td className="p-3.5 font-medium text-slate-800">{o.customer_name}</td>
                      <td className="p-3.5 font-bold text-[#271E2D]">
                        R$ {o.total.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-[#846391] border border-[#EBDDF0]">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {currentTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#EBDDF0] flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Buscar por pedido, cliente ou email..."
                className="w-full pl-10 pr-3 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl text-xs focus:outline-none focus:border-[#271E2D]"
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Exibindo {filteredOrders.length} de {orders.length} pedidos
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#EBDDF0] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7FA] text-gray-500 font-bold border-b border-[#EBDDF0]">
                  <tr>
                    <th className="p-3.5">Pedido</th>
                    <th className="p-3.5">Data</th>
                    <th className="p-3.5">Cliente</th>
                    <th className="p-3.5">Itens</th>
                    <th className="p-3.5">Total</th>
                    <th className="p-3.5">Rastreio</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBDDF0]/60">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#FAF7FA]/50">
                      <td className="p-3.5 font-mono font-bold text-slate-900">#{o.order_number}</td>
                      <td className="p-3.5 text-gray-500">{o.date}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{o.customer_name}</div>
                        <div className="text-[11px] text-gray-400">{o.customer_email}</div>
                      </td>
                      <td className="p-3.5 text-gray-600 max-w-xs truncate">
                        {o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </td>
                      <td className="p-3.5 font-bold text-[#271E2D]">
                        R$ {o.total.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-gray-600">
                        {o.tracking_code || '—'}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-[#846391] border border-[#EBDDF0]">
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(o);
                            setEditStatus(o.status);
                            setTrackingInput(o.tracking_code || '');
                          }}
                          className="px-3 py-1 bg-[#271E2D] text-white text-xs font-bold rounded-lg hover:bg-[#382343] transition-colors cursor-pointer"
                        >
                          Gerenciar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {currentTab === 'products' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#EBDDF0] flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Buscar por título, categoria ou marca..."
                className="w-full pl-10 pr-3 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl text-xs focus:outline-none focus:border-[#271E2D]"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setProductForm({
                  name: '',
                  slug: '',
                  price: 89.9,
                  regular_price: 149.9,
                  category: 'Moda Feminina (Adulto)',
                  condition: 'Seminovo Impecável',
                  size: 'M',
                  available_sizes: ['P', 'M', 'G'],
                  color: 'Preto Clássico',
                  available_colors: [{ name: 'Preto Clássico', hex: '#271E2D', in_stock: true }],
                  brand: 'Todday Modas Brechó',
                  description: 'Peça selecionada exclusiva com acabamento nobre e costura reforçada.',
                  measurements: { bust: '94 cm', waist: '76 cm', length: '112 cm' },
                  image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
                  rating: 5,
                  review_count: 1,
                  stock: 1,
                });
                setIsAddProductOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#271E2D] text-white text-xs font-bold rounded-xl hover:bg-[#382343] transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Nova Peça</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-[#EBDDF0] overflow-hidden p-3.5 flex gap-3 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-20 h-24 object-cover rounded-xl border border-[#EBDDF0] shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#846391] uppercase tracking-wider block truncate">
                      {p.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{p.name}</h4>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Tam: <strong>{p.size}</strong> • {p.condition}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#EBDDF0]/60">
                    <span className="font-bold text-sm text-[#271E2D]">
                      R$ {p.price.toFixed(2).replace('.', ',')}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(p);
                          setProductForm(p);
                          setIsAddProductOpen(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-[#271E2D] rounded-lg transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(p.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AUDIT LOGS TAB */}
      {currentTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-[#EBDDF0] overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#EBDDF0]">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Trilha de Auditoria e Segurança (`wp_todday_activity_log`)
            </h3>
            <p className="text-xs text-slate-400">
              Registro imutável de eventos de pedidos, logins, transações e alterações de status.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7FA] text-gray-500 font-bold border-b border-[#EBDDF0]">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Data/Hora</th>
                  <th className="p-3.5">Usuário</th>
                  <th className="p-3.5">Ação</th>
                  <th className="p-3.5">Objeto</th>
                  <th className="p-3.5">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBDDF0]/60">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-[#FAF7FA]/50">
                    <td className="p-3.5 font-mono text-gray-400">#{l.id}</td>
                    <td className="p-3.5 text-gray-500">{l.created_at}</td>
                    <td className="p-3.5 font-bold text-slate-800">{l.user_login}</td>
                    <td className="p-3.5 font-mono text-[#846391] font-semibold">{l.action}</td>
                    <td className="p-3.5 text-gray-600">
                      {l.object_type} #{l.object_id}
                    </td>
                    <td className="p-3.5 font-mono text-gray-400">{l.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {currentTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {savedSettingsSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Configurações salvas e aplicadas com sucesso no plugin WordPress!</span>
            </div>
          )}

          {/* Mercado Pago */}
          <div className="bg-white p-6 rounded-2xl border border-[#EBDDF0] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBDDF0]">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Mercado Pago (PIX e Cartão)</h3>
                <p className="text-xs text-slate-400">Gateway de pagamento com verificação de webhook</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                <input
                  type="checkbox"
                  checked={localSettings.mercadopago.enabled}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      mercadopago: { ...localSettings.mercadopago, enabled: e.target.checked },
                    })
                  }
                  className="rounded text-[#271E2D]"
                />
                <span>Habilitado</span>
              </label>
            </div>
            {mercadoPagoTestMessage && (
              <div className={`rounded-xl border px-3 py-2 text-xs font-bold ${mercadoPagoTestMessage.includes('sucesso') || mercadoPagoTestMessage.includes('ativado') ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
                {mercadoPagoTestMessage}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Ambiente</label>
                <select
                  value={localSettings.mercadopago.environment}
                  onChange={(e) => setLocalSettings({ ...localSettings, mercadopago: { ...localSettings.mercadopago, environment: e.target.value as 'sandbox' | 'production' } })}
                  className="w-full px-3 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl text-xs"
                >
                  <option value="sandbox">Sandbox / testes</option>
                  <option value="production">Produção</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Chave Pública (Public Key)</label>
                <input
                  type="text"
                  value={localSettings.mercadopago.public_key}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      mercadopago: { ...localSettings.mercadopago, public_key: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Token de Acesso (Access Token)</label>
                {localSettings.mercadopago.has_access_token && !localSettings.mercadopago.access_token && <p className="mb-1 text-[11px] font-bold text-emerald-700">Credencial salva com segurança. Deixe vazio para reutilizá-la.</p>}
                <input
                  type="password"
                  value={localSettings.mercadopago.access_token}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      mercadopago: { ...localSettings.mercadopago, access_token: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl font-mono text-[11px]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-gray-700 font-bold mb-1">Webhook Secret</label>
                <input
                  type="password"
                  value={localSettings.mercadopago.webhook_secret}
                  onChange={(e) => setLocalSettings({ ...localSettings, mercadopago: { ...localSettings.mercadopago, webhook_secret: e.target.value } })}
                  placeholder="Opcional, recomendado para produção"
                  className="w-full px-3 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl font-mono text-[11px]"
                />
              </div>
            </div>
            <button type="button" onClick={handleTestMercadoPago} disabled={testingMercadoPago || (!localSettings.mercadopago.access_token && !localSettings.mercadopago.has_access_token)} className="inline-flex items-center gap-2 rounded-xl bg-[#271E2D] px-4 py-2.5 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50">
              {testingMercadoPago ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {testingMercadoPago ? 'Testando conexão...' : 'Testar e ativar Mercado Pago'}
            </button>
          </div>

          {/* Melhor Envio */}
          <div className="bg-white p-6 rounded-2xl border border-[#EBDDF0] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBDDF0]">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Melhor Envio (Frete Nacional)</h3>
                <p className="text-xs text-slate-400">Cálculo de PAC, SEDEX e transportadoras</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                <input
                  type="checkbox"
                  checked={localSettings.melhorenvio.enabled}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      melhorenvio: { ...localSettings.melhorenvio, enabled: e.target.checked },
                    })
                  }
                  className="rounded text-[#271E2D]"
                />
                <span>Habilitado</span>
              </label>
            </div>
            {melhorEnvioTestMessage && (
              <div className={`rounded-xl border px-3 py-2 text-xs font-bold ${melhorEnvioTestMessage.includes('sucesso') || melhorEnvioTestMessage.includes('ativado') ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
                {melhorEnvioTestMessage}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Ambiente</label>
                <select
                  value={localSettings.melhorenvio.environment}
                  onChange={(e) => setLocalSettings({ ...localSettings, melhorenvio: { ...localSettings.melhorenvio, environment: e.target.value as 'sandbox' | 'production' } })}
                  className="w-full px-3 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl text-xs"
                >
                  <option value="sandbox">Sandbox / testes</option>
                  <option value="production">Produção</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Token de Acesso</label>
                {localSettings.melhorenvio.has_token && !localSettings.melhorenvio.api_token && <p className="mb-1 text-[11px] font-bold text-emerald-700">Credencial salva com segurança. Deixe vazio para reutilizá-la.</p>}
                <input
                  type="password"
                  value={localSettings.melhorenvio.api_token}
                  onChange={(e) => setLocalSettings({ ...localSettings, melhorenvio: { ...localSettings.melhorenvio, api_token: e.target.value } })}
                  placeholder="Cole o token do Melhor Envio"
                  className="w-full px-3 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">CEP de Origem da Loja</label>
                <input
                  type="text"
                  value={localSettings.melhorenvio.sender_cep}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      melhorenvio: { ...localSettings.melhorenvio, sender_cep: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Frete Fixo de Contingência (R$)</label>
                <input
                  type="number"
                  step="0.1"
                  value={localSettings.melhorenvio.fallback_flat_rate}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      melhorenvio: {
                        ...localSettings.melhorenvio,
                        fallback_flat_rate: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl text-xs"
                />
              </div>
            </div>
            <button type="button" onClick={handleTestMelhorEnvio} disabled={testingMelhorEnvio || (!localSettings.melhorenvio.api_token && !localSettings.melhorenvio.has_token)} className="inline-flex items-center gap-2 rounded-xl bg-[#271E2D] px-4 py-2.5 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50">
              {testingMelhorEnvio ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {testingMelhorEnvio ? 'Testando conexão...' : 'Testar e ativar Melhor Envio'}
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-[#271E2D] text-white text-xs font-bold rounded-xl hover:bg-[#382343] transition-all shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Todas as Configurações</span>
            </button>
          </div>
        </form>
      )}

      {/* ORDER STATUS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EBDDF0]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Gerenciar Pedido #{selectedOrder.order_number}
                </h3>
                <p className="text-xs text-slate-500">Cliente: {selectedOrder.customer_name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Status do Pedido</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as Order['status'])}
                  className="w-full px-3 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl"
                >
                  <option value="pending">Pendente (Aguardando Pagamento)</option>
                  <option value="processing">Processando / Em Preparação</option>
                  <option value="shipped">Enviado (Com Rastreio)</option>
                  <option value="completed">Concluído / Entregue</option>
                  <option value="cancelled">Cancelado / Estornado</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Código de Rastreio (Correios/Jadlog)</label>
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Ex: BR123456789BR"
                  className="w-full px-3 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-[#EBDDF0] rounded-xl text-xs font-bold text-gray-600 hover:bg-[#FAF7FA]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateOrderStatus(selectedOrder.id, editStatus, trackingInput || undefined);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 bg-[#271E2D] text-white rounded-xl text-xs font-bold hover:bg-[#382343]"
                >
                  Atualizar Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#EBDDF0] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingProduct ? 'Editar Peça' : 'Cadastrar Nova Peça no Brechó'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddProductOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Título da Peça</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Ex: Vestido Mídi Fascínius Plissado"
                  className="w-full px-3 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Preço Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Preço Original / Tabela</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.regular_price || ''}
                    onChange={(e) =>
                      setProductForm({ ...productForm, regular_price: parseFloat(e.target.value) || undefined })
                    }
                    className="w-full px-3 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Categoria</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl"
                  >
                    <option value="Moda Feminina (Adulto)">Moda Feminina (Adulto)</option>
                    <option value="Moda Masculina (Adulto)">Moda Masculina (Adulto)</option>
                    <option value="Moda Infantil">Moda Infantil</option>
                    <option value="Calçados">Calçados</option>
                    <option value="Acessórios Cristãos">Acessórios Cristãos</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Condição do Brechó</label>
                  <select
                    value={productForm.condition}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        condition: e.target.value as Product['condition'],
                      })
                    }
                    className="w-full px-3 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl"
                  >
                    <option value="Novo com Etiqueta">Novo com Etiqueta</option>
                    <option value="Seminovo Impecável">Seminovo Impecável</option>
                    <option value="Peça Única Selecionada">Peça Única Selecionada</option>
                    <option value="Vintage Especial">Vintage Especial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">URL da Imagem</label>
                <input
                  type="url"
                  required
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7FA] border border-[#EBDDF0] rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 border border-[#EBDDF0] rounded-xl text-xs font-bold text-gray-600 hover:bg-[#FAF7FA]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#271E2D] text-white rounded-xl text-xs font-bold hover:bg-[#382343]"
                >
                  Salvar Peça
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
