import { pgTable, text, integer, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const symptomLogsTable = pgTable("symptom_logs", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  userId: text("user_id").notNull(),
  date: date("date").notNull(),
  symptomType: text("symptom_type").notNull(),
  severity: integer("severity").notNull(),
  triggers: text("triggers"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSymptomLogSchema = createInsertSchema(symptomLogsTable).omit({ id: true, userId: true, createdAt: true });
export type InsertSymptomLog = z.infer<typeof insertSymptomLogSchema>;
export type SymptomLog = typeof symptomLogsTable.$inferSelect;
