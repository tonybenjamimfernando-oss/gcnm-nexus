const CODES =
  "AED AFN ALL AMD ANG AOA ARS AUD AWG AZN BAM BBD BDT BGN BHD BIF BMD BND BOB BOV BRL BSD BTN BWP BYN BZD CAD CDF CHE CHF CHW CLF CLP CNY COP COU CRC CUP CVE CZK DJF DKK DOP DZD EGP ERN ETB EUR FJD FKP GBP GEL GHS GIP GMD GNF GTQ GYD HKD HNL HTG HUF IDR ILS INR IQD IRR ISK JMD JOD JPY KES KGS KHR KMF KPW KRW KWD KYD KZT LAK LBP LKR LRD LSL LYD MAD MDL MGA MKD MMK MNT MOP MRU MUR MVR MWK MXN MXV MYR MZN NAD NGN NIO NOK NPR NZD OMR PAB PEN PGK PHP PKR PLN PYG QAR RON RSD RUB RWF SAR SBD SCR SDG SEK SGD SHP SLE SOS SRD SSP STN SVC SYP SZL THB TJS TMT TND TOP TRY TTD TWD TZS UAH UGX USD USN UYI UYU UYW UZS VED VES VND VUV WST XAF XAG XAU XCD XDR XOF XPD XPF XPT YER ZAR ZMW ZWG";

export const CURRENCIES: string[] = CODES.split(" ");

export const PRIORITY_CURRENCIES: string[] = [
  "USD",
  "EUR",
  "MZN",
  "ZAR",
  "GBP",
  "BRL",
  "CNY",
  "AED",
  "INR",
  "JPY",
];

type DisplayNamesLike = { of: (code: string) => string | undefined };
let cached: DisplayNamesLike | null | undefined;

function displayNames(): DisplayNamesLike | null {
  if (cached !== undefined) return cached;
  const ctor = (Intl as unknown as {
    DisplayNames?: new (locales: string[], options: { type: string }) => DisplayNamesLike;
  }).DisplayNames;
  cached = ctor ? new ctor(["pt"], { type: "currency" }) : null;
  return cached;
}

export function currencyName(code: string): string {
  const names = displayNames();
  if (!names) return code;
  try {
    return names.of(code) || code;
  } catch {
    return code;
  }
}

export function isKnownCurrency(code: string): boolean {
  return CURRENCIES.indexOf(code) !== -1;
}
