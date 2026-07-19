import PusherDefault, { type Channel } from "pusher-js";
import * as PusherNS from "pusher-js";
import { BASE_URL, getAuthToken } from "../api/client";

// Metro's CJS interop for pusher-js's react-native build puts the real
// constructor on a `.Pusher` named property, not `.default` — confirmed by
// smoke-testing directly in Expo Go (the `default` export resolves to a
// plain object there, not a callable class). Typed against the `default`
// export (correct shape) but resolved against `.Pusher` at runtime.
const Pusher = ((PusherNS as unknown as { Pusher?: typeof PusherDefault }).Pusher ??
  PusherDefault) as typeof PusherDefault;

const PUSHER_KEY = process.env.EXPO_PUBLIC_PUSHER_KEY;
const PUSHER_CLUSTER = process.env.EXPO_PUBLIC_PUSHER_CLUSTER;

let client: InstanceType<typeof PusherDefault> | null = null;

/**
 * No-ops when Pusher isn't configured yet (no account/credentials set) —
 * same graceful-degradation pattern as push registration before its
 * backend endpoint existed. REST polling keeps working regardless.
 */
export function connectPusher(): InstanceType<typeof PusherDefault> | null {
  if (!PUSHER_KEY || !PUSHER_CLUSTER) return null;
  if (client) return client;

  const token = getAuthToken();
  if (!token) return null;

  client = new Pusher(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER,
    channelAuthorization: {
      endpoint: `${BASE_URL}/broadcasting/auth`,
      transport: "ajax",
      headers: { Authorization: `Bearer ${token}` },
    },
  });

  return client;
}

export function disconnectPusher() {
  client?.disconnect();
  client = null;
}

export function subscribePrivate(channelName: string): Channel | null {
  const pusher = connectPusher();
  return pusher?.subscribe(`private-${channelName}`) ?? null;
}

export function unsubscribePrivate(channelName: string) {
  client?.unsubscribe(`private-${channelName}`);
}
