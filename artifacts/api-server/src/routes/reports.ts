import { Router } from "express";
import { db } from "@workspace/db";
import { paymentsTable, loansTable } from "@workspace/db";
import { sql, eq, and, getTableColumns } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /reports/collection
router.get("/reports/collection", requireAuth, async (req, res) => {
  try {
    const { from, to, loanType } = req.query as Record<string, string>;

    const conditions: any[] = [];
    if (from) conditions.push(sql`${paymentsTable.paymentDate} >= ${from}`);
    if (to) conditions.push(sql`${paymentsTable.paymentDate} <= ${to}`);
    if (loanType && loanType !== "all") {
      conditions.push(
        sql`EXISTS (SELECT 1 FROM loans l WHERE l.id = ${paymentsTable.loanId} AND l.loan_type = ${loanType})`
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const paymentCols = getTableColumns(paymentsTable);

    const [summary, payments] = await Promise.all([
      db.select({
        totalCollected: sql<number>`coalesce(sum(amount), 0)`,
        totalInterest: sql<number>`coalesce(sum(interest_paid), 0)`,
        totalPrincipal: sql<number>`coalesce(sum(principal_paid), 0)`,
        count: sql<number>`count(*)`,
      }).from(paymentsTable).where(where),
      db.select({ ...paymentCols, loanNumber: loansTable.loanNumber })
        .from(paymentsTable)
        .leftJoin(loansTable, eq(paymentsTable.loanId, loansTable.id))
        .where(where)
        .orderBy(sql`${paymentsTable.paymentDate} desc`)
        .limit(500),
    ]);

    return res.json({
      from: from || null,
      to: to || null,
      totalCollected: Number(summary[0].totalCollected),
      totalInterestCollected: Number(summary[0].totalInterest),
      totalPrincipalCollected: Number(summary[0].totalPrincipal),
      transactionCount: Number(summary[0].count),
      payments,
    });
  } catch (err) {
    req.log.error({ err }, "Collection report error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
