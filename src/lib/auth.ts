import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "fallback-dev-secret";

export interface AuthPayload {
  userId: number;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function verifyAuthToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export function readTokenFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const entry of cookieHeader.split(";")) {
    const [rawKey, ...rawValue] = entry.trim().split("=");
    if (rawKey === "token") {
      return rawValue.join("=") || null;
    }
  }

  return null;
}

export function isAuthenticatedRequest(request: Request) {
  const token = readTokenFromCookieHeader(request.headers.get("cookie"));

  if (!token) {
    return false;
  }

  return !!verifyAuthToken(token);
}
