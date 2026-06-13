export const paymentConfig = Object.freeze({
  upiId: import.meta.env.VITE_UPI_ID?.trim() || 'nerdyfren@upi',
  bankTransfer: import.meta.env.VITE_BANK_TRANSFER_DETAILS?.trim()
    || 'Bank details available from your NerdyFren coordinator',
  whatsappNumber: (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, ''),
});
