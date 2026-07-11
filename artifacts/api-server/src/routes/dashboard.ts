import { Router } from "express";
import { db } from "@workspace/db";
import { loansTable, paymentsTable, customersTable } from "@workspace/db";
import { sql, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /dashboard/stats
router.get("/dashboard/stats", requireAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split("T")[0];

    const [statusCounts, portfolioResult, todayPayments, monthPayments, recentLoans, monthlyData] = await Promise.all([
      // Status breakdown
      db.select({
        status: loansTable.status,
        count: sql<number>`count(*)`,
        type: loansTable.loanType,
      }).from(loansTable).groupBy(loansTable.status, loansTable.loanType),

      // Portfolio value: sum of outstanding balances for non-closed loans
      db.select({ total: sql<number>`coalesce(sum(outstanding_balance), 0)` })
        .from(loansTable)
        .where(sql`status IN ('active', 'overdue', 'partially_paid', 'auction')`),

      // Today's collection
      db.select({ total: sql<number>`coalesce(sum(amount), 0)` })
        .from(paymentsTable)
        .where(sql`payment_date = ${today}`),

      // Monthly income
      db.select({ total: sql<number>`coalesce(sum(amount), 0)` })
        .from(paymentsTable)
        .where(sql`payment_date >= ${monthStartStr}`),

      // Recent loans with customer names
      db.select({
        loan: loansTable,
        customerName: customersTable.name,
      })
        .from(loansTable)
        .leftJoin(customersTable, sql`${loansTable.customerId} = ${customersTable.id}`)
        .orderBy(desc(loansTable.createdAt))
        .limit(10),

      // Monthly disbursement (last 6 months)
      db.execute(sql`
        SELECT
          to_char(created_at, 'Mon YYYY') AS month,
          EXTRACT(YEAR FROM created_at) AS year,
          EXTRACT(MONTH FROM created_at) AS month_num,
          coalesce(sum(principal_amount), 0) AS amount,
          count(*) AS count
        FROM loans
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY to_char(created_at, 'Mon YYYY'), EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
        ORDER BY year, month_num
      `),
    ]);

    const countByStatus = (status: string) =>
      Number(statusCounts.filter((s) => s.status === status).reduce((a, b) => a + Number(b.count), 0));

    const loanStatusBreakdown = ["active", "overdue", "closed", "auction", "partially_paid"].map((status) => ({
      status,
      count: countByStatus(status),
    }));

    return res.json({
      totalActiveLoans: countByStatus("active"),
      totalOverdueLoans: countByStatus("overdue"),
      totalClosedLoans: countByStatus("closed"),
      totalAuctionLoans: countByStatus("auction"),
      todayCollection: Number(todayPayments[0]?.total ?? 0),
      monthlyIncome: Number(monthPayments[0]?.total ?? 0),
      loanPortfolioValue: Number(portfolioResult[0]?.total ?? 0),
      goldLoansCount: Number(statusCounts.filter((s) => s.type === "gold").reduce((a, b) => a + Number(b.count), 0)),
      silverLoansCount: Number(statusCounts.filter((s) => s.type === "silver").reduce((a, b) => a + Number(b.count), 0)),
      recentLoans: recentLoans.map(({ loan, customerName }) => ({ ...loan, customerName })),
      monthlyDisbursement: (monthlyData.rows as any[]).map((row) => ({
        month: row.month,
        amount: Number(row.amount),
        count: Number(row.count),
      })),
      loanStatusBreakdown,
    });
  } catch (err) {
    req.log.error({ err }, "Dashboard stats error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
