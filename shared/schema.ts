import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  fullName: text("full_name").notNull(),
  college: text("college").notNull(),
  verified: boolean("verified").default(false),
  verificationStatus: text("verification_status").$type<'pending' | 'approved' | 'rejected'>().default('pending'),
  idUploaded: boolean("id_uploaded").default(false),
  idUrl: text("id_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  moderationStatus: text("moderation_status").$type<'pending' | 'approved' | 'rejected' | 'flagged'>().default('pending'),
  flaggedBy: text("flagged_by").array(),
  flagReason: text("flag_reason"),
  priority: text("priority").$type<'low' | 'medium' | 'high'>().default('low'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const verificationRequests = pgTable("verification_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  college: text("college").notNull(),
  status: text("status").$type<'pending' | 'approved' | 'rejected'>().default('pending'),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const moderationLogs = pgTable("moderation_logs", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id),
  action: text("action").notNull(),
  moderatorId: text("moderator_id").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemStats = pgTable("system_stats", {
  id: serial("id").primaryKey(),
  totalUsers: integer("total_users").default(0),
  pendingVerifications: integer("pending_verifications").default(0),
  activeChats: integer("active_chats").default(0),
  apiRequests: integer("api_requests").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVerificationRequestSchema = createInsertSchema(verificationRequests).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
});

export const insertModerationLogSchema = createInsertSchema(moderationLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type VerificationRequest = typeof verificationRequests.$inferSelect;
export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;
export type ModerationLog = typeof moderationLogs.$inferSelect;
export type InsertModerationLog = z.infer<typeof insertModerationLogSchema>;
export type SystemStats = typeof systemStats.$inferSelect;

// Domain validation schema
export const emailDomainSchema = z.object({
  email: z.string().email().refine((email) => {
    const validDomains = [
      '.edu',
      '@stanford.edu',
      '@mit.edu',
      '@harvard.edu',
      '@iitm.ac.in',
      '@iitd.ac.in',
      '@iitb.ac.in',
      '@berkeley.edu',
      '@ucla.edu',
    ];
    return validDomains.some(domain => email.endsWith(domain) || email.includes(domain));
  }, {
    message: "Email must be from a recognized educational institution"
  })
});
