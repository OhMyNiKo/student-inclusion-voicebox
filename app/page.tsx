import Link from "next/link";
import { ArrowUpRight, MessageSquareText, ShieldCheck } from "lucide-react";

import { SubmitBox } from "@/components/submit-box";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="page-grid min-h-screen">
        <header className="mx-auto flex w-full max-w-[1480px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30"
            aria-label="Student Inclusion home"
          >
            <span className="grid size-11 place-items-center rounded-full bg-foreground text-sm font-black tracking-[-0.08em] text-background transition-transform group-hover:-rotate-6">
              SI
            </span>
            <span className="text-sm font-extrabold uppercase leading-[1.05] tracking-[0.14em]">
              Student
              <br />
              Inclusion
            </span>
          </Link>

          <Link
            href="/voices"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-foreground bg-card px-5 text-sm font-extrabold transition-transform hover:-translate-y-0.5 hover:bg-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30"
          >
            Public Q&amp;A
            <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={2.5} />
          </Link>
        </header>

        <section className="mx-auto grid w-full max-w-[1480px] flex-1 items-center gap-12 px-5 pb-14 pt-8 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)] lg:px-12 lg:pb-20 lg:pt-10">
          <div className="max-w-3xl">
            <p className="mb-5 flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
              <MessageSquareText aria-hidden="true" className="size-5 text-primary" />
              The official student voicebox
            </p>
            <h1 className="max-w-[820px] text-[clamp(4rem,8.2vw,8.4rem)] font-black leading-[0.82] tracking-[-0.075em]">
              Say it.
              <span className="block text-primary">Completely</span>
              <span className="block">anonymous.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg font-medium leading-7 text-muted-foreground sm:text-xl sm:leading-8">
              No name. No account. Share what should be heard, and the Student
              Inclusion team will take it from here.
            </p>

            <Link
              href="/voices"
              className="mt-8 inline-flex min-h-14 items-center gap-3 rounded-full bg-foreground px-6 text-base font-extrabold text-background shadow-[5px_5px_0_var(--primary)] transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30 lg:mt-10"
            >
              Read questions &amp; replies
              <ArrowUpRight aria-hidden="true" className="size-5" strokeWidth={2.5} />
            </Link>
          </div>

          <div className="relative">
            <div aria-hidden="true" className="absolute -right-3 -top-3 size-24 rounded-full bg-primary sm:-right-7 sm:-top-7" />
            <div aria-hidden="true" className="absolute -bottom-7 -left-5 h-20 w-36 rotate-[-7deg] rounded-full bg-secondary" />
            <div className="relative rounded-[2rem] border-2 border-foreground bg-card p-4 shadow-[10px_10px_0_var(--foreground)] sm:p-6 lg:p-7">
              <div className="mb-6 flex items-start justify-between gap-5 px-1">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-primary">
                    Your message
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.035em] sm:text-3xl">
                    What do you want us to know?
                  </h2>
                </div>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent">
                  <ShieldCheck aria-hidden="true" className="size-5" strokeWidth={2.4} />
                </span>
              </div>

              <SubmitBox />

              <div className="mt-5 rounded-2xl bg-accent px-4 py-3.5 text-sm font-medium leading-5 text-accent-foreground sm:px-5">
                <span className="mr-2 font-black uppercase tracking-[0.08em]">Tip</span>
                Every message is reviewed. Approved questions and our replies
                will be published on the public Q&amp;A board.
              </div>
            </div>
          </div>
        </section>

        <footer className="mx-auto flex w-full max-w-[1480px] items-center justify-between gap-4 px-5 pb-6 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground sm:px-8 lg:px-12">
          <span>Student Inclusion · 2026</span>
          <span className="text-right">Your voice belongs here.</span>
        </footer>
      </div>
    </main>
  );
}
