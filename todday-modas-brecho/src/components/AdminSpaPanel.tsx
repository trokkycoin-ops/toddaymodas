import React, { useState } from 'react';
import { 
  TrendingUp, ShoppingCart, DollarSign, Users, Package, FileSpreadsheet, 
  ShieldAlert, Settings, FileText, CheckCircle2, Clock, Truck, RefreshCw, 
  Search, Plus, Eye, Download, MessageCircle, AlertTriangle, Edit, Trash2,
  X, Palette, Check, Layers, Info, Sparkles
} from 'lucide-react';
import { Order, Product, ActivityLog, PluginSettings, ProductColor, ThriftCondition } from '../types';
import { generateOrderReceipt } from '../utils/pdfGenerator';

interface AdminSpaPanelProps {
  orders: Order[];
  products: Product[];
  logs: ActivityLog[];
  settings: PluginSettings;
  onUpdateOrderStatus: (orderId: number, status: Order['status'], trackingCode?: string) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: number) => void;
  onUpdateSettings: (newSettings: PluginSettings) => void;
}

export const AdminSpaPanel: React.FC<AdminSpaPanelProps> = ({
  orders,
  products,
  logs,
  settings,
  onUpdateOrderStatus,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'logs' | 'settings'>('dashboard');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Gerenciamento de Produtos e Variações
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Modal para Adicionar / Editar Produto
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const [prodFormName, setProdFormName] = useState('');
  const [prodFormPrice, setProdFormPrice] = useState('129.00');
  const [prodFormRegularPrice, setProdFormRegularPrice] = useState('249.00');
  const [prodFormCategory, setProdFormCategory] = useState('Moda Feminina (Adulto)');
  const [prodFormCondition, setProdFormCondition] = useState<ThriftCondition>('Seminovo Impecável');
  const [prodFormBrand, setProdFormBrand] = useState('Todday Modas Seleção');
  const [prodFormStock, setProdFormStock] = useState(5);
  const [prodFormDescription, setProdFormDescription] = useState('Peça selecionada com curadoria de excelência.');
  const [prodFormFabric, setProdFormFabric] = useState('Algodão Nobre / Alfaiataria');
  const [prodFormImage, setProdFormImage] = useState('https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=700&q=80');

  // Variações de Tamanho (Multi-Size)
  const [prodSizesList, setProdSizesList] = useState<string[]>(['PP (36)', 'P (38)', 'M (40)', 'G (42)', 'GG (44)']);
  const [customSizeInput, setCustomSizeInput] = useState('');

  // Variações de Cores (Multi-Color)
  const [prodColorsList, setProdColorsList] = useState<ProductColor[]>([
    { name: 'Preto Clássico', hex: '#111111', in_stock: true },
    { name: 'Lavanda Suave', hex: '#dac9df', in_stock: true },
    { name: 'Azul Marinho', hex: '#1E293B', in_stock: true }
  ]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#271E2D');

  // Medidas
  const [prodBust, setProdBust] = useState('');
  const [prodWaist, setProdWaist] = useState('');
  const [prodLength, setProdLength] = useState('');
  const [prodShoulder, setProdShoulder] = useState('');

  // Configurações Locais
  const [localSettings, setLocalSettings] = useState<PluginSettings>(settings);
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  // Métricas
  const totalRevenue = orders.reduce((sum, o) => sum + (o.payment_status === 'paid' ? o.total : 0), 0);
  const totalOrdersCount = orders.length;
  const averageTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  const activeCustomersCount = new Set(orders.map((o) => o.customer_email)).size;

  // Filtragem de Pedidos
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = selectedStatusFilter === 'all' || o.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 3000);
  };

  // Presets de Tamanho Inteligentes
  const applySizePreset = (type: 'clothes_letter' | 'clothes_number' | 'shoes_fem' | 'shoes_masc' | 'pants_number' | 'kids') => {
    switch (type) {
      case 'clothes_letter':
        setProdSizesList(['PP', 'P', 'M', 'G', 'GG', 'XG']);
        break;
      case 'clothes_number':
        setProdSizesList(['P (36-38)', 'M (38-40)', 'G (42-44)', 'GG (46-48)']);
        break;
      case 'pants_number':
        setProdSizesList(['38', '40', '42', '44', '46', '48']);
        break;
      case 'shoes_fem':
        setProdSizesList(['34', '35', '36', '37', '38', '39', '40']);
        break;
      case 'shoes_masc':
        setProdSizesList(['38', '39', '40', '41', '42', '43', '44']);
        break;
      case 'kids':
        setProdSizesList(['2 Anos', '4 Anos', '6 Anos', '8 Anos', '10 Anos']);
        break;
    }
  };

  const handleAddCustomSize = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customSizeInput.trim()) return;
    const clean = customSizeInput.trim();
    if (!prodSizesList.includes(clean)) {
      setProdSizesList([...prodSizesList, clean]);
    }
    setCustomSizeInput('');
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setProdSizesList(prodSizesList.filter((s) => s !== sizeToRemove));
  };

  const handleAddCustomColor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newColorName.trim()) return;
    setProdColorsList([
      ...prodColorsList,
      { name: newColorName.trim(), hex: newColorHex, in_stock: true }
    ]);
    setNewColorName('');
  };

  const handleRemoveColor = (indexToRemove: number) => {
    setProdColorsList(prodColorsList.filter((_, idx) => idx !== indexToRemove));
  };

  const handleOpenNewProduct = () => {
    setEditingProductId(null);
    setProdFormName('');
    setProdFormPrice('129.00');
    setProdFormRegularPrice('249.00');
    setProdFormCategory('Moda Feminina (Adulto)');
    setProdFormCondition('Seminovo Impecável');
    setProdFormBrand('Todday Modas Seleção');
    setProdFormStock(5);
    setProdFormDescription('Peça exclusiva de alta qualidade selecionada pela curadoria Todday Modas.');
    setProdFormFabric('Algodão Nobre / Alfaiataria');
    setProdFormImage('https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=700&q=80');
    setProdSizesList(['PP (36)', 'P (38)', 'M (40)', 'G (42)', 'GG (44)']);
    setProdColorsList([
      { name: 'Preto Clássico', hex: '#111111', in_stock: true },
      { name: 'Lavanda Suave', hex: '#dac9df', in_stock: true }
    ]);
    setProdBust('96 cm');
    setProdWaist('78 cm');
    setProdLength('110 cm');
    setProdShoulder('39 cm');
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setProdFormName(p.name);
    setProdFormPrice(p.price.toString());
    setProdFormRegularPrice(p.regular_price ? p.regular_price.toString() : '');
    setProdFormCategory(p.category);
    setProdFormCondition(p.condition);
    setProdFormBrand(p.brand);
    setProdFormStock(p.stock);
    setProdFormDescription(p.description);
    setProdFormFabric(p.fabric || '');
    setProdFormImage(p.image);
    setProdSizesList(
      p.available_sizes && p.available_sizes.length > 0
        ? [...p.available_sizes]
        : [p.size]
    );
    setProdColorsList(
      p.available_colors && p.available_colors.length > 0
        ? [...p.available_colors]
        : [{ name: p.color, hex: '#271E2D', in_stock: true }]
    );
    setProdBust(p.measurements?.bust || '');
    setProdWaist(p.measurements?.waist || '');
    setProdLength(p.measurements?.length || '');
    setProdShoulder(p.measurements?.shoulder || '');
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSizes = prodSizesList.length > 0 ? prodSizesList : ['M'];
    const finalColors = prodColorsList.length > 0 ? prodColorsList : [{ name: 'Padrão', hex: '#271E2D', in_stock: true }];

    const payload = {
      name: prodFormName || 'Peça Todday Modas',
      slug: (prodFormName || 'peca').toLowerCase().replace(/\s+/g, '-'),
      price: parseFloat(prodFormPrice) || 99.00,
      regular_price: prodFormRegularPrice ? parseFloat(prodFormRegularPrice) : undefined,
      category: prodFormCategory,
      condition: prodFormCondition,
      size: finalSizes[0],
      available_sizes: finalSizes,
      color: finalColors[0].name,
      available_colors: finalColors,
      brand: prodFormBrand || 'Todday Modas',
      description: prodFormDescription,
      fabric: prodFormFabric,
      measurements: {
        bust: prodBust,
        waist: prodWaist,
        length: prodLength,
        shoulder: prodShoulder,
      },
      image: prodFormImage || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=700&q=80',
      rating: 5.0,
      review_count: 1,
      stock: prodFormStock || 1,
    };

    if (editingProductId !== null) {
      if (onUpdateProduct) {
        onUpdateProduct({
          ...payload,
          id: editingProductId,
        });
      }
    } else {
      onAddProduct(payload);
    }
    setShowProductModal(false);
  };

  // Filtragem de Produtos
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleExportCsv = () => {
    const headers = ['Numero_Pedido', 'Data', 'Cliente', 'Email', 'Total', 'Status', 'Metodo_Pagamento', 'Rastreio'];
    const rows = orders.map(o => [
      o.order_number,
      o.date,
      `"${o.customer_name}"`,
      o.customer_email,
      o.total.toFixed(2),
      o.status,
      o.payment_method,
      o.tracking_code || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `todday_pedidos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Barra de Topo do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED] animate-pulse"></span>
            <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
              Painel SPA Autônomo (/todday-painel/)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Gestão Todday Modas Brechó</h1>
          <p className="text-xs text-slate-500">
            Ambiente de administração com WooCommerce HPOS, relatórios e auditoria em tempo real.
          </p>
        </div>

        {/* Sub-abas de Navegação */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-2 rounded-lg transition-all ${
              activeTab === 'dashboard' ? 'bg-white text-[#7C3AED] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-2 rounded-lg transition-all ${
              activeTab === 'orders' ? 'bg-white text-[#7C3AED] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pedidos ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-2 rounded-lg transition-all ${
              activeTab === 'products' ? 'bg-white text-[#7C3AED] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Estoque / Peças
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-2 rounded-lg transition-all ${
              activeTab === 'logs' ? 'bg-white text-[#7C3AED] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Auditoria
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 rounded-lg transition-all ${
              activeTab === 'settings' ? 'bg-white text-[#7C3AED] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Configurações
          </button>
        </div>
      </div>

      {/* 1. ABA DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Grid de KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Receita Total</span>
                <div className="p-2 rounded-xl bg-purple-50 text-[#7C3AED]">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#7C3AED]">
                R$ {totalRevenue.toFixed(2).replace('.', ',')}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                +18.4% vs mês anterior
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pedidos Confirmados</span>
                <div className="p-2 rounded-xl bg-[#F7F5FF] text-[#8B5CF6]">
                  <ShoppingCart className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {totalOrdersCount}
              </div>
              <span className="text-[11px] text-[#8B5CF6] font-semibold mt-1 inline-block">
                HPOS Storage Ativo
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ticket Médio</span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                R$ {averageTicket.toFixed(2).replace('.', ',')}
              </div>
              <span className="text-[11px] text-slate-400 font-semibold mt-1 inline-block">
                Média por compra
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Clientes Ativos</span>
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {activeCustomersCount}
              </div>
              <span className="text-[11px] text-slate-500 font-semibold mt-1 inline-block">
                Base com retenção
              </span>
            </div>
          </div>

          {/* Gráfico de Desempenho Visual (Chart.js Native Simulation) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Curva de Faturamento & Vendas</h3>
                <p className="text-xs text-slate-400">Vendas diárias consolidadas pelo gateway Mercado Pago</p>
              </div>
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Exportar CSV</span>
              </button>
            </div>

            {/* Visualizador de Gráfico SVG de Alta Resolução */}
            <div className="h-64 w-full flex items-end justify-between gap-3 pt-8 px-4 border-b border-l border-slate-200">
              {[
                { day: '05/09', val: 180, orders: 1 },
                { day: '06/09', val: 340, orders: 2 },
                { day: '07/09', val: 220, orders: 1 },
                { day: '08/09', val: 490, orders: 3 },
                { day: '09/09', val: 610, orders: 4 },
                { day: '10/09', val: 780, orders: 5 },
                { day: '11/09', val: totalRevenue, orders: totalOrdersCount },
              ].map((item, idx) => {
                const maxVal = 900;
                const heightPct = Math.min(100, Math.max(15, (item.val / maxVal) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-bold pointer-events-none whitespace-nowrap z-10">
                      R$ {item.val.toFixed(2)} ({item.orders} pedidos)
                    </div>
                    {/* Barra */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[42px] bg-gradient-to-t from-[#7C3AED] to-[#C4B5FD] rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                    />
                    <span className="text-[11px] font-semibold text-slate-500 mt-2">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. ABA PEDIDOS (HPOS) */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Filtrar por pedido, cliente ou email..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="processing">Processando</option>
                <option value="shipped">Enviado</option>
                <option value="completed">Concluído</option>
              </select>

              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1 px-3 py-2 bg-[#7C3AED] text-white text-xs font-bold rounded-xl hover:bg-[#6D28D9] transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Pedido / Data</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Itens</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status HPOS</th>
                  <th className="p-4">Rastreio</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Nenhum pedido encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">
                        <div>#{order.order_number}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{order.date}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{order.customer_name}</div>
                        <div className="text-slate-400 text-[11px]">{order.customer_email}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                          {order.items.length} peça(s)
                        </span>
                      </td>
                      <td className="p-4 font-bold text-[#7C3AED]">
                        R$ {order.total.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as any)}
                          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 cursor-pointer"
                        >
                          <option value="pending">Pendente</option>
                          <option value="processing">Processando</option>
                          <option value="shipped">Enviado</option>
                          <option value="completed">Concluído</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-[11px] text-[#8B5CF6] font-bold">
                          {order.tracking_code || 'Aguardando despacho'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => generateOrderReceipt(order)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#7C3AED] hover:bg-purple-50"
                            title="Ver e Imprimir Recibo PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <a
                            href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Olá ${order.customer_name}! Notificação do Todday Modas Brechó sobre seu pedido #${order.order_number}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#25D366] hover:bg-slate-50"
                            title="Falar com cliente no WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ABA PRODUTOS & ESTOQUE COM GRADE DE VARIAÇÕES */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-slate-900">Catálogo & Grade de Variações</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                  {filteredProducts.length} itens cadastrados
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Produtos unificados: cadastre todos os tamanhos (P, M, G, GG, calçados 34 a 44) e cores em uma única página profissional.
              </p>
            </div>
            <button
              onClick={handleOpenNewProduct}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7C3AED] text-white text-xs font-bold rounded-xl hover:bg-[#6D28D9] transition-all shadow-sm hover:shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Produto (Grade Completa)</span>
            </button>
          </div>

          {/* Destaque didático profissional sobre Variações Unificadas */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 via-slate-50 to-pink-50 border border-purple-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#7C3AED] flex items-center justify-center shrink-0 mt-0.5">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-0.5">Como funciona a Grade Unificada da Todday Modas:</span>
              Vestidos, blusas, calças masculinas e calçados reúnem todos os tamanhos e cores na mesma página.
              O cliente seleciona o tamanho desejado (ex: P, M, G ou nº 37) e a cor diretamente no seletor, sem a necessidade de criar páginas duplicadas para cada tamanho individual.
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Buscar por nome da peça, marca ou tecido..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#7C3AED] focus:outline-hidden"
              />
            </div>
            <select
              value={productCategoryFilter}
              onChange={(e) => setProductCategoryFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden"
            >
              <option value="all">Todas as Categorias</option>
              <option value="Moda Feminina (Adulto)">Moda Feminina (Adulto)</option>
              <option value="Moda Masculina (Adulto)">Moda Masculina (Adulto)</option>
              <option value="Calçados">Calçados</option>
              <option value="Moda Infantil">Moda Infantil</option>
              <option value="Acessórios Cristãos">Acessórios Cristãos</option>
            </select>
          </div>

          {/* Grid de Produtos com Variações */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => {
              const sizes = p.available_sizes && p.available_sizes.length > 0 ? p.available_sizes : [p.size];
              const colors = p.available_colors && p.available_colors.length > 0 ? p.available_colors : [{ name: p.color, hex: '#271E2D', in_stock: true }];

              return (
                <div 
                  key={p.id} 
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-purple-200 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex gap-3 mb-3">
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        className="w-20 h-24 object-cover rounded-lg border border-slate-200 shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-[#7C3AED] uppercase">
                            {p.condition}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate">
                            {p.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug mb-1">
                          {p.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate mb-1">
                          Marca: <span className="font-medium text-slate-700">{p.brand}</span>
                        </p>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-extrabold text-sm text-[#7C3AED]">
                            R$ {p.price.toFixed(2).replace('.', ',')}
                          </span>
                          {p.regular_price && (
                            <span className="text-[10px] text-slate-400 line-through">
                              R$ {p.regular_price.toFixed(2).replace('.', ',')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Grade de Tamanhos Cadastrada */}
                    <div className="pt-2.5 pb-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="font-bold text-slate-700">Grade de Tamanhos:</span>
                        <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.2 rounded">
                          {sizes.length} {sizes.length === 1 ? 'tamanho' : 'tamanhos'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {sizes.map((sz) => (
                          <span 
                            key={sz} 
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold border border-slate-200"
                          >
                            {sz}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Grade de Cores Cadastrada */}
                    {colors.length > 0 && (
                      <div className="pt-2 pb-2 border-t border-slate-100">
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="font-bold text-slate-700">Cores Disponíveis:</span>
                          <span className="text-[10px] text-slate-500">
                            {colors.length} {colors.length === 1 ? 'cor' : 'cores'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {colors.map((c) => (
                            <div 
                              key={c.name} 
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-700"
                              title={c.name}
                            >
                              <span 
                                className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0" 
                                style={{ backgroundColor: c.hex }} 
                              />
                              <span className="truncate max-w-[70px]">{c.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ações do Produto */}
                  <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 font-medium">
                      Estoque: <strong className="text-slate-800">{p.stock} un.</strong>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditProduct(p)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:text-[#7C3AED] hover:border-purple-200 hover:bg-purple-50 text-xs font-bold transition-colors"
                        title="Editar produto e grade de tamanhos/cores"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Editar Grade</span>
                      </button>
                      {onDeleteProduct && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Tem certeza que deseja remover "${p.name}" do catálogo?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                          title="Excluir produto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Nenhum produto encontrado com os filtros selecionados.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Tente buscar por outro termo ou categoria.</p>
            </div>
          )}
        </div>
      )}

      {/* 4. ABA AUDITORIA / LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-6 border-b border-slate-200">
            <h3 className="font-extrabold text-base text-slate-900">Trilha de Auditoria do Plugin</h3>
            <p className="text-xs text-slate-400">
              Registros gravados na tabela customizada <code className="text-[#7C3AED] font-mono">todday_activity_log</code>
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Data/Hora</th>
                  <th className="p-4">Usuário</th>
                  <th className="p-4">Ação</th>
                  <th className="p-4">Objeto</th>
                  <th className="p-4">Metadados</th>
                  <th className="p-4">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="p-4 text-slate-500 whitespace-nowrap">{log.created_at}</td>
                    <td className="p-4 font-bold text-slate-800">{log.user_login}</td>
                    <td className="p-4">
                      <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{log.object_type} #{log.object_id}</td>
                    <td className="p-4 text-slate-500 max-w-xs truncate">{log.meta_data}</td>
                    <td className="p-4 font-mono text-slate-400 text-[11px]">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ABA CONFIGURAÇÕES */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {savedSettingsNotice && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Configurações salvas e chaves criptografadas com sucesso!</span>
            </div>
          )}

          {/* Mercado Pago */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="font-extrabold text-sm text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#7C3AED]" />
              Gateway Mercado Pago (PIX & Cartão)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Ambiente</label>
                <select
                  value={localSettings.mercadopago.environment}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      mercadopago: { ...localSettings.mercadopago, environment: e.target.value as any },
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                >
                  <option value="sandbox">Sandbox (Ambiente de Testes)</option>
                  <option value="production">Produção (Vendas Reais)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Public Key</label>
                <input
                  type="text"
                  value={localSettings.mercadopago.public_key}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      mercadopago: { ...localSettings.mercadopago, public_key: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Melhor Envio */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="font-extrabold text-sm text-slate-900 mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#7C3AED]" />
              Melhor Envio & Fretes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">CEP de Origem do Brechó</label>
                <input
                  type="text"
                  value={localSettings.melhorenvio.sender_cep}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      melhorenvio: { ...localSettings.melhorenvio, sender_cep: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Taxa de Contingência (Fallback R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={localSettings.melhorenvio.fallback_flat_rate}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      melhorenvio: { ...localSettings.melhorenvio, fallback_flat_rate: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-xl transition-all shadow-md"
          >
            Salvar Configurações do Plugin
          </button>
        </form>
      )}

      {/* Modal de Cadastro e Edição de Produto com Grade de Variações */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-auto max-h-[92vh] flex flex-col">
            {/* Header do Modal */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-purple-100 text-[#7C3AED]">
                    <Layers className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingProductId ? 'Editar Produto & Grade de Variações' : 'Cadastrar Novo Produto (Grade Unificada)'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Reúna todos os tamanhos e cores em uma única página profissional de produto.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário com Scroll */}
            <form onSubmit={handleSaveProduct} className="space-y-5 text-xs overflow-y-auto pr-1 pt-4">
              {/* Alerta didático */}
              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" />
                <p className="text-[11px] text-purple-900 leading-relaxed">
                  <strong>Dica de Loja Profissional:</strong> Não crie um produto para cada tamanho. Adicione todos os tamanhos (ex: P, M, G, GG ou calçados 34 ao 40) na seção <strong>Grade de Tamanhos</strong> abaixo. O cliente selecionará tudo na mesma página do produto!
                </p>
              </div>

              {/* Informações Básicas */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  1. Informações da Peça
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Nome do Produto *</label>
                    <input
                      type="text"
                      required
                      value={prodFormName}
                      onChange={(e) => setProdFormName(e.target.value)}
                      placeholder="Ex: Vestido Midi Alfaiataria Clássico"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-[#7C3AED] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Categoria *</label>
                    <select
                      value={prodFormCategory}
                      onChange={(e) => setProdFormCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-[#7C3AED] focus:outline-hidden cursor-pointer"
                    >
                      <option value="Moda Feminina (Adulto)">Moda Feminina (Adulto)</option>
                      <option value="Moda Masculina (Adulto)">Moda Masculina (Adulto)</option>
                      <option value="Calçados">Calçados</option>
                      <option value="Moda Infantil">Moda Infantil</option>
                      <option value="Acessórios Cristãos">Acessórios Cristãos</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Marca / Etiqueta</label>
                    <input
                      type="text"
                      value={prodFormBrand}
                      onChange={(e) => setProdFormBrand(e.target.value)}
                      placeholder="Ex: Todday Modas Seleção"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-[#7C3AED] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Condição</label>
                    <select
                      value={prodFormCondition}
                      onChange={(e) => setProdFormCondition(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-[#7C3AED] focus:outline-hidden cursor-pointer"
                    >
                      <option value="Novo com Etiqueta">Novo com Etiqueta</option>
                      <option value="Seminovo Impecável">Seminovo Impecável</option>
                      <option value="Peça Única Selecionada">Peça Única Selecionada</option>
                      <option value="Vintage Especial">Vintage Especial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Estoque Total</label>
                    <input
                      type="number"
                      min="1"
                      value={prodFormStock}
                      onChange={(e) => setProdFormStock(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-[#7C3AED] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Preço Venda (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={prodFormPrice}
                      onChange={(e) => setProdFormPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-[#7C3AED] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Preço De (R$) Opcional</label>
                    <input
                      type="number"
                      step="0.01"
                      value={prodFormRegularPrice}
                      onChange={(e) => setProdFormRegularPrice(e.target.value)}
                      placeholder="Ex: 249.00"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-[#7C3AED] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tecido / Composição</label>
                    <input
                      type="text"
                      value={prodFormFabric}
                      onChange={(e) => setProdFormFabric(e.target.value)}
                      placeholder="Ex: Alfaiataria Crepe Premium"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-[#7C3AED] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">URL da Imagem da Peça</label>
                  <input
                    type="url"
                    value={prodFormImage}
                    onChange={(e) => setProdFormImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-[#7C3AED] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Descrição Detalhada</label>
                  <textarea
                    rows={2}
                    value={prodFormDescription}
                    onChange={(e) => setProdFormDescription(e.target.value)}
                    placeholder="Detalhes sobre o corte, forro, caimento e sofisticação da peça..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-[#7C3AED] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* 2. SEÇÃO DE GRADE DE TAMANHOS (O NÚCLEO DO PEDIDO DO USUÁRIO) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#7C3AED]"></span>
                      2. Grade de Tamanhos Disponíveis *
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Adicione todos os tamanhos que este produto possui (roupas ou calçados).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProdSizesList([])}
                    className="text-[10px] font-bold text-red-500 hover:text-red-700 self-start sm:self-auto"
                  >
                    Limpar Grade
                  </button>
                </div>

                {/* Presets Rápidos com 1 clique */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Preenchimento Rápido por Categoria:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => applySizePreset('clothes_number')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#7C3AED] hover:bg-purple-50 text-[11px] font-semibold text-slate-700 transition-colors"
                    >
                      👗 Roupas (P 36-38, M 38-40, G 42-44, GG 46-48)
                    </button>
                    <button
                      type="button"
                      onClick={() => applySizePreset('clothes_letter')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#7C3AED] hover:bg-purple-50 text-[11px] font-semibold text-slate-700 transition-colors"
                    >
                      👗 Letras (PP, P, M, G, GG, XG)
                    </button>
                    <button
                      type="button"
                      onClick={() => applySizePreset('pants_number')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#7C3AED] hover:bg-purple-50 text-[11px] font-semibold text-slate-700 transition-colors"
                    >
                      👖 Calças Masculinas (38 a 48)
                    </button>
                    <button
                      type="button"
                      onClick={() => applySizePreset('shoes_fem')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#7C3AED] hover:bg-purple-50 text-[11px] font-semibold text-slate-700 transition-colors"
                    >
                      👠 Calçados Femininos (34 a 40)
                    </button>
                    <button
                      type="button"
                      onClick={() => applySizePreset('shoes_masc')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#7C3AED] hover:bg-purple-50 text-[11px] font-semibold text-slate-700 transition-colors"
                    >
                      👞 Calçados Masculinos (38 a 44)
                    </button>
                    <button
                      type="button"
                      onClick={() => applySizePreset('kids')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#7C3AED] hover:bg-purple-50 text-[11px] font-semibold text-slate-700 transition-colors"
                    >
                      🧒 Infantil (2A a 10A)
                    </button>
                  </div>
                </div>

                {/* Campo para adicionar tamanho customizado */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSize();
                      }
                    }}
                    placeholder="Digitar tamanho (Ex: 37, M (38-40), Plus Size, Único)..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-[#7C3AED] focus:outline-hidden text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomSize()}
                    className="px-3 py-2 bg-slate-800 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Tamanho</span>
                  </button>
                </div>

                {/* Lista de Tamanhos Atuais na Grade */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-700">
                      Tamanhos nesta peça ({prodSizesList.length}):
                    </span>
                    {prodSizesList.length === 0 && (
                      <span className="text-[11px] text-red-500 font-semibold">
                        ⚠️ Adicione ao menos 1 tamanho na grade
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-white rounded-xl border border-slate-200">
                    {prodSizesList.map((sz) => (
                      <div
                        key={sz}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-[#7C3AED] font-bold text-xs"
                      >
                        <span>{sz}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(sz)}
                          className="hover:text-red-600 hover:bg-purple-100 rounded p-0.5"
                          title="Remover tamanho"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {prodSizesList.length === 0 && (
                      <span className="text-slate-400 italic text-[11px] py-1">
                        Nenhum tamanho adicionado ainda. Escolha um preset acima ou digite um tamanho.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. SEÇÃO DE CORES DA PEÇA */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[#7C3AED]" />
                      3. Cores Disponíveis
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Cadastre as opções de cores para o cliente escolher na página.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProdColorsList([])}
                    className="text-[10px] font-bold text-red-500 hover:text-red-700"
                  >
                    Limpar Cores
                  </button>
                </div>

                {/* Presets de cores rápidas */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: 'Preto', hex: '#111111' },
                    { name: 'Branco', hex: '#FFFFFF' },
                    { name: 'Azul Marinho', hex: '#1E293B' },
                    { name: 'Nude Rosado', hex: '#E7D3C5' },
                    { name: 'Lavanda', hex: '#DAC9DF' },
                    { name: 'Verde Esmeralda', hex: '#065F46' },
                    { name: 'Marsala / Vinho', hex: '#831843' },
                    { name: 'Bege Areia', hex: '#D2B48C' },
                    { name: 'Caramelo', hex: '#9A3412' }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        if (!prodColorsList.some((c) => c.name === preset.name)) {
                          setProdColorsList([...prodColorsList, { ...preset, in_stock: true }]);
                        }
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-[#7C3AED] text-[10px] text-slate-700"
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: preset.hex }} />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>

                {/* Adicionar cor personalizada */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="Nome da cor (Ex: Terracota, Dourado, Chumbo)..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-[#7C3AED] focus:outline-hidden text-xs"
                  />
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-slate-200 rounded-xl shrink-0">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                      title="Escolher tom da cor"
                    />
                    <span className="text-[10px] font-mono text-slate-600 uppercase">{newColorHex}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddCustomColor()}
                    className="px-3 py-2 bg-slate-800 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Cor</span>
                  </button>
                </div>

                {/* Lista de Cores cadastradas */}
                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-white rounded-xl border border-slate-200">
                  {prodColorsList.map((c, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-xs"
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(idx)}
                        className="hover:text-red-600 hover:bg-slate-200 rounded p-0.5 ml-0.5"
                        title="Remover cor"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {prodColorsList.length === 0 && (
                    <span className="text-slate-400 italic text-[11px] py-1">
                      Nenhuma cor adicionada. Use os botões rápidos ou cadastre uma cor personalizada.
                    </span>
                  )}
                </div>
              </div>

              {/* 4. MEDIDAS DA PEÇA (TRANSPARÊNCIA MODA CRISTÃ & BRECHÓ) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  4. Medidas da Peça (Busto, Cintura, Comprimento, Salto)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Busto / Tórax</label>
                    <input
                      type="text"
                      value={prodBust}
                      onChange={(e) => setProdBust(e.target.value)}
                      placeholder="Ex: 96 cm"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Cintura</label>
                    <input
                      type="text"
                      value={prodWaist}
                      onChange={(e) => setProdWaist(e.target.value)}
                      placeholder="Ex: 78 cm"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Comprimento</label>
                    <input
                      type="text"
                      value={prodLength}
                      onChange={(e) => setProdLength(e.target.value)}
                      placeholder="Ex: 110 cm (Midi)"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Ombro / Salto</label>
                    <input
                      type="text"
                      value={prodShoulder}
                      onChange={(e) => setProdShoulder(e.target.value)}
                      placeholder="Ex: 39 cm / 7 cm"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Botões do Rodapé */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 sticky bottom-0 bg-white pb-1">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProductId ? 'Salvar Alterações da Grade' : 'Publicar Produto com Grade Unificada'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
