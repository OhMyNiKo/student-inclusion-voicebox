import { NextRequest, NextResponse } from "next/server";

import { getD1 } from "@/db";
import { ADMIN_COOKIE_NAME, isValidAdminSession } from "@/lib/admin-auth";

const MAX_REPLY_LENGTH = 2000;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const isAdmin = await isValidAdminSession(
    request.cookies.get(ADMIN_COOKIE_NAME)?.value
  );
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const payload = body as { reply?: unknown };
  const reply = typeof payload.reply === "string" ? payload.reply.trim() : "";
  if (!reply) {
    return NextResponse.json(
      { error: "Write a reply before publishing." },
      { status: 400 }
    );
  }
  if (reply.length > MAX_REPLY_LENGTH) {
    return NextResponse.json(
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
      return NextResponse.json(
        { error: "This question no longer exists." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, repliedAt: now });
  } catch {
    return NextResponse.json(
      { error: "The reply could not be published." },
      { status: 503 }
    );
  }
}
