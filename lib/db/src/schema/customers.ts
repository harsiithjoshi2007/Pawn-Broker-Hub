import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const customersTable = pgTable("customers", {
  id: serial("id").primaryKey(),
  customerId: text("customer_id").notNull().unique(),
  name: text("name").notNull(),
  dateOfBirth: text("date_of_birth"),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp"),
  email: text("email"),
  aadhaarNumber: text("aadhaar_number"),
  panNumber: text("pan_number"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customersTable).omit({
  id: true,
  customerId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customersTable.$inferSelect;
