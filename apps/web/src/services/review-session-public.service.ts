import type {
  ReviewClientComment,
  ReviewContent,
  ReviewPublicPreview
} from "@/types/base";

const BASE_URL = "/api/v1/review-sessions";

// Deliberately not built on lib/api/client.ts's apiRequest(). These routes
// never send a bearer token - they're gated by the review-session cookie
// instead - and apiRequest's 401 handling calls clearSession(), which would
// wrong-headedly log out a staff member who opens a client review link
// while signed in. Same isolation reasoning as REVIEW_SESSION_COOKIE_SECRET
// being a dedicated env var rather than reusing the access-token secret.
export class ReviewSessionError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ReviewSessionError";
    this.status = status;
    this.code = code;
  }
}

async function request<T>(
  path: string,
  options: {
    method?: "GET" | "POST";
    body?: unknown;
    query?: Record<string, string | number | undefined>;
  } = {}
): Promise<T> {
  const { method = "GET", body, query } = options;

  const url = new URL(`${BASE_URL}${path}`, "http://localhost");
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(`${url.pathname}${url.search}`, {
    method,
    headers:
      body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const payload = (await response.json().catch(() => null)) as {
    data?: T;
    error?: { code: string; message: string };
  } | null;

  if (!response.ok) {
    throw new ReviewSessionError(
      response.status,
      payload?.error?.code ?? "unknown_error",
      payload?.error?.message ?? "Something went wrong. Please try again."
    );
  }

  return payload?.data as T;
}

export function getReviewPreview(token: string): Promise<ReviewPublicPreview> {
  return request(`/${token}`);
}

export function verifyReviewPassword(
  token: string,
  password: string
): Promise<{ verified: boolean }> {
  return request(`/${token}/password/verify`, {
    method: "POST",
    body: { password }
  });
}

export function requestReviewOtp(token: string): Promise<{ sent: boolean }> {
  return request(`/${token}/otp/request`, { method: "POST" });
}

export function verifyReviewOtp(
  token: string,
  code: string
): Promise<{ verified: boolean }> {
  return request(`/${token}/otp/verify`, { method: "POST", body: { code } });
}

export function getReviewContent(
  token: string,
  version?: number
): Promise<ReviewContent> {
  return request(`/${token}/content`, { query: { version } });
}

export function addReviewComment(
  token: string,
  body: string,
  timestampSeconds?: number,
  version?: number
): Promise<ReviewClientComment> {
  return request(`/${token}/comments`, {
    method: "POST",
    body: { body, timestampSeconds, version }
  });
}

export function addReviewReply(
  token: string,
  commentId: string,
  body: string
): Promise<ReviewClientComment> {
  return request(`/${token}/comments/${commentId}/replies`, {
    method: "POST",
    body: { body }
  });
}

export function toggleReviewReaction(
  token: string,
  commentId: string,
  emoji: string
): Promise<ReviewClientComment> {
  return request(`/${token}/comments/${commentId}/reactions`, {
    method: "POST",
    body: { emoji }
  });
}

export function approveReview(token: string): Promise<{ approved: boolean }> {
  return request(`/${token}/approve`, { method: "POST" });
}

export function requestReviewChanges(
  token: string,
  feedback: string,
  priority?: string,
  deadline?: string
): Promise<{ submitted: boolean }> {
  return request(`/${token}/request-changes`, {
    method: "POST",
    body: { feedback, priority, deadline }
  });
}
