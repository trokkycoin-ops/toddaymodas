import { Order } from '../types';

/**
 * Gera um recibo profissional estilizado para visualização e impressão direta.
 */
export function generateOrderReceipt(order: Order): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita popups para visualizar e baixar o recibo em PDF.');
    return;
  }

  const itemsHtml = order.items.map(item => `
    <tr style="border-bottom: 1px solid #E2E8F0;">
      <td style="padding: 12px 0;">${item.name}</td>
      <td style="padding: 12px 0; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 0; text-align: right;">R$ ${item.price.toFixed(2).replace('.', ',')}</td>
      <td style="padding: 12px 0; text-align: right; font-weight: bold;">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Recibo de Pedido #${order.order_number} — Todday Modas Brechó</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #12201B;
          line-height: 1.5;
          margin: 0;
          padding: 40px;
          background: #FFF;
        }
        .container {
          max-width: 700px;
          margin: 0 auto;
          border: 1px solid #E2E8F0;
          padding: 32px;
          border-radius: 12px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #7C3AED;
          padding-bottom: 20px;
          margin-bottom: 24px;
        }
        .brand {
          font-size: 24px;
          font-weight: 800;
          color: #7C3AED;
          margin: 0;
        }
        .subbrand {
          font-size: 13px;
          color: #64748B;
          margin: 2px 0 0 0;
        }
        .meta-box {
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        th {
          text-align: left;
          font-size: 12px;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #E2E8F0;
          padding-bottom: 8px;
        }
        .totals {
          margin-left: auto;
          width: 280px;
          font-size: 14px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
        }
        .grand-total {
          border-top: 2px solid #7C3AED;
          margin-top: 8px;
          padding-top: 8px;
          font-size: 18px;
          font-weight: bold;
          color: #7C3AED;
        }
        .footer {
          margin-top: 36px;
          text-align: center;
          font-size: 12px;
          color: #94A3B8;
          border-top: 1px solid #E2E8F0;
          padding-top: 16px;
        }
        @media print {
          body { padding: 0; }
          .container { border: none; padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            <h1 class="brand">TODDAY MODAS BRECHÓ</h1>
            <p class="subbrand">Moda Modesta, Infantil & Acessórios Cristãos</p>
          </div>
          <div style="text-align: right;">
            <strong style="font-size: 16px; color: #7C3AED;">Fatura / Recibo</strong>
            <p style="margin: 2px 0; font-size: 13px; color: #64748B;">Pedido #${order.order_number}</p>
            <p style="margin: 0; font-size: 12px; color: #94A3B8;">${order.date}</p>
          </div>
        </div>

        <div class="meta-box">
          <div>
            <strong style="color: #7C3AED;">Dados da Cliente:</strong><br>
            ${order.customer_name}<br>
            ${order.customer_email}<br>
            ${order.customer_phone}
          </div>
          <div>
            <strong style="color: #7C3AED;">Endereço de Entrega:</strong><br>
            ${order.shipping_address.street}, ${order.shipping_address.number} ${order.shipping_address.complement || ''}<br>
            ${order.shipping_address.neighborhood} — ${order.shipping_address.city}/${order.shipping_address.state}<br>
            CEP: ${order.shipping_address.cep}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Peça / Produto Selecionado</th>
              <th style="text-align: center;">Qtd</th>
              <th style="text-align: right;">Unitário</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>R$ ${order.subtotal.toFixed(2).replace('.', ',')}</span>
          </div>
          <div class="total-row">
            <span>Frete (Melhor Envio):</span>
            <span>${order.shipping_cost === 0 ? 'Grátis' : 'R$ ' + order.shipping_cost.toFixed(2).replace('.', ',')}</span>
          </div>
          ${order.discount > 0 ? `
          <div class="total-row" style="color: #7C3AED;">
            <span>Desconto Cupom:</span>
            <span>- R$ ${order.discount.toFixed(2).replace('.', ',')}</span>
          </div>` : ''}
          <div class="total-row grand-total">
            <span>Total Pago:</span>
            <span>R$ ${order.total.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        <div style="margin-top: 24px; padding: 12px; background: #F5F3FF; border-radius: 8px; font-size: 13px; border: 1px solid #DDD6FE;">
          <strong>Pagamento:</strong> ${order.payment_method === 'pix' ? 'PIX Instantâneo (Aprovado)' : 'Cartão de Crédito (Aprovado)'} 
          ${order.tracking_code ? ` | <strong>Rastreio:</strong> ${order.tracking_code}` : ''}
        </div>

        <div class="footer">
          <p>Obrigada pela preferência! Que Deus abençoe você e sua família. Cada peça foi embalada com amor e oração.</p>
          <p class="no-print" style="margin-top: 12px;">
            <button onclick="window.print()" style="background: #7C3AED; color: white; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; font-weight: bold;">
              Imprimir / Salvar em PDF
            </button>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
