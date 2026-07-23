import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
};

export const clients = sqliteTable("clients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  notes: text("notes"),
  ...timestamps,
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().references(() => clients.id),
  name: text("name").notNull(),
  status: text("status").notNull().default("draft"),
  packageType: text("package_type").notNull().default("professional"),
  platform: text("platform").notNull().default("web_tablet"),
  estimatedValue: real("estimated_value").notNull().default(0),
  estimatedWeeks: integer("estimated_weeks").notNull().default(0),
  meetingNotes: text("meeting_notes"),
  ...timestamps,
}, (table) => [index("projects_client_id_idx").on(table.clientId), index("projects_status_idx").on(table.status)]);

export const projectModules = sqliteTable("project_modules", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id),
  moduleKey: text("module_key").notNull(),
  moduleName: text("module_name").notNull(),
  price: real("price").notNull().default(0),
  selectedOptions: text("selected_options").notNull().default("[]"),
  ...timestamps,
}, (table) => [index("project_modules_project_id_idx").on(table.projectId)]);

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id),
  kind: text("kind").notNull(),
  version: integer("version").notNull().default(1),
  content: text("content").notNull(),
  ...timestamps,
}, (table) => [index("documents_project_id_idx").on(table.projectId)]);
