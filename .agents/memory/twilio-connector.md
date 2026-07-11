---
name: Twilio messaging via Replit connector
description: How to send SMS/WhatsApp via the installed Twilio Replit integration without raw credentials
---

## Rule
Use `@replit/connectors-sdk` with `ReplitConnectors`. Do NOT use the `twilio` npm package or hardcode credentials.

**Why:** The Replit Twilio connector (conn_twilio_01KX8MQHE3G8X1JQNX6EDJVERV) manages auth. Raw credentials are not exposed as env vars.

## CRITICAL: proxy() returns a Response object, not parsed JSON

`connectors.proxy()` behaves like `fetch()` — it returns a `Response`. You MUST call `.json()` on it:

```ts
// WRONG — treats Response as JSON, always undefined:
const accountData = await connectors.proxy("twilio", "...") as any;
const sid = accountData?.accounts?.[0]?.sid; // always undefined!

// CORRECT — parse the response:
const response = await connectors.proxy("twilio", "...") as Response;
const accountData = await response.json();
```

## CRITICAL: Account SID comes from shop_settings, NOT the connector

`connectors.listConnections()` from server-side code does NOT return unredacted settings (the `settings` object has `account_sid: "[redacted]"`). Calling `GET /2010-04-01/Accounts.json` also fails with API key auth.

**The correct approach:** Store `twilioAccountSid` in the `shop_settings` DB table. The admin enters it once from Settings → Shop & Messaging (find it on Twilio Console dashboard, starts with AC…).

```ts
// In messages route:
const settings = await getShopSettings();
if (!settings.twilioAccountSid) {
  return res.status(400).json({ error: "Twilio Account SID not configured." });
}
// Then pass accountSid directly to the send function:
await sendTwilioMessage(to, body, fromNumber, settings.twilioAccountSid, useWhatsApp);
```

## Sending a message (correct pattern)

```ts
async function sendTwilioMessage(to, body, fromNumber, accountSid, useWhatsApp) {
  const connectors = new ReplitConnectors();
  const toNum = useWhatsApp ? `whatsapp:${to}` : to;
  const fromNum = useWhatsApp ? `whatsapp:${fromNumber}` : fromNumber;

  const msgResponse = await connectors.proxy(
    "twilio",
    `/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ To: toNum, From: fromNum, Body: body }),
    },
  ) as Response;

  if (!msgResponse.ok) {
    const errData = await msgResponse.json().catch(() => ({})) as any;
    throw new Error(errData?.message ?? `Twilio error ${msgResponse.status}`);
  }
}
```

## WhatsApp
Prefix both To and From with `"whatsapp:"`. The From number must be enrolled in Twilio's WhatsApp service or sandbox.

## Shop settings required fields
- `twilioAccountSid` — Twilio Account SID (ACxxx…), entered by admin in Settings
- `twilioFromNumber` — Twilio phone number in E.164 format
- `twilioWhatsappEnabled` — boolean toggle
