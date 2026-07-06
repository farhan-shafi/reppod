/**
 * Lightweight display-currency localization. Prices are defined in USD and
 * converted for display only — the real charge happens in the customer's
 * local currency at the payment provider's checkout. Rates are approximate.
 */
export type CurrencyCode =
  | "USD"
  | "PKR"
  | "EUR"
  | "GBP"
  | "INR"
  | "AED"
  | "CAD"
  | "AUD";

type CurrencyInfo = {
  code: CurrencyCode;
  symbol: string;
  /** Approx units per 1 USD. */
  rate: number;
  /** Round display to this step (nicer prices). */
  step: number;
  locale: string;
};

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: "USD", symbol: "$", rate: 1, step: 1, locale: "en-US" },
  PKR: { code: "PKR", symbol: "Rs", rate: 278, step: 50, locale: "en-PK" },
  EUR: { code: "EUR", symbol: "€", rate: 0.92, step: 1, locale: "de-DE" },
  GBP: { code: "GBP", symbol: "£", rate: 0.79, step: 1, locale: "en-GB" },
  INR: { code: "INR", symbol: "₹", rate: 83, step: 10, locale: "en-IN" },
  AED: { code: "AED", symbol: "AED", rate: 3.67, step: 1, locale: "en-AE" },
  CAD: { code: "CAD", symbol: "CA$", rate: 1.36, step: 1, locale: "en-CA" },
  AUD: { code: "AUD", symbol: "A$", rate: 1.52, step: 1, locale: "en-AU" },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

/** Map an ISO country code to a display currency. */
const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  PK: "PKR",
  IN: "INR",
  GB: "GBP",
  AE: "AED",
  CA: "CAD",
  AU: "AUD",
  US: "USD",
  // Eurozone (subset)
  DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR", NL: "EUR", IE: "EUR", PT: "EUR", AT: "EUR", BE: "EUR", FI: "EUR",
};

export function currencyForCountry(country?: string | null): CurrencyCode {
  if (!country) return "USD";
  return COUNTRY_TO_CURRENCY[country.toUpperCase()] ?? "USD";
}

/** Best-effort browser guess from navigator.language (e.g. "en-PK" → PKR). */
export function guessCurrencyFromBrowser(): CurrencyCode {
  if (typeof navigator === "undefined") return "USD";
  const region = navigator.language.split("-")[1];
  return currencyForCountry(region);
}

/** Convert a USD amount to a nicely-rounded display value in the given currency. */
export function convert(usd: number, code: CurrencyCode): number {
  const c = CURRENCIES[code];
  const raw = usd * c.rate;
  return Math.round(raw / c.step) * c.step;
}

/** Format a USD amount for display in the chosen currency (no decimals). */
export function formatPrice(usd: number, code: CurrencyCode): string {
  const c = CURRENCIES[code];
  const value = convert(usd, code);
  try {
    return new Intl.NumberFormat(c.locale, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${c.symbol}${value.toLocaleString()}`;
  }
}
