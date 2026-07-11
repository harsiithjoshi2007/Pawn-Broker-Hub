/**
 * Seed script: populates sample users, customers, loans, jewellery items, and payments
 * so the dashboard, lists, and charts are populated on first load.
 *
 * Run with: pnpm tsx scripts/seed.ts
 */

import bcrypt from "bcrypt";
import { db } from "@workspace/db";
import {
  usersTable,
  customersTable,
  loansTable,
  jewelleryItemsTable,
  paymentsTable,
} from "@workspace/db";
import { eq, sql } from "drizzle-orm";

// ── helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function dateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function addMonths(d: Date, n: number): Date {
  const out = new Date(d);
  out.setMonth(out.getMonth() + n);
  return out;
}

function calcInterest(
  principal: number,
  rate: number,
  ratePeriod: string,
  interestType: string,
  duration: number,
  durationUnit: string,
): number {
  let monthlyRate = rate;
  if (ratePeriod === "day") monthlyRate = rate * 30;
  else if (ratePeriod === "year") monthlyRate = rate / 12;

  let months = duration;
  if (durationUnit === "days") months = duration / 30;
  else if (durationUnit === "years") months = duration * 12;

  if (interestType === "simple") {
    return (principal * monthlyRate * months) / 100;
  }
  const r = monthlyRate / 100;
  return principal * (Math.pow(1 + r, months) - 1);
}

// ── users ────────────────────────────────────────────────────────────────────

async function seedUsers() {
  const users = [
    { email: "admin@pawnbroker.com", password: "admin123", name: "Admin User", role: "admin" },
    { email: "manager@pawnbroker.com", password: "manager123", name: "Store Manager", role: "manager" },
    { email: "staff@pawnbroker.com", password: "staff123", name: "Staff Member", role: "staff" },
  ];

  const ids: number[] = [];
  for (const u of users) {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, u.email))
      .limit(1);
    if (existing[0]) {
      console.log(`  ↳ User already exists: ${u.email}`);
      ids.push(existing[0].id);
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, 10);
    const [inserted] = await db
      .insert(usersTable)
      .values({ email: u.email, passwordHash, name: u.name, role: u.role, active: true })
      .returning();
    console.log(`  ↳ Seeded user: ${u.email} / ${u.password}`);
    ids.push(inserted.id);
  }
  return ids; // [adminId, managerId, staffId]
}

// ── customers ────────────────────────────────────────────────────────────────

const CUSTOMER_DATA = [
  {
    name: "Rajesh Kumar",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "rajesh.kumar@gmail.com",
    aadhaarNumber: "1234 5678 9012",
    panNumber: "ABCPK1234D",
    address: "12, MG Road",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560001",
    dateOfBirth: "1978-05-15",
  },
  {
    name: "Priya Sharma",
    phone: "9812345678",
    whatsapp: "9812345678",
    email: "priya.sharma@yahoo.com",
    aadhaarNumber: "2345 6789 0123",
    panNumber: "BKRPS5678F",
    address: "45, Anna Nagar",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600040",
    dateOfBirth: "1985-11-22",
  },
  {
    name: "Mohammed Arif",
    phone: "9923456789",
    whatsapp: "9923456789",
    email: null,
    aadhaarNumber: "3456 7890 1234",
    panNumber: null,
    address: "78, Bandra West",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400050",
    dateOfBirth: "1970-03-08",
  },
  {
    name: "Sunita Devi",
    phone: "9745678901",
    whatsapp: null,
    email: null,
    aadhaarNumber: "4567 8901 2345",
    panNumber: null,
    address: "22, Civil Lines",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302006",
    dateOfBirth: "1990-07-30",
  },
  {
    name: "Venkat Rao",
    phone: "9856789012",
    whatsapp: "9856789012",
    email: "venkat.rao@hotmail.com",
    aadhaarNumber: "5678 9012 3456",
    panNumber: "CVNVR9012G",
    address: "33, Jubilee Hills",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500033",
    dateOfBirth: "1982-09-14",
  },
  {
    name: "Kavitha Menon",
    phone: "9667890123",
    whatsapp: "9667890123",
    email: "kavitha.m@gmail.com",
    aadhaarNumber: "6789 0123 4567",
    panNumber: "DKPKM6789H",
    address: "56, Kaloor",
    city: "Kochi",
    state: "Kerala",
    pincode: "682017",
    dateOfBirth: "1975-01-25",
  },
  {
    name: "Deepak Singh",
    phone: "9578901234",
    whatsapp: "9578901234",
    email: "deepak.singh@gmail.com",
    aadhaarNumber: "7890 1234 5678",
    panNumber: "EDKDS7890J",
    address: "15, Model Town",
    city: "Delhi",
    state: "Delhi",
    pincode: "110009",
    dateOfBirth: "1988-06-18",
  },
  {
    name: "Lakshmi Narayanan",
    phone: "9489012345",
    whatsapp: "9489012345",
    email: null,
    aadhaarNumber: "8901 2345 6789",
    panNumber: null,
    address: "88, T Nagar",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600017",
    dateOfBirth: "1965-12-05",
  },
];

async function seedCustomers(adminId: number): Promise<number[]> {
  const existing = await db
    .select({ count: sql<number>`count(*)` })
    .from(customersTable);
  const existingCount = Number(existing[0].count);

  const ids: number[] = [];
  for (let i = 0; i < CUSTOMER_DATA.length; i++) {
    const c = CUSTOMER_DATA[i];
    const existingCustomer = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.phone, c.phone))
      .limit(1);

    if (existingCustomer[0]) {
      ids.push(existingCustomer[0].id);
      continue;
    }

    const year = new Date().getFullYear();
    const seq = (existingCount + i + 1).toString().padStart(5, "0");
    const customerId = `CUS-${year}-${seq}`;

    const [inserted] = await db
      .insert(customersTable)
      .values({ ...c, customerId, createdBy: adminId })
      .returning();
    ids.push(inserted.id);
  }
  console.log(`  ↳ Seeded ${CUSTOMER_DATA.length} customers`);
  return ids;
}

// ── loan + items helper ───────────────────────────────────────────────────────

let loanSeq = 0;

async function countLoans() {
  const r = await db.select({ count: sql<number>`count(*)` }).from(loansTable);
  loanSeq = Number(r[0].count);
}

async function createLoan(params: {
  customerId: number;
  loanType: "gold" | "silver";
  principal: number;
  rate: number;
  ratePeriod: "day" | "month" | "year";
  interestType: "simple" | "compound";
  duration: number;
  durationUnit: "days" | "months" | "years";
  penaltyRate?: number;
  startDaysAgo: number;
  status: "active" | "closed" | "overdue" | "auction" | "partially_paid";
  notes?: string;
  createdBy: number;
  items: Array<{
    jewelleryType: string;
    category?: string;
    grossWeight: number;
    stoneWeight?: number;
    purity: string;
    estimatedValue: number;
    marketValue?: number;
  }>;
  payments?: Array<{
    amount: number;
    daysAgoOffset: number; // relative to loan start
    paymentMode: "cash" | "upi" | "bank_transfer" | "cheque";
  }>;
}): Promise<number> {
  loanSeq++;
  const prefix = params.loanType === "gold" ? "GL" : "SL";
  const year = new Date().getFullYear();
  const loanNumber = `${prefix}-${year}-${loanSeq.toString().padStart(5, "0")}`;

  const startDate = daysAgo(params.startDaysAgo);
  const dueDate = addMonths(startDate, params.duration);
  const expiryDate = addMonths(dueDate, 1);

  const totalInterest = calcInterest(
    params.principal,
    params.rate,
    params.ratePeriod,
    params.interestType,
    params.duration,
    params.durationUnit,
  );
  const totalPayable = params.principal + totalInterest;

  // Calculate amount paid from payments
  const totalPaid = (params.payments || []).reduce((s, p) => s + p.amount, 0);
  const outstanding = Math.max(0, totalPayable - totalPaid);

  const [loan] = await db
    .insert(loansTable)
    .values({
      loanNumber,
      customerId: params.customerId,
      loanType: params.loanType,
      principalAmount: params.principal,
      interestRate: params.rate,
      ratePeriod: params.ratePeriod,
      interestType: params.interestType,
      duration: params.duration,
      durationUnit: params.durationUnit,
      startDate: dateStr(startDate),
      dueDate: dateStr(dueDate),
      expiryDate: dateStr(expiryDate),
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalPayable: Math.round(totalPayable * 100) / 100,
      amountPaid: Math.round(totalPaid * 100) / 100,
      outstandingBalance: Math.round(outstanding * 100) / 100,
      penaltyRate: params.penaltyRate || null,
      status: params.status,
      notes: params.notes || null,
      createdBy: params.createdBy,
    })
    .returning();

  // Insert jewellery items
  for (const item of params.items) {
    const netWeight = item.grossWeight - (item.stoneWeight || 0);
    await db.insert(jewelleryItemsTable).values({
      loanId: loan.id,
      jewelleryType: item.jewelleryType,
      category: item.category || null,
      grossWeight: item.grossWeight,
      stoneWeight: item.stoneWeight || 0,
      netWeight,
      purity: item.purity,
      estimatedValue: item.estimatedValue,
      marketValue: item.marketValue || null,
    });
  }

  // Insert payments
  let paymentSeq = 0;
  const payCountRes = await db.select({ count: sql<number>`count(*)` }).from(paymentsTable);
  paymentSeq = Number(payCountRes[0].count);

  let runningPaid = 0;
  for (const pmt of params.payments || []) {
    paymentSeq++;
    const receiptNumber = `RCP-${year}-${paymentSeq.toString().padStart(5, "0")}`;
    const pmtDate = daysAgo(params.startDaysAgo - pmt.daysAgoOffset);

    const interestPaid = Math.min(pmt.amount, totalInterest - runningPaid);
    const principalPaid = Math.max(0, pmt.amount - interestPaid);
    runningPaid += pmt.amount;

    await db.insert(paymentsTable).values({
      receiptNumber,
      loanId: loan.id,
      paymentDate: dateStr(pmtDate),
      amount: pmt.amount,
      interestPaid: Math.round(interestPaid * 100) / 100,
      principalPaid: Math.round(principalPaid * 100) / 100,
      penaltyPaid: 0,
      remainingPrincipal: Math.max(0, params.principal - principalPaid),
      remainingInterest: Math.max(0, totalInterest - runningPaid),
      paymentMode: pmt.paymentMode,
      referenceNumber: null,
      notes: null,
      createdBy: params.createdBy,
    });
  }

  return loan.id;
}

// ── main seed ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...\n");

  console.log("👤 Users");
  const [adminId, managerId] = await seedUsers();

  console.log("\n👥 Customers");
  const customerIds = await seedCustomers(adminId);

  console.log("\n📋 Checking existing loans...");
  const existingLoans = await db.select({ count: sql<number>`count(*)` }).from(loansTable);
  if (Number(existingLoans[0].count) > 0) {
    console.log(`  ↳ ${existingLoans[0].count} loans already exist, skipping loan seed`);
    console.log("\n✅ Seed complete.");
    return;
  }

  await countLoans();

  console.log("\n🏦 Loans");

  // ── ACTIVE GOLD LOANS ──
  await createLoan({
    customerId: customerIds[0], // Rajesh Kumar
    loanType: "gold",
    principal: 85000,
    rate: 2,
    ratePeriod: "month",
    interestType: "simple",
    duration: 6,
    durationUnit: "months",
    penaltyRate: 3,
    startDaysAgo: 45,
    status: "active",
    notes: "Regular customer",
    createdBy: adminId,
    items: [
      { jewelleryType: "Necklace", category: "Ornament", grossWeight: 35.5, stoneWeight: 2.0, purity: "22K", estimatedValue: 90000, marketValue: 95000 },
      { jewelleryType: "Bangles", category: "Ornament", grossWeight: 12.0, purity: "22K", estimatedValue: 30000, marketValue: 32000 },
    ],
    payments: [
      { amount: 1700, daysAgoOffset: 30, paymentMode: "cash" },
    ],
  });

  await createLoan({
    customerId: customerIds[1], // Priya Sharma
    loanType: "gold",
    principal: 120000,
    rate: 1.8,
    ratePeriod: "month",
    interestType: "simple",
    duration: 9,
    durationUnit: "months",
    penaltyRate: 2.5,
    startDaysAgo: 30,
    status: "active",
    createdBy: managerId,
    items: [
      { jewelleryType: "Chain", category: "Ornament", grossWeight: 50.0, stoneWeight: 0, purity: "22K", estimatedValue: 125000, marketValue: 130000 },
    ],
    payments: [],
  });

  await createLoan({
    customerId: customerIds[4], // Venkat Rao
    loanType: "gold",
    principal: 45000,
    rate: 2.5,
    ratePeriod: "month",
    interestType: "simple",
    duration: 3,
    durationUnit: "months",
    startDaysAgo: 15,
    status: "active",
    createdBy: adminId,
    items: [
      { jewelleryType: "Ring", category: "Ornament", grossWeight: 8.5, purity: "18K", estimatedValue: 47000 },
      { jewelleryType: "Earrings", category: "Ornament", grossWeight: 6.0, purity: "18K", estimatedValue: 22000 },
    ],
  });

  await createLoan({
    customerId: customerIds[6], // Deepak Singh
    loanType: "gold",
    principal: 200000,
    rate: 1.5,
    ratePeriod: "month",
    interestType: "compound",
    duration: 12,
    durationUnit: "months",
    penaltyRate: 2,
    startDaysAgo: 20,
    status: "active",
    createdBy: adminId,
    items: [
      { jewelleryType: "Set (Necklace + Earrings)", category: "Bridal", grossWeight: 80.0, stoneWeight: 5.0, purity: "22K", estimatedValue: 210000, marketValue: 220000 },
    ],
  });

  // ── OVERDUE LOANS ──
  await createLoan({
    customerId: customerIds[2], // Mohammed Arif
    loanType: "gold",
    principal: 65000,
    rate: 2,
    ratePeriod: "month",
    interestType: "simple",
    duration: 3,
    durationUnit: "months",
    penaltyRate: 3,
    startDaysAgo: 150,
    status: "overdue",
    notes: "Customer not responding",
    createdBy: adminId,
    items: [
      { jewelleryType: "Bracelet", category: "Ornament", grossWeight: 25.0, purity: "22K", estimatedValue: 68000 },
    ],
    payments: [
      { amount: 1300, daysAgoOffset: 60, paymentMode: "cash" },
    ],
  });

  await createLoan({
    customerId: customerIds[3], // Sunita Devi
    loanType: "silver",
    principal: 15000,
    rate: 2.5,
    ratePeriod: "month",
    interestType: "simple",
    duration: 2,
    durationUnit: "months",
    startDaysAgo: 120,
    status: "overdue",
    createdBy: managerId,
    items: [
      { jewelleryType: "Anklets", category: "Ornament", grossWeight: 80.0, purity: "925", estimatedValue: 16000 },
    ],
  });

  // ── AUCTION LOAN ──
  await createLoan({
    customerId: customerIds[7], // Lakshmi Narayanan
    loanType: "gold",
    principal: 95000,
    rate: 2,
    ratePeriod: "month",
    interestType: "simple",
    duration: 6,
    durationUnit: "months",
    penaltyRate: 3,
    startDaysAgo: 280,
    status: "auction",
    notes: "Sent to auction notice",
    createdBy: adminId,
    items: [
      { jewelleryType: "Necklace", category: "Ornament", grossWeight: 42.0, stoneWeight: 3.0, purity: "22K", estimatedValue: 100000 },
    ],
  });

  // ── CLOSED LOANS ──
  await createLoan({
    customerId: customerIds[0], // Rajesh Kumar (repeat customer)
    loanType: "gold",
    principal: 50000,
    rate: 2,
    ratePeriod: "month",
    interestType: "simple",
    duration: 3,
    durationUnit: "months",
    startDaysAgo: 180,
    status: "closed",
    createdBy: adminId,
    items: [
      { jewelleryType: "Chain", category: "Ornament", grossWeight: 20.0, purity: "22K", estimatedValue: 52000 },
    ],
    payments: [
      { amount: 1000, daysAgoOffset: 30, paymentMode: "cash" },
      { amount: 1000, daysAgoOffset: 60, paymentMode: "cash" },
      { amount: 51000, daysAgoOffset: 90, paymentMode: "upi" },
    ],
  });

  await createLoan({
    customerId: customerIds[5], // Kavitha Menon
    loanType: "gold",
    principal: 75000,
    rate: 1.8,
    ratePeriod: "month",
    interestType: "simple",
    duration: 6,
    durationUnit: "months",
    startDaysAgo: 240,
    status: "closed",
    createdBy: managerId,
    items: [
      { jewelleryType: "Bangles Set", category: "Ornament", grossWeight: 32.0, purity: "22K", estimatedValue: 78000 },
    ],
    payments: [
      { amount: 2700, daysAgoOffset: 30, paymentMode: "cash" },
      { amount: 2700, daysAgoOffset: 60, paymentMode: "cash" },
      { amount: 2700, daysAgoOffset: 90, paymentMode: "upi" },
      { amount: 2700, daysAgoOffset: 120, paymentMode: "upi" },
      { amount: 2700, daysAgoOffset: 150, paymentMode: "cash" },
      { amount: 75000, daysAgoOffset: 180, paymentMode: "bank_transfer" },
    ],
  });

  await createLoan({
    customerId: customerIds[1], // Priya Sharma (another loan)
    loanType: "silver",
    principal: 25000,
    rate: 3,
    ratePeriod: "month",
    interestType: "simple",
    duration: 3,
    durationUnit: "months",
    startDaysAgo: 200,
    status: "closed",
    createdBy: adminId,
    items: [
      { jewelleryType: "Silver Set", category: "Ornament", grossWeight: 120.0, purity: "925", estimatedValue: 27000 },
    ],
    payments: [
      { amount: 750, daysAgoOffset: 30, paymentMode: "upi" },
      { amount: 750, daysAgoOffset: 60, paymentMode: "upi" },
      { amount: 25750, daysAgoOffset: 90, paymentMode: "cash" },
    ],
  });

  // ── PARTIALLY_PAID LOAN ──
  await createLoan({
    customerId: customerIds[4], // Venkat Rao
    loanType: "gold",
    principal: 55000,
    rate: 2,
    ratePeriod: "month",
    interestType: "simple",
    duration: 6,
    durationUnit: "months",
    penaltyRate: 2.5,
    startDaysAgo: 100,
    status: "partially_paid",
    createdBy: managerId,
    items: [
      { jewelleryType: "Necklace", category: "Ornament", grossWeight: 22.0, purity: "22K", estimatedValue: 58000 },
    ],
    payments: [
      { amount: 2200, daysAgoOffset: 30, paymentMode: "cash" },
      { amount: 2200, daysAgoOffset: 60, paymentMode: "cash" },
      { amount: 2200, daysAgoOffset: 90, paymentMode: "upi" },
    ],
  });

  // ── SILVER ACTIVE LOANS ──
  await createLoan({
    customerId: customerIds[3], // Sunita Devi (new loan)
    loanType: "silver",
    principal: 18000,
    rate: 3,
    ratePeriod: "month",
    interestType: "simple",
    duration: 3,
    durationUnit: "months",
    startDaysAgo: 10,
    status: "active",
    createdBy: adminId,
    items: [
      { jewelleryType: "Silver Payal", category: "Ornament", grossWeight: 95.0, purity: "925", estimatedValue: 20000 },
    ],
  });

  await createLoan({
    customerId: customerIds[6], // Deepak Singh (silver)
    loanType: "silver",
    principal: 12000,
    rate: 2.5,
    ratePeriod: "month",
    interestType: "simple",
    duration: 2,
    durationUnit: "months",
    startDaysAgo: 25,
    status: "active",
    createdBy: adminId,
    items: [
      { jewelleryType: "Silver Coins", category: "Bullion", grossWeight: 50.0, purity: "999", estimatedValue: 13000 },
    ],
  });

  const finalLoanCount = await db.select({ count: sql<number>`count(*)` }).from(loansTable);
  const finalPaymentCount = await db.select({ count: sql<number>`count(*)` }).from(paymentsTable);
  const finalCustomerCount = await db.select({ count: sql<number>`count(*)` }).from(customersTable);

  console.log(`  ↳ ${finalLoanCount[0].count} loans inserted`);
  console.log(`  ↳ ${finalPaymentCount[0].count} payments inserted`);

  console.log(`
✅ Seed complete!
   Customers : ${finalCustomerCount[0].count}
   Loans     : ${finalLoanCount[0].count}
   Payments  : ${finalPaymentCount[0].count}

🔑 Login credentials:
   admin@pawnbroker.com   / admin123
   manager@pawnbroker.com / manager123
   staff@pawnbroker.com   / staff123
`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
