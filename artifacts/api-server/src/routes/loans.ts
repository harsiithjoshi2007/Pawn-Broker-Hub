import { Router } from "express";
import { db } from "@workspace/db";
import { loansTable, jewelleryItemsTable, paymentsTable, customersTable } from "@workspace/db";
import { eq, ilike, or, sql, desc, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { addDays, addMonths, addYears, format } from "date-fns";

const router = Router();

function generateLoanNumber(loanType: string, seq: number): string {
  const year = new Date().getFullYear();
  const prefix = loanType === "gold" ? "GL" : "SL";
  return `${prefix}-${year}-${seq.toString().padStart(5, "0")}`;
}

async function generateReceiptNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.select({ count: sql<number>`count(*)` }).from(paymentsTable);
  const seq = (Number(count[0].count) + 1).toString().padStart(5, "0");
  return `RCP-${year}-${seq}`;
}

function calculateInterest(
  principal: number,
  rate: number,
  ratePeriod: string,
  interestType: string,
  duration: number,
  durationUnit: string
): number {
  // Convert rate to monthly
  let monthlyRate = rate;
  if (ratePeriod === "day") monthlyRate = rate * 30;
  else if (ratePeriod === "year") monthlyRate = rate / 12;

  // Convert duration to months
  let months = duration;
  if (durationUnit === "days") months = duration / 30;
  else if (durationUnit === "years") months = duration * 12;

  if (interestType === "simple") {
    return (principal * monthlyRate * months) / 100;
  } else {
    // compound monthly
    const n = months;
    const r = monthlyRate / 100;
    return principal * (Math.pow(1 + r, n) - 1);
  }
}

function calculateDueDate(startDate: Date, duration: number, durationUnit: string): Date {
  if (durationUnit === "days") return addDays(startDate, duration);
  if (durationUnit === "months") return addMonths(startDate, duration);
  return addYears(startDate, duration);
}

// GET /loans
router.get("/loans", requireAuth, async (req, res) => {
  try {
    const { search, status, loanType, customerId, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [];
    if (status && status !== "all") conditions.push(eq(loansTable.status, status));
    if (loanType && loanType !== "all") conditions.push(eq(loansTable.loanType, loanType));
    if (customerId) conditions.push(eq(loansTable.customerId, parseInt(customerId)));
    if (search) {
      conditions.push(
        or(
          ilike(loansTable.loanNumber, `%${search}%`),
          sql`EXISTS (SELECT 1 FROM customers c WHERE c.id = ${loansTable.customerId} AND (c.name ILIKE ${'%' + search + '%'} OR c.phone ILIKE ${'%' + search + '%'}))`
        )
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [loans, countResult] = await Promise.all([
      db.select({
        loan: loansTable,
        customerName: customersTable.name,
      })
        .from(loansTable)
        .leftJoin(customersTable, eq(loansTable.customerId, customersTable.id))
        .where(where)
        .orderBy(desc(loansTable.createdAt))
        .limit(limitNum)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(loansTable)
        .where(where),
    ]);

    const data = loans.map(({ loan, customerName }) => ({
      ...loan,
      customerName,
    }));

    return res.json({
      data,
      total: Number(countResult[0].count),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    req.log.error({ err }, "List loans error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /loans
router.post("/loans", requireAuth, async (req, res) => {
  try {
    const {
      customerId, loanType, principalAmount, interestRate, ratePeriod = "month",
      interestType = "simple", duration, durationUnit = "months",
      penaltyRate, notes, jewelleryItems = []
    } = req.body;

    const count = await db.select({ count: sql<number>`count(*)` }).from(loansTable);
    const seq = Number(count[0].count) + 1;
    const loanNumber = generateLoanNumber(loanType, seq);

    const startDate = new Date();
    const dueDate = calculateDueDate(startDate, duration, durationUnit);
    const expiryDate = calculateDueDate(dueDate, 1, "months");

    const totalInterest = calculateInterest(principalAmount, interestRate, ratePeriod, interestType, duration, durationUnit);
    const totalPayable = principalAmount + totalInterest;

    const [loan] = await db.insert(loansTable).values({
      loanNumber,
      customerId,
      loanType,
      principalAmount,
      interestRate,
      ratePeriod,
      interestType,
      duration,
      durationUnit,
      startDate: format(startDate, "yyyy-MM-dd"),
      dueDate: format(dueDate, "yyyy-MM-dd"),
      expiryDate: format(expiryDate, "yyyy-MM-dd"),
      totalInterest,
      totalPayable,
      amountPaid: 0,
      outstandingBalance: totalPayable,
      penaltyRate: penaltyRate || null,
      status: "active",
      notes: notes || null,
      createdBy: req.session.userId,
    }).returning();

    if (jewelleryItems.length > 0) {
      await db.insert(jewelleryItemsTable).values(
        jewelleryItems.map((item: any) => ({
          loanId: loan.id,
          jewelleryType: item.jewelleryType,
          category: item.category || null,
          grossWeight: item.grossWeight,
          stoneWeight: item.stoneWeight || 0,
          netWeight: item.netWeight ?? (item.grossWeight - (item.stoneWeight || 0)),
          purity: item.purity,
          estimatedValue: item.estimatedValue,
          marketValue: item.marketValue || null,
        }))
      );
    }

    const customer = await db.select().from(customersTable).where(eq(customersTable.id, customerId)).limit(1);

    return res.status(201).json({ ...loan, customerName: customer[0]?.name || null });
  } catch (err) {
    req.log.error({ err }, "Create loan error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /loans/:id
router.get("/loans/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const loans = await db.select({
      loan: loansTable,
      customerName: customersTable.name,
      customerPhone: customersTable.phone,
    })
      .from(loansTable)
      .leftJoin(customersTable, eq(loansTable.customerId, customersTable.id))
      .where(eq(loansTable.id, id))
      .limit(1);

    if (!loans[0]) return res.status(404).json({ error: "Loan not found" });

    const [jewelleryItems, payments] = await Promise.all([
      db.select().from(jewelleryItemsTable).where(eq(jewelleryItemsTable.loanId, id)),
      db.select().from(paymentsTable).where(eq(paymentsTable.loanId, id)).orderBy(desc(paymentsTable.createdAt)),
    ]);

    return res.json({
      ...loans[0].loan,
      customerName: loans[0].customerName,
      customerPhone: loans[0].customerPhone,
      jewelleryItems,
      payments,
    });
  } catch (err) {
    req.log.error({ err }, "Get loan error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /loans/:id
router.patch("/loans/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(loansTable)
      .set({ status: req.body.status, notes: req.body.notes, penaltyRate: req.body.penaltyRate, updatedAt: new Date() })
      .where(eq(loansTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Loan not found" });
    return res.json({ ...updated, customerName: null });
  } catch (err) {
    req.log.error({ err }, "Update loan error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /loans/:id/payment
router.post("/loans/:id/payment", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const loans = await db.select().from(loansTable).where(eq(loansTable.id, id)).limit(1);
    if (!loans[0]) return res.status(404).json({ error: "Loan not found" });

    const loan = loans[0];
    const { amount, paymentDate, paymentMode, referenceNumber, notes, interestPaid, principalPaid, penaltyPaid } = req.body;

    const ip = interestPaid ?? Math.min(amount, loan.outstandingBalance - loan.principalAmount > 0 ? loan.outstandingBalance - loan.principalAmount : 0);
    const pp = principalPaid ?? (amount - (ip || 0));
    const pnp = penaltyPaid ?? 0;

    const newAmountPaid = loan.amountPaid + amount;
    const newOutstanding = Math.max(0, loan.outstandingBalance - amount);
    const newStatus = newOutstanding <= 0 ? "closed" : newAmountPaid > loan.principalAmount ? "partially_paid" : loan.status;

    const receiptNumber = await generateReceiptNumber();

    const [payment] = await db.insert(paymentsTable).values({
      receiptNumber,
      loanId: id,
      paymentDate: paymentDate || format(new Date(), "yyyy-MM-dd"),
      amount,
      interestPaid: ip,
      principalPaid: pp,
      penaltyPaid: pnp,
      remainingPrincipal: Math.max(0, loan.principalAmount - (loan.amountPaid + pp)),
      remainingInterest: Math.max(0, loan.totalInterest - ip),
      paymentMode,
      referenceNumber: referenceNumber || null,
      notes: notes || null,
      createdBy: req.session.userId,
    }).returning();

    await db.update(loansTable).set({
      amountPaid: newAmountPaid,
      outstandingBalance: newOutstanding,
      status: newStatus,
      updatedAt: new Date(),
    }).where(eq(loansTable.id, id));

    return res.status(201).json(payment);
  } catch (err) {
    req.log.error({ err }, "Record payment error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /loans/:id/close
router.post("/loans/:id/close", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const loans = await db.select().from(loansTable).where(eq(loansTable.id, id)).limit(1);
    if (!loans[0]) return res.status(404).json({ error: "Loan not found" });

    const loan = loans[0];
    const { discount = 0, paymentMode, referenceNumber, notes } = req.body;
    const finalAmount = Math.max(0, loan.outstandingBalance - (discount || 0));

    if (finalAmount > 0) {
      const receiptNumber = await generateReceiptNumber();
      await db.insert(paymentsTable).values({
        receiptNumber,
        loanId: id,
        paymentDate: format(new Date(), "yyyy-MM-dd"),
        amount: finalAmount,
        interestPaid: 0,
        principalPaid: finalAmount,
        penaltyPaid: 0,
        remainingPrincipal: 0,
        remainingInterest: 0,
        paymentMode,
        referenceNumber: referenceNumber || null,
        notes: notes || "Loan closed",
        createdBy: req.session.userId,
      });
    }

    const [updated] = await db.update(loansTable)
      .set({ status: "closed", amountPaid: loan.amountPaid + finalAmount, outstandingBalance: 0, updatedAt: new Date() })
      .where(eq(loansTable.id, id))
      .returning();

    return res.json({ ...updated, customerName: null });
  } catch (err) {
    req.log.error({ err }, "Close loan error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /loans/:id/renew
router.post("/loans/:id/renew", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const loans = await db.select().from(loansTable).where(eq(loansTable.id, id)).limit(1);
    if (!loans[0]) return res.status(404).json({ error: "Loan not found" });

    const loan = loans[0];
    const { newInterestRate, newDuration, newDurationUnit = "months", capitalizeInterest = false } = req.body;

    const newPrincipal = capitalizeInterest ? loan.outstandingBalance : loan.principalAmount;
    const newStartDate = new Date();
    const newDueDate = calculateDueDate(newStartDate, newDuration, newDurationUnit);
    const newTotalInterest = calculateInterest(newPrincipal, newInterestRate, loan.ratePeriod, loan.interestType, newDuration, newDurationUnit);
    const newTotalPayable = newPrincipal + newTotalInterest;

    const [updated] = await db.update(loansTable).set({
      interestRate: newInterestRate,
      duration: newDuration,
      durationUnit: newDurationUnit,
      startDate: format(newStartDate, "yyyy-MM-dd"),
      dueDate: format(newDueDate, "yyyy-MM-dd"),
      expiryDate: format(calculateDueDate(newDueDate, 1, "months"), "yyyy-MM-dd"),
      principalAmount: newPrincipal,
      totalInterest: newTotalInterest,
      totalPayable: newTotalPayable,
      outstandingBalance: newTotalPayable,
      amountPaid: 0,
      status: "active",
      updatedAt: new Date(),
    }).where(eq(loansTable.id, id)).returning();

    return res.json({ ...updated, customerName: null });
  } catch (err) {
    req.log.error({ err }, "Renew loan error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
