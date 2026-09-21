import { NextRequest, NextResponse } from "next/server";

import { getD1 } from "@/db";
import { ADMIN_COOKIE_NAME, isValidAdminSession } from "@/lib/admin-auth";

export async function DELETE(
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
  try {
    const result = await getD1()
      .prepare("DELETE FROM questions WHERE id = ?")
      .bind(id)
      .run();

    if (!result.meta.changes) {
      return NextResponse.json(
        { error: "This question no longer exists." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "The question could not be deleted." },
      { status: 503 }
    );
  }
}
