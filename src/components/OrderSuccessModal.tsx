import React, { useEffect } from 'react';
import { Logo } from './Logo';
import { X, CheckCircle2, FileText, MessageCircle, ArrowRight, Copy, Check, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '../types';
import { generateOrderReceipt } from '../utils/pdfGenerator';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onGoToCustomerPortal: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onGoToCustomerPortal,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (order) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#dac9df', '#8a5d96', '#382343', '#f5eff7', '#f472b6'],
        });
      } catch {}
    }
  }, [order]);

  if (!order) return null;

  const pixCopyPaste = `00020126580014br.gov.bcb.pix0136tdm-brecho-${order.order_number}520400005303986540${order.total.toFixed(2)}5802BR5925TODDAY MODAS BRECHO6009SAO PAULO62070503***6304ABCD`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCopyPaste);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMsg = `A paz! Olá Todday Modas, acabei de fazer o pedido #${order.order_number} no valor de R$ ${order.total.toFixed(2).replace('.', ',')}. Gostaria de acompanhar os detalhes do envio das minhas peças!`;
  const whatsappUrl = `https://wa.me/5535991759960?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#dac9df] p-6 sm:p-8 relative text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#faf7fb] text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo da Marca */}
        <div className="flex justify-center mb-4">
          <Logo variant="stacked" size="sm" theme="light" onClick={onClose} />
        </div>

        {/* Ícone de Sucesso com Paleta #dac9df */}
        <div 
          className="w-16 h-16 rounded-full text-[#382343] flex items-center justify-center mx-auto mb-4 shadow-sm border-2 border-[#cbb6d2]"
          style={{ backgroundColor: '#dac9df' }}
        >
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div 
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black text-[#382343] mb-2 border border-[#cbb6d2]"
          style={{ backgroundColor: '#dac9df' }}
        >
          <Heart className="w-3.5 h-3.5 fill-[#382343]" />
          <span>Pedido Registrado com Sucesso</span>
        </div>

        <h2 className="text-2xl font-black text-[#382343] mb-1 font-serif">
          Obrigada pela sua Compra!
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          Pedido <strong>#{order.order_number}</strong> confirmado com sucesso. Suas peças serão preparadas e embaladas com muito carinho e amor.
        </p>

        {/* Informações de Pagamento PIX se aplicável */}
        {order.payment_method === 'pix' && (
          <div className="bg-[#faf7fb] border border-[#dac9df] rounded-2xl p-5 mb-6 text-left">
            <h4 className="font-extrabold text-xs text-[#382343] uppercase tracking-wider mb-2">
              Pagamento via PIX (Mercado Pago)
            </h4>
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-[#dac9df] mb-3">
              {/* QR Code Fictício Estilizado */}
              <div className="w-24 h-24 bg-[#291630] text-[#dac9df] rounded-lg flex items-center justify-center shrink-0 p-2">
                <div className="w-full h-full border border-dashed border-[#dac9df] flex items-center justify-center text-[10px] font-mono text-center">
                  PIX QR CODE
                </div>
              </div>
              <div className="flex-1 text-xs">
                <p className="font-bold text-slate-800 mb-1">Total: R$ {order.total.toFixed(2).replace('.', ',')}</p>
                <p className="text-slate-500 text-[11px] mb-2">
                  Abra o app do seu banco, escaneie o código ao lado ou use o Copia e Cola abaixo.
                </p>
                <button
                  onClick={handleCopyPix}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs text-[#382343] shadow-xs hover:shadow-md transition-all cursor-pointer"
                  style={{ backgroundColor: '#dac9df', border: '1px solid #cbb6d2' }}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Código Copiado!' : 'Copiar Chave PIX'}</span>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-[#6b4b7a]">
              ⚡ O webhook do Mercado Pago reconhece o pagamento automaticamente e atualiza o status.
            </p>
          </div>
        )}

        {/* Resumo Rápido */}
        <div className="bg-[#faf7fb] rounded-2xl p-4 text-xs text-left mb-6 border border-[#dac9df] space-y-1.5 text-slate-600">
          <div className="flex justify-between">
            <span>Destinatário:</span>
            <strong className="text-slate-900">{order.customer_name}</strong>
          </div>
          <div className="flex justify-between">
            <span>Endereço:</span>
            <span className="text-slate-700">{order.shipping_address.street}, {order.shipping_address.number} — {order.shipping_address.city}/{order.shipping_address.state}</span>
          </div>
          <div className="flex justify-between">
            <span>Rastreamento Inicial:</span>
            <span className="font-mono font-bold text-[#382343]">{order.tracking_code}</span>
          </div>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => generateOrderReceipt(order)}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#dac9df] hover:bg-[#faf7fb] text-[#382343] font-bold text-xs transition-all shadow-2xs cursor-pointer"
            id="tdm-download-pdf-receipt-btn"
          >
            <FileText className="w-4 h-4 text-[#8a5d96]" />
            <span>Baixar Recibo em PDF</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs transition-all shadow-2xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Avisar no WhatsApp</span>
          </a>
        </div>

        <button
          onClick={() => {
            onClose();
            onGoToCustomerPortal();
          }}
          className="w-full py-3.5 px-4 rounded-2xl font-black text-xs text-[#382343] flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md cursor-pointer"
          style={{ backgroundColor: '#dac9df', border: '1px solid #cbb6d2' }}
        >
          <span>Acompanhar Meus Pedidos no Portal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
