import { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    userId: number;
    userRole: string;
    userName: string;
    userEmail: string;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!roles.includes(req.session.userRole)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}
