import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_SECONDS = 10 * 60;

type WarrantyTokenPayload = {
  warrantyId: string;
  expiresAt: number;
};

const getSigningSecret = () => {
  const secret =
    process.env.WARRANTY_LOOKUP_SIGNING_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error("Warranty lookup signing secret is not configured.");
  }

  return secret;
};

const sign = (payload: string) =>
  createHmac("sha256", getSigningSecret()).update(payload).digest("base64url");

export const normalizeWarrantyName = (value: string) =>
  value.trim().replace(/\s+/g, "");

export const normalizeWarrantyPhone = (value: string) =>
  value.replace(/\D/g, "");

export const isValidCustomerPhone = (value: string) =>
  /^01\d{8,9}$/.test(value);

export const maskCustomerName = (value: string) => {
  const characters = Array.from(value.trim());
  if (characters.length <= 1) return "*";
  if (characters.length === 2) return `${characters[0]}*`;
  return `${characters[0]}${"*".repeat(characters.length - 2)}${characters.at(-1)}`;
};

export const createWarrantyAccessToken = (warrantyId: string) => {
  const payload: WarrantyTokenPayload = {
    warrantyId,
    expiresAt: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
};

export const verifyWarrantyAccessToken = (
  token: string,
): WarrantyTokenPayload | null => {
  const [encoded, suppliedSignature] = token.split(".");
  if (!encoded || !suppliedSignature) return null;

  const expectedSignature = sign(encoded);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as WarrantyTokenPayload;
    if (
      typeof payload.warrantyId !== "string" ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};
