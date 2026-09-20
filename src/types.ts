export type ThriftCondition = 'Novo com Etiqueta' | 'Seminovo Impecável' | 'Peça Única Selecionada' | 'Vintage Especial';

export interface ProductColor {
  name: string;
  hex: string;
  in_stock?: boolean;
}

export interface DetailedMeasurements {
  bust?: string;
  waist?: string;
  hips?: string;
  length?: string;
  shoulder?: string;
  sleeve?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  regular_price?: number;
  sku?: string;
  category: string;
  condition: ThriftCondition;
  size: string;
  available_sizes: string[];
  color: string;
  available_colors: ProductColor[];
  brand: string;
  description: string;
  fabric?: string;
  care_instructions?: string;
  measurements: {
    bust?: string;
    waist?: string;
    length?: string;
    shoulder?: string;
  };
  detailed_measurements?: DetailedMeasurements;
  image: string;
  gallery?: string[];
  video?: string;
  image_id?: number;
  gallery_ids?: number[];
  rating: number;
  review_count: number;
  stock: number;
  is_featured?: boolean;
  eco_score?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  company: string;
  price: number;
  delivery_time: number;
}

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Order {
  id: number;
  order_number: string;
  date: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  payment_method: 'pix' | 'credit_card';
  payment_status: 'paid' | 'pending' | 'failed';
  payment_data?: {
    qr_code?: string;
    qr_code_base64?: string;
  };
  tracking_code?: string;
  shipping_address: Address;
  assigned_vendor?: string;
}

export interface ActivityLog {
  id: number;
  user_login: string;
  action: string;
  object_type: string;
  object_id: string;
  meta_data: string;
  ip_address: string;
  created_at: string;
}

export interface PluginSettings {
  mercadopago: {
    enabled: boolean;
    environment: 'sandbox' | 'production';
    public_key: string;
    access_token: string;
    has_access_token?: boolean;
    webhook_secret: string;
  };
  melhorenvio: {
    enabled: boolean;
    environment: 'sandbox' | 'production';
    sender_cep: string;
    fallback_flat_rate: number;
    api_token: string;
    has_token?: boolean;
  };
  whatsapp: {
    enabled: boolean;
    phone: string;
    default_message: string;
  };
  delete_data_on_uninstall: boolean;
}
