import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MessageCircleMore, PenLine } from "lucide-react";

import { formatShanghaiTimestamp } from "@/lib/format-date";
import { listPublishedQuestions } from "@/lib/questions";
import type { Question } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Public Q&A",
  description: "Reviewed student questions and replies from Student Inclusion.",
};

export default async function VoicesPage() {
  let questions: Question[] = [];
  let couldNotLoad = false;

  try {
    questions = await listPublishedQuestions();
  } catch {
    couldNotLoad = true;
  }

  return (
    <main className="page-grid min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b-2 border-foreground bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1840px] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30"
          >
            <ArrowLeft aria-hidden="true" className="size-5" strokeWidth={2.6} />
            Back to voicebox
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-black text-primary-foreground shadow-[3px_3px_0_var(--foreground)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30"
          >
            <PenLine aria-hidden="true" className="size-4" />
            Ask anonymously
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1840px] px-5 pb-20 pt-12 sm:px-8 lg:px-10 lg:pt-16">
        <div className="mb-10 grid items-end gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.16em] text-primary">
              Public Q&amp;A board
            </p>
            <h1 className="text-[clamp(3.5rem,7vw,7.5rem)] font-black leading-[0.86] tracking-[-0.07em]">
              Heard. Reviewed.
              <span className="block">Answered.</span>
            </h1>
          </div>
          <div className="max-w-md rounded-2xl border-2 border-foreground bg-secondary px-5 py-4 text-sm font-bold leading-6 shadow-[5px_5px_0_var(--foreground)]">
            Latest first. Each card shows an anonymous question and the official
            Student Inclusion reply.
          </div>
        </div>

        {couldNotLoad ? (
          <div className="rounded-[2rem] border-2 border-foreground bg-card px-6 py-16 text-center shadow-[7px_7px_0_var(--foreground)]">
            <MessageCircleMore aria-hidden="true" className="mx-auto mb-5 size-12 text-primary" />
            <h2 className="text-2xl font-black">The board is taking a short pause.</h2>
            <p className="mx-auto mt-2 max-w-md font-medium text-muted-foreground">
              Published questions could not be loaded. Please refresh in a moment.
            </p>
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-[2rem] border-2 border-dashed border-foreground bg-card px-6 py-20 text-center">
            <MessageCircleMore aria-hidden="true" className="mx-auto mb-5 size-12 text-primary" />
            <h2 className="text-2xl font-black">No published questions yet.</h2>
            <p className="mx-auto mt-2 max-w-md font-medium text-muted-foreground">
              Once the team reviews and replies to a submission, it will appear here.
            </p>
            <Link
              href="/"
              className="mt-7 inline-flex min-h-12 items-center rounded-full bg-foreground px-6 font-extrabold text-background"
            >
              Be the first to ask
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-[1700px]:grid-cols-5">
            {questions.map((question, index) => (
              <article
                key={question.id}
                className="flex h-[350px] min-w-0 flex-col rounded-[1.75rem] border-2 border-foreground bg-card p-4 shadow-[6px_6px_0_var(--foreground)]"
              >
                <div className="flex items-start justify-between gap-3 px-1 pb-3">
                  <span className="rounded-full bg-accent px-3 py-1 text-[0.7rem] font-black uppercase tracking-[0.11em]">
                    Voice #{questions.length - index}
                  </span>
                  <time
                    dateTime={new Date(question.createdAt * 1000).toISOString()}
                    className="text-right font-mono text-[0.66rem] font-bold leading-4 text-muted-foreground"
                  >
                    {formatShanghaiTimestamp(question.createdAt)}
                  </time>
                </div>

                <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-1 pb-1 pr-2">
                  <div className="max-w-[92%] self-start rounded-[1.25rem] rounded-bl-sm bg-muted px-4 py-3">
                    <p className="mb-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted-foreground">
                      Anonymous student
                    </p>
                    <p className="whitespace-pre-wrap text-sm font-semibold leading-5">
                      {question.questionText}
                    </p>
                  </div>

                  <div className="max-w-[92%] self-end rounded-[1.25rem] rounded-br-sm bg-foreground px-4 py-3 text-background">
                    <p className="mb-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-secondary">
                      Student Inclusion
                    </p>
                    <p className="whitespace-pre-wrap text-sm font-semibold leading-5">
                      {question.replyText}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
