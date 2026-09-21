import { NextRequest, NextResponse } from "next/server";

import { ADMIN_COOKIE_NAME, isValidAdminSession } from "@/lib/admin-auth";
import { listAllQuestions } from "@/lib/questions";

export async function GET(request: NextRequest) {
  const isAdmin = await isValidAdminSession(
    request.cookies.get(ADMIN_COOKIE_NAME)?.value
  );
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    return NextResponse.json({ questions: await listAllQuestions() });
  } catch {
    return NextResponse.json(
      { error: "Questions could not be loaded." },
      { status: 503 }
    );
  }
}
