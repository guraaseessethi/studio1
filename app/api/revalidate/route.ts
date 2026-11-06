import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * Sanity webhook for public content. Marks cached content stale so edits go live in seconds.
 * Body projection: {_type}
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "Webhook secret is not set" }, { status: 503 });

  const { isValidSignature, body } = await parseBody<{ _type?: string }>(request, secret);
  if (!isValidSignature) return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });

  const tags = ["sanity", ...(body?._type ? [body._type] : [])];
  // expire: 0 drops the old copy right away, so the next visitor sees the edit.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ ok: true, revalidated: tags });
}
