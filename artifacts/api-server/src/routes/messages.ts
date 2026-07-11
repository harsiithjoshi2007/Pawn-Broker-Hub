import { Router } from "express";
import { db } from "@workspace/db";
import { loansTable, customersTable, shopSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { format } from "date-fns";

const router = Router();

async function getShopSettings() {
  const rows = await db.select().from(shopSettingsTable).limit(1);
  return rows[0] ?? {
    shopName:       "GoldVault Pawn Broker",
    shopPhone:      null,
    shopAddress:    null,
    fast2smsApiKey: null,
  };
}

/** Strip to 10-digit Indian number for Fast2SMS (removes +91 / 91 prefix). */
function toFast2SMSNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 10) return digits;
  return digits.slice(-10);
}

/** Normalise to E.164 for wa.me links (+91XXXXXXXXXX). */
function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (phone.startsWith("+")) return phone.trim().replace(/\s/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return `+${digits}`;
}

/** Send SMS via Fast2SMS — works to any Indian number, no verification required. */
async function sendFast2SMS(to: string, body: string, apiKey: string): Promise<void> {
  const number = toFast2SMSNumber(to);
  const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: {
      "authorization": apiKey,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      route:    "q",        // Quick SMS — no DLT template registration required
      message:  body,
      language: "english",
      flash:    0,
      numbers:  number,
    }),
  });
  const data = await response.json().catch(() => ({})) as any;
  if (!data?.return) {
    const msg = Array.isArray(data?.message) ? data.message[0] : (data?.message ?? "Fast2SMS error");
    throw new Error(msg);
  }
}

function buildReminderMessage(
  shopName:          string,
  shopPhone:         string | null | undefined,
  customerName:      string,
  loanNumber:        string,
  loanType:          string,
  principalAmount:   number,
  outstandingBalance:number,
  dueDate:           string | null | undefined,
): string {
  const fmt        = (n: number) => `Rs.${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  const dueDateStr = dueDate ? format(new Date(dueDate), "dd MMM yyyy") : "N/A";
  const typeLabel  = loanType === "gold" ? "Gold Loan" : "Silver Loan";

  const lines = [
    `Dear ${customerName},`,
    ``,
    `This is a reminder from ${shopName}.`,
    ``,
    `Your ${typeLabel} is OVERDUE:`,
    `Loan No    : ${loanNumber}`,
    `Principal  : ${fmt(principalAmount)}`,
    `Due Since  : ${dueDateStr}`,
    `Outstanding: ${fmt(outstandingBalance)}`,
    ``,
    `Please visit us or clear your dues at the earliest to avoid penalty.`,
  ];
  if (shopPhone) lines.push(`Contact: ${shopPhone}`);
  lines.push(``, `Thank you,`, shopName);

  return lines.join("\n");
}

// ── Single loan reminder ──────────────────────────────────────────────────────
// POST /messages/send/:loanId
// For SMS   → sends via Fast2SMS, returns { success, to }
// For WA    → returns { waLink } for the frontend to open; no API call is made
router.post("/messages/send/:loanId", requireAuth, async (req, res) => {
  try {
    const loanId      = parseInt(String(req.params.loanId));
    const useWhatsApp = req.body.channel === "whatsapp";

    const settings = await getShopSettings();

    if (!useWhatsApp && !settings.fast2smsApiKey) {
      return res.status(400).json({
        error: "Fast2SMS API key not configured. Go to Settings → Shop & Messaging and add your key.",
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
    const toNumber = (useWhatsApp ? (customerWhatsapp || customerPhone) : customerPhone);
    if (!toNumber) return res.status(400).json({ error: "Customer has no phone number on file." });

    const message = buildReminderMessage(
      settings.shopName, settings.shopPhone,
      customerName ?? "Customer",
      loan.loanNumber, loan.loanType,
      loan.principalAmount, loan.outstandingBalance,
      loan.dueDate,
    );

    if (useWhatsApp) {
      // Return a wa.me deep-link; the browser opens WhatsApp with message pre-filled
      const e164   = toE164(toNumber).replace("+", "");  // wa.me uses no + prefix
      const waLink = `https://wa.me/${e164}?text=${encodeURIComponent(message)}`;
      return res.json({ success: true, waLink, to: toNumber, channel: "whatsapp" });
    }

    await sendFast2SMS(toNumber, message, settings.fast2smsApiKey!);
    return res.json({ success: true, to: toNumber, channel: "sms", provider: "fast2sms" });
  } catch (err: any) {
    req.log.error({ err }, "Send single reminder error");
    return res.status(500).json({ error: err?.message ?? "Failed to send message." });
  }
});

// ── All overdue reminders ─────────────────────────────────────────────────────
// POST /messages/send-overdue
// For SMS → sends all via Fast2SMS
// For WA  → returns { waLinks: [...] } for the frontend to show as clickable list
router.post("/messages/send-overdue", requireAuth, async (req, res) => {
  try {
    const useWhatsApp = req.body.channel === "whatsapp";
    const settings    = await getShopSettings();

    if (!useWhatsApp && !settings.fast2smsApiKey) {
      return res.status(400).json({
        error: "Fast2SMS API key not configured. Go to Settings → Shop & Messaging and add your key.",
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

    if (useWhatsApp) {
      // Build wa.me links for every overdue loan; no SMS API call
      const waLinks: any[] = [];
      for (const { loan, customerName, customerPhone, customerWhatsapp } of overdueRows) {
        const toNumber = customerWhatsapp || customerPhone;
        if (!toNumber) {
          waLinks.push({ loanId: loan.id, loanNumber: loan.loanNumber, customerName, skipped: true, reason: "No phone number" });
          continue;
        }
        const message = buildReminderMessage(
          settings.shopName, settings.shopPhone,
          customerName ?? "Customer",
          loan.loanNumber, loan.loanType,
          loan.principalAmount, loan.outstandingBalance,
          loan.dueDate,
        );
        const e164   = toE164(toNumber).replace("+", "");
        const waLink = `https://wa.me/${e164}?text=${encodeURIComponent(message)}`;
        waLinks.push({ loanId: loan.id, loanNumber: loan.loanNumber, customerName, toNumber, waLink });
      }
      return res.json({ whatsapp: true, waLinks, total: overdueRows.length });
    }

    let sent = 0, failed = 0;
    const results: any[] = [];

    for (const { loan, customerName, customerPhone } of overdueRows) {
      if (!customerPhone) {
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
        await sendFast2SMS(customerPhone, message, settings.fast2smsApiKey!);
        sent++;
        results.push({ loanId: loan.id, loanNumber: loan.loanNumber, customerName, status: "sent", to: customerPhone });
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
