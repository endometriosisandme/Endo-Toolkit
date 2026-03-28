import { pgTable, text, integer, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const painLogsTable = pgTable("pain_logs", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  userId: text("user_id").notNull(),
  date: date("date").notNull(),
  painScore: integer("pain_score").notNull(),
  painLocation: text("pain_location").notNull(),
  painType: text("pain_type").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPainLogSchema = createInsertSchema(painLogsTable).omit({ id: true, userId: true, createdAt: true });
export type InsertPainLog = z.infer<typeof insertPainLogSchema>;
export type PainLog = typeof painLogsTable.$inferSelect;
