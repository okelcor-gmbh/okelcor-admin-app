import { useEffect } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { registerPushToken } from "../api/pushTokens";

/**
 * Requests notification permission and registers the Expo push token with
 * the backend. Call once, only while signed in — the endpoint is scoped to
 * the authenticated admin. Can't be verified in a simulator (no APNs there);
 * needs a physical device. The backend endpoint itself doesn't exist yet
 * either (see docs), so this safely no-ops end to end until both land.
 */
export function usePushRegistration(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (!Device.isDevice) return; // Simulators can't receive push — skip registration entirely

    (async () => {
      const { status: existing } = await Notifications.getPermissionsAsync();
      let status = existing;
      if (status !== "granted") {
        const req = await Notifications.requestPermissionsAsync();
        status = req.status;
      }
      if (status !== "granted") return;

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const { data: token } = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      );

      const platform = Device.osName === "Android" ? "android" : "ios";
      await registerPushToken(token, platform);
    })().catch(() => {
      // Non-fatal — retries next time this mounts (e.g. next app launch)
    });
  }, [enabled]);
}
