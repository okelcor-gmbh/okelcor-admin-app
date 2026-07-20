import { apiFetch } from "./client";
import type { CrispConversation, CrispMessage } from "./types";

export function fetchCrispConversations(page = 1) {
  return apiFetch<{ data: CrispConversation[]; message?: string }>("/admin/crisp/conversations", {
    params: { page },
  });
}

export function fetchCrispMessages(sessionId: string) {
  return apiFetch<{ data: CrispMessage[]; message?: string }>(
    `/admin/crisp/conversations/${sessionId}/messages`
  );
}

export function sendCrispReply(sessionId: string, body: string) {
  return apiFetch<{ data: unknown; message?: string }>(`/admin/crisp/conversations/${sessionId}/reply`, {
    method: "POST",
    body: { body },
  });
}

export function resolveCrispConversation(sessionId: string) {
  return apiFetch<{ data: unknown; message?: string }>(`/admin/crisp/conversations/${sessionId}/resolve`, {
    method: "POST",
  });
}
