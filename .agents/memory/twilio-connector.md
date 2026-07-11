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
// WRONG — accountData is a Response, not JSON:
const accountData = await connectors.proxy("twilio", "/2010-04-01/Accounts.json") as any;
const sid = accountData?.accounts?.[0]?.sid; // always undefined!

// CORRECT — parse the response:
const response = await connectors.proxy("twilio", "/2010-04-01/Accounts.json") as Response;
const accountData = await response.json();
const sid = accountData?.accounts?.[0]?.sid;
```

## Preferred: get Account SID from connector settings (no extra API call)

The connector already stores `account_sid` in its settings. Use `listConnections()` instead:

```ts
const connectors = new ReplitConnectors();
const connections = await connectors.listConnections({ connector_names: "twilio" });
const accountSid = (connections[0] as any)?.settings?.account_sid as string | undefined;
if (!accountSid) throw new Error("Could not retrieve Twilio Account SID from connector settings.");
```

## Sending a message

```ts
const msgResponse = await connectors.proxy(
  "twilio",
  `/2010-04-01/Accounts/${accountSid}/Messages.json`,
  {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: toNum, From: fromNum, Body: text }),
    // Pass URLSearchParams directly — SDK handles it natively
  },
) as Response;

if (!msgResponse.ok) {
  const errData = await msgResponse.json().catch(() => ({})) as any;
  throw new Error(errData?.message ?? `Twilio error ${msgResponse.status}`);
}
```

## WhatsApp
Prefix both To and From with `"whatsapp:"`:
- `To: "whatsapp:+91XXXXXXXXXX"`, `From: "whatsapp:+1XXXXXXXXXX"`
- The From number must be enrolled in Twilio's WhatsApp service or sandbox.

## Shop settings
The `twilioFromNumber` (sender) is stored in `shop_settings` DB table, configured via Settings → Shop & Messaging in the UI.
