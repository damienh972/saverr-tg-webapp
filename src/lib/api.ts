import { getLaunchSafe } from "./tma";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const launch = getLaunchSafe();

/**
 * Makes an API request with JSON body and automatic Telegram Mini App authentication.
 * @param path - API endpoint path
 * @param opts - Request options (method, body, headers)
 * @returns Promise resolving to the JSON response
 */
export async function apiJson<T>(
  path: string,
  opts: { method?: string; body?: unknown; headers?: Record<string, string> } = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
      // Add Telegram Mini App authentication if available
      ...(launch.initDataRaw ? { Authorization: `tma ${launch.initDataRaw}` } : {}),
    },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

export async function updateTransactionStatus(id: string, status: "PROCESSING" | "CANCELLED"): Promise<any> {
  return apiJson(`/api/transaction/${id}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { status },
  });
}

