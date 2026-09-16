import React, { useState } from 'react';
import { Logo } from './Logo';
import { getConfig } from '../lib/api';
import { X, CheckCircle2, QrCode, CreditCard, Truck, ShieldCheck, MapPin, Search, Loader2 } from 'lucide-react';
import { CartItem, ShippingOption, Address, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  discountAmount: number;
  couponCode: string;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  discountAmount,
  couponCode,
  onOrderCompleted,
}) => {
  const [step, setStep] = useState<'form' | 'processing'>('form');

  // Dados Pessoais
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Endereço
  const [cep, setCep] = useState('01414-001');
  const [street, setStreet] = useState('Rua Oscar Freire');
  const [number, setNumber] = useState('1420');
  const [complement, setComplement] = useState('Apto 42');
  const [neighborhood, setNeighborhood] = useState('Cerqueira César');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [isLookingUpCep, setIsLookingUpCep] = useState(false);

  // Opções de Frete Melhor Envio
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([
    { id: 'sedex', name: 'SEDEX — Correios', company: 'Melhor Envio', price: 18.50, delivery_time: 2 },
    { id: 'pac', name: 'PAC — Correios', company: 'Melhor Envio', price: 12.00, delivery_time: 5 },
    { id: 'jadlog', name: 'Jadlog .Package', company: 'Melhor Envio', price: 14.90, delivery_time: 4 },
  ]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption>(shippingOptions[0]);

  // Pagamento
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardCpf, setCardCpf] = useState('');
  const [installments, setInstallments] = useState('1');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = Math.max(0, subtotal + selectedShipping.price - discountAmount);

  // Consulta real ViaCEP (com fallback garantido)
  const handleLookupCep = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      alert('Por favor, digite um CEP válido com 8 números.');
      return;
    }

    setIsLookingUpCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setStreet(data.logradouro || '');
        setNeighborhood(data.bairro || '');
        setCity(data.localidade || '');
        setState(data.uf || '');
      } else {
        alert('CEP não encontrado na base nacional. Preencha o endereço manualmente.');
      }
    } catch {
      // Fallback local gracioso se a requisição externa falhar
      if (cleanCep === '01001000') {
        setStreet('Praça da Sé');
        setNeighborhood('Sé');
        setCity('São Paulo');
        setState('SP');
      }
    } finally {
      setIsLookingUpCep(false);
    }

    // Cotação real de frete (Melhor Envio com fallback plano)
    try {
      const apiBase = (window as any).tdmConfig?.restUrl || `${window.location.origin}/wp-json/todday/v1`;
      const q = await fetch(`${apiBase}/shipping/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': (window as any).tdmConfig?.nonce || '' },
        body: JSON.stringify({ cep: cleanCep }),
      });
      const qj = await q.json();
      if (qj?.success && Array.isArray(qj.data?.shipping_quotes) && qj.data.shipping_quotes.length > 0) {
        const quotes = qj.data.shipping_quotes.map((s: any) => ({
          id: String(s.id || s.company || 'frete'),
          name: s.name || s.company || 'Entrega',
          company: 'Melhor Envio',
          price: Number(s.price) || 0,
          delivery_time: Number(s.delivery_time) || 5,
        }));
        setShippingOptions(quotes);
        setSelectedShipping(quotes[0]);
      }
    } catch {
      // Mantém as opções locais de frete
    }
  };

  const handleFinishOrder = () => {
    setStep('processing');

    const apiBase = (window as any).tdmConfig?.restUrl || `${window.location.origin}/wp-json/todday/v1`;

    const confirmViaRest = async () => {
      try {
        const res = await fetch(`${apiBase}/checkout/place`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': (window as any).tdmConfig?.nonce || '' },
          body: JSON.stringify({
            customer: {
              first_name: firstName,
              last_name: lastName,
              email,
              phone,
              address_1: `${street}, ${number} - ${neighborhood}`,
              address_2: complement,
              city,
              state,
              postcode: cep.replace(/\D/g, ''),
            },
            items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
            shipping: {
              id: selectedShipping.id,
              name: selectedShipping.name,
              price: selectedShipping.price,
            },
            payment_method: 'todday_mercadopago',
          }),
        });
        const json = await res.json();
        if (json?.success && json.data?.order_id) {
          let cardToken = '';
          if (paymentMethod === 'credit_card') {
            const publicKey = getConfig().mercadopagoPublicKey;
            const mercadoPago = (window as any).MercadoPago;
            const [expirationMonth, expirationYear] = cardExp.split('/').map((part) => part.trim());
            if (!publicKey || !mercadoPago || !cardNumber || !cardHolder || !expirationMonth || !expirationYear || !cardCvv || !cardCpf) {
              throw new Error('Preencha os dados do cartão e o CPF para continuar.');
            }
            const mp = new mercadoPago(publicKey, { locale: 'pt-BR' });
            const tokenResult = await mp.createCardToken({
              cardNumber: cardNumber.replace(/\D/g, ''),
              cardholderName: cardHolder,
              cardExpirationMonth: expirationMonth,
              cardExpirationYear: expirationYear.length === 2 ? `20${expirationYear}` : expirationYear,
              securityCode: cardCvv,
              identificationType: 'CPF',
              identificationNumber: cardCpf.replace(/\D/g, ''),
            });
            if (!tokenResult?.id) {
              throw new Error('Não foi possível tokenizar o cartão. Confira os dados.');
            }
            cardToken = tokenResult.id;
          }

          const paymentResponse = await fetch(`${apiBase}/checkout/payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': (window as any).tdmConfig?.nonce || '' },
            body: JSON.stringify({
              order_id: Number(json.data.order_id),
              email,
              payment_type: paymentMethod === 'pix' ? 'pix' : 'credit_card',
                token: paymentMethod === 'credit_card' ? cardToken : undefined,
              installments: Number(installments) || 1,
            }),
          });
          const paymentJson = await paymentResponse.json();
          if (!paymentResponse.ok || !paymentJson?.success) {
            throw new Error(paymentJson?.message || 'Falha ao processar o pagamento');
          }
          return {
            id: Number(json.data.order_id),
            order_number: json.data.order_number || `TDM-${json.data.order_id}`,
            total: Number(json.data.total) || total,
            payment_data: paymentJson.data?.point_of_interaction?.transaction_data || {},
          };
        }
        throw new Error(json?.message || 'Falha ao registrar o pedido');
      } catch (err) {
        console.error('REST checkout indispon├¡vel:', (err as Error).message);
        throw err;
      }
    };

    setTimeout(async () => {
      let restOrder;
      try {
        restOrder = await confirmViaRest();
      } catch (err) {
        setStep('form');
        alert((err as Error).message || 'N├úo foi poss├¡vel concluir o pedido. Tente novamente.');
        return;
      }

      const orderIdBase = restOrder.id;
      const newOrder: Order = {
        id: orderIdBase,
        order_number: restOrder ? restOrder.order_number : `TDM-2026-${orderIdBase}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        customer_name: `${firstName} ${lastName}`,
        customer_email: email,
        customer_phone: phone,
        items: items.map((i) => ({
          id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
        })),
        subtotal,
        shipping_cost: selectedShipping.price,
        discount: discountAmount,
        total: restOrder ? restOrder.total : total,
        status: 'processing',
        payment_method: paymentMethod,
        payment_status: 'pending',
        tracking_code: '',
        payment_data: restOrder.payment_data,
        assigned_vendor: '',
        shipping_address: {
          cep,
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
        },
      };

      setStep('form');
      onOrderCompleted(newOrder);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#dac9df] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Topo */}
        <div className="p-5 sm:p-6 border-b border-[#dac9df] flex items-center justify-between bg-[#faf7fb] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Logo variant="horizontal" size="sm" theme="light" onClick={onClose} />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-[#dac9df]/40 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'processing' ? (
          <div className="p-16 text-center">
            <Loader2 className="w-12 h-12 text-[#8a5d96] animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#382343] mb-2 font-serif">Processando no Mercado Pago...</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Registrando pedido no WooCommerce HPOS e validando chave de idempotência.
            </p>
          </div>
        ) : (
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 2 Colunas: Formulários */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Dados Pessoais */}
              <div className="bg-[#faf7fb] p-5 rounded-2xl border border-[#dac9df]">
                <h3 className="font-extrabold text-sm text-[#382343] mb-4 flex items-center gap-2">
                  <span 
                    className="w-6 h-6 rounded-full text-[#382343] flex items-center justify-center text-xs font-black border border-[#cbb6d2]"
                    style={{ backgroundColor: '#dac9df' }}
                  >
                    1
                  </span>
                  Identificação da Compradora
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Nome *</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#dac9df] rounded-xl text-[#382343] focus:border-[#8a5d96] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Sobrenome *</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#dac9df] rounded-xl text-[#382343] focus:border-[#8a5d96] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">E-mail para Recibo *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#dac9df] rounded-xl text-[#382343] focus:border-[#8a5d96] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">WhatsApp / Celular *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#dac9df] rounded-xl text-[#382343] focus:border-[#8a5d96] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Endereço e Integração ViaCEP */}
              <div className="bg-[#faf7fb] p-5 rounded-2xl border border-[#dac9df]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-sm text-[#382343] flex items-center gap-2">
                    <span 
                      className="w-6 h-6 rounded-full text-[#382343] flex items-center justify-center text-xs font-black border border-[#cbb6d2]"
                      style={{ backgroundColor: '#dac9df' }}
                    >
                      2
                    </span>
                    Entrega (Integração ViaCEP)
                  </h3>
                  <span 
                    className="text-[11px] text-[#382343] font-bold px-2 py-0.5 rounded border border-[#cbb6d2]"
                    style={{ backgroundColor: '#dac9df' }}
                  >
                    Auto-preenchimento
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                  <div className="sm:col-span-1">
                    <label className="block text-slate-600 font-semibold mb-1">CEP *</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={cep}
                        onChange={(e) => setCep(e.target.value)}
                        placeholder="00000-000"
                        className="w-full px-3 py-2 bg-white border border-[#dac9df] rounded-xl font-bold text-[#382343] focus:border-[#8a5d96] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleLookupCep}
                        disabled={isLookingUpCep}
                        className="px-3 rounded-xl font-bold text-[#382343] transition-colors cursor-pointer"
                        style={{ backgroundColor: '#dac9df', border: '1px solid #cbb6d2' }}
                        title="Buscar no ViaCEP"
                      >
                        {isLookingUpCep ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">Rua / Avenida *</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#dac9df] rounded-xl text-[#382343] focus:border-[#8a5d96] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Número *</label>
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#dac9df] rounded-xl text-[#382343] focus:border-[#8a5d96] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Complemento</label>
                    <input
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#dac9df] rounded-xl text-[#382343] focus:border-[#8a5d96] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Bairro *</label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#dac9df] rounded-xl text-[#382343] focus:border-[#8a5d96] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Cidade / UF *</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-2 py-2 bg-white border border-[#dac9df] rounded-xl text-[#382343] focus:border-[#8a5d96] focus:outline-none"
                      />
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-12 px-2 py-2 bg-white border border-[#dac9df] rounded-xl text-center uppercase font-bold text-[#382343] focus:border-[#8a5d96] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Opções de Frete Melhor Envio */}
              <div className="bg-[#faf7fb] p-5 rounded-2xl border border-[#dac9df]">
                <h3 className="font-extrabold text-sm text-[#382343] mb-3 flex items-center gap-2">
                  <span 
                    className="w-6 h-6 rounded-full text-[#382343] flex items-center justify-center text-xs font-black border border-[#cbb6d2]"
                    style={{ backgroundColor: '#dac9df' }}
                  >
                    3
                  </span>
                  Opção de Envio (Melhor Envio)
                </h3>
                <div className="space-y-2 text-xs">
                  {shippingOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedShipping.id === opt.id
                          ? 'border-[#8a5d96] bg-[#f5eff7] ring-2 ring-[#dac9df] shadow-xs'
                          : 'border-[#dac9df] bg-white hover:bg-[#faf7fb]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={selectedShipping.id === opt.id}
                          onChange={() => setSelectedShipping(opt)}
                          className="accent-[#8a5d96]"
                        />
                        <div>
                          <p className="font-bold text-[#382343]">{opt.name}</p>
                          <p className="text-[11px] text-slate-500">Entrega prevista em até {opt.delivery_time} dias úteis</p>
                        </div>
                      </div>
                      <span className="font-black text-sm text-[#382343]">
                        R$ {opt.price.toFixed(2).replace('.', ',')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 4. Pagamento Mercado Pago */}
              <div className="bg-[#faf7fb] p-5 rounded-2xl border border-[#dac9df]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-sm text-[#382343] flex items-center gap-2">
                    <span 
                      className="w-6 h-6 rounded-full text-[#382343] flex items-center justify-center text-xs font-black border border-[#cbb6d2]"
                      style={{ backgroundColor: '#dac9df' }}
                    >
                      4
                    </span>
                    Pagamento via Mercado Pago
                  </h3>
                  <span className="text-xs text-[#8a5d96] flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Criptografia SSL
                  </span>
                </div>

                {/* Abas PIX ou Cartão */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                      paymentMethod === 'pix'
                        ? 'text-[#382343] shadow-xs border-[#cbb6d2]'
                        : 'bg-white text-slate-700 border-[#dac9df] hover:bg-[#faf7fb]'
                    }`}
                    style={paymentMethod === 'pix' ? { backgroundColor: '#dac9df' } : {}}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>PIX Instantâneo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                      paymentMethod === 'credit_card'
                        ? 'text-[#382343] shadow-xs border-[#cbb6d2]'
                        : 'bg-white text-slate-700 border-[#dac9df] hover:bg-[#faf7fb]'
                    }`}
                    style={paymentMethod === 'credit_card' ? { backgroundColor: '#dac9df' } : {}}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cartão de Crédito</span>
                  </button>
                </div>

                {/* Campos do Método */}
                {paymentMethod === 'pix' ? (
                  <div className="p-4 rounded-xl bg-white border border-[#dac9df] text-xs text-slate-700">
                    <div className="flex items-center gap-2 font-bold text-[#382343] mb-1">
                      <QrCode className="w-4 h-4 text-[#8a5d96]" />
                      <span>QR Code & Chave Copia e Cola gerados na confirmação</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      A confirmação do PIX ocorre em até 10 segundos diretamente pelo Webhook do Mercado Pago.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs bg-white p-4 rounded-xl border border-[#dac9df]">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Número do Cartão</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-[#dac9df] rounded-xl focus:outline-none focus:border-[#8a5d96]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Nome no Cartão</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        autoComplete="cc-name"
                        className="w-full px-3 py-2 border border-[#dac9df] rounded-xl focus:outline-none focus:border-[#8a5d96]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Validade</label>
                        <input
                          type="text"
                          value={cardExp}
                          onChange={(e) => setCardExp(e.target.value)}
                          className="w-full px-3 py-2 border border-[#dac9df] rounded-xl focus:outline-none focus:border-[#8a5d96]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">CVV</label>
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 border border-[#dac9df] rounded-xl focus:outline-none focus:border-[#8a5d96]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">CPF do Titular</label>
                      <input
                        type="text"
                        value={cardCpf}
                        onChange={(e) => setCardCpf(e.target.value)}
                        autoComplete="off"
                        inputMode="numeric"
                        className="w-full px-3 py-2 border border-[#dac9df] rounded-xl focus:outline-none focus:border-[#8a5d96]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Parcelamento</label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                        className="w-full px-3 py-2 border border-[#dac9df] rounded-xl focus:outline-none focus:border-[#8a5d96] font-semibold text-[#382343]"
                      >
                        <option value="1">1x de R$ {total.toFixed(2).replace('.', ',')} (sem juros)</option>
                        <option value="2">2x de R$ {(total / 2).toFixed(2).replace('.', ',')} (sem juros)</option>
                        <option value="3">3x de R$ {(total / 3).toFixed(2).replace('.', ',')} (sem juros)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Coluna Direita: Resumo do Pedido */}
            <div>
              <div className="bg-white p-5 rounded-2xl border border-[#dac9df] shadow-xs sticky top-24">
                <h3 className="font-black text-sm text-[#382343] mb-4 pb-2 border-b border-[#dac9df] font-serif">
                  Resumo da Compra ({items.reduce((s, i) => s + i.quantity, 0)} itens)
                </h3>

                <div className="space-y-3 max-h-48 overflow-y-auto mb-4 divide-y divide-[#dac9df]/40 pr-1">
                  {items.map((item) => (
                    <div key={item.product.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <p className="font-bold text-slate-800 truncate">{item.product.name}</p>
                        <p className="text-slate-400 text-[11px]">Tam: {item.product.size} (Qtd: {item.quantity})</p>
                      </div>
                      <span className="font-bold text-[#382343] shrink-0">
                        R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-xs border-t border-[#dac9df] pt-3 mb-4 text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frete ({selectedShipping.name.split(' ')[0]})</span>
                    <span>R$ {selectedShipping.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#5c406b] font-bold">
                      <span>Desconto ({couponCode})</span>
                      <span>- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-[#dac9df]">
                    <span>Total a Pagar</span>
                    <span className="text-lg text-[#382343] font-black">
                      R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFinishOrder}
                  className="w-full py-3.5 px-4 rounded-2xl font-black text-sm text-[#382343] shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  style={{ backgroundColor: '#dac9df', border: '1px solid #cbb6d2' }}
                  id="tdm-confirm-order-btn"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#382343]" />
                  <span>Confirmar e Pagar Agora</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center mt-3">
                  Transação protegida por webhook seguro e tokenização oficial do Mercado Pago.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
