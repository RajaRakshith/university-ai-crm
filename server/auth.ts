import bcrypt from "bcrypt";
import type { Request, Response, NextFunction } from "express";
import type { Session } from "express-session";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: "student" | "organizer";
}

declare module "express-session" {
  interface SessionData {
    user?: AuthUser;
  }
}

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Validate password strength
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters long" };
  }
  return { valid: true };
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Get current user from session
export function getCurrentUser(req: Request): AuthUser | null {
  return req.session.user || null;
}

// Middleware: Require authentication
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

// Middleware: Require specific role
export function requireRole(role: "student" | "organizer") {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    if (req.session.user.role !== role) {
      res.status(403).json({ error: `Access denied. ${role} role required.` });
      return;
    }
    next();
  };
}

// Middleware: Require organizer OR check ownership
export function requireOrganizerOrOwnership(getOwnerId: (req: Request) => Promise<string | null>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.session.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Organizers can access anything
    if (req.session.user.role === "organizer") {
      next();
      return;
    }

    // Students can only access their own resources
    if (req.session.user.role === "student") {
      const ownerId = await getOwnerId(req);
      if (ownerId === req.session.user.id) {
        next();
        return;
      }
    }

    res.status(403).json({ error: "Access denied" });
  };
}
