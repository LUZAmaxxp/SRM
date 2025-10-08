import { like } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  timestamp,
  pgEnum,
  boolean,
  AnyPgColumn,
  integer,
  json,
} from "drizzle-orm/pg-core";

// ENUMS
export const statusEnum = pgEnum("status", [
  "Pilot",
  "Production",
  "Ongoing",
  "Completed",
  "Biodiversity Challenge",
]);

export const commentStatus = pgEnum("comment_status", ["approved", "flagged"]);

export const visibilityLevelEnum = pgEnum("visibility_level", [
  "public",
  "organization",
  "private",
]);

export const roleEnum = pgEnum("role", [
  "admin",
  "publisher",
  "default",
  "member",
]);

// ORGANIZATION TABLE
export const organization = pgTable("organization", {
  id: text("id").primaryKey().unique(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull(),
  metadata: text("metadata"),
});

// USER TABLE
export const user = pgTable("user", {
  id: text("id").primaryKey().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  password: text("password"),
  image: text("image"),
  role: roleEnum("role").default("default").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @PURE */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @PURE */ new Date())
    .notNull(),
});

// SESSION TABLE
export const session = pgTable("session", {
  id: text("id").primaryKey().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: text("active_organization_id").references(
    () => organization.id
  ),
});

// ACCOUNT TABLE
export const account = pgTable("account", {
  id: text("id").primaryKey().unique(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// VERIFICATION TABLE
export const verification = pgTable("verification", {
  id: text("id").primaryKey().unique(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => /* @PURE */ new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => /* @PURE */ new Date()),
});

// MEMBER TABLE
export const member = pgTable("member", {
  id: text("id").primaryKey().unique(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: roleEnum("role").default("default").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

// INVITATION TABLE
export const invitation = pgTable("invitation", {
  id: text("id").primaryKey().unique(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// INITIATIVE TABLE
export const initiative = pgTable("initiative", {
  id: text("id").primaryKey().unique(),
  institution: varchar("institution", { length: 255 }),
  title: varchar("title", { length: 255 }),
  status: statusEnum("status"),

  duration_start: timestamp("duration_start"),
  duration_end: timestamp("duration_end"),

  use_case: text("use_case"),

  blockchain_type: varchar("blockchain_type", { length: 255 }),
  blockchain_network: varchar("blockchain_network", { length: 255 }),

  website: text("website"), // nullable
  description: text("description"),

  // related_functional_areas and related_operational_domains moved to separate tables

  organization_id: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),

  notes: text("notes"),

  // New fields
  countries_concerned: json("countries_concerned"), // array of country names
  photo_link: text("photo_link"), // official photo link
});

// Initiative Functional Areas Table
export const initiativeFunctionalArea = pgTable("initiative_functional_area", {
  id: text("id").primaryKey().unique(),

  initiative_id: text("initiative_id")
    .notNull()
    .references(() => initiative.id, { onDelete: "cascade" }),

  rfa_title: text("rfa_title").notNull(),
  rfa_content: text("rfa_content").notNull(),
});

// Initiative Operational Domains Table
export const initiativeOperationalDomain = pgTable(
  "initiative_operational_domain",
  {
    id: text("id").primaryKey().unique(),
    initiative_id: text("initiative_id")
      .notNull()
      .references(() => initiative.id, { onDelete: "cascade" }),
    rod_title: text("rod_title").notNull(),
    rod_content: text("rod_content").notNull(),
  }
);

// COMMENT TABLE
export const comment = pgTable("comment", {
  id: text("id").primaryKey().unique(),
  content: text("content").notNull(),
  status: commentStatus("status").default("approved"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),

  likes: integer("likes").default(0),

  initiativeId: text("initiative")
    .notNull()
    .references(() => initiative.id, { onDelete: "cascade" }),
  userId: text("user")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  replyTo: text("reply_to").references((): AnyPgColumn => comment.id),
});

// INITIATIVE LIKE TABLE
export const initiativeLike = pgTable("initiative_like", {

  id: text("id").primaryKey().unique(),

  initiativeId: text("initiative_id")
    .notNull()
    .references(() => initiative.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// NOTIFICATION TABLE
export const notification = pgTable("notification", {

  id: text("id").primaryKey().unique(),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  data: json("data"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// **********************
export default {
  user,
  organization,
  member,
  initiative,
  account,
  session,
  verification,
  invitation,
  comment,
  initiativeLike,
  notification,
};
