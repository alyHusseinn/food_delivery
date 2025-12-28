import exp from "constants";
import { pgTable, serial, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

const roles = ["customer", "owner"] as const;

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
    role: varchar("role", { length: 50 }).default("user").notNull(),
    verifed: boolean("verifed").default(false).notNull(),
    otpHash: varchar("otp_hash", { length: 255 }),
    otpCreatedAt: timestamp("otp_created_at"),
    otpExpiredAt: timestamp("otp_expired_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;