import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

const roles = ["user", "restaurant_owner"] as const;

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
    role: varchar("role", { length: 50 }).default("user").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;