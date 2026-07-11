import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, getAuthUserId } from "../middleware/auth";

const router = Router();

/**
 * POST /notifications/push-token
 * Stores or updates the Expo push token for the authenticated user.
 * Called by the mobile app after login.
 */
router.post("/notifications/push-token", requireAuth, async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { pushToken } = req.body;
    if (!pushToken || typeof pushToken !== "string") {
      return res.status(400).json({ error: "pushToken is required" });
    }

    await db
      .update(usersTable)
      .set({ pushToken, updatedAt: new Date() })
      .where(eq(usersTable.id, userId));

    return res.json({ message: "Push token registered" });
  } catch (err) {
    req.log.error({ err }, "Register push token error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /notifications/push-token
 * Clears the push token for the authenticated user (on logout).
 */
router.delete("/notifications/push-token", requireAuth, async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    await db
      .update(usersTable)
      .set({ pushToken: null, updatedAt: new Date() })
      .where(eq(usersTable.id, userId));

    return res.json({ message: "Push token cleared" });
  } catch (err) {
    req.log.error({ err }, "Clear push token error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
