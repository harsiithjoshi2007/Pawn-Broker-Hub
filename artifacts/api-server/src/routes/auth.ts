import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, getAuthUserId } from "../middleware/auth";

const router = Router();

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET ?? process.env.SESSION_SECRET;
  if (!secret) throw new Error("JWT_SECRET or SESSION_SECRET must be set");
  return secret;
}

// POST /auth/login
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    const user = users[0];
    if (!user || !user.active) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Establish cookie session (web clients)
    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.userName = user.name;
    req.session.userEmail = user.email;

    // Issue a signed JWT (mobile / API clients)
    const token = jwt.sign(
      {
        userId: user.id,
        userRole: user.role,
        userName: user.name,
        userEmail: user.email,
      },
      getJwtSecret(),
      { expiresIn: "30d" }
    );

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token,
    });
  } catch (err) {
    req.log.error({ err }, "Login error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/logout
router.post("/auth/logout", (req, res) => {
  // For session-based clients: destroy the session.
  // For bearer-token clients: the token is stateless — tell the client to
  // discard it. We still respond 200 so the mobile app can clean up locally.
  if (req.session?.userId) {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  } else {
    res.json({ message: "Logged out successfully" });
  }
});

// PATCH /auth/me — update profile info and/or change password
router.patch("/auth/me", requireAuth, async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const user = users[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    const { name, email, currentPassword, newPassword } = req.body;
    const profileUpdate: Record<string, unknown> = {};
    let passwordChanged = false;

    // Profile fields
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({ error: "Name must be at least 2 characters" });
      }
      profileUpdate.name = name.trim();
    }
    if (email !== undefined) {
      if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Invalid email address" });
      }
      profileUpdate.email = email.toLowerCase().trim();
    }

    // Password change (optional — only if both fields provided)
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Both currentPassword and newPassword are required to change password" });
      }
      if (typeof newPassword === "string" && newPassword.length < 8) {
        return res.status(400).json({ error: "New password must be at least 8 characters" });
      }
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) return res.status(400).json({ error: "Current password is incorrect" });
      profileUpdate.passwordHash = await bcrypt.hash(newPassword, 10);
      passwordChanged = true;
    }

    if (Object.keys(profileUpdate).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const [updated] = await db.update(usersTable)
      .set(profileUpdate as any)
      .where(eq(usersTable.id, userId))
      .returning();

    // Update session if name/email changed
    if (profileUpdate.name) req.session.userName = updated.name;
    if (profileUpdate.email) req.session.userEmail = updated.email;

    return res.json({
      message: passwordChanged ? "Profile and password updated successfully" : "Profile updated successfully",
      user: { id: updated.id, email: updated.email, name: updated.name, role: updated.role },
    });
  } catch (err) {
    req.log.error({ err }, "Update profile error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /auth/me
router.get("/auth/me", requireAuth, async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    const user = users[0];
    if (!user || !user.active) {
      // Clean up stale session if one exists
      if (req.session?.userId) req.session.destroy(() => {});
      return res.status(401).json({ error: "User not found" });
    }

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    req.log.error({ err }, "Get me error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
