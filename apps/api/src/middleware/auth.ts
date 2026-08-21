import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  role: string;
}

/**
 * Express middleware: verifies the JWT access token from the Authorization header.
 * On success, attaches `req.user` with { userId, role }.
 * On failure, returns 401.
 */
export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or malformed authorization header", code: "UNAUTHORIZED" });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token", code: "UNAUTHORIZED" });
  }
}

/** Helper to read the authenticated user from the request (after verifyToken). */
export function getUser(req: Request): JwtPayload {
  return (req as any).user;
}
