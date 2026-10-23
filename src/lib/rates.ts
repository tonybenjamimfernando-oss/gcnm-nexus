export const BASE_CURRENCY = "USD";

/*
  Taxas de referencia face ao USD, usadas para apresentar precos na moeda
  escolhida pelo visitante. Sao valores de referencia para a fase de
  apresentacao: a fase de pagamentos passa a usar taxas ao vivo do provedor.
*/
export const RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  MZN: 63.9,
  ZAR: 18.2,
  BRL: 5.42,
  CAD: 1.36,
  AUD: 1.52,
  NZD: 1.64,
  CHF: 0.88,
  JPY: 151.4,
  CNY: 7.24,
  HKD: 7.82,
  SGD: 1.34,
  INR: 83.2,
  AED: 3.67,
  SAR: 3.75,
  QAR: 3.64,
  KWD: 0.31,
  TRY: 32.4,
  RUB: 92.5,
  PLN: 3.97,
  CZK: 23.2,
  HUF: 358,
  RON: 4.58,
  SEK: 10.6,
  NOK: 10.7,
  DKK: 6.87,
  ISK: 138,
  MAD: 10.0,
  EGP: 48.5,
  NGN: 1480,
  KES: 131,
  GHS: 14.6,
  TZS: 2650,
  UGX: 3800,
  XOF: 604,
  XAF: 604,
  AOA: 840,
  CVE: 101,
  MGA: 4500,
  MUR: 46.6,
  XCD: 2.7,
  DOP: 59.4,
  JMD: 155,
  TTD: 6.78,
  MXN: 17.1,
  ARS: 880,
  CLP: 950,
  COP: 3900,
  PEN: 3.78,
  UYU: 39.5,
  PYG: 7400,
  BOB: 6.91,
  CRC: 512,
  GTQ: 7.8,
  PAB: 1,
  ILS: 3.72,
  PKR: 278,
  BDT: 117,
  LKR: 300,
  NPR: 133,
  IDR: 15900,
  MYR: 4.72,
  THB: 36.4,
  PHP: 57.3,
  VND: 25100,
  KRW: 1360,
  TWD: 32.2,
};

export function rateFor(code: string): number {
  const rate = RATES[code];
  return typeof rate === "number" && rate > 0 ? rate : 1;
}

export function hasRate(code: string): boolean {
  const rate = RATES[code];
  return typeof rate === "number" && rate > 0;
}
