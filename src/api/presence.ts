import { apiFetch } from "./client";

export function updatePresence(availableForChat: boolean) {
  return apiFetch<{ data: { available_for_chat: boolean }; message: string }>("/admin/presence", {
    method: "PUT",
    body: { available_for_chat: availableForChat },
  });
}
