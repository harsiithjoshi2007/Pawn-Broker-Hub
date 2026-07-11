import { pgTable, serial, text, timestamp, integer, numeric, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { customersTable } from "./customers";

export const loansTable = pgTable("loans", {
  id: serial("id").primaryKey(),
  loanNumber: text("loan_number").notNull().unique(),
  customerId: integer("customer_id").notNull().references(() => customersTable.id),
  loanType: text("loan_type").notNull(), // gold | silver
  principalAmount: doublePrecision("principal_amount").notNull(),
  interestRate: doublePrecision("interest_rate").notNull(),
  ratePeriod: text("rate_period").notNull().default("month"), // day | month | year
  interestType: text("interest_type").notNull().default("simple"), // simple | compound
  duration: integer("duration").notNull(),
  durationUnit: text("duration_unit").notNull().default("months"), // days | months | years
  startDate: text("start_date").notNull(),
  dueDate: text("due_date"),
  expiryDate: text("expiry_date"),
  totalInterest: doublePrecision("total_interest").notNull().default(0),
  totalPayable: doublePrecision("total_payable").notNull().default(0),
  amountPaid: doublePrecision("amount_paid").notNull().default(0),
  outstandingBalance: doublePrecision("outstanding_balance").notNull().default(0),
  penaltyRate: doublePrecision("penalty_rate"),
  status: text("status").notNull().default("active"), // active | closed | overdue | auction | partially_paid
  notes: text("notes"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const jewelleryItemsTable = pgTable("jewellery_items", {
  id: serial("id").primaryKey(),
  loanId: integer("loan_id").notNull().references(() => loansTable.id),
  jewelleryType: text("jewellery_type").notNull(),
  category: text("category"),
  grossWeight: doublePrecision("gross_weight").notNull(),
  stoneWeight: doublePrecision("stone_weight").notNull().default(0),
  netWeight: doublePrecision("net_weight").notNull(),
  purity: text("purity").notNull(),
  estimatedValue: doublePrecision("estimated_value").notNull(),
  marketValue: doublePrecision("market_value"),
});

export const insertLoanSchema = createInsertSchema(loansTable).omit({
  id: true,
  loanNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJewelleryItemSchema = createInsertSchema(jewelleryItemsTable).omit({
  id: true,
});

export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loansTable.$inferSelect;
export type JewelleryItem = typeof jewelleryItemsTable.$inferSelect;
