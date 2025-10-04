export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
    const data = await response.json();
    const rate = data.rates[toCurrency];
    return amount * rate;
  } catch (error) {
    console.error('Currency conversion error:', error);
    return amount;
  }
}

export async function getCurrencies(): Promise<{ code: string; name: string }[]> {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
    const countries = await response.json();
    
    const currencyMap = new Map<string, string>();
    countries.forEach((country: any) => {
      if (country.currencies) {
        Object.entries(country.currencies).forEach(([code, info]: [string, any]) => {
          if (!currencyMap.has(code)) {
            currencyMap.set(code, info.name);
          }
        });
      }
    });

    return Array.from(currencyMap.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.code.localeCompare(b.code));
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return [
      { code: 'USD', name: 'US Dollar' },
      { code: 'EUR', name: 'Euro' },
      { code: 'GBP', name: 'British Pound' },
    ];
  }
}
