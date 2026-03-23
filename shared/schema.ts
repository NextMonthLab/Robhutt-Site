import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const strategies = pgTable("strategies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull().default("My Strategy"),
  status: text("status").notNull().default("draft"),
  characterxFraming: text("characterx_framing"),
  visitorToken: text("visitor_token"),
  guide: text("guide").default("norman"),
  mode: text("mode").default("business"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Strategy = typeof strategies.$inferSelect;
export type InsertStrategy = typeof strategies.$inferInsert;

export const planNotes = pgTable("plan_notes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  strategyId: integer("strategy_id").notNull().references(() => strategies.id),
  authorId: varchar("author_id").references(() => users.id),
  authorEmail: text("author_email"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PlanNote = typeof planNotes.$inferSelect;
export type InsertPlanNote = typeof planNotes.$inferInsert;
