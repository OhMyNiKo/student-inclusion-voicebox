"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX_LENGTH = 1000;

type SubmissionResponse = {
  ok?: boolean;
  destination?: string;
  error?: string;
};

async function sendFeedback(message: string, website = "") {
  const response = await fetch("/api/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, website }),
  });
  const data = (await response.json()) as SubmissionResponse;

  if (!response.ok) {
    throw new Error(data.error || "Your message could not be sent.");
  }

  return data;
}

export function SubmitBox() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: {
              name: string;
              title: string;
              description: string;
              inputSchema: object;
              annotations: {
                readOnlyHint: boolean;
                untrustedContentHint: boolean;
              };
              execute: (input: unknown) => Promise<unknown>;
            },
            options: { signal: AbortSignal }
          ) => void | Promise<void>;
        };
      }
    ).modelContext;

    if (!context?.registerTool) return;
    const lifecycle = new AbortController();

    void Promise.resolve(
      context.registerTool(
        {
          name: "submit_anonymous_feedback",
          title: "Submit anonymous feedback",
          description:
            "Submit one anonymous message to the Student Inclusion review queue.",
          inputSchema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                minLength: 1,
                maxLength: MAX_LENGTH,
                description: "The anonymous feedback message to submit.",
              },
            },
            required: ["message"],
            additionalProperties: false,
          },
          annotations: {
            readOnlyHint: false,
            untrustedContentHint: false,
          },
          async execute(input) {
            const candidate = (input as { message?: unknown })?.message;
            if (typeof candidate !== "string" || !candidate.trim()) {
              throw new Error("A non-empty message is required.");
            }
            const trimmed = candidate.trim();
            if (trimmed.length > MAX_LENGTH) {
              throw new Error(`Messages must be ${MAX_LENGTH} characters or fewer.`);
            }

            const data = await sendFeedback(trimmed);
            if (data.destination === "/admin") {
              router.push("/admin");
              router.refresh();
              return { status: "admin_session_started" };
            }

            setMessage("");
            toast.success("Message sent. Thank you for speaking up.");
            return { status: "submitted" };
          },
        },
        { signal: lifecycle.signal }
      )
    ).catch(() => undefined);

    return () => lifecycle.abort();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();

    if (!trimmed) {
      toast.error("Please write a message before sending.");
      return;
    }

    setIsSending(true);
    try {
      const data = await sendFeedback(trimmed, website);

      if (data.destination === "/admin") {
        router.push("/admin");
        router.refresh();
        return;
      }

      setMessage("");
      toast.success("Message sent. Thank you for speaking up.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="message" className="sr-only">
        Anonymous message
      </label>
      <Textarea
        id="message"
        name="message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        maxLength={MAX_LENGTH}
        disabled={isSending}
        placeholder="Type freely. No name is attached to your message…"
        className="min-h-[220px] resize-none rounded-[1.5rem] border-2 border-foreground/20 bg-background p-5 text-base font-medium leading-7 shadow-none placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-primary/20 sm:min-h-[260px] sm:p-6 sm:text-lg"
      />

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <span className="text-xs font-bold tabular-nums tracking-wide text-muted-foreground">
          {message.length} / {MAX_LENGTH}
        </span>
        <Button
          type="submit"
          size="lg"
          disabled={isSending || !message.trim()}
          className="min-h-13 rounded-full bg-primary px-6 text-base font-black text-primary-foreground shadow-[4px_4px_0_var(--foreground)] hover:bg-primary hover:-translate-y-0.5 active:translate-y-0"
        >
          {isSending ? (
            <>
              Sending
              <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
            </>
          ) : (
            <>
              Submit
              <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2.7} />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
