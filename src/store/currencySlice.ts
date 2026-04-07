import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CurrencyState {
  usdRate: number;
  eurRate: number;
}

const loadRates = (): CurrencyState => {
  const saved = localStorage.getItem('currency_rates');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        usdRate: parsed.usdRate ?? 90,
        eurRate: parsed.eurRate ?? 98,
      };
    } catch (e) {}
  }
  return { usdRate: 90, eurRate: 98 };
};

const initialState: CurrencyState = loadRates();

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setUsdRate: (state, action: PayloadAction<number>) => {
      state.usdRate = action.payload;
      localStorage.setItem('currency_rates', JSON.stringify({ usdRate: state.usdRate, eurRate: state.eurRate }));
    },
    setEurRate: (state, action: PayloadAction<number>) => {
      state.eurRate = action.payload;
      localStorage.setItem('currency_rates', JSON.stringify({ usdRate: state.usdRate, eurRate: state.eurRate }));
    },
  },
});

export const { setUsdRate, setEurRate } = currencySlice.actions;
export default currencySlice.reducer;
