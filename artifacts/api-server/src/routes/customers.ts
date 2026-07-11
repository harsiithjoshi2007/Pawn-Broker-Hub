import { Router } from "express";
import { db } from "@workspace/db";
import { customersTable, loansTable } from "@workspace/db";
import { eq, ilike, or, sql, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Generate customer ID
async function generateCustomerId(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.select({ count: sql<number>`count(*)` }).from(customersTable);
  const seq = (Number(count[0].count) + 1).toString().padStart(5, "0");
  return `CUS-${year}-${seq}`;
}

// GET /customers
router.get("/customers", requireAuth, async (req, res) => {
  try {
    const { search, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions = search
      ? [
          ilike(customersTable.name, `%${search}%`),
          ilike(customersTable.phone, `%${search}%`),
          ilike(customersTable.aadhaarNumber, `%${search}%`),
          ilike(customersTable.panNumber, `%${search}%`),
          ilike(customersTable.customerId, `%${search}%`),
        ]
      : [];

    const [customers, countResult] = await Promise.all([
      db
        .select()
        .from(customersTable)
        .where(conditions.length ? or(...conditions) : undefined)
        .orderBy(desc(customersTable.createdAt))
        .limit(limitNum)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(customersTable)
        .where(conditions.length ? or(...conditions) : undefined),
    ]);

    // Add active loans count
    const enriched = await Promise.all(
      customers.map(async (c) => {
        const loanCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(loansTable)
          .where(
            sql`${loansTable.customerId} = ${c.id} AND ${loansTable.status} IN ('active','overdue','partially_paid','auction')`
          );
        return { ...c, activeLoansCount: Number(loanCount[0].count) };
      })
    );

    return res.json({
      data: enriched,
      total: Number(countResult[0].count),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    req.log.error({ err }, "List customers error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /customers
router.post("/customers", requireAuth, async (req, res) => {
  try {
    const customerId = await generateCustomerId();
    const [customer] = await db
      .insert(customersTable)
      .values({
        customerId,
        name: req.body.name,
        dateOfBirth: req.body.dateOfBirth || null,
        phone: req.body.phone,
        whatsapp: req.body.whatsapp || null,
        email: req.body.email || null,
        aadhaarNumber: req.body.aadhaarNumber || null,
        panNumber: req.body.panNumber || null,
        address: req.body.address || null,
        city: req.body.city || null,
        state: req.body.state || null,
        pincode: req.body.pincode || null,
        createdBy: req.session.userId,
      })
      .returning();

    return res.status(201).json({ ...customer, activeLoansCount: 0 });
  } catch (err) {
    req.log.error({ err }, "Create customer error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /customers/:id
router.get("/customers/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const customers = await db.select().from(customersTable).where(eq(customersTable.id, id)).limit(1);
    if (!customers[0]) return res.status(404).json({ error: "Customer not found" });

    const loanCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(loansTable)
      .where(sql`${loansTable.customerId} = ${id} AND ${loansTable.status} IN ('active','overdue','partially_paid','auction')`);

    return res.json({ ...customers[0], activeLoansCount: Number(loanCount[0].count) });
  } catch (err) {
    req.log.error({ err }, "Get customer error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /customers/:id
router.patch("/customers/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const [updated] = await db
      .update(customersTable)
      .set({
        name: req.body.name,
        dateOfBirth: req.body.dateOfBirth,
        phone: req.body.phone,
        whatsapp: req.body.whatsapp,
        email: req.body.email,
        aadhaarNumber: req.body.aadhaarNumber,
        panNumber: req.body.panNumber,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        updatedAt: new Date(),
      })
      .where(eq(customersTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Customer not found" });
    return res.json({ ...updated, activeLoansCount: 0 });
  } catch (err) {
    req.log.error({ err }, "Update customer error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /customers/:id
router.delete("/customers/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    await db.delete(customersTable).where(eq(customersTable.id, id));
    return res.json({ message: "Customer deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete customer error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
