import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { clients, documents, projectModules, projects } from "../../../../db/schema";

type ProjectPayload = {
  clientName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  projectName?: string;
  status?: string;
  packageType?: string;
  platform?: string;
  estimatedValue?: number;
  estimatedWeeks?: number;
  meetingNotes?: string;
  modules?: Array<{ key: string; name: string; price?: number; options?: string[] }>;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected error";
}

export async function GET(_: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await context.params;
    const db = getDb();
    const [project] = await db
      .select({
        id: projects.id,
        clientId: projects.clientId,
        name: projects.name,
        status: projects.status,
        packageType: projects.packageType,
        platform: projects.platform,
        estimatedWeeks: projects.estimatedWeeks,
        meetingNotes: projects.meetingNotes,
        clientName: clients.name,
        contactName: clients.contactName,
        email: clients.email,
        phone: clients.phone,
      })
      .from(projects)
      .innerJoin(clients, eq(projects.clientId, clients.id))
      .where(eq(projects.id, projectId));

    if (!project) return Response.json({ error: "Project not found" }, { status: 404 });

    const moduleRows = await db.select().from(projectModules).where(eq(projectModules.projectId, projectId));
    return Response.json({
      project: {
        ...project,
        modules: moduleRows.map((module) => ({
          key: module.moduleKey,
          options: JSON.parse(module.selectedOptions || "[]") as string[],
        })),
      },
    });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await context.params;
    const body = (await request.json()) as ProjectPayload;
    const clientName = body.clientName?.trim() ?? "";
    const projectName = body.projectName?.trim() ?? "";
    if (!clientName || !projectName) {
      return Response.json({ error: "clientName and projectName are required" }, { status: 400 });
    }

    const db = getDb();
    const [existing] = await db.select({ clientId: projects.clientId }).from(projects).where(eq(projects.id, projectId));
    if (!existing) return Response.json({ error: "Project not found" }, { status: 404 });

    const now = new Date();
    await db.update(clients).set({
      name: clientName,
      contactName: body.contactName?.trim() || null,
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      updatedAt: now,
    }).where(eq(clients.id, existing.clientId));

    await db.update(projects).set({
      name: projectName,
      status: body.status ?? "draft",
      packageType: body.packageType ?? "professional",
      platform: body.platform ?? "web_tablet",
      estimatedValue: body.estimatedValue ?? 0,
      estimatedWeeks: body.estimatedWeeks ?? 0,
      meetingNotes: body.meetingNotes ?? null,
      updatedAt: now,
    }).where(eq(projects.id, projectId));

    await db.delete(projectModules).where(eq(projectModules.projectId, projectId));
    const selectedModules = body.modules ?? [];
    if (selectedModules.length) {
      await db.insert(projectModules).values(selectedModules.map((module) => ({
        id: crypto.randomUUID(), projectId, moduleKey: module.key, moduleName: module.name,
        price: module.price ?? 0, selectedOptions: JSON.stringify(module.options ?? []), createdAt: now, updatedAt: now,
      })));
    }

    return Response.json({ projectId, updated: true });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await context.params;
    const db = getDb();
    const [existing] = await db.select({ clientId: projects.clientId }).from(projects).where(eq(projects.id, projectId));
    if (!existing) return Response.json({ error: "Project not found" }, { status: 404 });

    await db.delete(documents).where(eq(documents.projectId, projectId));
    await db.delete(projectModules).where(eq(projectModules.projectId, projectId));
    await db.delete(projects).where(eq(projects.id, projectId));
    await db.delete(clients).where(eq(clients.id, existing.clientId));

    return Response.json({ projectId, deleted: true });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
