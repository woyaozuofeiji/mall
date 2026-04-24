export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "jcb" | "unionpay" | "diners" | "unknown";

export interface SerializedCardAuditDetails {
  cardholderName: string;
  brand: CardBrand;
  last4: string;
  bin: string | null;
  maskedNumber: string;
  fingerprintSha256: string | null;
  panLength: number;
  expiry: string;
  billingZip: string;
  cvcLength: number;
  luhnValid: boolean;
}

export function detectCardBrand(digits: string): CardBrand {
  if (!digits) return "unknown";
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^(6011|65|64[4-9])/.test(digits)) return "discover";
  if (/^(2131|1800|35)/.test(digits)) return "jcb";
  if (/^(62|81)/.test(digits)) return "unionpay";
  if (/^3(?:0[0-5]|[68])/.test(digits)) return "diners";
  return "unknown";
}

export function getCardLengthOptions(brand: CardBrand) {
  switch (brand) {
    case "amex":
      return [15];
    case "mastercard":
      return [16];
    case "diners":
      return [14];
    case "discover":
      return [16, 19];
    case "visa":
      return [13, 16, 19];
    case "jcb":
    case "unionpay":
      return [16, 17, 18, 19];
    default:
      return [13, 14, 15, 16, 17, 18, 19];
  }
}

export function getCardNumberMaxLength(brand: CardBrand) {
  return Math.max(...getCardLengthOptions(brand));
}

export function getCvcLength(brand: CardBrand) {
  return brand === "amex" ? 4 : 3;
}

export function formatCardNumber(rawValue: string, brand: CardBrand) {
  const digits = rawValue.replace(/\D/g, "").slice(0, getCardNumberMaxLength(brand));

  if (brand === "amex") {
    const parts = [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean);
    return parts.join(" ");
  }

  return digits.match(/.{1,4}/g)?.join(" ") ?? digits;
}

export function formatExpiry(rawValue: string) {
  let digits = rawValue.replace(/\D/g, "").slice(0, 4);

  if (digits.length === 1 && Number(digits) > 1) {
    digits = `0${digits}`;
  }

  if (!digits) return "";

  let month = digits.slice(0, 2);
  const year = digits.slice(2);

  if (month.length === 2) {
    const monthValue = Number(month);
    month = String(Math.min(Math.max(monthValue || 1, 1), 12)).padStart(2, "0");
  }

  return year ? `${month}/${year}` : month.length === 2 ? `${month}/` : month;
}

export function luhnCheck(digits: string) {
  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function isExpiryValid(expiry: string) {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;

  const month = Number(match[1]);
  const year = Number(match[2]);
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
}

function hexFromBytes(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return hexFromBytes(new Uint8Array(digest));
}

export async function serializeCardAuditDetails(input: {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  billingZip: string;
}): Promise<SerializedCardAuditDetails> {
  const digits = input.cardNumber.replace(/\D/g, "");
  const brand = detectCardBrand(digits);
  const last4 = digits.slice(-4);
  const bin = digits.length >= 6 ? digits.slice(0, 6) : null;
  const maskedMiddleLength = Math.max(digits.length - 10, 0);
  const maskedNumber = digits
    ? `${bin ?? digits.slice(0, Math.min(6, digits.length))}${"*".repeat(maskedMiddleLength)}${last4}`.slice(0, digits.length)
    : "";

  return {
    cardholderName: input.cardholderName.trim(),
    brand,
    last4,
    bin,
    maskedNumber,
    fingerprintSha256: digits ? await sha256Hex(digits) : null,
    panLength: digits.length,
    expiry: input.expiry,
    billingZip: input.billingZip.trim(),
    cvcLength: input.cvc.length,
    luhnValid: digits ? luhnCheck(digits) : false,
  };
}
