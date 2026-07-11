import { pgTable, serial, text, timestamp, integer, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { loansTable } from "./loans";

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  receiptNumber: text("receipt_number").notNull().unique(),
  loanId: integer("loan_id").notNull().references(() => loansTable.id),
  paymentDate: text("payment_date").notNull(),
  amount: doublePrecision("amount").notNull(),
  interestPaid: doublePrecision("interest_paid").notNull().default(0),
  principalPaid: doublePrecision("principal_paid").notNull().default(0),
  penaltyPaid: doublePrecision("penalty_paid").notNull().default(0),
  remainingPrincipal: doublePrecision("remaining_principal").notNull().default(0),
  remainingInterest: doublePrecision("remaining_interest").notNull().default(0),
  paymentMode: text("payment_mode").notNull().default("cash"), // cash | upi | bank_transfer | cheque
  referenceNumber: text("reference_number"),
  notes: text("notes"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({
  id: true,
  receiptNumber: true,
  createdAt: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
