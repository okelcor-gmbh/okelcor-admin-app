/**
 * Thin fetch wrapper for the Okelcor admin API. Mirrors the typed-error
 * pattern in okelcor-website/lib/admin-api.ts (AdminUnauthorizedError /
 * AdminApiError) so the two clients read the same way, even though types
 * are ported rather than shared — see the mobile-app plan for why.
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class AdminUnauthorizedError extends Error {
  constructor() {
    super("Admin authentication required");
    this.name = "AdminUnauthorizedError";
  }
}

export class AdminApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

// In-memory token cache, kept in sync with SecureStore by AuthContext.
// Avoids threading the token through every single API call site.
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

// AuthContext registers its logout() here on mount, so a 401 from anywhere
// (any query/mutation) can trigger a global sign-out without threading the
// auth context through every API call site.
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | undefined>;
  /** Send as multipart/form-data instead of JSON (e.g. inbox reply attachments) */
  formData?: FormData;
};

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, params, formData } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  if (!formData) headers["Content-Type"] = "application/json";

  const res = await fetch(buildUrl(path, params), {
    method,
    headers,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });

  if (res.status === 401) {
    onUnauthorized?.();
    throw new AdminUnauthorizedError();
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message = (json?.message as string | undefined) ?? `Request failed (${res.status})`;
    const code = json?.code as string | undefined;
    throw new AdminApiError(res.status, message, code);
  }

  return json as T;
}
