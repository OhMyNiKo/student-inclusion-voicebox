import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const questions = sqliteTable(
  "questions",
  {
    id: text("id").primaryKey(),
    questionText: text("question_text").notNull(),
    replyText: text("reply_text"),
    status: text("status", { enum: ["pending", "published"] })
      .notNull()
      .default("pending"),
    createdAt: integer("created_at").notNull(),
    repliedAt: integer("replied_at"),
  },
  (table) => [
    index("idx_questions_status_created_at").on(
      table.status,
      table.createdAt
    ),
  ]
);
