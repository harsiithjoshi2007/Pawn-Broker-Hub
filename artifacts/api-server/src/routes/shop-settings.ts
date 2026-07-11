import { Router } from "express";
import { db } from "@workspace/db";
import { shopSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /shop-settings
router.get("/shop-settings", requireAuth, async (req, res) => {
  try {
    const rows = await db.select().from(shopSettingsTable).limit(1);
    if (!rows[0]) {
      return res.json({
        shopName: "GoldVault Pawn Broker",
        shopPhone: null,
        shopAddress: null,
        twilioFromNumber: null,
        twilioWhatsappEnabled: false,
      });
    }
    return res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "Get shop settings error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /shop-settings
router.put("/shop-settings", requireAuth, async (req, res) => {
  try {
    const {
      shopName,
      shopPhone,
      shopAddress,
      twilioFromNumber,
      twilioWhatsappEnabled,
    } = req.body;

    const existing = await db.select().from(shopSettingsTable).limit(1);

    if (existing[0]) {
      const [updated] = await db
        .update(shopSettingsTable)
        .set({
          ...(shopName             !== undefined && { shopName }),
          ...(shopPhone            !== undefined && { shopPhone:            shopPhone || null }),
          ...(shopAddress          !== undefined && { shopAddress:          shopAddress || null }),
          ...(twilioFromNumber     !== undefined && { twilioFromNumber:     twilioFromNumber || null }),
          ...(twilioWhatsappEnabled !== undefined && { twilioWhatsappEnabled: Boolean(twilioWhatsappEnabled) }),
          updatedAt: new Date(),
        })
        .where(eq(shopSettingsTable.id, existing[0].id))
        .returning();
      return res.json(updated);
    }

    const [created] = await db
      .insert(shopSettingsTable)
      .values({
        shopName:              shopName             || "GoldVault Pawn Broker",
        shopPhone:             shopPhone            || null,
        shopAddress:           shopAddress          || null,
        twilioFromNumber:      twilioFromNumber     || null,
        twilioWhatsappEnabled: Boolean(twilioWhatsappEnabled),
      })
      .returning();
    return res.json(created);
  } catch (err) {
    req.log.error({ err }, "Update shop settings error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
