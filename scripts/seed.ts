import bcrypt from "bcrypt";
import { db, usersTable, customersTable, loansTable, jewelleryItemsTable, paymentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const daysAgo = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return d; };
const daysFromNow = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };
const monthsAgo = (n: number) => { const d = new Date(today); d.setMonth(d.getMonth() - n); return d; };
const monthsFromNow = (n: number) => { const d = new Date(today); d.setMonth(d.getMonth() + n); return d; };

async function seed() {
  console.log("Seeding database...");

  // ── Users ─────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("Admin@1234", 10);
  const managerHash = await bcrypt.hash("Manager@1234", 10);
  const staffHash = await bcrypt.hash("Staff@1234", 10);

  const existingAdmin = await db.select().from(usersTable).where(eq(usersTable.email, "admin@pawnbroker.in")).limit(1);
  let adminId = existingAdmin[0]?.id;

  if (!existingAdmin[0]) {
    const [admin] = await db.insert(usersTable).values([
      { email: "admin@pawnbroker.in", passwordHash: adminHash, name: "Rajesh Kumar", role: "admin", active: true },
    ]).returning();
    adminId = admin.id;
    console.log("Admin seeded: admin@pawnbroker.in / Admin@1234");
  } else {
    // Update password hash in case it was seeded with wrong credentials
    await db.update(usersTable).set({ passwordHash: adminHash }).where(eq(usersTable.email, "admin@pawnbroker.in"));
    console.log("Admin password updated");
  }

  const existingManager = await db.select().from(usersTable).where(eq(usersTable.email, "manager@pawnbroker.in")).limit(1);
  if (!existingManager[0]) {
    await db.insert(usersTable).values([
      { email: "manager@pawnbroker.in", passwordHash: managerHash, name: "Priya Sharma", role: "manager", active: true },
      { email: "staff@pawnbroker.in", passwordHash: staffHash, name: "Amit Singh", role: "staff", active: true },
    ]);
    console.log("Manager and staff seeded");
  }

  // ── Customers ─────────────────────────────────────────────────────
  const existingCustomers = await db.select().from(customersTable).limit(1);
  let customerIds: number[] = [];

  if (existingCustomers.length === 0) {
    const customers = await db.insert(customersTable).values([
      {
        customerId: "CUS-2024-00001", name: "Sunita Devi", phone: "9876543210",
        whatsapp: "9876543210", email: "sunita.devi@gmail.com",
        aadhaarNumber: "234567891234", panNumber: "ABCDE1234F",
        address: "12, Laxmi Nagar", city: "Jaipur", state: "Rajasthan", pincode: "302001",
        dateOfBirth: "1978-05-15", createdBy: adminId,
      },
      {
        customerId: "CUS-2024-00002", name: "Ramesh Patel", phone: "9765432109",
        whatsapp: "9765432109", aadhaarNumber: "345678912345", panNumber: "FGHIJ5678K",
        address: "45, Gandhi Road", city: "Ahmedabad", state: "Gujarat", pincode: "380001",
        dateOfBirth: "1965-11-20", createdBy: adminId,
      },
      {
        customerId: "CUS-2024-00003", name: "Kavitha Nair", phone: "9654321098",
        email: "kavitha.nair@yahoo.com", aadhaarNumber: "456789123456",
        address: "78, MG Road", city: "Kochi", state: "Kerala", pincode: "682001",
        dateOfBirth: "1990-03-08", createdBy: adminId,
      },
      {
        customerId: "CUS-2024-00004", name: "Mohammed Ishaq", phone: "9543210987",
        whatsapp: "9543210987", aadhaarNumber: "567891234567", panNumber: "MNOPQ9012R",
        address: "23, Bandra West", city: "Mumbai", state: "Maharashtra", pincode: "400050",
        dateOfBirth: "1972-07-30", createdBy: adminId,
      },
      {
        customerId: "CUS-2024-00005", name: "Lakshmi Venkat", phone: "9432109876",
        aadhaarNumber: "678912345678",
        address: "5, Anna Salai", city: "Chennai", state: "Tamil Nadu", pincode: "600002",
        dateOfBirth: "1985-09-12", createdBy: adminId,
      },
      {
        customerId: "CUS-2024-00006", name: "Gurpreet Singh", phone: "9321098765",
        whatsapp: "9321098765", email: "gurpreet.singh@hotmail.com",
        aadhaarNumber: "789123456789", panNumber: "STUVW3456X",
        address: "34, Model Town", city: "Ludhiana", state: "Punjab", pincode: "141001",
        dateOfBirth: "1969-12-25", createdBy: adminId,
      },
      {
        customerId: "CUS-2024-00007", name: "Meena Gupta", phone: "9210987654",
        aadhaarNumber: "891234567890",
        address: "67, Civil Lines", city: "Allahabad", state: "Uttar Pradesh", pincode: "211001",
        dateOfBirth: "1982-06-18", createdBy: adminId,
      },
      {
        customerId: "CUS-2024-00008", name: "Suresh Babu", phone: "9109876543",
        whatsapp: "9109876543", aadhaarNumber: "912345678901", panNumber: "YZABC7890D",
        address: "89, Jubilee Hills", city: "Hyderabad", state: "Telangana", pincode: "500033",
        dateOfBirth: "1975-02-28", createdBy: adminId,
      },
    ]).returning();
    customerIds = customers.map((c) => c.id);
    console.log(`Seeded ${customers.length} customers`);
  } else {
    const all = await db.select().from(customersTable).limit(10);
    customerIds = all.map((c) => c.id);
    console.log("Customers already exist, skipping");
  }

  // ── Loans ─────────────────────────────────────────────────────────
  const existingLoans = await db.select().from(loansTable).limit(1);
  if (existingLoans.length > 0) {
    console.log("Loans already exist, skipping");
    return;
  }

  if (customerIds.length === 0) {
    console.error("No customers to attach loans to");
    return;
  }

  const [c1, c2, c3, c4, c5, c6, c7, c8] = customerIds;

  const loans = await db.insert(loansTable).values([
    // Active gold loan — due in 2 months
    {
      loanNumber: "GL-2024-00001", customerId: c1, loanType: "gold",
      principalAmount: 50000, interestRate: 2, ratePeriod: "month", interestType: "simple",
      duration: 6, durationUnit: "months",
      startDate: fmt(monthsAgo(4)), dueDate: fmt(monthsFromNow(2)), expiryDate: fmt(monthsFromNow(3)),
      totalInterest: 6000, totalPayable: 56000, amountPaid: 0, outstandingBalance: 56000,
      penaltyRate: 3, status: "active", createdBy: adminId,
    },
    // Active silver loan — due next month
    {
      loanNumber: "SL-2024-00002", customerId: c2, loanType: "silver",
      principalAmount: 15000, interestRate: 2.5, ratePeriod: "month", interestType: "simple",
      duration: 3, durationUnit: "months",
      startDate: fmt(monthsAgo(2)), dueDate: fmt(monthsFromNow(1)), expiryDate: fmt(monthsFromNow(2)),
      totalInterest: 1125, totalPayable: 16125, amountPaid: 0, outstandingBalance: 16125,
      status: "active", createdBy: adminId,
    },
    // OVERDUE gold loan — due 15 days ago
    {
      loanNumber: "GL-2024-00003", customerId: c3, loanType: "gold",
      principalAmount: 80000, interestRate: 1.5, ratePeriod: "month", interestType: "simple",
      duration: 6, durationUnit: "months",
      startDate: fmt(monthsAgo(7)), dueDate: fmt(daysAgo(15)), expiryDate: fmt(daysFromNow(15)),
      totalInterest: 7200, totalPayable: 87200, amountPaid: 0, outstandingBalance: 87200,
      penaltyRate: 2, status: "overdue", createdBy: adminId,
    },
    // OVERDUE silver loan — due 30 days ago
    {
      loanNumber: "SL-2024-00004", customerId: c4, loanType: "silver",
      principalAmount: 25000, interestRate: 3, ratePeriod: "month", interestType: "simple",
      duration: 3, durationUnit: "months",
      startDate: fmt(monthsAgo(4)), dueDate: fmt(daysAgo(30)), expiryDate: fmt(daysFromNow(0)),
      totalInterest: 2250, totalPayable: 27250, amountPaid: 0, outstandingBalance: 27250,
      penaltyRate: 3, status: "overdue", createdBy: adminId,
    },
    // CLOSED gold loan
    {
      loanNumber: "GL-2024-00005", customerId: c5, loanType: "gold",
      principalAmount: 35000, interestRate: 2, ratePeriod: "month", interestType: "simple",
      duration: 3, durationUnit: "months",
      startDate: fmt(monthsAgo(5)), dueDate: fmt(monthsAgo(2)), expiryDate: fmt(monthsAgo(1)),
      totalInterest: 2100, totalPayable: 37100, amountPaid: 37100, outstandingBalance: 0,
      status: "closed", createdBy: adminId,
    },
    // PARTIALLY PAID — gold loan
    {
      loanNumber: "GL-2024-00006", customerId: c6, loanType: "gold",
      principalAmount: 120000, interestRate: 1.8, ratePeriod: "month", interestType: "simple",
      duration: 12, durationUnit: "months",
      startDate: fmt(monthsAgo(3)), dueDate: fmt(monthsFromNow(9)), expiryDate: fmt(monthsFromNow(10)),
      totalInterest: 25920, totalPayable: 145920, amountPaid: 30000, outstandingBalance: 115920,
      penaltyRate: 2.5, status: "partially_paid", createdBy: adminId,
    },
    // ACTIVE — compound interest gold loan
    {
      loanNumber: "GL-2024-00007", customerId: c7, loanType: "gold",
      principalAmount: 200000, interestRate: 2, ratePeriod: "month", interestType: "compound",
      duration: 6, durationUnit: "months",
      startDate: fmt(monthsAgo(1)), dueDate: fmt(monthsFromNow(5)), expiryDate: fmt(monthsFromNow(6)),
      totalInterest: 26431, totalPayable: 226431, amountPaid: 0, outstandingBalance: 226431,
      status: "active", createdBy: adminId,
    },
    // AUCTION silver loan
    {
      loanNumber: "SL-2024-00008", customerId: c8, loanType: "silver",
      principalAmount: 18000, interestRate: 2.5, ratePeriod: "month", interestType: "simple",
      duration: 3, durationUnit: "months",
      startDate: fmt(monthsAgo(5)), dueDate: fmt(monthsAgo(2)), expiryDate: fmt(monthsAgo(1)),
      totalInterest: 1350, totalPayable: 19350, amountPaid: 0, outstandingBalance: 19350,
      status: "auction", createdBy: adminId,
    },
    // Another active gold loan for customer 1
    {
      loanNumber: "GL-2024-00009", customerId: c1, loanType: "gold",
      principalAmount: 75000, interestRate: 2, ratePeriod: "month", interestType: "simple",
      duration: 6, durationUnit: "months",
      startDate: fmt(monthsAgo(1)), dueDate: fmt(monthsFromNow(5)), expiryDate: fmt(monthsFromNow(6)),
      totalInterest: 9000, totalPayable: 84000, amountPaid: 0, outstandingBalance: 84000,
      status: "active", createdBy: adminId,
    },
    // Recently closed silver loan
    {
      loanNumber: "SL-2024-00010", customerId: c2, loanType: "silver",
      principalAmount: 10000, interestRate: 3, ratePeriod: "month", interestType: "simple",
      duration: 2, durationUnit: "months",
      startDate: fmt(monthsAgo(3)), dueDate: fmt(monthsAgo(1)), expiryDate: fmt(daysAgo(10)),
      totalInterest: 600, totalPayable: 10600, amountPaid: 10600, outstandingBalance: 0,
      status: "closed", createdBy: adminId,
    },
  ]).returning();

  console.log(`Seeded ${loans.length} loans`);

  // ── Jewellery Items ───────────────────────────────────────────────
  const jewelleryData = [
    // Loan 1 — GL-2024-00001 (Sunita, active gold)
    { loanId: loans[0].id, jewelleryType: "Necklace", category: "22K Gold", grossWeight: 25.5, stoneWeight: 0, netWeight: 25.5, purity: "22K", estimatedValue: 50000, marketValue: 55000 },
    // Loan 2 — SL-2024-00002 (Ramesh, active silver)
    { loanId: loans[1].id, jewelleryType: "Anklet", category: "Pure Silver", grossWeight: 100, stoneWeight: 2, netWeight: 98, purity: "925", estimatedValue: 15000, marketValue: 16500 },
    // Loan 3 — GL-2024-00003 (Kavitha, overdue gold)
    { loanId: loans[2].id, jewelleryType: "Bangles", category: "22K Gold", grossWeight: 40, stoneWeight: 0, netWeight: 40, purity: "22K", estimatedValue: 45000, marketValue: 52000 },
    { loanId: loans[2].id, jewelleryType: "Earrings", category: "22K Gold", grossWeight: 8, stoneWeight: 0.5, netWeight: 7.5, purity: "22K", estimatedValue: 35000, marketValue: 38000 },
    // Loan 4 — SL-2024-00004 (Mohammed, overdue silver)
    { loanId: loans[3].id, jewelleryType: "Chain", category: "Pure Silver", grossWeight: 150, stoneWeight: 0, netWeight: 150, purity: "925", estimatedValue: 25000, marketValue: 27000 },
    // Loan 5 — GL-2024-00005 (Lakshmi, closed gold)
    { loanId: loans[4].id, jewelleryType: "Ring", category: "18K Gold", grossWeight: 15, stoneWeight: 1, netWeight: 14, purity: "18K", estimatedValue: 35000, marketValue: 38000 },
    // Loan 6 — GL-2024-00006 (Gurpreet, partially paid)
    { loanId: loans[5].id, jewelleryType: "Necklace Set", category: "22K Gold", grossWeight: 60, stoneWeight: 2, netWeight: 58, purity: "22K", estimatedValue: 80000, marketValue: 90000 },
    { loanId: loans[5].id, jewelleryType: "Bangles (set of 6)", category: "22K Gold", grossWeight: 50, stoneWeight: 0, netWeight: 50, purity: "22K", estimatedValue: 40000, marketValue: 45000 },
    // Loan 7 — GL-2024-00007 (Meena, active compound)
    { loanId: loans[6].id, jewelleryType: "Crown/Tiara", category: "22K Gold", grossWeight: 95, stoneWeight: 5, netWeight: 90, purity: "22K", estimatedValue: 200000, marketValue: 220000 },
    // Loan 8 — SL-2024-00008 (Suresh, auction silver)
    { loanId: loans[7].id, jewelleryType: "Silver Pooja Items", category: "Pure Silver", grossWeight: 200, stoneWeight: 0, netWeight: 200, purity: "999", estimatedValue: 18000, marketValue: 20000 },
    // Loan 9 — GL-2024-00009 (Sunita, second active)
    { loanId: loans[8].id, jewelleryType: "Necklace", category: "24K Gold", grossWeight: 30, stoneWeight: 0, netWeight: 30, purity: "24K", estimatedValue: 75000, marketValue: 82000 },
    // Loan 10 — SL-2024-00010 (Ramesh, closed silver)
    { loanId: loans[9].id, jewelleryType: "Silver Bracelet", category: "Pure Silver", grossWeight: 60, stoneWeight: 0, netWeight: 60, purity: "925", estimatedValue: 10000, marketValue: 11000 },
  ];

  await db.insert(jewelleryItemsTable).values(jewelleryData);
  console.log(`Seeded ${jewelleryData.length} jewellery items`);

  // ── Payments ──────────────────────────────────────────────────────
  const payments = [
    // Payment for closed loan GL-2024-00005 (full closure)
    {
      receiptNumber: "RCP-2024-00001", loanId: loans[4].id,
      paymentDate: fmt(monthsAgo(2)), amount: 37100,
      interestPaid: 2100, principalPaid: 35000, penaltyPaid: 0,
      remainingPrincipal: 0, remainingInterest: 0,
      paymentMode: "cash", createdBy: adminId, notes: "Full closure payment",
    },
    // Partial payment for GL-2024-00006
    {
      receiptNumber: "RCP-2024-00002", loanId: loans[5].id,
      paymentDate: fmt(monthsAgo(2)), amount: 15000,
      interestPaid: 15000, principalPaid: 0, penaltyPaid: 0,
      remainingPrincipal: 120000, remainingInterest: 10920,
      paymentMode: "upi", referenceNumber: "UPI001234567",
      createdBy: adminId,
    },
    {
      receiptNumber: "RCP-2024-00003", loanId: loans[5].id,
      paymentDate: fmt(monthsAgo(1)), amount: 15000,
      interestPaid: 10920, principalPaid: 4080, penaltyPaid: 0,
      remainingPrincipal: 115920, remainingInterest: 0,
      paymentMode: "bank_transfer", referenceNumber: "NEFT20240102",
      createdBy: adminId,
    },
    // Payment for closed SL-2024-00010
    {
      receiptNumber: "RCP-2024-00004", loanId: loans[9].id,
      paymentDate: fmt(monthsAgo(1)), amount: 10600,
      interestPaid: 600, principalPaid: 10000, penaltyPaid: 0,
      remainingPrincipal: 0, remainingInterest: 0,
      paymentMode: "cash", createdBy: adminId, notes: "Full closure",
    },
    // Recent payment today
    {
      receiptNumber: "RCP-2024-00005", loanId: loans[0].id,
      paymentDate: fmt(today), amount: 5000,
      interestPaid: 5000, principalPaid: 0, penaltyPaid: 0,
      remainingPrincipal: 50000, remainingInterest: 1000,
      paymentMode: "upi", referenceNumber: "UPI00567890",
      createdBy: adminId, notes: "Partial interest payment",
    },
    // Yesterday's payment
    {
      receiptNumber: "RCP-2024-00006", loanId: loans[1].id,
      paymentDate: fmt(daysAgo(1)), amount: 3000,
      interestPaid: 3000, principalPaid: 0, penaltyPaid: 0,
      remainingPrincipal: 15000, remainingInterest: 0,
      paymentMode: "cash", createdBy: adminId,
    },
    // This week
    {
      receiptNumber: "RCP-2024-00007", loanId: loans[6].id,
      paymentDate: fmt(daysAgo(3)), amount: 10000,
      interestPaid: 10000, principalPaid: 0, penaltyPaid: 0,
      remainingPrincipal: 200000, remainingInterest: 16431,
      paymentMode: "bank_transfer", referenceNumber: "RTGS20240203",
      createdBy: adminId,
    },
    {
      receiptNumber: "RCP-2024-00008", loanId: loans[8].id,
      paymentDate: fmt(daysAgo(5)), amount: 8000,
      interestPaid: 8000, principalPaid: 0, penaltyPaid: 0,
      remainingPrincipal: 75000, remainingInterest: 1000,
      paymentMode: "upi", referenceNumber: "UPI00891011",
      createdBy: adminId,
    },
  ];

  await db.insert(paymentsTable).values(payments);
  console.log(`Seeded ${payments.length} payments`);

  // Update amounts paid for loans that have payments
  await db.update(loansTable)
    .set({ amountPaid: 5000, outstandingBalance: 51000 })
    .where(eq(loansTable.loanNumber, "GL-2024-00001"));

  await db.update(loansTable)
    .set({ amountPaid: 3000, outstandingBalance: 13125 })
    .where(eq(loansTable.loanNumber, "SL-2024-00002"));

  await db.update(loansTable)
    .set({ amountPaid: 10000, outstandingBalance: 216431 })
    .where(eq(loansTable.loanNumber, "GL-2024-00007"));

  await db.update(loansTable)
    .set({ amountPaid: 8000, outstandingBalance: 76000 })
    .where(eq(loansTable.loanNumber, "GL-2024-00009"));

  console.log("✅ Seed complete!");
  console.log("Login credentials:");
  console.log("  Admin:   admin@pawnbroker.in / Admin@1234");
  console.log("  Manager: manager@pawnbroker.in / Manager@1234");
  console.log("  Staff:   staff@pawnbroker.in / Staff@1234");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
