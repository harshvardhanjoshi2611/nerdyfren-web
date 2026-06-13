import { publicContactConfig } from './contactConfig';

export const paymentConfig = Object.freeze({
  upiId: import.meta.env.VITE_UPI_ID?.trim() || '',
  bankTransfer: import.meta.env.VITE_BANK_TRANSFER_DETAILS?.trim() || '',
  whatsappNumber: publicContactConfig.whatsappNumber,
});
