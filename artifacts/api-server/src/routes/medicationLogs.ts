import { Router, type IRouter } from "express";
import { db, medicationLogsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { CreateMedicationLogBody, DeleteMedicationLogParams } from "@workspace/api-zod";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/medication-logs", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const logs = await db
    .select()
    .from(medicationLogsTable)
    .where(eq(medicationLogsTable.userId, req.user.id))
    .orderBy(desc(medicationLogsTable.createdAt));
  res.json(logs.map(log => ({
    ...log,
    timeTaken: log.timeTaken.toISOString(),
    createdAt: log.createdAt.toISOString(),
  })));
});

router.post("/medication-logs", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const body = CreateMedicationLogBody.parse(req.body);
  const [log] = await db
    .insert(medicationLogsTable)
    .values({
      ...body,
      id: sql`gen_random_uuid()`,
      userId: req.user.id,
      timeTaken: new Date(body.timeTaken),
    })
    .returning();
  res.status(201).json({
    ...log,
    timeTaken: log.timeTaken.toISOString(),
    createdAt: log.createdAt.toISOString(),
  });
});

router.delete("/medication-logs/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { id } = DeleteMedicationLogParams.parse(req.params);
  const deleted = await db
    .delete(medicationLogsTable)
    .where(and(eq(medicationLogsTable.id, id), eq(medicationLogsTable.userId, req.user.id)))
    .returning();
  if (!deleted.length) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
