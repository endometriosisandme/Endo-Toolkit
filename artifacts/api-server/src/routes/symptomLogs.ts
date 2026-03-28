import { Router, type IRouter } from "express";
import { db, symptomLogsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { CreateSymptomLogBody, DeleteSymptomLogParams } from "@workspace/api-zod";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/symptom-logs", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const logs = await db
    .select()
    .from(symptomLogsTable)
    .where(eq(symptomLogsTable.userId, req.user.id))
    .orderBy(desc(symptomLogsTable.date));
  res.json(logs.map(log => ({
    ...log,
    date: log.date,
    createdAt: log.createdAt.toISOString(),
  })));
});

router.post("/symptom-logs", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const body = CreateSymptomLogBody.parse(req.body);
  const [log] = await db
    .insert(symptomLogsTable)
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

router.delete("/symptom-logs/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { id } = DeleteSymptomLogParams.parse(req.params);
  const deleted = await db
    .delete(symptomLogsTable)
    .where(and(eq(symptomLogsTable.id, id), eq(symptomLogsTable.userId, req.user.id)))
    .returning();
  if (!deleted.length) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
