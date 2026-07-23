CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`contact_name` text,
	`email` text,
	`phone` text,
	`company` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`kind` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `documents_project_id_idx` ON `documents` (`project_id`);--> statement-breakpoint
CREATE TABLE `project_modules` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`module_key` text NOT NULL,
	`module_name` text NOT NULL,
	`price` real DEFAULT 0 NOT NULL,
	`selected_options` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `project_modules_project_id_idx` ON `project_modules` (`project_id`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`package_type` text DEFAULT 'professional' NOT NULL,
	`platform` text DEFAULT 'web_tablet' NOT NULL,
	`estimated_value` real DEFAULT 0 NOT NULL,
	`estimated_weeks` integer DEFAULT 0 NOT NULL,
	`meeting_notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `projects_client_id_idx` ON `projects` (`client_id`);--> statement-breakpoint
CREATE INDEX `projects_status_idx` ON `projects` (`status`);