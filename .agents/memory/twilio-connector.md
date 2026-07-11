---
name: Twilio messaging via Replit connector
description: How to send SMS/WhatsApp via the installed Twilio Replit integration without raw credentials
---

## Rule
Use `@replit/connectors-sdk` with `ReplitConnectors.proxy("twilio", endpoint, options)`. Do NOT use the `twilio` npm package or hardcode credentials.

**Why:** The Replit Twilio connector (conn_twilio_01KX8MQHE3G8X1JQNX6EDJVERV) manages auth. Raw credentials are not exposed as env vars.

## How to apply

```ts
import { ReplitConnectors } from "@replit/connectors-sdk";

const connectors = new ReplitConnectors();

// 1. Get Account SID dynamically — do NOT hardcode it
const accountData = await connectors.proxy("twilio", "/2010-04-01/Accounts.json") as any;
const accountSid = accountData.accounts[0].sid;

// 2. Send SMS
await connectors.proxy("twilio", `/2010-04-01/Accounts/${accountSid}/Messages.json`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ To: toNum, From: fromNum, Body: text }).toString(),
});

// 3. For WhatsApp, prefix numbers with "whatsapp:"
// To: "whatsapp:+91XXXXXXXXXX", From: "whatsapp:+1XXXXXXXXXX"
```

The `twilioFromNumber` (sender) is stored in `shop_settings` DB table and configured via Settings → Shop & Messaging in the UI.
