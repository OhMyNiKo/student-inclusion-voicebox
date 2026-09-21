CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`question_text` text NOT NULL,
	`reply_text` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`replied_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_questions_status_created_at` ON `questions` (`status`,`created_at`);
--> statement-breakpoint
PRAGMA optimize;
