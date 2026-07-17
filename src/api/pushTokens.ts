import { apiFetch, AdminApiError } from "./client";

/**
 * POST /admin/push-tokens — doesn't exist yet (backend building it in
 * parallel per the mobile-app plan). A 404 here is the expected state today,
 * not an error — same graceful-degradation approach used throughout the web
 * app for backend-pending features. Silently no-ops until it ships.
 */
export async function registerPushToken(token: string, platform: "ios" | "android") {
  try {
    await apiFetch("/admin/push-tokens", { method: "POST", body: { token, platform } });
  } catch (err) {
    if (err instanceof AdminApiError && err.status === 404) return;
    // Any other failure (network, 5xx) — also non-fatal, push registration
    // retries next app foreground anyway.
  }
}
