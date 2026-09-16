import { Order, ActivityLog, PluginSettings } from '../types';

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_LOGS: ActivityLog[] = [];

export const INITIAL_SETTINGS: PluginSettings = {
  mercadopago: {
    enabled: false,
    environment: 'sandbox',
    public_key: '',
    access_token: '',
    webhook_secret: '',
  },
  melhorenvio: {
    enabled: false,
    environment: 'sandbox',
    sender_cep: '',
    fallback_flat_rate: 0,
    api_token: '',
  },
  whatsapp: {
    enabled: true,
    phone: '5535991759960',
    default_message: 'Olá, Sebastiana! Gostaria de saber mais sobre as peças do Todday Modas Brechó!',
  },
  delete_data_on_uninstall: false,
};
