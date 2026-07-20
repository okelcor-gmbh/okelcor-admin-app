import type { AdminUser } from "../api/types";

export type AuthStackParamList = {
  Login: undefined;
  Enter2FACode: { sessionToken: string };
  Setup2FA: { tempToken: string };
  /** Shown once, right after 2FA setup confirms — signIn() only fires once the user acknowledges these. */
  RecoveryCodes: { codes: string[]; token: string; user: AdminUser };
};

export type InboxStackParamList = {
  InboxList: undefined;
  ThreadDetail: { customerId: number; customerName: string };
};

export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetail: { orderId: number };
};

export type QuotesStackParamList = {
  QuotesList: undefined;
  QuoteDetail: { quoteId: number };
};

export type MainTabParamList = {
  TodayTab: undefined;
  NotificationsTab: undefined;
  InsightsTab: undefined;
  InboxTab: undefined;
  OrdersTab: undefined;
  QuotesTab: undefined;
  SecurityTab: undefined;
  SettingsTab: undefined;
};

// Wraps MainTabs so ChatThread is reachable from any tab — it can't nest
// inside a single tab's own stack the way OrderDetail does.
export type RootStackParamList = {
  Main: undefined;
  // Full conversation list, kept off the Today dashboard to avoid crowding
  // it — Today just links here via a single compact row.
  ChatsList: undefined;
  // Crisp's own session ID format (string), not a numeric DB id. nickname
  // is passed through from the list row to avoid a placeholder header
  // title flash — there's no single-conversation fetch endpoint to refill
  // it from if opened without it.
  ChatThread: { sessionId: string; nickname?: string };
};
