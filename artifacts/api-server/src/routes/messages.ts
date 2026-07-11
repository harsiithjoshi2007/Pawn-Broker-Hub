import { Router } from "express";
import { db } from "@workspace/db";
import { loansTable, customersTable, shopSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { ReplitConnectors } from "@replit/connectors-sdk";
import { format } from "date-fns";

const router = Router();

async function getShopSettings() {
  const rows = await db.select().from(shopSettingsTable).limit(1);
  return rows[0] ?? {
    shopName: "GoldVault Pawn Broker",
    shopPhone: null,
    shopAddress: null,
    twilioAccountSid: null,
    twilioFromNumber: null,
    twilioWhatsappEnabled: false,
  };
}

async function sendTwilioMessage(
  to: string,
  body: string,
  fromNumber: string,
  accountSid: string,
  useWhatsApp: boolean,
): Promise<void> {
  const connectors = new ReplitConnectors();

  // proxy() returns a Response (like fetch) — must call .json() to read it.
  // Account SID is stored in shop_settings by the admin; no dynamic lookup needed.
  const toNum   = useWhatsApp ? `whatsapp:${to}`         : to;
  const fromNum = useWhatsApp ? `whatsapp:${fromNumber}` : fromNumber;

  const msgResponse = await connectors.proxy(
    "twilio",
    `/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    new URLSearchParams({ To: toNum, From: fromNum, Body: body }),
    },
  ) as Response;

  if (!msgResponse.ok) {
    const errData = await msgResponse.json().catch(() => ({})) as any;
    throw new Error(errData?.message ?? `Twilio error ${msgResponse.status}`);
  }
}

function buildReminderMessage(
  shopName: string,
  shopPhone: string | null | undefined,
  customerName: string,
  loanNumber: string,
  loanType: string,
  principalAmount: number,
  outstandingBalance: number,
  dueDate: string | null | undefined,
): string {
  const fmt       = (n: number) => `Rs.${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  const dueDateStr = dueDate ? format(new Date(dueDate), "dd MMM yyyy") : "N/A";
  const typeLabel  = loanType === "gold" ? "Gold Loan" : "Silver Loan";

  const lines = [
    `Dear ${customerName},`,
    ``,
    `This is a reminder from *${shopName}*.`,
    ``,
    `Your ${typeLabel} is OVERDUE:`,
    `Loan No  : ${loanNumber}`,
    `Principal: ${fmt(principalAmount)}`,
    `Due Since: ${dueDateStr}`,
    `Outstanding: ${fmt(outstandingBalance)}`,
    ``,
    `Please visit us or clear your dues at the earliest to avoid penalty.`,
  ];
  if (shopPhone) lines.push(`Contact: ${shopPhone}`);
  lines.push(``, `Thank you,`, shopName);

  return lines.join("\n");
}

// POST /messages/send/:loanId  –  reminder for a single overdue loan
router.post("/messages/send/:loanId", requireAuth, async (req, res) => {
  try {
    const loanId    = parseInt(String(req.params.loanId));
    const useWhatsApp = req.body.channel === "whatsapp";

    const settings = await getShopSettings();
    if (!settings.twilioAccountSid) {
      return res.status(400).json({
        error: "Twilio Account SID not configured. Go to Settings → Shop & Messaging.",
      });
    }
    if (!settings.twilioFromNumber) {
      return res.status(400).json({
        error: "Twilio sender number not configured. Go to Settings → Shop & Messaging.",
      });
    }

    const rows = await db
      .select({
        loan:             loansTable,
        customerName:     customersTable.name,
        customerPhone:    customersTable.phone,
        customerWhatsapp: customersTable.whatsapp,
      })
      .from(loansTable)
      .leftJoin(customersTable, eq(loansTable.customerId, customersTable.id))
      .where(eq(loansTable.id, loanId))
      .limit(1);

    if (!rows[0]) return res.status(404).json({ error: "Loan not found" });

    const { loan, customerName, customerPhone, customerWhatsapp } = rows[0];
    const toNumber = useWhatsApp ? (customerWhatsapp || customerPhone) : customerPhone;
    if (!toNumber) return res.status(400).json({ error: "Customer has no phone number on file." });

    const message = buildReminderMessage(
      settings.shopName, settings.shopPhone,
      customerName ?? "Customer",
      loan.loanNumber, loan.loanType,
      loan.principalAmount, loan.outstandingBalance,
      loan.dueDate,
    );

    await sendTwilioMessage(toNumber, message, settings.twilioFromNumber, settings.twilioAccountSid!, useWhatsApp);
    return res.json({ success: true, to: toNumber, channel: useWhatsApp ? "whatsapp" : "sms" });
  } catch (err: any) {
    req.log.error({ err }, "Send single reminder error");
    return res.status(500).json({ error: err?.message ?? "Failed to send message." });
  }
});

// POST /messages/send-overdue  –  reminders to ALL overdue customers
router.post("/messages/send-overdue", requireAuth, async (req, res) => {
  try {
    const useWhatsApp = req.body.channel === "whatsapp";

    const settings = await getShopSettings();
    if (!settings.twilioAccountSid) {
      return res.status(400).json({
        error: "Twilio Account SID not configured. Go to Settings → Shop & Messaging.",
      });
    }
    if (!settings.twilioFromNumber) {
      return res.status(400).json({
        error: "Twilio sender number not configured. Go to Settings → Shop & Messaging.",
      });
    }

    const overdueRows = await db
      .select({
        loan:             loansTable,
        customerName:     customersTable.name,
        customerPhone:    customersTable.phone,
        customerWhatsapp: customersTable.whatsapp,
      })
      .from(loansTable)
      .leftJoin(customersTable, eq(loansTable.customerId, customersTable.id))
      .where(eq(loansTable.status, "overdue"));

    let sent = 0, failed = 0;
    const results: any[] = [];

    for (const { loan, customerName, customerPhone, customerWhatsapp } of overdueRows) {
      const toNumber = useWhatsApp ? (customerWhatsapp || customerPhone) : customerPhone;
      if (!toNumber) {
        failed++;
        results.push({ loanId: loan.id, loanNumber: loan.loanNumber, status: "skipped", reason: "No phone number" });
        continue;
      }
      try {
        const message = buildReminderMessage(
          settings.shopName, settings.shopPhone,
          customerName ?? "Customer",
          loan.loanNumber, loan.loanType,
          loan.principalAmount, loan.outstandingBalance,
          loan.dueDate,
        );
        await sendTwilioMessage(toNumber, message, settings.twilioFromNumber, settings.twilioAccountSid!, useWhatsApp);
        sent++;
        results.push({ loanId: loan.id, loanNumber: loan.loanNumber, customerName, status: "sent", to: toNumber });
      } catch (e: any) {
        failed++;
        results.push({ loanId: loan.id, loanNumber: loan.loanNumber, customerName, status: "failed", reason: e.message });
      }
    }

    return res.json({ sent, failed, total: overdueRows.length, results });
  } catch (err) {
    req.log.error({ err }, "Send overdue reminders error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
