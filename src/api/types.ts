/**
 * Ported (not shared) from okelcor-website/lib/admin-api.ts where the shape
 * overlaps, plus mobile-only auth types confirmed directly against
 * AdminAuthController / AdminTwoFactorController in okelcor-api.
 */

// ── Auth ──────────────────────────────────────────────────────────────────────

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  role_label?: string;
  permissions: string[];
};

/** POST /admin/login response — branches on which of these two shapes comes back */
export type LoginResponse =
  | { requires_2fa: true; data: { session_token: string }; message: string }
  | { requires_2fa_setup: true; data: { temp_token: string; user?: AdminUser }; message: string };

/** POST /admin/login/2fa response — 2FA already enabled */
export type TwoFactorLoginResponse = {
  data: { token: string; expires_at: string; user: AdminUser };
  message: string;
};

/** POST /admin/2fa/setup/enable response */
export type TwoFactorSetupEnableResponse = {
  data: { secret: string; otpauth_uri: string };
  message: string;
};

/** POST /admin/2fa/setup/confirm response — issues the first-ever token */
export type TwoFactorSetupConfirmResponse = {
  data: { token: string; expires_at: string; user: AdminUser; recovery_codes: string[] };
  message: string;
};

// ── Notifications ─────────────────────────────────────────────────────────────

export type AdminNotificationSeverity = "info" | "success" | "warning" | "urgent";

export type AdminNotification = {
  id: number;
  type: string;
  title: string;
  body?: string | null;
  severity?: AdminNotificationSeverity | null;
  action_url?: string | null;
  related_type?: string | null;
  related_id?: number | null;
  read: boolean;
  read_at?: string | null;
  dismissed_at?: string | null;
  created_at: string;
};

export type PaginatedMeta = {
  current_page?: number;
  per_page?: number;
  total?: number;
  last_page?: number;
  unread_count?: number;
  [key: string]: unknown;
};

export type AdminNotificationsResponse = {
  data: AdminNotification[];
  meta: PaginatedMeta;
  message: string;
};

// ── Insights ──────────────────────────────────────────────────────────────────

export type AdminInsightCategory = "revenue" | "orders" | "inventory" | "security" | "quotes" | string;
export type AdminInsightSeverity = "positive" | "info" | "warning" | "critical";

export type AdminInsight = {
  id: string;
  category: AdminInsightCategory;
  severity: AdminInsightSeverity;
  headline: string;
  detail: string;
  action_url?: string | null;
};

export type AdminInsightsResponse = {
  data: AdminInsight[];
  generated_at: string | null;
  next_refresh_at?: string | null;
  message?: string;
};

// ── Communications / Inbox ────────────────────────────────────────────────────

export type CommunicationInboxRow = {
  id: number;
  customer_id: number | null;
  quote_request_id: number | null;
  customer_name: string | null;
  channel: "email" | "whatsapp" | string;
  subject: string | null;
  preview: string | null;
  unread: boolean;
  action_url: string | null;
  created_at: string;
};

export type Communication = {
  id: number;
  type: string;
  direction: "inbound" | "outbound";
  channel: "email" | "whatsapp" | string;
  subject?: string | null;
  body: string;
  cc?: string[] | null;
  attachments?: { filename: string; url: string }[] | null;
  status?: string | null;
  staff_read_at?: string | null;
  customer_read_at?: string | null;
  created_at: string;
};

// ── Orders ────────────────────────────────────────────────────────────────────

export type AdminOrder = {
  id: number;
  order_ref: string;
  customer_name: string;
  customer_email: string;
  total: number;
  currency?: string | null;
  status: string;
  payment_status?: string | null;
  payment_method?: string | null;
  carrier?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  created_at: string;
};

export type AdminOrderFull = AdminOrder & {
  items: {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[];
  // DOC-5 financial lock/revision — same field names as the web admin panel
  financials_locked?: boolean | null;
  financials_revision_required?: boolean | null;
  financials_revision_reason?: string | null;
};

// ── Quotes ────────────────────────────────────────────────────────────────────

export type AdminQuoteRequest = {
  id: number;
  ref_number: string;
  full_name: string;
  company_name?: string | null;
  tyre_category: string;
  country: string;
  status: string;
  created_at: string;
};

// ── Security ──────────────────────────────────────────────────────────────────

export type SecuritySummary = {
  admins: Record<string, unknown>;
  today: {
    failed_logins?: number;
    critical_events?: number;
    [key: string]: unknown;
  };
  recent_events: {
    id: number;
    type: string;
    description?: string;
    created_at: string;
  }[];
};
