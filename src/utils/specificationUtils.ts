import { Row } from '../pages/SpecificationPage';

export const getSpecTotalRub = (rows: Row[], usdRate: number, eurRate: number): number => {
  let total = 0;
  for (const row of rows) {
    if (row.type === 'data') {
      const rate = row.currency === 'USD' ? usdRate : row.currency === 'EUR' ? eurRate : 1;
      total += (row.priceAfter || 0) * row.quantity * rate;
    }
  }
  return total;
};
