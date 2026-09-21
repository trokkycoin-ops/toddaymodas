export const PaymentIcons = {
  pix: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#00A651"/>
      <path d="M12 6V18M6 12H18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>
  ),
  visa: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#1A1F71"/>
      <path d="M6 7H18M6 12H18M6 17H18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M6 7V17" stroke="#F7B500" strokeWidth="3" strokeLinecap="round"/>
      <path d="M18 7V17" stroke="#E01A2B" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
  mastercard: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#EB001B"/>
      <circle cx="9" cy="12" r="5.5" fill="#FF5F00" fillOpacity="0.8"/>
      <circle cx="15" cy="12" r="5.5" fill="#F79E1B" fillOpacity="0.8"/>
      <circle cx="9" cy="12" r="5.5" fill="none" stroke="white" strokeWidth="1.5" fillOpacity="0"/>
      <circle cx="15" cy="12" r="5.5" fill="none" stroke="white" strokeWidth="1.5" fillOpacity="0"/>
    </svg>
  ),
  elo: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#003366"/>
      <ellipse cx="12" cy="12" rx="7" ry="5" fill="none" stroke="white" strokeWidth="2"/>
      <ellipse cx="12" cy="12" rx="4" ry="3" fill="white" fillOpacity="0.9"/>
    </svg>
  ),
  boleto: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#0A0A0A"/>
      <path d="M6 5H18M6 9H15M6 13H18M6 17H12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M6 21H18" stroke="#00A651" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
  mercadopago: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#009EE3"/>
      <path d="M6 12H18M12 6V18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="2.5" fill="white"/>
    </svg>
  ),
  paypal: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#003087"/>
      <path d="M14 9C14 6.24 11.76 4 9 4S4 6.24 4 9H6C6 6.79 7.79 5 9 5S12 6.79 12 9H10V15H14V9Z" fill="white"/>
    </svg>
  ),
};

export const getPaymentIcon = (method: string) => {
  const key = method.toLowerCase().replace(/\s+/g, '');
  return PaymentIcons[key as keyof typeof PaymentIcons] || PaymentIcons.visa;
};

export const PAYMENT_METHODS = [
  { id: 'pix', label: 'PIX', icon: PaymentIcons.pix, color: '#00A651' },
  { id: 'visa', label: 'Visa', icon: PaymentIcons.visa, color: '#1A1F71' },
  { id: 'mastercard', label: 'Mastercard', icon: PaymentIcons.mastercard, color: '#EB001B' },
  { id: 'elo', label: 'Elo', icon: PaymentIcons.elo, color: '#003366' },
  { id: 'boleto', label: 'Boleto', icon: PaymentIcons.boleto, color: '#0A0A0A' },
] as const;