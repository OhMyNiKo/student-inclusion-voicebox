import { NextRequest } from "next/server";

import { getD1 } from "@/db";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { corsPreflight, jsonWithCors } from "@/lib/cors";

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const isAdmin = await isAuthorizedAdminRequest(request);
  if (!isAdmin) {
    return jsonWithCors(request, { error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const result = await getD1()
      .prepare("DELETE FROM questions WHERE id = ?")
      .bind(id)
      .run();

    if (!result.meta.changes) {
      return jsonWithCors(
        request,
        { error: "This question no longer exists." },
        { status: 404 }
      );
    }

    return jsonWithCors(request, { ok: true });
  } catch {
    return jsonWithCors(
      request,
      { error: "The question could not be deleted." },
      { status: 503 }
    );
  }
}
