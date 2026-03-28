import { Router, type IRouter } from "express";
import { db, painLogsTable, symptomLogsTable, medicationLogsTable } from "@workspace/db";
import { eq, gte, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/reports/summary", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

  const [painLogs, symptomLogs, medicationLogs] = await Promise.all([
    db
      .select()
      .from(painLogsTable)
      .where(eq(painLogsTable.userId, req.user.id))
      .orderBy(desc(painLogsTable.date)),
    db
      .select()
      .from(symptomLogsTable)
      .where(eq(symptomLogsTable.userId, req.user.id))
      .orderBy(desc(symptomLogsTable.date)),
    db
      .select()
      .from(medicationLogsTable)
      .where(eq(medicationLogsTable.userId, req.user.id))
      .orderBy(desc(medicationLogsTable.createdAt)),
  ]);

  const recentPainLogs = painLogs.filter(l => l.date >= thirtyDaysAgoStr);
  const recentSymptomLogs = symptomLogs.filter(l => l.date >= thirtyDaysAgoStr);
  const recentMedLogs = medicationLogs.filter(l => l.createdAt >= thirtyDaysAgo);

  const averagePainScore =
    recentPainLogs.length > 0
      ? recentPainLogs.reduce((sum, l) => sum + l.painScore, 0) / recentPainLogs.length
      : null;

  const symptomCounts: Record<string, number> = {};
  for (const log of recentSymptomLogs) {
    symptomCounts[log.symptomType] = (symptomCounts[log.symptomType] || 0) + 1;
  }
  const mostFrequentSymptoms = Object.entries(symptomCounts)
    .map(([symptomType, count]) => ({ symptomType, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const painTrend = recentPainLogs
    .map(l => ({ date: l.date, painScore: l.painScore }))
    .reverse();

  const medCounts: Record<string, { count: number; totalRelief: number }> = {};
  for (const log of recentMedLogs) {
    if (!medCounts[log.medicationName]) {
      medCounts[log.medicationName] = { count: 0, totalRelief: 0 };
    }
    medCounts[log.medicationName].count++;
    medCounts[log.medicationName].totalRelief += log.reliefLevel;
  }
  const medicationUsage = Object.entries(medCounts)
    .map(([medicationName, { count, totalRelief }]) => ({
      medicationName,
      count,
      averageRelief: totalRelief / count,
    }))
    .sort((a, b) => b.count - a.count);

  res.json({
    averagePainScore: averagePainScore !== null ? Math.round(averagePainScore * 10) / 10 : null,
    totalPainLogs: recentPainLogs.length,
    totalSymptomLogs: recentSymptomLogs.length,
    totalMedicationLogs: recentMedLogs.length,
    mostFrequentSymptoms,
    painTrend,
    medicationUsage,
  });
});

export default router;
