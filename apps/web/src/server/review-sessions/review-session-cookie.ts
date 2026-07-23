import jwt from "jsonwebtoken";
import { requireEnv } from "../env";

export const REVIEW_SESSION_COOKIE_NAME_PREFIX = "fylmico_review_";

// One cookie per review session (name suffixed with the session id) rather
// than a single shared cookie, so verifying one client link never clobbers
// another still-unverified one open in the same browser.
export function reviewSessionCookieName(reviewSessionId: string): string {
  return `${REVIEW_SESSION_COOKIE_NAME_PREFIX}${reviewSessionId}`;
}

export interface ReviewSessionCookieClaims {
  reviewSessionId: string;
  clientEmail: string;
}

// Deliberately its own secret (not JWT_ACCESS_SECRET) - this cookie proves
// "this browser passed OTP for this one review link", a much narrower and
// lower-trust claim than a real user's session, so a leak of one secret
// shouldn't affect the other.
export function signReviewSessionCookie(
  claims: ReviewSessionCookieClaims
): string {
  const secret = requireEnv("REVIEW_SESSION_COOKIE_SECRET");
  return jwt.sign(claims, secret, { expiresIn: "30d" });
}

export function verifyReviewSessionCookie(
  token: string
): ReviewSessionCookieClaims | null {
  const secret = requireEnv("REVIEW_SESSION_COOKIE_SECRET");
  try {
    return jwt.verify(token, secret) as unknown as ReviewSessionCookieClaims;
  } catch {
    return null;
  }
}
