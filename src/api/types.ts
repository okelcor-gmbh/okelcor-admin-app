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
  available_for_chat?: boolean;
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

export type QuoteRequestItem = {
  id: number;
  brand?: string | null;
  model?: string | null;
  size?: string | null;
  season?: string | null;
  load_index?: string | null;
  speed_index?: string | null;
  condition?: string | null;
  quantity: number;
  unit_price?: number | null;
  line_total?: number | null;
  currency?: string | null;
  notes?: string | null;
};

// Detail response (GET /admin/quote-requests/{id}) — much richer than the
// list row above; not every field is populated depending on how the quote
// was submitted (legacy tyre_size/quantity vs. modern tyre_items[]).
export type AdminQuoteRequestFull = AdminQuoteRequest & {
  contact_person?: string | null;
  company_address?: string | null;
  company_city?: string | null;
  company_postal_code?: string | null;
  email?: string | null;
  phone?: string | null;
  business_type?: string | null;
  vat_number?: string | null;
  vat_valid?: boolean | null;

  brand_preference?: string | null;
  tyre_size?: string | null;
  quantity?: number | null;
  tyre_condition?: string | null;
  used_tyre_grade?: string | null;
  used_tyre_notes?: string | null;
  tyre_items?: { size?: string; quantity?: number; brand?: string; condition?: string }[] | null;

  budget_range?: string | null;
  delivery_location?: string | null;
  delivery_address?: string | null;
  delivery_city?: string | null;
  delivery_postal_code?: string | null;
  delivery_timeline?: string | null;
  incoterm?: string | null;
  incoterm_type?: string | null;

  notes?: string | null;
  admin_notes?: string | null;

  quote_items?: QuoteRequestItem[];
  quote_items_count?: number;

  proposal_status?: string | null;
  proposal_number?: string | null;
  proposal_total?: number | null;
  proposal_currency?: string | null;

  order_id?: number | null;
  order_ref?: string | null;
  possible_customer_id?: number | null;
};

export type QuoteRequestSummary = {
  new_count?: number;
  needs_review_count?: number;
  qualified_count?: number;
  proposal_sent_count?: number;
  converted_count?: number;
  spam_count?: number;
  follow_up_due_count?: number;
  unassigned_count?: number;
  high_priority_count?: number;
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

// ── Live Chat (Crisp) ─────────────────────────────────────────────────────────
// Shapes match Crisp's own API exactly — the Laravel proxy passes `data`
// through unreshaped, confirmed against okelcor-website's working Crisp
// admin inbox (components/admin/chats-inbox.tsx), not guessed.

export type CrispConversationState = "pending" | "unresolved" | "resolved";

export type CrispConversation = {
  session_id: string;
  status: number;
  state: CrispConversationState;
  created_at: number; // epoch ms
  updated_at: number; // epoch ms
  last_message: string;
  meta: {
    nickname: string;
    email: string | null;
    avatar: string | null;
    city?: string;
    country?: string;
  };
  unread: { operator: number; visitor: number };
};

export type CrispMessage = {
  session_id: string;
  type: string; // filter on "text"
  content: string;
  from: "user" | "operator";
  timestamp: number; // epoch ms
  user: { nickname: string; avatar: string | null; type: "visitor" | "operator" };
};
