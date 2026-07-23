import { desc, eq, max } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { documents } from "../../../../../db/schema";

type DocumentPayload = { kind?: string; content?: string };

function errorMessage(error: unknown) {
  const text = error instanceof Error ? error.message : "Unexpected error";
  return text.includes("no such table")
    ? "Database tables are not available yet. Deploy the migration before saving documents."
    : text;
}

export async function GET(_: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await context.params;
    const db = getDb();
    const rows = await db.select().from(documents)
      .where(eq(documents.projectId, projectId))
      .orderBy(desc(documents.createdAt), desc(documents.version));
    return Response.json({ documents: rows });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await context.params;
    const body = (await request.json()) as DocumentPayload;
    const kind = body.kind?.trim() ?? "";
    const content = body.content?.trim() ?? "";
    if (!kind || !content) {
      return Response.json({ error: "kind and content are required" }, { status: 400 });
    }
    const db = getDb();
    const [current] = await db.select({ version: max(documents.version) }).from(documents)
      .where(eq(documents.projectId, projectId));
    const now = new Date();
    const [document] = await db.insert(documents).values({
      id: crypto.randomUUID(), projectId, kind, content,
      version: (current?.version ?? 0) + 1, createdAt: now, updatedAt: now,
    }).returning();
    return Response.json({ document }, { status: 201 });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
