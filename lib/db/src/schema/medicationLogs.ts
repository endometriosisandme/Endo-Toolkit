import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const medicationLogsTable = pgTable("medication_logs", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  userId: text("user_id").notNull(),
  medicationName: text("medication_name").notNull(),
  dose: text("dose").notNull(),
  timeTaken: timestamp("time_taken", { withTimezone: true }).notNull(),
  reliefLevel: integer("relief_level").notNull(),
  sideEffects: text("side_effects"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMedicationLogSchema = createInsertSchema(medicationLogsTable).omit({ id: true, userId: true, createdAt: true });
export type InsertMedicationLog = z.infer<typeof insertMedicationLogSchema>;
export type MedicationLog = typeof medicationLogsTable.$inferSelect;
