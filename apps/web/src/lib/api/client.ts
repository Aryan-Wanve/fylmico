import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setSession
} from "@/lib/session";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000/api/v1";

type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  auth?: boolean;
};

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function rawFetch<T>(
  path: string,
  { method = "GET", body, query, auth = true }: RequestOptions
): Promise<{
  ok: boolean;
  status: number;
  payload: (ApiErrorBody & { data?: T }) | null;
}> {
  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const payload = (await response.json().catch(() => null)) as
    (ApiErrorBody & { data?: T }) | null;
  return { ok: response.ok, status: response.status, payload };
}

// Deduplicates concurrent refresh attempts so multiple 401s in flight at
// once (e.g. several dashboard widgets fetching in parallel) trigger a
// single POST /auth/refresh, not one per request.
let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  refreshPromise ??= (async () => {
    try {
      const { ok, payload } = await rawFetch<{
        accessToken: string;
        refreshToken: string;
      }>("/auth/refresh", {
        method: "POST",
        body: { refreshToken },
        auth: false
      });
      if (!ok || !payload?.data) {
        return false;
      }
      setSession(payload.data.accessToken, payload.data.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { auth = true } = options;

  let { ok, status, payload } = await rawFetch<T>(path, options);

  if (!ok && status === 401 && auth && getRefreshToken()) {
    const refreshed = await refreshSession();
    if (refreshed) {
      ({ ok, status, payload } = await rawFetch<T>(path, options));
    }
  }

  if (!ok) {
    if (status === 401) {
      clearSession();
    }
    const errorInfo = payload?.error;
    throw new ApiError(
      status,
      errorInfo?.code ?? "unknown_error",
      errorInfo?.message ?? "Something went wrong. Please try again."
    );
  }

  return (payload as { data: T })?.data;
}
