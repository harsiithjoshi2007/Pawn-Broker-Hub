import express, { type Express } from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";
import router from "./routes";
import { logger } from "./lib/logger";
import { populateFromBearer } from "./middleware/auth";

// Ensure the session table exists (connect-pg-simple's createTableIfMissing
// reads a SQL file that esbuild doesn't bundle, so we create it ourselves).
async function ensureSessionTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "user_sessions" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL,
      CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
    ) WITH (OIDS=FALSE);
    CREATE INDEX IF NOT EXISTS "IDX_user_sessions_expire" ON "user_sessions" ("expire");
  `);
}

ensureSessionTable().catch((err) =>
  logger.error({ err }, "Failed to ensure session table"),
);

const PgSession = connectPgSimple(session);

const app: Express = express();

// Trust proxy for Replit's reverse proxy
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Build an explicit allowlist of trusted origins.
// In development, we allow the Replit dev domain (host-based proxying) plus localhost.
// In production, restrict to ALLOWED_ORIGINS env var (comma-separated).
function buildAllowedOrigins(): string[] {
  const env = process.env.ALLOWED_ORIGINS;
  if (env) {
    return env.split(",").map((o) => o.trim()).filter(Boolean);
  }
  // Development fallback: Replit proxied origins
  const replitDevDomain = process.env.REPLIT_DEV_DOMAIN;
  const expoDevDomain = process.env.REPLIT_EXPO_DEV_DOMAIN;
  const origins: string[] = ["http://localhost:3000", "http://localhost:5173"];
  if (replitDevDomain) {
    origins.push(`https://${replitDevDomain}`);
  }
  // Allow the Expo web preview domain so mobile app's web build can reach the API
  if (expoDevDomain) {
    origins.push(`https://${expoDevDomain}`);
  }
  return origins;
}

const allowedOrigins = buildAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin requests (no Origin header).
      if (!origin) return callback(null, true);
      // Allow explicit allowlist entries and their subdomains.
      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.some((o) =>
          origin.endsWith(`.${o.replace(/^https?:\/\//, "")}`)
        )
      ) {
        return callback(null, true);
      }
      // Always allow Replit deployment domains (*.replit.app) and dev preview
      // domains (*.replit.dev) — these are Replit-proxied origins that only
      // the project owner can register.
      if (
        origin.endsWith(".replit.app") ||
        origin.endsWith(".replit.dev")
      ) {
        return callback(null, true);
      }
      callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware with PostgreSQL store
app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "user_sessions",
    }),
    secret: (() => {
      const s = process.env.SESSION_SECRET;
      if (!s) throw new Error("SESSION_SECRET environment variable is required but not set.");
      return s;
    })(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// Bearer-token middleware: runs after session middleware so session takes
// priority. For requests with a valid Authorization: Bearer <jwt> and no
// active session, backfills req.tokenUserId / req.tokenUserRole so that
// requireAuth and route handlers work identically for both auth methods.
app.use(
  populateFromBearer(
    (() => {
      const s = process.env.JWT_SECRET ?? process.env.SESSION_SECRET;
      if (!s) throw new Error("JWT_SECRET or SESSION_SECRET must be set");
      return s;
    })()
  )
);

app.use("/api", router);

export default app;
