"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  Inbox,
  LoaderCircle,
  LogOut,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatShanghaiTimestamp } from "@/lib/format-date";
import type { Question } from "@/lib/types";

type AdminDashboardProps = {
  initialQuestions: Question[];
  loadError: boolean;
};

export function AdminDashboard({
  initialQuestions,
  loadError,
}: AdminDashboardProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState(initialQuestions);
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      initialQuestions.map((question) => [question.id, question.replyText ?? ""])
    )
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  const pendingCount = useMemo(
    () => questions.filter((question) => question.status === "pending").length,
    [questions]
  );
  const publishedCount = questions.length - pendingCount;

  async function publishReply(question: Question) {
    const reply = (drafts[question.id] ?? "").trim();
    if (!reply) {
      toast.error("Write a reply before publishing.");
      return;
    }

    setBusyId(question.id);
    try {
      const response = await fetch(
        `/api/admin/questions/${encodeURIComponent(question.id)}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reply }),
        }
      );
      const data = (await response.json()) as {
        ok?: boolean;
        repliedAt?: number;
        error?: string;
      };

      if (response.status === 401) {
        router.replace("/");
        return;
      }
      if (!response.ok) {
        throw new Error(data.error || "The reply could not be published.");
      }

      setQuestions((current) =>
        current.map((item) =>
          item.id === question.id
            ? {
                ...item,
                replyText: reply,
                repliedAt: data.repliedAt ?? Math.floor(Date.now() / 1000),
                status: "published",
              }
            : item
        )
      );
      toast.success(
        question.status === "published"
          ? "Reply updated on the public board."
          : "Reply published to the public board."
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The reply could not be published."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteQuestion(id: string) {
    setBusyId(id);
    try {
      const response = await fetch(
        `/api/admin/questions/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (response.status === 401) {
        router.replace("/");
        return;
      }
      if (!response.ok) {
        throw new Error(data.error || "The question could not be deleted.");
      }

      setQuestions((current) => current.filter((question) => question.id !== id));
      setDrafts((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      toast.success("Question permanently deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The question could not be deleted."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="page-grid min-h-screen bg-background text-foreground">
      <header className="border-b-2 border-foreground bg-foreground text-background">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-5 px-5 py-5 sm:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-secondary">
              Student Inclusion
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
              Moderation desk
            </h1>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={logout}
            className="rounded-full border-background/50 bg-transparent text-background hover:bg-background hover:text-foreground"
          >
            <LogOut aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-5 pb-24 pt-9 sm:px-8 sm:pt-12">
        <div className="grid gap-5 sm:grid-cols-3">
          <StatCard icon={Inbox} label="All submissions" value={questions.length} />
          <StatCard icon={Clock3} label="Awaiting reply" value={pendingCount} accent />
          <StatCard icon={CheckCircle2} label="Published" value={publishedCount} />
        </div>

        <div className="mb-7 mt-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-primary">
              Oldest first
            </p>
            <h2 className="mt-1 text-4xl font-black tracking-[-0.055em] sm:text-5xl">
              Review queue
            </h2>
          </div>
          <p className="max-w-md text-sm font-semibold leading-6 text-muted-foreground">
            Replying publishes both the question and response. Deletion is permanent.
          </p>
        </div>

        {loadError ? (
          <div className="rounded-[1.75rem] border-2 border-foreground bg-card p-8 text-center shadow-[6px_6px_0_var(--foreground)]">
            <h3 className="text-xl font-black">The review queue could not be loaded.</h3>
            <p className="mt-2 font-medium text-muted-foreground">
              Refresh the page to try again.
            </p>
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-[1.75rem] border-2 border-dashed border-foreground bg-card p-14 text-center">
            <Inbox aria-hidden="true" className="mx-auto mb-4 size-11 text-primary" />
            <h3 className="text-2xl font-black">The queue is clear.</h3>
            <p className="mt-2 font-medium text-muted-foreground">
              New anonymous submissions will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, index) => {
              const isBusy = busyId === question.id;
              const draft = drafts[question.id] ?? "";

              return (
                <article
                  key={question.id}
                  className="rounded-[1.75rem] border-2 border-foreground bg-card p-5 shadow-[6px_6px_0_var(--foreground)] sm:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-foreground px-3 py-1 text-xs font-black text-background">
                        #{index + 1}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.08em] ${
                          question.status === "published"
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-accent text-accent-foreground"
                        }`}
                      >
                        {question.status}
                      </span>
                      <time
                        dateTime={new Date(question.createdAt * 1000).toISOString()}
                        className="font-mono text-xs font-bold text-muted-foreground"
                      >
                        {formatShanghaiTimestamp(question.createdAt)}
                      </time>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={isBusy}
                          aria-label="Delete question"
                          className="shrink-0 rounded-full text-destructive hover:bg-destructive hover:text-white"
                        >
                          <X aria-hidden="true" className="size-5" strokeWidth={2.7} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[1.5rem] border-2 border-foreground bg-card">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this question forever?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This removes the question and any published reply immediately.
                            It cannot be recovered.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep question</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => deleteQuestion(question.id)}
                          >
                            Delete permanently
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="mt-5 rounded-[1.25rem] bg-muted px-5 py-4 sm:px-6 sm:py-5">
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">
                      Anonymous question
                    </p>
                    <p className="whitespace-pre-wrap text-base font-semibold leading-7 sm:text-lg">
                      {question.questionText}
                    </p>
                  </div>

                  <div className="mt-5">
                    <label
                      htmlFor={`reply-${question.id}`}
                      className="mb-2 block text-sm font-black"
                    >
                      Official reply
                    </label>
                    <Textarea
                      id={`reply-${question.id}`}
                      value={draft}
                      maxLength={2000}
                      disabled={isBusy}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [question.id]: event.target.value,
                        }))
                      }
                      placeholder="Write the Student Inclusion response…"
                      className="min-h-32 resize-y rounded-[1.25rem] border-2 border-foreground/25 bg-background p-4 text-base font-medium leading-6 focus-visible:border-primary focus-visible:ring-primary/20"
                    />
                    <div className="mt-3 flex items-center justify-between gap-4">
                      <span className="text-xs font-bold tabular-nums text-muted-foreground">
                        {draft.length} / 2000
                      </span>
                      <Button
                        type="button"
                        size="lg"
                        disabled={isBusy || !draft.trim()}
                        onClick={() => publishReply(question)}
                        className="rounded-full bg-primary px-6 font-black text-primary-foreground shadow-[3px_3px_0_var(--foreground)] hover:bg-primary hover:-translate-y-0.5"
                      >
                        {isBusy ? (
                          <LoaderCircle aria-hidden="true" className="animate-spin" />
                        ) : (
                          <Send aria-hidden="true" />
                        )}
                        {question.status === "published" ? "Update reply" : "Reply & publish"}
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: typeof Inbox;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[1.5rem] border-2 border-foreground p-5 shadow-[4px_4px_0_var(--foreground)] ${
        accent ? "bg-accent" : "bg-card"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold text-muted-foreground">{label}</p>
        <Icon aria-hidden="true" className="size-5" />
      </div>
      <p className="mt-2 text-4xl font-black tracking-[-0.06em]">{value}</p>
    </div>
  );
}
