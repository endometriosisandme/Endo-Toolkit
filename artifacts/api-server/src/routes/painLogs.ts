import { Router, type IRouter } from "express";
import { db, painLogsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { CreatePainLogBody, DeletePainLogParams } from "@workspace/api-zod";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/pain-logs", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const logs = await db
    .select()
    .from(painLogsTable)
    .where(eq(painLogsTable.userId, req.user.id))
    .orderBy(desc(painLogsTable.date));
  res.json(logs.map(log => ({
    ...log,
    date: log.date,
    createdAt: log.createdAt.toISOString(),
  })));
});

router.post("/pain-logs", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const body = CreatePainLogBody.parse(req.body);
  const [log] = await db
    .insert(painLogsTable)
    .values({
      ...body,
      id: sql`gen_random_uuid()`,
      userId: req.user.id,
    })
    .returning();
  res.status(201).json({
    ...log,
    date: log.date,
    createdAt: log.createdAt.toISOString(),
  });
});

router.delete("/pain-logs/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { id } = DeletePainLogParams.parse(req.params);
  const deleted = await db
    .delete(painLogsTable)
    .where(and(eq(painLogsTable.id, id), eq(painLogsTable.userId, req.user.id)))
    .returning();
  if (!deleted.length) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
