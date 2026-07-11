import { Router } from "express";
import { db } from "@workspace/db";
import { loansTable, customersTable, shopSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
// Direct Twilio REST API calls — no connector proxy needed (proxy uses JWT which Twilio REST rejects)
import { format } from "date-fns";

const router = Router();

async function getShopSettings() {
  const rows = await db.select().from(shopSettingsTable).limit(1);
  return rows[0] ?? {
    shopName: "GoldVault Pawn Broker",
    shopPhone: null,
    shopAddress: null,
    twilioAccountSid: null,
    twilioAuthToken: null,
    twilioFromNumber: null,
    twilioWhatsappEnabled: false,
    fast2smsApiKey: null,
  };
}

/** Normalise a phone number to E.164. Assumes India (+91) if no country code. */
function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (phone.startsWith("+")) return phone.trim();
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return `+${digits}`;
}

/** Strip to 10-digit Indian number for Fast2SMS (removes +91 / 91 prefix). */
function toFast2SMSNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 10) return digits;
  return digits.slice(-10); // best-effort
}

/** Send SMS via Fast2SMS — works to any Indian number, no verification required. */
async function sendFast2SMS(to: string, body: string, apiKey: string): Promise<void> {
  const number = toFast2SMSNumber(to);
  const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: {
      "authorization": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      route: "q",          // Quick SMS — no DLT template registration required
      message: body,
      language: "english",
      flash: 0,
      numbers: number,
    }),
  });
  const data = await response.json().catch(() => ({})) as any;
  if (!data?.return) {
    const msg = Array.isArray(data?.message) ? data.message[0] : (data?.message ?? "Fast2SMS error");
    throw new Error(msg);
  }
}

async function sendTwilioMessage(
  to: string,
  body: string,
  fromNumber: string,
  accountSid: string,
  authToken: string,
  useWhatsApp: boolean,
): Promise<void> {
  // Call Twilio REST API directly with HTTP Basic Auth (Account SID + Auth Token).
  // The Replit connector proxy uses JWT which Twilio REST API does not accept for SMS.
  // Only normalise the customer's number — the shop's Twilio number is already correct.
  const normalizedTo = toE164(to);
  const toNum   = useWhatsApp ? `whatsapp:${normalizedTo}` : normalizedTo;
  const fromNum = useWhatsApp ? `whatsapp:${fromNumber}`   : fromNumber;

  const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const msgResponse = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method:  "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type":  "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: toNum, From: fromNum, Body: body }),
    },
  );

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
    const useFast2SMS = !!(settings as any).fast2smsApiKey;

    // Validate credentials for whichever provider is active
    if (useFast2SMS && useWhatsApp) {
      return res.status(400).json({ error: "Fast2SMS does not support WhatsApp. Switch to SMS channel." });
    }
    if (!useFast2SMS) {
      if (!settings.twilioAccountSid)         return res.status(400).json({ error: "No SMS provider configured. Add a Fast2SMS API key or Twilio credentials in Settings → Shop & Messaging." });
      if (!(settings as any).twilioAuthToken) return res.status(400).json({ error: "Twilio Auth Token not configured. Go to Settings → Shop & Messaging." });
      if (!settings.twilioFromNumber)         return res.status(400).json({ error: "Twilio sender number not configured. Go to Settings → Shop & Messaging." });
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

    if (useFast2SMS) {
      await sendFast2SMS(toNumber, message, (settings as any).fast2smsApiKey!);
    } else {
      await sendTwilioMessage(toNumber, message, settings.twilioFromNumber!, settings.twilioAccountSid!, (settings as any).twilioAuthToken!, useWhatsApp);
    }
    return res.json({ success: true, to: toNumber, channel: useWhatsApp ? "whatsapp" : "sms", provider: useFast2SMS ? "fast2sms" : "twilio" });
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
    const useFast2SMS = !!(settings as any).fast2smsApiKey;

    if (useFast2SMS && useWhatsApp) {
      return res.status(400).json({ error: "Fast2SMS does not support WhatsApp. Switch to SMS channel." });
    }
    if (!useFast2SMS) {
      if (!settings.twilioAccountSid)         return res.status(400).json({ error: "No SMS provider configured. Add a Fast2SMS API key or Twilio credentials in Settings → Shop & Messaging." });
      if (!(settings as any).twilioAuthToken) return res.status(400).json({ error: "Twilio Auth Token not configured. Go to Settings → Shop & Messaging." });
      if (!settings.twilioFromNumber)         return res.status(400).json({ error: "Twilio sender number not configured. Go to Settings → Shop & Messaging." });
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
        if (useFast2SMS) {
          await sendFast2SMS(toNumber, message, (settings as any).fast2smsApiKey!);
        } else {
          await sendTwilioMessage(toNumber, message, settings.twilioFromNumber!, settings.twilioAccountSid!, (settings as any).twilioAuthToken!, useWhatsApp);
        }
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
