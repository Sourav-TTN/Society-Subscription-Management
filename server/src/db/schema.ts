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
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

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

export const societiesRelations = relations(societiesTable, ({ many }) => ({
  admins: many(adminsTable),
  flats: many(flatsTable),
}));

export type SocietiesSelectType = typeof societiesTable.$inferSelect;
export type SocietiesInsertType = typeof societiesTable.$inferInsert;

export const societiesInsertSchema = createInsertSchema(societiesTable);

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

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  flatRecipients: many(flatRecipientsTable),
}));

export type UsersSelectType = typeof usersTable.$inferSelect;
export type UsersInsertType = typeof usersTable.$inferInsert;

export const usersInsertSchema = createInsertSchema(usersTable);

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

export const adminsRelations = relations(adminsTable, ({ one, many }) => ({
  society: one(societiesTable, {
    fields: [adminsTable.societyId],
    references: [societiesTable.societyId],
  }),
  flats: many(flatsTable),
  subscriptions: many(subscriptionsTable),
}));

export type AdminsSelectType = typeof adminsTable.$inferSelect;
export type AdminsInsertType = typeof adminsTable.$inferInsert;

export const adminsInsertSchema = createInsertSchema(adminsTable);

export const flatTypesTable = pgTable("flat_types", {
  flatTypeId: uuid("flat_type_id").defaultRandom().notNull().primaryKey(),
  size: integer("size").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const flatTypesRelations = relations(flatTypesTable, ({ many }) => ({
  flats: many(flatsTable),
}));

export type FlatTypesSelectType = typeof flatTypesTable.$inferSelect;
export type FlatTypesInsertType = typeof flatTypesTable.$inferInsert;

export const flatTypesInsertSchema = createInsertSchema(flatTypesTable);

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
  createdBy: uuid("created_by")
    .notNull()
    .references(() => adminsTable.adminId),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const flatsRelations = relations(flatsTable, ({ one, many }) => ({
  society: one(societiesTable, {
    fields: [flatsTable.societyId],
    references: [societiesTable.societyId],
  }),
  flatType: one(flatTypesTable, {
    fields: [flatsTable.flatTypeId],
    references: [flatTypesTable.flatTypeId],
  }),
  createdBy: one(adminsTable, {
    fields: [flatsTable.createdBy],
    references: [adminsTable.adminId],
  }),
  recipients: many(flatRecipientsTable),
}));

export type FlatsSelectType = typeof flatsTable.$inferSelect;
export type FlatsInsertType = typeof flatsTable.$inferInsert;

export const flatsInsertSchema = createInsertSchema(flatsTable);

export const flatRecipientsTable = pgTable("flat_recipients", {
  flatRecipientId: uuid("flat_recipient_id")
    .defaultRandom()
    .notNull()
    .primaryKey(),
  flatId: uuid("flat_id")
    .notNull()
    .references(() => flatsTable.flatId),
  ownerId: uuid("owner_id").references(() => usersTable.userId),
  isCurrentOwner: boolean("is_current_owner").default(true).notNull(),
  from: date("from", { mode: "date" }).notNull(),
  to: date("to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const flatRecipientsRelations = relations(
  flatRecipientsTable,
  ({ one, many }) => ({
    flat: one(flatsTable, {
      fields: [flatRecipientsTable.flatId],
      references: [flatsTable.flatId],
    }),
    owner: one(usersTable, {
      fields: [flatRecipientsTable.ownerId],
      references: [usersTable.userId],
    }),
    bills: many(billsTable),
  }),
);

export type FlatRecipientsSelectType = typeof flatRecipientsTable.$inferSelect;
export type FlatRecipientsInsertType = typeof flatRecipientsTable.$inferInsert;

export const flatRecipientsInsertSchema =
  createInsertSchema(flatRecipientsTable);

export const subscriptionsTable = pgTable("subscriptions", {
  subscriptionId: uuid("subscription_id")
    .defaultRandom()
    .notNull()
    .primaryKey(),
  flatTypeId: uuid("flat_type_id")
    .notNull()
    .references(() => flatTypesTable.flatTypeId),
  charges: numeric("charges").notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => adminsTable.adminId),
  effectiveFrom: date("effective_from", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const subscriptionsRelations = relations(
  subscriptionsTable,
  ({ one, many }) => ({
    flatType: one(flatTypesTable, {
      fields: [subscriptionsTable.flatTypeId],
      references: [flatTypesTable.flatTypeId],
    }),
    createdBy: one(adminsTable, {
      fields: [subscriptionsTable.createdBy],
      references: [adminsTable.adminId],
    }),
    bills: many(billsTable),
  }),
);

export type SubscriptionsSelectType = typeof subscriptionsTable.$inferSelect;
export type SubscriptionsInsertType = typeof subscriptionsTable.$inferInsert;

export const subscriptionsInsertSchema = createInsertSchema(societiesTable);

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

export const billsRelations = relations(billsTable, ({ one, many }) => ({
  recipient: one(flatRecipientsTable, {
    fields: [billsTable.flatRecipientId],
    references: [flatRecipientsTable.flatRecipientId],
  }),
  subscription: one(subscriptionsTable, {
    fields: [billsTable.subscriptionId],
    references: [subscriptionsTable.subscriptionId],
  }),
  payments: many(paymentsTable),
}));

export type BillsSelectType = typeof billsTable.$inferSelect;
export type BillsInsertType = typeof billsTable.$inferInsert;

export const billsInsertSchema = createInsertSchema(billsTable);

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

export const paymentsRelations = relations(paymentsTable, ({ one, many }) => ({
  bill: one(billsTable, {
    fields: [paymentsTable.billId],
    references: [billsTable.billId],
  }),
}));

export type PaymentsSelectType = typeof paymentsTable.$inferSelect;
export type PaymentsInsertType = typeof paymentsTable.$inferInsert;

export const paymentsInsertSchema = createInsertSchema(paymentsTable);

export const notificationsTable = pgTable("notifications", {
  notificationId: uuid("notification_id")
    .notNull()
    .defaultRandom()
    .primaryKey(),
  title: text("title").notNull(),
  sentBy: uuid("sent_by")
    .notNull()
    .references(() => adminsTable.adminId),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const notifcationsRelations = relations(
  notificationsTable,
  ({ one, many }) => ({
    sentBy: one(adminsTable, {
      fields: [notificationsTable.sentBy],
      references: [adminsTable.adminId],
    }),
    notificationRecipients: many(notificationsTable),
  }),
);

export type NotificationsSelectType = typeof notificationsTable.$inferSelect;
export type NotificationsInsertType = typeof notificationsTable.$inferInsert;

export const notificationsInsertSchema = createInsertSchema(notificationsTable);

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

export const notificationRecipientsRelations = relations(
  notificationRecipientsTable,
  ({ one, many }) => ({
    notification: one(notificationsTable, {
      fields: [notificationRecipientsTable.notificationId],
      references: [notificationsTable.notificationId],
    }),
    recipient: one(flatRecipientsTable, {
      fields: [notificationRecipientsTable.flatRecipientId],
      references: [flatRecipientsTable.flatRecipientId],
    }),
  }),
);

export type NotificationRecipientsSelectType =
  typeof notificationRecipientsTable.$inferSelect;
export type NotificationRecipientsInsertType =
  typeof notificationRecipientsTable.$inferInsert;

export const notificationRecipientsInsertSchema = createInsertSchema(
  notificationRecipientsTable,
);
