import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare module "express-session" {
  interface SessionData {
    userId: number;
    userRole: string;
    userName: string;
    userEmail: string;
  }
}

// Augment Express Request with bearer-token user context.
// Populated by populateFromBearer() before route handlers run.
declare global {
  namespace Express {
    interface Request {
      tokenUserId?: number;
      tokenUserRole?: string;
      tokenUserName?: string;
      tokenUserEmail?: string;
    }
  }
}

/**
 * Global middleware — mount this AFTER express-session.
 * When a valid `Authorization: Bearer <jwt>` header is present and there is
 * no active session, verifies the token and backfills req.token* fields so
 * that requireAuth / requireRole / getAuthUserId work identically for both
 * cookie-based and token-based callers.
 */
export function populateFromBearer(secret: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // Session already authenticated — bearer header not needed
    if (req.session?.userId) {
      return next();
    }

    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return next();
    }

    const token = auth.slice(7);
    try {
      const payload = jwt.verify(token, secret) as {
        userId: number;
        userRole: string;
        userName: string;
        userEmail: string;
      };
      req.tokenUserId = payload.userId;
      req.tokenUserRole = payload.userRole;
      req.tokenUserName = payload.userName;
      req.tokenUserEmail = payload.userEmail;
    } catch {
      // Expired or malformed token — leave token* fields unset; the route
      // handler will return 401 via requireAuth if auth is needed.
    }

    next();
  };
}

/** Resolve the authenticated user ID from either a session or bearer token. */
export function getAuthUserId(req: Request): number | undefined {
  return req.session?.userId ?? req.tokenUserId;
}

/** Resolve the authenticated user role from either a session or bearer token. */
export function getAuthUserRole(req: Request): string | undefined {
  return req.session?.userRole ?? req.tokenUserRole;
}

/** Middleware: require any authenticated caller (session OR bearer token). */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.userId && !req.tokenUserId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

/** Middleware: require an authenticated caller with one of the given roles. */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session?.userId && !req.tokenUserId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const role = req.session?.userRole ?? req.tokenUserRole;
    if (!role || !roles.includes(role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}
