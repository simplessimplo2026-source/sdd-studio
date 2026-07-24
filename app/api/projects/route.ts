import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { clients, projectModules, projects } from "../../../db/schema";

type CreateProjectPayload = {
  clientName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  projectName?: string;
  packageType?: string;
  platform?: string;
  estimatedValue?: number;
  estimatedWeeks?: number;
  meetingNotes?: string;
  modules?: Array<{ key: string; name: string; price?: number; options?: string[] }>;
};

function message(error: unknown) {
  const text = error instanceof Error ? error.message : "Unexpected error";
  if (text.includes("no such table")) {
    return "Database tables are not available yet. Deploy the generated migration before using project records.";
  }
  return text;
}

export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        packageType: projects.packageType,
        platform: projects.platform,
        estimatedValue: projects.estimatedValue,
        updatedAt: projects.updatedAt,
        clientName: clients.name,
      })
      .from(projects)
      .innerJoin(clients, eq(projects.clientId, clients.id))
      .orderBy(desc(projects.updatedAt));

    return Response.json({ projects: rows });
  } catch (error) {
    return Response.json({ error: message(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateProjectPayload;
    const clientName = body.clientName?.trim() ?? "";
    const projectName = body.projectName?.trim() ?? "";
    if (!clientName || !projectName) {
      return Response.json({ error: "clientName and projectName are required" }, { status: 400 });
    }

    const db = getDb();
    const now = new Date();
    const clientId = crypto.randomUUID();
    const projectId = crypto.randomUUID();
    await db.insert(clients).values({ id: clientId, name: clientName, contactName: body.contactName?.trim() || null, email: body.email?.trim() || null, phone: body.phone?.trim() || null, createdAt: now, updatedAt: now });
    await db.insert(projects).values({
      id: projectId,
      clientId,
      name: projectName,
      packageType: body.packageType ?? "professional",
      platform: body.platform ?? "web_tablet",
      estimatedValue: body.estimatedValue ?? 0,
      estimatedWeeks: body.estimatedWeeks ?? 0,
      meetingNotes: body.meetingNotes ?? null,
      createdAt: now,
      updatedAt: now,
    });

    const selectedModules = body.modules ?? [];
    if (selectedModules.length) {
      await db.insert(projectModules).values(selectedModules.map((module) => ({
        id: crypto.randomUUID(), projectId, moduleKey: module.key, moduleName: module.name,
        price: module.price ?? 0, selectedOptions: JSON.stringify(module.options ?? []), createdAt: now, updatedAt: now,
      })));
    }

    return Response.json({ projectId, clientId }, { status: 201 });
  } catch (error) {
    return Response.json({ error: message(error) }, { status: 500 });
  }
}
