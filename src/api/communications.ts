import { apiFetch } from "./client";
import type { Communication, CommunicationInboxRow, PaginatedMeta } from "./types";

export function fetchInbox(page = 1) {
  return apiFetch<{ data: CommunicationInboxRow[]; meta: PaginatedMeta; message: string }>(
    "/admin/communications/inbox",
    { params: { page } }
  );
}

export function fetchCustomerCommunications(customerId: number) {
  return apiFetch<{ data: Communication[]; message: string }>(
    `/admin/customers/${customerId}/communications`
  );
}

type SendEmailInput = {
  subject: string;
  body: string;
  cc?: string[];
  in_reply_to_id?: number;
  attachment?: { uri: string; name: string; mimeType: string } | null;
};

export async function sendCustomerEmail(customerId: number, input: SendEmailInput) {
  const form = new FormData();
  form.append("subject", input.subject);
  form.append("body", input.body);
  (input.cc ?? []).forEach((addr) => form.append("cc[]", addr));
  if (input.in_reply_to_id != null) form.append("in_reply_to_id", String(input.in_reply_to_id));
  if (input.attachment) {
    // React Native's FormData accepts { uri, name, type } file objects directly.
    form.append("attachments[]", {
      uri: input.attachment.uri,
      name: input.attachment.name,
      type: input.attachment.mimeType,
    } as unknown as Blob);
  }

  return apiFetch<{ success: boolean; data: Communication; message: string }>(
    `/admin/customers/${customerId}/communications/send-email`,
    { method: "POST", formData: form }
  );
}
