import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";
import { navigationRef } from "../navigation/navigationRef";
import { sendCustomerEmail } from "../api/communications";
import { approveFinancialRevision, rejectFinancialRevision } from "../api/quickActions";
import { resolveActionUrl } from "./actionUrl";

/**
 * Notification categories give iOS/Android action buttons on the notification
 * itself (Approve/Decline/Reply/View) without opening the app first. This is
 * inert until the backend's push payload includes a matching `categoryId` —
 * ExpoPushService/notifyUser() don't send one yet (flagged back separately).
 * Registering the categories now costs nothing and means it lights up the
 * moment that one param is added, same graceful-degradation pattern as
 * everything else in this app.
 */
export const NOTIFICATION_CATEGORY = {
  CUSTOMER_REPLY: "customer_reply",
  REVISION_PENDING: "revision_pending",
  LIVE_CHAT_REQUEST: "live_chat_request",
} as const;

export async function registerNotificationCategories() {
  await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORY.CUSTOMER_REPLY, [
    {
      identifier: "reply",
      buttonTitle: "Reply",
      textInput: { submitButtonTitle: "Send", placeholder: "Type a reply…" },
      options: { opensAppToForeground: true },
    },
    { identifier: "view", buttonTitle: "View", options: { opensAppToForeground: true } },
  ]);

  await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORY.REVISION_PENDING, [
    { identifier: "approve", buttonTitle: "Approve", options: { opensAppToForeground: true } },
    { identifier: "decline", buttonTitle: "Decline", options: { opensAppToForeground: true, isDestructive: true } },
    { identifier: "view", buttonTitle: "View", options: { opensAppToForeground: true } },
  ]);

  // Default tap already resolves action_url via goToActionUrl() below — this
  // category only exists to label the notification's button "View" instead
  // of relying on the bare default tap.
  await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORY.LIVE_CHAT_REQUEST, [
    { identifier: "view", buttonTitle: "View", options: { opensAppToForeground: true } },
  ]);
}

/**
 * Expected push `data` shape (to flag back to backend alongside categoryId):
 * { related_type?: "customer"|"order"; related_id?: number; action_url?: string }
 * Missing/unrecognized data degrades to just opening the app — never crashes.
 */
export function handleNotificationResponse(response: Notifications.NotificationResponse) {
  const data = response.notification.request.content.data as
    | { related_type?: string; related_id?: number; action_url?: string }
    | undefined;
  const actionId = response.actionIdentifier;

  const goToActionUrl = () => {
    if (!navigationRef.isReady()) return;
    resolveActionUrl(data?.action_url, navigationRef);
  };

  // Default tap (no action button — the notification body itself) or "view"
  if (actionId === Notifications.DEFAULT_ACTION_IDENTIFIER || actionId === "view") {
    goToActionUrl();
    return;
  }

  if (actionId === "reply" && data?.related_type === "customer" && data.related_id) {
    const text = (response as { userText?: string }).userText;
    if (!text?.trim()) return;
    sendCustomerEmail(data.related_id, { subject: "Re: your message", body: text.trim().replace(/\n/g, "<br>") })
      .then(() => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success))
      .catch(() => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
    return;
  }

  if (actionId === "approve" && data?.related_type === "order" && data.related_id) {
    approveFinancialRevision(data.related_id)
      .then(() => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success))
      .catch(() => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error))
      .finally(goToActionUrl);
    return;
  }

  if (actionId === "decline" && data?.related_type === "order" && data.related_id) {
    rejectFinancialRevision(data.related_id)
      .then(() => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success))
      .catch(() => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error))
      .finally(goToActionUrl);
    return;
  }

  // Unrecognized action — fall back to just opening to the right place
  goToActionUrl();
}
