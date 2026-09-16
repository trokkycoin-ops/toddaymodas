import { Order, ActivityLog, PluginSettings } from '../types';

export const INITIAL_ORDERS: Order[] = [
  {
    id: 1001,
    order_number: 'TDM-2026-1001',
    date: '2026-09-10 14:32',
    customer_name: 'Camila Albuquerque',
    customer_email: 'camila.albuquerque@exemplo.com.br',
    customer_phone: '(11) 98765-4321',
    items: [
      { id: 101, name: 'Blazer Oversized Vintage Lã Italiana', price: 189.90, quantity: 1 }
    ],
    subtotal: 189.90,
    shipping_cost: 18.50,
    discount: 0,
    total: 208.40,
    status: 'completed',
    payment_method: 'pix',
    payment_status: 'paid',
    tracking_code: 'BR984521367AA',
    assigned_vendor: 'Juliana Garimpos',
    shipping_address: {
      cep: '01414-001',
      street: 'Rua Oscar Freire',
      number: '1420',
      complement: 'Apt 42',
      neighborhood: 'Cerqueira César',
      city: 'São Paulo',
      state: 'SP'
    }
  },
  {
    id: 1002,
    order_number: 'TDM-2026-1002',
    date: '2026-09-10 17:15',
    customer_name: 'Beatriz Vasconcelos',
    customer_email: 'beatriz.v@exemplo.com.br',
    customer_phone: '(21) 99123-8877',
    items: [
      { id: 102, name: 'Vestido Midi Seda Floral Primavera', price: 149.00, quantity: 1 },
      { id: 105, name: 'Bolsa Baguete Vintage Couro Croco', price: 135.00, quantity: 1 }
    ],
    subtotal: 284.00,
    shipping_cost: 0,
    discount: 28.40,
    total: 255.60,
    status: 'processing',
    payment_method: 'credit_card',
    payment_status: 'paid',
    tracking_code: 'BR123498765BB',
    assigned_vendor: 'Juliana Garimpos',
    shipping_address: {
      cep: '22041-001',
      street: 'Avenida Nossa Senhora de Copacabana',
      number: '580',
      neighborhood: 'Copacabana',
      city: 'Rio de Janeiro',
      state: 'RJ'
    }
  },
  {
    id: 1003,
    order_number: 'TDM-2026-1003',
    date: '2026-09-11 09:05',
    customer_name: 'Mariana Duarte',
    customer_email: 'mariana.duarte@exemplo.com.br',
    customer_phone: '(31) 98456-1122',
    items: [
      { id: 103, name: 'Jaqueta Bomber Couro Legítimo Anos 80', price: 285.00, quantity: 1 }
    ],
    subtotal: 285.00,
    shipping_cost: 22.00,
    discount: 0,
    total: 307.00,
    status: 'shipped',
    payment_method: 'pix',
    payment_status: 'paid',
    tracking_code: 'BR554433221CC',
    assigned_vendor: 'Carlos Vintage',
    shipping_address: {
      cep: '30140-061',
      street: 'Rua da Bahia',
      number: '1200',
      neighborhood: 'Lourdes',
      city: 'Belo Horizonte',
      state: 'MG'
    }
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 1,
    user_login: 'admin',
    action: 'plugin_activated',
    object_type: 'core',
    object_id: '1.0.0',
    meta_data: 'Tabela todday_activity_log e capacidades registradas.',
    ip_address: '127.0.0.1',
    created_at: '2026-09-10 10:00:00'
  },
  {
    id: 2,
    user_login: 'admin',
    action: 'settings_updated',
    object_type: 'settings',
    object_id: 'all',
    meta_data: 'Credenciais de Mercado Pago e Melhor Envio salvas com criptografia AES-256.',
    ip_address: '127.0.0.1',
    created_at: '2026-09-10 10:15:20'
  },
  {
    id: 3,
    user_login: 'sistema',
    action: 'order_created',
    object_type: 'order',
    object_id: '1001',
    meta_data: 'Pedido criado no WooCommerce HPOS via Checkout Todday.',
    ip_address: '189.40.12.98',
    created_at: '2026-09-10 14:32:05'
  },
  {
    id: 4,
    user_login: 'webhook_mercadopago',
    action: 'payment_approved',
    object_type: 'order',
    object_id: '1001',
    meta_data: 'Pagamento PIX confirmado com sucesso (ID MP: 981247012).',
    ip_address: '54.232.12.44',
    created_at: '2026-09-10 14:32:28'
  },
  {
    id: 5,
    user_login: 'juliana.garimpos',
    action: 'order_status_updated',
    object_type: 'order',
    object_id: '1001',
    meta_data: 'Status alterado para completed. Código de rastreio BR984521367AA inserido.',
    ip_address: '177.18.99.12',
    created_at: '2026-09-10 16:40:12'
  }
];

export const INITIAL_SETTINGS: PluginSettings = {
  mercadopago: {
    enabled: true,
    environment: 'production',
    public_key: 'APP_USR-78192348-9123-4214-bf12-984128934',
    access_token: '••••••••••••••••••••••••••••••••',
    webhook_secret: '••••••••••••••••',
  },
  melhorenvio: {
    enabled: true,
    environment: 'production',
    sender_cep: '01001-000',
    fallback_flat_rate: 22.00,
    api_token: '••••••••••••••••••••••••••••••••',
  },
  whatsapp: {
    enabled: true,
    phone: '5511999998888',
    default_message: 'Olá, gostaria de saber mais sobre as peças do brechó!',
  },
  delete_data_on_uninstall: false,
};
