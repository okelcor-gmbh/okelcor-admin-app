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
