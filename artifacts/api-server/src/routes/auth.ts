import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

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

    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.userName = user.name;
    req.session.userEmail = user.email;

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    req.log.error({ err }, "Login error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/logout
router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

// GET /auth/me
router.get("/auth/me", requireAuth, async (req, res) => {
  try {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.session.userId!))
      .limit(1);

    const user = users[0];
    if (!user || !user.active) {
      req.session.destroy(() => {});
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
