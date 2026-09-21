import { NextRequest, NextResponse } from "next/server";

const GITHUB_PAGES_ORIGIN = "https://ohmyniko.github.io";

export function isGitHubPagesRequest(request: NextRequest) {
  return request.headers.get("origin") === GITHUB_PAGES_ORIGIN;
}

function applyCors(request: NextRequest, response: NextResponse) {
  if (isGitHubPagesRequest(request)) {
    response.headers.set("Access-Control-Allow-Origin", GITHUB_PAGES_ORIGIN);
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type"
    );
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, DELETE, OPTIONS"
    );
    response.headers.set("Access-Control-Max-Age", "86400");
    response.headers.set("Vary", "Origin");
  }
  return response;
}

export function jsonWithCors(
  request: NextRequest,
  body: unknown,
  init?: ResponseInit
) {
  return applyCors(request, NextResponse.json(body, init));
}

export function corsPreflight(request: NextRequest) {
  return applyCors(request, new NextResponse(null, { status: 204 }));
}
