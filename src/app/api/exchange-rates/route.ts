import { NextResponse } from 'next/server';

// Popular fiat currencies to display
const FIAT_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL'];

// Cache prices for 1 minute
let priceCache: { prices: Record<string, number>; timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const amount = parseFloat(searchParams.get('amount') || '1');
  const baseCurrency = searchParams.get('base') || 'USD';
  const targetCurrencies = searchParams.get('currencies')?.split(',') || FIAT_CURRENCIES;

  try {
    // Check cache
    if (priceCache && Date.now() - priceCache.timestamp < CACHE_TTL) {
      const conversions = calculateConversions(amount, baseCurrency, targetCurrencies, priceCache.prices);
      return NextResponse.json({ conversions, cached: true });
    }

    // Fetch latest rates from a free API
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/USD`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    const rates = data.rates as Record<string, number>;

    // Update cache
    priceCache = {
      prices: rates,
      timestamp: Date.now(),
    };

    const conversions = calculateConversions(amount, baseCurrency, targetCurrencies, rates);

    return NextResponse.json({ 
      conversions,
      timestamp: new Date().toISOString(),
      cached: false,
    });
  } catch (error) {
    console.error('Exchange rate error:', error);
    
    // Return fallback rates if API fails
    const fallbackRates: Record<string, number> = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 149.50,
      CAD: 1.36,
      AUD: 1.53,
      CHF: 0.88,
      CNY: 7.24,
      INR: 83.12,
      BRL: 4.97,
    };

    const conversions = calculateConversions(amount, baseCurrency, targetCurrencies, fallbackRates);

    return NextResponse.json({ 
      conversions,
      timestamp: new Date().toISOString(),
      fallback: true,
    });
  }
}

function calculateConversions(
  amount: number,
  baseCurrency: string,
  targetCurrencies: string[],
  rates: Record<string, number>
): Record<string, { value: number; symbol: string; formatted: string }> {
  const conversions: Record<string, { value: number; symbol: string; formatted: string }> = {};
  
  // Currency symbols
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
    BRL: 'R$',
  };

  // Convert base currency to USD first
  const baseRate = rates[baseCurrency] || 1;
  const amountInUSD = amount / baseRate;

  for (const currency of targetCurrencies) {
    const rate = rates[currency] || 1;
    const value = amountInUSD * rate;
    const symbol = symbols[currency] || currency;
    
    // Format based on currency
    let formatted: string;
    if (currency === 'JPY' || currency === 'INR') {
      formatted = `${symbol}${Math.round(value).toLocaleString()}`;
    } else {
      formatted = `${symbol}${value.toFixed(2)}`;
    }

    conversions[currency] = { value, symbol, formatted };
  }

  return conversions;
}
