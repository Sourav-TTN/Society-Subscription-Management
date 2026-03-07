import {
  date,
  text,
  uuid,
  pgTable,
  numeric,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const societiesTable = pgTable("societies", {
  societyId: uuid("society_id").defaultRandom().notNull().primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  pin: integer("pin").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const usersTable = pgTable("users", {
  userId: uuid("user_id").notNull().defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  isVerified: boolean("is_verified").default(true).notNull(),
  otp: integer("otp"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const adminsTable = pgTable("admins", {
  adminId: uuid("admin_id").defaultRandom().notNull().primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  societyId: uuid("society_id")
    .notNull()
    .references(() => societiesTable.societyId, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const flatTypesTable = pgTable("flat_types", {
  flatTypeId: uuid("flat_type_id").defaultRandom().notNull().primaryKey(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const flatsTable = pgTable("flats", {
  flatId: uuid("flat_id").defaultRandom().notNull().primaryKey(),
  flatBlock: text("flat_block").notNull(),
  flatFloor: integer("flat_floor").notNull(),
  flatNumber: text("flat_number").notNull(),
  societyId: uuid("society_id")
    .notNull()
    .references(() => societiesTable.societyId),
  flatTypeId: uuid("flat_type_id")
    .notNull()
    .references(() => flatTypesTable.flatTypeId),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const flatRecipientsTable = pgTable("flat_recipients", {
  flatRecipientId: uuid("flat_recipient_id")
    .defaultRandom()
    .notNull()
    .primaryKey(),
  flatId: uuid("flat_id")
    .notNull()
    .references(() => flatsTable.flatId),
  ownerEmail: text("owner_email")
    .notNull()
    .references(() => usersTable.email),
  ownerId: uuid("owner_id").references(() => usersTable.userId),
  isCurrentOwner: boolean("is_current_owner").default(true).notNull(),
  from: date("from", { mode: "date" }).notNull(),
  to: date("to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const subscriptionsTable = pgTable("subscriptions", {
  subscriptionId: uuid("subscription_id")
    .defaultRandom()
    .notNull()
    .primaryKey(),
  societyId: uuid("society_id")
    .notNull()
    .references(() => societiesTable.societyId, { onDelete: "cascade" }),
  flatTypeId: uuid("flat_type_id")
    .notNull()
    .references(() => flatTypesTable.flatTypeId),
  charges: numeric("charges").notNull(),
  effectiveFrom: date("effective_from", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const statusEnum = ["pending", "paid"] as const;

export const billsTable = pgTable("bills", {
  billId: uuid("bill_id").notNull().defaultRandom().primaryKey(),
  flatRecipientId: uuid("flat_recipient_id")
    .notNull()
    .references(() => flatRecipientsTable.flatRecipientId),
  status: text("status", { enum: statusEnum }).default("pending").notNull(),
  subscriptionId: uuid("subscription_id")
    .notNull()
    .references(() => subscriptionsTable.subscriptionId),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const paymentViaEnum = ["cash", "upi", "online"] as const;

export const paymentsTable = pgTable("payments", {
  paymentId: uuid("payment_id").notNull().defaultRandom().primaryKey(),
  billId: uuid("bill_id")
    .notNull()
    .references(() => billsTable.billId),
  amount: numeric("amount").notNull(),
  paymentVia: text("payment_via", { enum: paymentViaEnum }).notNull(),
  paidAt: timestamp("paid_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const notificationsTable = pgTable("notifications", {
  notificationId: uuid("notification_id")
    .notNull()
    .defaultRandom()
    .primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const notificationRecipientsTable = pgTable("notification_recipients", {
  notificationRecipientId: uuid("notification_recipient_id")
    .defaultRandom()
    .notNull()
    .primaryKey(),
  notificationId: uuid("notification_id")
    .notNull()
    .references(() => notificationsTable.notificationId),
  flatRecipientId: uuid("flat_recipient_id")
    .notNull()
    .references(() => flatRecipientsTable.flatRecipientId),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});
