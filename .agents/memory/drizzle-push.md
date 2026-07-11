---
name: Drizzle push requires TTY — use raw SQL instead
description: drizzle-kit push always fails in non-interactive shells; apply schema changes via executeSql
---

## Rule
Never use `pnpm --filter @workspace/db run push` or `push-force` from the shell tool — it requires a TTY even with `--force` and always errors with "Interactive prompts require a TTY terminal".

**Why:** drizzle-kit push opens an interactive prompt for new tables/columns regardless of the `--force` flag when running from a non-TTY shell (CI, ShellExec tool).

## How to apply
Use the `executeSql` CodeExecution callback to run raw DDL directly:

```js
await executeSql({ sqlQuery: `
  ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS relation_type TEXT,
    ADD COLUMN IF NOT EXISTS relative_name TEXT;

  CREATE TABLE IF NOT EXISTS shop_settings (
    id SERIAL PRIMARY KEY,
    shop_name TEXT NOT NULL DEFAULT 'GoldVault Pawn Broker',
    ...
  );
` });
```

This bypasses drizzle-kit entirely and applies changes directly. The Drizzle ORM schema file still needs to be updated so TypeScript types stay in sync.
