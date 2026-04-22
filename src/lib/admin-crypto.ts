import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const PASSWORD_HASH_PREFIX = "scrypt";

function safeCompareText(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${PASSWORD_HASH_PREFIX}$${salt}$${derived}`;
}

export function verifyAdminPassword(password: string, storedHash: string) {
  if (!storedHash) {
    return false;
  }

  if (!storedHash.startsWith(`${PASSWORD_HASH_PREFIX}$`)) {
    return safeCompareText(password, storedHash);
  }

  const [, salt, expected] = storedHash.split("$");
  if (!salt || !expected) {
    return false;
  }

  const actual = scryptSync(password, salt, 64).toString("hex");
  return safeCompareText(actual, expected);
}

export function signAdminSessionData(data: string, secret: string) {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

