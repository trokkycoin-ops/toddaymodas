import { useCallback, useEffect, useState } from 'react';
import {
  AppMode,
  api,
  toLog,
  toOrder,
  toProduct,
  toSettings,
} from '../lib/api';
import { ActivityLog, Order, PluginSettings, Product } from '../types';

function defaultSettings(): PluginSettings {
  return {
    mercadopago: { enabled: false, environment: 'sandbox', public_key: '', access_token: '', webhook_secret: '' },
    melhorenvio: { enabled: false, environment: 'sandbox', sender_cep: '', fallback_flat_rate: 0, api_token: '' },
    whatsapp: { enabled: true, phone: '', default_message: '' },
    delete_data_on_uninstall: false,
  };
}

function productPayload(p: Partial<Product> & { id?: number }) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    regular_price: p.regular_price,
    category: p.category,
    condition: p.condition,
    size: p.size,
    available_sizes: p.available_sizes,
    color: p.color,
    available_colors: p.available_colors,
    brand: p.brand,
    description: p.description,
    fabric: p.fabric,
    measurements: p.measurements,
    image: p.image,
    stock: p.stock,
    status: 'publish',
  };
}

export function usePanelData(mode: AppMode) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState<PluginSettings>(defaultSettings());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = mode === 'admin';
  const needsOrders = mode === 'admin' || mode === 'vendor' || mode === 'customer';
  const needsProducts = mode === 'admin';
  const needsLogs = mode === 'admin';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const jobs: Promise<any>[] = [];

      if (needsOrders) {
        jobs.push(
          api('/orders?limit=100').then((r: any) => {
            const list = r.data?.orders || r.data || [];
            setOrders(Array.isArray(list) ? list.map(toOrder) : []);
          })
        );
      }
      if (needsProducts) {
        jobs.push(
          api('/products?limit=100').then((r: any) => {
            const list = r.data?.products || r.data || [];
            setProducts(Array.isArray(list) ? list.map(toProduct) : []);
          })
        );
      }
      if (needsLogs) {
        jobs.push(
          api('/logs?limit=50').then((r: any) => {
            const list = r.data?.logs || r.data || [];
            setLogs(Array.isArray(list) ? list.map(toLog) : []);
          })
        );
      }
      if (isAdmin) {
        jobs.push(api('/settings').then((r: any) => setSettings(toSettings(r.data))));
      }

      await Promise.all(jobs);
    } catch (e: any) {
      setError(e?.message || 'Falha ao carregar dados do painel.');
    } finally {
      setLoading(false);
    }
  }, [mode, needsOrders, needsProducts, needsLogs, isAdmin]);

  useEffect(() => {
    if (mode === 'admin' || mode === 'vendor' || mode === 'customer') {
      load();
    }
  }, [load, mode]);

  const updateOrderStatus = useCallback(
    async (orderId: number, status: Order['status'], trackingCode?: string) => {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status, tracking_code: trackingCode ?? o.tracking_code } : o)));
      await api(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: { status, note: trackingCode ? `Rastreio: ${trackingCode}` : '' },
      });
      await load();
    },
    [load]
  );

  const addProduct = useCallback(
    async (product: Omit<Product, 'id'>) => {
      await api('/products', { method: 'POST', body: productPayload(product as any) });
      await load();
    },
    [load]
  );

  const updateProduct = useCallback(
    async (product: Product) => {
      await api('/products', { method: 'POST', body: productPayload(product) });
      await load();
    },
    [load]
  );

  const deleteProduct = useCallback(
    async (productId: number) => {
      await api(`/products/${productId}`, { method: 'DELETE' });
      await load();
    },
    [load]
  );

  const updateSettings = useCallback(
    async (next: PluginSettings) => {
      setSettings(next);
      await api('/settings', {
        method: 'POST',
        body: {
          mercadopago: { ...next.mercadopago, enabled: next.mercadopago.enabled ? 'yes' : 'no' },
          melhorenvio: { ...next.melhorenvio, enabled: next.melhorenvio.enabled ? 'yes' : 'no' },
          whatsapp: { ...next.whatsapp, enabled: next.whatsapp.enabled ? 'yes' : 'no' },
        },
      });
    },
    []
  );

  const testMercadoPago = useCallback(async (accessToken: string) => {
    const result = await api('/settings/test-mercadopago', {
      method: 'POST',
      body: { access_token: accessToken },
    });
    await load();
    return result;
  }, [load]);

  return {
    orders,
    products,
    logs,
    settings,
    loading,
    error,
    reload: load,
    updateOrderStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    updateSettings,
    testMercadoPago,
  };
}
