import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useUnreadNotificationsCount } from "./useUnreadNotificationsCount";
import { useUnreadInboxCount } from "./useUnreadInboxCount";

/**
 * Unified app-icon badge = notifications + inbox unread combined, so the
 * badge always means "something needs you," not two different half-truths.
 * Only updates while the app is open and polling — no background task, same
 * constraint as the rest of this app's polling-based approach.
 */
export function useAppBadge() {
  const unreadNotifications = useUnreadNotificationsCount();
  const unreadInbox = useUnreadInboxCount();

  useEffect(() => {
    void Notifications.setBadgeCountAsync(unreadNotifications + unreadInbox);
  }, [unreadNotifications, unreadInbox]);
}
