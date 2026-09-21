import { NextRequest } from "next/server";

import { getD1 } from "@/db";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { corsPreflight, jsonWithCors } from "@/lib/cors";

const MAX_REPLY_LENGTH = 2000;

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const isAdmin = await isAuthorizedAdminRequest(request);
  if (!isAdmin) {
    return jsonWithCors(request, { error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonWithCors(request, { error: "Invalid request." }, { status: 400 });
  }

  const payload = body as { reply?: unknown };
  const reply = typeof payload.reply === "string" ? payload.reply.trim() : "";
  if (!reply) {
    return jsonWithCors(
      request,
      { error: "Write a reply before publishing." },
      { status: 400 }
    );
  }
  if (reply.length > MAX_REPLY_LENGTH) {
    return jsonWithCors(
      request,
      { error: `Replies must be ${MAX_REPLY_LENGTH} characters or fewer.` },
      { status: 400 }
    );
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const result = await getD1()
      .prepare(
        `UPDATE questions
         SET reply_text = ?, status = ?, replied_at = ?
         WHERE id = ?`
      )
      .bind(reply, "published", now, id)
      .run();

    if (!result.meta.changes) {
      return jsonWithCors(
        request,
        { error: "This question no longer exists." },
        { status: 404 }
      );
    }

    return jsonWithCors(request, { ok: true, repliedAt: now });
  } catch {
    return jsonWithCors(
      request,
      { error: "The reply could not be published." },
      { status: 503 }
    );
  }
}
