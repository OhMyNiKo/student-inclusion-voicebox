import { env } from "cloudflare:workers";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "si_admin_session";
export const ADMIN_SESSION_SECONDS = 8 * 60 * 60;

function toBase64Url(bytes: ArrayBuffer) {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function constantTimeEqual(left: string, right: string) {
  const maxLength = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;

  for (let index = 0; index < maxLength; index += 1) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }

  return difference === 0;
}

async function sign(payload: string) {
  const secret = env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET is missing or too short.");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return toBase64Url(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))
  );
}

export function matchesAdminPassphrase(candidate: string) {
  const expected = env.ADMIN_PASSPHRASE;
  return Boolean(expected && constantTimeEqual(candidate, expected));
}

export async function createAdminSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS;
  const payload = `v1.${expiresAt}`;
  return `${payload}.${await sign(payload)}`;
}

export async function isValidAdminSession(value: string | undefined) {
  if (!value) return false;

  const [version, expiresText, signature, extra] = value.split(".");
  if (version !== "v1" || !expiresText || !signature || extra) return false;

  const expiresAt = Number(expiresText);
  if (!Number.isInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  try {
    const expectedSignature = await sign(`${version}.${expiresText}`);
    return constantTimeEqual(signature, expectedSignature);
  } catch {
    return false;
  }
}

export async function isAuthorizedAdminRequest(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : undefined;

  return isValidAdminSession(
    bearerToken || request.cookies.get(ADMIN_COOKIE_NAME)?.value
  );
}
