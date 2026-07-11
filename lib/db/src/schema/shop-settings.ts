import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const shopSettingsTable = pgTable("shop_settings", {
  id: serial("id").primaryKey(),
  shopName: text("shop_name").notNull().default("GoldVault Pawn Broker"),
  shopPhone: text("shop_phone"),
  shopAddress: text("shop_address"),
  twilioAccountSid: text("twilio_account_sid"),
  twilioFromNumber: text("twilio_from_number"),
  twilioWhatsappEnabled: boolean("twilio_whatsapp_enabled").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ShopSettings = typeof shopSettingsTable.$inferSelect;
