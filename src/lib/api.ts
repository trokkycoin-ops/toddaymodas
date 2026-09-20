import { Order, Product, ActivityLog, PluginSettings } from '../types';

export type AppMode = 'store' | 'admin' | 'vendor' | 'customer' | 'download' | 'docs';

export interface TdmConfig {
  restUrl: string;
  nonce: string;
  panelNonce: string;
  ajaxUrl: string;
  ajaxNonce: string;
  currency: string;
  isLoggedIn: boolean;
  homeUrl: string;
  appMode: AppMode;
  mercadopagoPublicKey: string;
}

export function getConfig(): TdmConfig {
  const c = (window as any).tdmConfig || {};
  const mode = ((window as any).tdmAppMode || c.appMode || 'store') as AppMode;
  return {
    restUrl: c.restUrl || '/wp-json/todday/v1',
    nonce: c.nonce || '',
    panelNonce: c.panelNonce || '',
    ajaxUrl: c.ajaxUrl || '/wp-admin/admin-ajax.php',
    ajaxNonce: c.ajaxNonce || '',
    currency: c.currency || 'R$',
    isLoggedIn: !!c.isLoggedIn,
    homeUrl: c.homeUrl || (window.location.origin + '/'),
    appMode: mode,
    mercadopagoPublicKey: c.mercadopagoPublicKey || '',
  };
}

export function panelUrl(path: string): string {
  const base = getConfig().homeUrl.replace(/\/?$/, '/');
  return base + path.replace(/^\//, '');
}

export async function api<T = any>(path: string, options: { method?: string; body?: any } = {}): Promise<T> {
  const cfg = getConfig();
  const headers: Record<string, string> = {
    'X-WP-Nonce': cfg.nonce,
    ...(cfg.panelNonce ? { 'X-TDM-Panel-Nonce': cfg.panelNonce } : {}),
  };
  let body: string | undefined;
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  const res = await fetch(cfg.restUrl.replace(/\/$/, '') + path, {
    method: options.method || 'GET',
    headers,
    credentials: 'same-origin',
    body,
  });

  const json = await res.json().catch(() => ({} as any));
  if (!res.ok || json.success === false) {
    throw new Error((json && (json.message || json.error)) || `Erro ${res.status}`);
  }
  return json as T;
}

export async function uploadMedia(file: File): Promise<{ id: number; url: string; type: 'image' | 'video' }> {
  const cfg = getConfig();
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(cfg.restUrl.replace(/\/$/, '') + '/media/upload', {
    method: 'POST',
    headers: {
      'X-WP-Nonce': cfg.nonce,
      ...(cfg.panelNonce ? { 'X-TDM-Panel-Nonce': cfg.panelNonce } : {}),
    },
    credentials: 'same-origin',
    body: form,
  });
  const json = await res.json().catch(() => ({} as any));
  if (!res.ok || json.success === false) throw new Error(json.message || `Erro ${res.status}`);
  return json.data;
}

function mapStatus(raw: string): Order['status'] {
  switch ((raw || '').replace(/^wc-/, '')) {
    case 'completed':
      return 'completed';
    case 'cancelled':
    case 'refunded':
    case 'failed':
      return 'cancelled';
    case 'shipped':
      return 'shipped';
    case 'processing':
    case 'on-hold':
      return 'processing';
    default:
      return 'pending';
  }
}

export function toOrder(o: any): Order {
  const status = mapStatus(o.status);
  const paid = status === 'completed' || status === 'processing' || o.payment_status === 'paid';
  return {
    id: Number(o.id),
    order_number: String(o.order_number || o.id),
    date: (o.date_created || '').slice(0, 16).replace('T', ' '),
    customer_name: o.customer_name || 'Cliente',
    customer_email: o.customer_email || '',
    customer_phone: o.customer_phone || '',
    items: Array.isArray(o.items)
      ? o.items.map((i: any) => ({
          id: Number(i.id),
          name: i.name,
          price: Number(i.total ?? i.subtotal ?? 0),
          quantity: Number(i.quantity) || 1,
          size: i.size || undefined,
          color: i.color || undefined,
        }))
      : [],
    subtotal: Number(o.subtotal || 0),
    shipping_cost: Number(o.shipping_total || 0),
    discount: Number(o.discount_total || 0),
    total: Number(o.total || 0),
    status,
    payment_method: (o.payment_method === 'pix' ? 'pix' : 'credit_card'),
    payment_status: paid ? 'paid' : 'pending',
    tracking_code: o.tracking_code || undefined,
    shipping_address: {
      cep: o.shipping_address?.postcode || '',
      street: o.shipping_address?.address_1 || '',
      number: '',
      complement: o.shipping_address?.address_2 || '',
      neighborhood: '',
      city: o.shipping_address?.city || '',
      state: o.shipping_address?.state || '',
    },
    assigned_vendor: o.vendor_id ? String(o.vendor_id) : undefined,
  };
}

export function toProduct(p: any): Product {
  const cats: string[] = Array.isArray(p.categories)
    ? p.categories
    : Array.isArray(p.category)
    ? p.category
    : p.category
    ? [p.category]
    : [];

  return {
    id: Number(p.id),
    name: p.name || 'Peça',
    slug: p.slug || String(p.id),
    price: Number(p.price || 0),
    sku: p.sku || '',
    regular_price: p.regular_price ? Number(p.regular_price) : undefined,
    category: cats[0] || 'Moda Feminina (Adulto)',
    condition: (p.condition || 'Peça Única Selecionada') as Product['condition'],
    size: p.size || 'M',
    available_sizes: Array.isArray(p.available_sizes) ? p.available_sizes : p.size ? [p.size] : ['M'],
    color: p.color || 'Padrão',
    available_colors: Array.isArray(p.available_colors) && p.available_colors.length
      ? p.available_colors
      : [{ name: p.color || 'Padrão', hex: '#271E2D', in_stock: true }],
    brand: p.brand || 'Todday Modas Brechó',
    description: p.description || p.short_description || '',
    fabric: p.fabric || '',
    measurements: p.measurements || {},
    image: p.image || '',
    gallery: Array.isArray(p.gallery) ? p.gallery : p.image ? [p.image] : [],
    video: p.video || '',
    rating: Number(p.rating || 0),
    review_count: Number(p.rating_count || 0),
    stock: Number.isFinite(Number(p.stock ?? p.stock_quantity)) ? Number(p.stock ?? p.stock_quantity) : 0,
  };
}

export function toLog(l: any): ActivityLog {
  return {
    id: Number(l.id || 0),
    user_login: l.user_login || l.user_id || 'sistema',
    action: l.action || '',
    object_type: l.object_type || '',
    object_id: String(l.object_id || ''),
    meta_data: typeof l.meta_data === 'string' ? l.meta_data : JSON.stringify(l.meta_data || {}),
    ip_address: l.ip_address || '',
    created_at: l.created_at || '',
  };
}

export function toSettings(s: any): PluginSettings {
  const mp = s?.mercadopago || {};
  const me = s?.melhorenvio || {};
  const wa = s?.whatsapp || {};
  const yes = (v: any) => v === true || v === 'yes' || v === '1';
  return {
    mercadopago: {
      enabled: yes(mp.enabled),
      environment: mp.environment === 'production' ? 'production' : 'sandbox',
      public_key: mp.public_key || '',
      access_token: '',
      has_access_token: !!mp.has_access_token,
      webhook_secret: mp.webhook_secret || '',
    },
    melhorenvio: {
      enabled: yes(me.enabled),
      environment: me.environment === 'production' ? 'production' : 'sandbox',
      sender_cep: me.sender_cep || '',
      fallback_flat_rate: Number(me.fallback_flat_rate || 0),
      api_token: '',
      has_token: !!me.has_token,
    },
    whatsapp: {
      enabled: yes(wa.enabled),
      phone: wa.phone || '',
      default_message: wa.default_message || '',
    },
    delete_data_on_uninstall: false,
  };
}
