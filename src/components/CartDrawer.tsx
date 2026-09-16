import React, { useState } from 'react';
import { CartItem } from '../types';
import { ShoppingBag, X, Check, Trash2, Tag, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemoveItem: (productId: number) => void;
  onProceedToCheckout: (discountAmount: number, couponCode: string) => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}: CartDrawerProps) {
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.percent) / 100 : 0;
  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'TODDAY10' || code === 'BEMVINDA10' || code === 'FE10') {
      setAppliedCoupon({ code, percent: 10 });
    } else if (code === 'BRECHO15' || code === 'VIP15') {
      setAppliedCoupon({ code, percent: 15 });
    } else {
      setCouponError('Cupom não encontrado. Experimente BEMVINDA10');
    }
  };

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-modal">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#dac9df]">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#dac9df] flex items-center justify-between bg-[#faf7fb]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0F4C3A] text-white flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-4 h-4 text-[#dac9df]" />
              </div>
              <div>
                <h2 className="text-base font-serif font-black text-[#382343]">Sacola de Grife</h2>
                <span className="text-[11px] text-[#0F4C3A] font-bold">
                  {totalQuantity} {totalQuantity === 1 ? 'peça única' : 'peças selecionadas'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-[#382343] hover:bg-[#dac9df]/50 transition-colors cursor-pointer"
              aria-label="Fechar sacola"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Banner */}
          <div className="bg-emerald-50/90 border-b border-emerald-200/80 p-3 text-xs text-[#0F4C3A] flex items-center gap-2 px-5">
            <Check className="w-4 h-4 shrink-0 text-[#0F4C3A]" />
            <span className="font-semibold">
              Peças raras de brechó são únicas! Reserve e finalize seu pedido.
            </span>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 divide-y divide-[#dac9df]/50">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-3xl bg-[#faf7fb] border border-[#dac9df] flex items-center justify-center mx-auto mb-4 text-[#0F4C3A]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-base font-serif font-black text-[#382343] mb-1">
                  Sua sacola está vazia
                </p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
                  Conheça nossa seleção de vestidos modestos, ternos, saias mídi e capas de Bíblia.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl text-xs font-black text-white bg-[#0F4C3A] hover:bg-[#165B4C] shadow-md transition-all cursor-pointer"
                >
                  Explorar Araras Agora
                </button>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={`${item.product.id}-${index}`} className="py-4 flex gap-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover rounded-2xl border border-[#dac9df] shrink-0 shadow-2xs"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 transition-colors shrink-0 cursor-pointer"
                          title="Remover peça"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-600">
                        <span className="bg-[#faf7fb] px-2 py-0.5 rounded-md border border-[#dac9df] font-bold text-[#382343]">
                          Tam: {item.selectedSize || item.product.size}
                        </span>
                        <span className="bg-[#faf7fb] px-2 py-0.5 rounded-md border border-[#dac9df] text-slate-600">
                          Cor: {item.selectedColor || item.product.color}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <span className="font-serif font-black text-sm text-[#0F4C3A]">
                        R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                      <div className="flex items-center border border-[#dac9df] rounded-xl text-xs bg-[#faf7fb]">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="px-2.5 py-0.5 text-slate-600 hover:bg-[#dac9df]/50 font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="px-2.5 py-0.5 text-slate-600 hover:bg-[#dac9df]/50 font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with checkout */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-[#dac9df] bg-[#faf7fb]">
              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-[#0F4C3A] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Cupom VIP (ex: BEMVINDA10)"
                      className="w-full pl-8 pr-3 py-2.5 bg-white border border-[#dac9df] rounded-xl text-xs uppercase font-bold text-[#382343] focus:outline-none focus:border-[#0F4C3A]"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2.5 text-xs font-bold text-[#382343] rounded-xl transition-all cursor-pointer shadow-2xs border border-[#cbb6d2]"
                    style={{ backgroundColor: '#dac9df' }}
                  >
                    Aplicar
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-[#0F4C3A] font-bold mt-1.5 flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#0F4C3A]" />
                    <span>
                      Cupom <strong>{appliedCoupon.code}</strong> ativado ({appliedCoupon.percent}% OFF)!
                    </span>
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-rose-500 font-medium mt-1.5">{couponError}</p>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-[#0F4C3A] font-bold">
                    <span>Desconto VIP ({appliedCoupon.percent}%)</span>
                    <span>- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-[#dac9df]">
                  <span className="font-serif">Total com Desconto</span>
                  <span className="text-[#0F4C3A] text-lg font-black font-serif">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onProceedToCheckout(discountAmount, appliedCoupon?.code || '');
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-black text-sm text-white bg-[#0F4C3A] hover:bg-[#165B4C] shadow-lg hover:shadow-xl transition-all active:scale-[0.98] cursor-pointer"
                id="tdm-drawer-checkout-btn"
              >
                <span>Finalizar Pedido com Segurança</span>
                <ArrowRight className="w-4 h-4 text-emerald-200" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
