export type QuestionStatus = "pending" | "published";

export type Question = {
  id: string;
  questionText: string;
  replyText: string | null;
  status: QuestionStatus;
  createdAt: number;
  repliedAt: number | null;
};

export type QuestionRow = {
  id: string;
  question_text: string;
  reply_text: string | null;
  status: QuestionStatus;
  created_at: number;
  replied_at: number | null;
};

export function mapQuestionRow(row: QuestionRow): Question {
  return {
    id: row.id,
    questionText: row.question_text,
    replyText: row.reply_text,
    status: row.status,
    createdAt: row.created_at,
    repliedAt: row.replied_at,
  };
}
