export const buildDialablePhoneNumber = (
  countryCode?: string | null,
  phoneNumber?: string | null
): string => {
  const ccRaw = typeof countryCode === "string" ? countryCode.trim() : "";
  const pnRaw = typeof phoneNumber === "string" ? phoneNumber.trim() : "";

  if (!ccRaw && !pnRaw) return "";

  // If backend already stored full E.164, prefer it.
  if (pnRaw.startsWith("+")) {
    return pnRaw.replace(/\s+/g, "");
  }

  const ccDigits = ccRaw.replace(/\D/g, "");
  const pnDigits = pnRaw.replace(/\D/g, "");

  if (!pnDigits) return "";

  if (!ccDigits) {
    // Best effort: treat as national number without a country code.
    return pnDigits;
  }

  // Avoid double-prefixing if phoneNumber already begins with country digits.
  const nationalDigits = pnDigits.startsWith(ccDigits)
    ? pnDigits.slice(ccDigits.length)
    : pnDigits;

  return `+${ccDigits}${nationalDigits}`;
};

