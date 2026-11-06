import "server-only";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import type { NextRequest } from "next/server";

/**
 * Reads a Sanity webhook request and checks its signature against the shared secret.
 * Waits a moment afterwards so Sanity's API has caught up with the change that fired it.
 */
export async function parseWebhook<T>(request: NextRequest, secret: string): Promise<{ valid: boolean; body: T | null }> {
  const raw = await request.text();
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  if (!signature || !(await isValidSignature(raw, signature, secret))) return { valid: false, body: null };
  await new Promise((resolve) => setTimeout(resolve, 2000));
  try {
    return { valid: true, body: JSON.parse(raw) as T };
  } catch {
    return { valid: true, body: null };
  }
}
