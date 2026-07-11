import { Router } from "express";
import { db } from "@workspace/db";
import { paymentsTable, loansTable, customersTable } from "@workspace/db";
import { eq, sql, desc, and, ilike, or, inArray, getTableColumns } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /payments
router.get("/payments", requireAuth, async (req, res) => {
  try {
    const {
      loanId, customerId, search, mode, from, to,
      page = "1", limit = "20",
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [];

    if (loanId) {
      conditions.push(eq(paymentsTable.loanId, parseInt(loanId)));
    }

    if (customerId) {
      const customerLoans = await db
        .select({ id: loansTable.id })
        .from(loansTable)
        .where(eq(loansTable.customerId, parseInt(customerId)));
      const loanIds = customerLoans.map((l) => l.id);
      if (loanIds.length === 0) {
        return res.json({ data: [], total: 0, page: pageNum, limit: limitNum });
      }
      conditions.push(inArray(paymentsTable.loanId, loanIds));
    }

    if (search) {
      conditions.push(
        or(
          ilike(paymentsTable.receiptNumber, `%${search}%`),
          sql`EXISTS (
            SELECT 1 FROM loans l
            WHERE l.id = ${paymentsTable.loanId}
            AND l.loan_number ILIKE ${"%" + search + "%"}
          )`
        )
      );
    }

    if (mode && mode !== "all") {
      conditions.push(eq(paymentsTable.paymentMode, mode));
    }

    if (from) conditions.push(sql`${paymentsTable.paymentDate} >= ${from}`);
    if (to)   conditions.push(sql`${paymentsTable.paymentDate} <= ${to}`);

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const paymentCols = getTableColumns(paymentsTable);

    const [payments, countResult] = await Promise.all([
      db.select({
        ...paymentCols,
        loanNumber: loansTable.loanNumber,
        customerName: customersTable.name,
      })
        .from(paymentsTable)
        .leftJoin(loansTable, eq(paymentsTable.loanId, loansTable.id))
        .leftJoin(customersTable, eq(loansTable.customerId, customersTable.id))
        .where(where)
        .orderBy(desc(paymentsTable.createdAt))
        .limit(limitNum)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(paymentsTable)
        .where(where),
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
