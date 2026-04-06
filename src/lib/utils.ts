export const formatPrice = (price: number | undefined | null): string => {
  if (price === undefined || price === null) return '0.00';
  return price.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
