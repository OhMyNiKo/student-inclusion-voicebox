import { getD1 } from "@/db";
import { mapQuestionRow, Question, QuestionRow } from "@/lib/types";

export async function listPublishedQuestions(): Promise<Question[]> {
  const result = await getD1()
    .prepare(
      `SELECT id, question_text, reply_text, status, created_at, replied_at
       FROM questions
       WHERE status = ? AND reply_text IS NOT NULL
       ORDER BY created_at DESC, id DESC
       LIMIT 500`
    )
    .bind("published")
    .all<QuestionRow>();

  return result.results.map(mapQuestionRow);
}

export async function listAllQuestions(): Promise<Question[]> {
  const result = await getD1()
    .prepare(
      `SELECT id, question_text, reply_text, status, created_at, replied_at
       FROM questions
       ORDER BY created_at ASC, id ASC
       LIMIT 1000`
    )
    .all<QuestionRow>();

  return result.results.map(mapQuestionRow);
}
