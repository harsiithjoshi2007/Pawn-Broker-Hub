import { Router } from "express";
import { db } from "@workspace/db";
import { paymentsTable, loansTable, customersTable } from "@workspace/db";
import { eq, sql, desc, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /payments
router.get("/payments", requireAuth, async (req, res) => {
  try {
    const { loanId, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const where = loanId ? eq(paymentsTable.loanId, parseInt(loanId)) : undefined;

    const [payments, countResult] = await Promise.all([
      db.select().from(paymentsTable)
        .where(where)
        .orderBy(desc(paymentsTable.createdAt))
        .limit(limitNum)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(paymentsTable).where(where),
    ]);

    return res.json({
      data: payments,
      total: Number(countResult[0].count),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    req.log.error({ err }, "List payments error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
