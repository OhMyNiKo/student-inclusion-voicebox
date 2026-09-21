import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin-dashboard";
import { ADMIN_COOKIE_NAME, isValidAdminSession } from "@/lib/admin-auth";
import { listAllQuestions } from "@/lib/questions";
import type { Question } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Moderation",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAdmin = await isValidAdminSession(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value
  );

  if (!isAdmin) redirect("/");

  let questions: Question[] = [];
  let loadError = false;
  try {
    questions = await listAllQuestions();
  } catch {
    loadError = true;
  }

  return <AdminDashboard initialQuestions={questions} loadError={loadError} />;
}
