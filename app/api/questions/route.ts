import { NextRequest } from "next/server";

import { getD1 } from "@/db";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_SECONDS,
  createAdminSession,
  matchesAdminPassphrase,
} from "@/lib/admin-auth";
import { corsPreflight, isGitHubPagesRequest, jsonWithCors } from "@/lib/cors";
import { listPublishedQuestions } from "@/lib/questions";

const MAX_QUESTION_LENGTH = 1000;

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

export async function GET(request: NextRequest) {
  try {
    return jsonWithCors(request, { questions: await listPublishedQuestions() });
  } catch {
    return jsonWithCors(
      request,
      { error: "Published questions could not be loaded." },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonWithCors(request, { error: "Invalid request." }, { status: 400 });
  }

  const payload = body as { message?: unknown; website?: unknown };
  const message =
    typeof payload.message === "string" ? payload.message.trim() : "";
  const website =
    typeof payload.website === "string" ? payload.website.trim() : "";

  if (website) {
    return jsonWithCors(request, { ok: true }, { status: 201 });
  }

  if (!message) {
    return jsonWithCors(
      request,
      { error: "Please write a message before sending." },
      { status: 400 }
    );
  }

  if (message.length > MAX_QUESTION_LENGTH) {
    return jsonWithCors(
      request,
      { error: `Messages must be ${MAX_QUESTION_LENGTH} characters or fewer.` },
      { status: 400 }
    );
  }

  if (matchesAdminPassphrase(message)) {
    try {
      const session = await createAdminSession();
      const response = jsonWithCors(request, {
        ok: true,
        destination: "/admin",
        ...(isGitHubPagesRequest(request) ? { adminToken: session } : {}),
      });
      response.cookies.set(ADMIN_COOKIE_NAME, session, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: ADMIN_SESSION_SECONDS,
      });
      return response;
    } catch {
      return jsonWithCors(
        request,
        { error: "The moderation portal is temporarily unavailable." },
        { status: 503 }
      );
    }
  }

  try {
    await getD1()
      .prepare(
        `INSERT INTO questions
          (id, question_text, reply_text, status, created_at, replied_at)
         VALUES (?, ?, NULL, ?, ?, NULL)`
      )
      .bind(
        crypto.randomUUID(),
        message,
        "pending",
        Math.floor(Date.now() / 1000)
      )
      .run();

    return jsonWithCors(request, { ok: true }, { status: 201 });
  } catch {
    return jsonWithCors(
      request,
      {
        error:
          "Feedback is temporarily unavailable. Your text is still here—please try again shortly.",
      },
      { status: 503 }
    );
  }
}
