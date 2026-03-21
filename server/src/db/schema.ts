import {
  date,
  text,
  uuid,
  unique,
  pgTable,
  numeric,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { eq, relations } from "drizzle-orm";
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
  users: many(usersTable),
  admins: many(adminsTable),
  flats: many(flatsTable),
}));

export type SocietySelectType = typeof societiesTable.$inferSelect;
export type SocietyInsertType = typeof societiesTable.$inferInsert;

export const societiesInsertSchema = createInsertSchema(societiesTable);

export const usersTable = pgTable(
  "users",
  {
    userId: uuid("user_id").notNull().defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    isVerified: boolean("is_verified").default(true).notNull(),
    societyId: uuid("society_id")
      .notNull()
      .references(() => societiesTable.societyId, {
        onDelete: "cascade",
      }),
    otp: integer("otp"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("unique_users_email_society").on(table.email, table.societyId),
  ],
);

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  flatRecipients: many(flatRecipientsTable),
  society: one(societiesTable, {
    fields: [usersTable.societyId],
    references: [societiesTable.societyId],
  }),
}));

export type UserSelectType = typeof usersTable.$inferSelect;
export type UserInsertType = typeof usersTable.$inferInsert;

export const usersInsertSchema = createInsertSchema(usersTable);

export const adminsTable = pgTable("admins", {
  adminId: uuid("admin_id").defaultRandom().notNull().primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  societyId: uuid("society_id").references(() => societiesTable.societyId, {
    onDelete: "cascade",
  }),
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

export type AdminSelectType = typeof adminsTable.$inferSelect;
export type AdminInsertType = typeof adminsTable.$inferInsert;

export const adminsInsertSchema = createInsertSchema(adminsTable);

export const flatTypesTable = pgTable(
  "flat_types",
  {
    flatTypeId: uuid("flat_type_id").defaultRandom().notNull().primaryKey(),
    societyId: uuid("society_id")
      .notNull()
      .references(() => societiesTable.societyId),
    size: integer("size").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("unique_flat_types_size_society").on(table.size, table.societyId),
  ],
);

export const flatTypesRelations = relations(flatTypesTable, ({ many }) => ({
  flats: many(flatsTable),
}));

export type FlatTypeSelectType = typeof flatTypesTable.$inferSelect;
export type FlatTypeInsertType = typeof flatTypesTable.$inferInsert;

export const flatTypesInsertSchema = createInsertSchema(flatTypesTable);

export const flatsTable = pgTable(
  "flats",
  {
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
    isDeleted: boolean("is_deleted").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("unique_flat_address").on(
      table.societyId,
      table.flatBlock,
      table.flatFloor,
      table.flatNumber,
    ),
  ],
);

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

export type FlatSelectType = typeof flatsTable.$inferSelect;
export type FlatInsertType = typeof flatsTable.$inferInsert;

export const flatsInsertSchema = createInsertSchema(flatsTable);

export const flatRecipientsTable = pgTable("flat_recipients", {
  flatRecipientId: uuid("flat_recipient_id")
    .defaultRandom()
    .notNull()
    .primaryKey(),
  flatId: uuid("flat_id")
    .notNull()
    .references(() => flatsTable.flatId),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => usersTable.userId),
  isCurrentOwner: boolean("is_current_owner").default(true).notNull(),
  from: date("from", { mode: "date" }).defaultNow().notNull(),
  to: date("to", { mode: "date" }),
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

export type FlatRecipientSelectType = typeof flatRecipientsTable.$inferSelect;
export type FlatRecipientInsertType = typeof flatRecipientsTable.$inferInsert;

export const flatRecipientsInsertSchema =
  createInsertSchema(flatRecipientsTable);

export const subscriptionsTable = pgTable(
  "subscriptions",
  {
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
  },
  (table) => [
    unique("unique_subscriptions_flat_type_effective_from").on(
      table.flatTypeId,
      table.effectiveFrom,
    ),
  ],
);

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

export type SubscriptionSelectType = typeof subscriptionsTable.$inferSelect;
export type SubscriptionInsertType = typeof subscriptionsTable.$inferInsert;

export const subscriptionsInsertSchema = createInsertSchema(subscriptionsTable);

export const statusEnum = ["pending", "paid"] as const;

export const billsTable = pgTable(
  "bills",
  {
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
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("unique_bill_subscription_month_year").on(
      table.subscriptionId,
      table.flatRecipientId,
      table.month,
      table.year,
    ),
  ],
);

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

export type BillSelectType = typeof billsTable.$inferSelect;
export type BillInsertType = typeof billsTable.$inferInsert;

export const billsInsertSchema = createInsertSchema(billsTable);

export const paymentViaEnum = ["cash", "upi", "online"] as const;

export const paymentsTable = pgTable("payments", {
  paymentId: uuid("payment_id").notNull().defaultRandom().primaryKey(),
  billId: uuid("bill_id")
    .notNull()
    .references(() => billsTable.billId),
  amount: numeric("amount").notNull(),
  paymentVia: text("payment_via", { enum: paymentViaEnum }).notNull(),
  paidAt: date("paid_at", { mode: "date" }).defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const paymentsRelations = relations(paymentsTable, ({ one, many }) => ({
  bill: one(billsTable, {
    fields: [paymentsTable.billId],
    references: [billsTable.billId],
  }),
}));

export type PaymentSelectType = typeof paymentsTable.$inferSelect;
export type PaymentInsertType = typeof paymentsTable.$inferInsert;

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
  societyId: uuid("society_id")
    .notNull()
    .references(() => societiesTable.societyId),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
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
  }),
);

export type NotificationSelectType = typeof notificationsTable.$inferSelect;
export type NotificationInsertType = typeof notificationsTable.$inferInsert;

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
    .defaultNow()
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

export type NotificationRecipientSelectType =
  typeof notificationRecipientsTable.$inferSelect;
export type NotificationRecipientInsertType =
  typeof notificationRecipientsTable.$inferInsert;

export const notificationRecipientsInsertSchema = createInsertSchema(
  notificationRecipientsTable,
);

export const firebaseTokensTable = pgTable("firebase_tokens", {
  tokenId: text("token_id").unique().notNull().primaryKey(),
  societyId: uuid("society_id")
    .notNull()
    .references(() => societiesTable.societyId),
  flatRecipientId: uuid("flat_recipient_id")
    .notNull()
    .references(() => flatRecipientsTable.flatRecipientId),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const firebaseTokensRelations = relations(
  firebaseTokensTable,
  ({ one }) => ({
    society: one(societiesTable, {
      fields: [firebaseTokensTable.societyId],
      references: [societiesTable.societyId],
    }),
    flatRecipient: one(flatRecipientsTable, {
      fields: [firebaseTokensTable.flatRecipientId],
      references: [flatRecipientsTable.flatRecipientId],
    }),
  }),
);

export type FirebaseTokensSelectType = typeof firebaseTokensTable.$inferSelect;
export type FirebaseTokensInsertType = typeof firebaseTokensTable.$inferInsert;

export const firebaseTokensInsertSchema =
  createInsertSchema(firebaseTokensTable);
