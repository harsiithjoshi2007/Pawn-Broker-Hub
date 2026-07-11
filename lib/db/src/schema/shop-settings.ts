import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const shopSettingsTable = pgTable("shop_settings", {
  id:             serial("id").primaryKey(),
  shopName:       text("shop_name").notNull().default("GoldVault Pawn Broker"),
  shopPhone:      text("shop_phone"),
  shopAddress:    text("shop_address"),
  fast2smsApiKey: text("fast2sms_api_key"),
  updatedAt:      timestamp("updated_at").notNull().defaultNow(),
});

export type ShopSettings = typeof shopSettingsTable.$inferSelect;
