import { NextRequest } from "next/server";

import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { corsPreflight, jsonWithCors } from "@/lib/cors";
import { listAllQuestions } from "@/lib/questions";

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

export async function GET(request: NextRequest) {
  const isAdmin = await isAuthorizedAdminRequest(request);
  if (!isAdmin) {
    return jsonWithCors(request, { error: "Unauthorized." }, { status: 401 });
  }

  try {
    return jsonWithCors(request, { questions: await listAllQuestions() });
  } catch {
    return jsonWithCors(
      request,
      { error: "Questions could not be loaded." },
      { status: 503 }
    );
  }
}
