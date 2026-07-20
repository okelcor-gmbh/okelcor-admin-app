import { ScrollView, Text, View, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { fetchDashboard } from "../../api/dashboard";
import { fetchInsights } from "../../api/insights";
import { fetchOrders } from "../../api/orders";
import { fetchChatQueue } from "../../api/chat";
import { fetchQuoteSummary } from "../../api/quotes";
import { fetchLogisticsSummary } from "../../api/logistics";
import { fetchSecuritySummary } from "../../api/security";
import { useAuth } from "../../context/auth-context";
import { useUnreadNotificationsCount } from "../../hooks/useUnreadNotificationsCount";
import { useUnreadInboxCount } from "../../hooks/useUnreadInboxCount";
import Card from "../../components/ui/Card";
import SeverityPill from "../../components/ui/SeverityPill";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import PresenceToggle from "../../components/ui/PresenceToggle";
import { revenueDeltaPct } from "../../lib/revenueDelta";
import { decodeHtmlEntities } from "../../lib/decodeHtmlEntities";

function todayLabel(): string {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
}

function fmtEur(n?: number): string {
  if (n == null) return "—";
  return n >= 1000 ? `€${(n / 1000).toFixed(1)}k` : `€${n.toFixed(2)}`;
}

export default function TodayScreen() {
  // Loosely typed on purpose — navigating cross-tab into a nested stack
  // (OrdersTab -> OrderDetail) doesn't type-check cleanly against this
  // screen's own strict tab-navigation prop, same as resolveActionUrl().
  const navigation = useNavigation() as { navigate: (name: string, params?: object) => void };
  const { user } = useAuth();
  const canViewSecurity = user?.permissions.includes("security.view") ?? false;
  const unreadNotifications = useUnreadNotificationsCount();
  const unreadInbox = useUnreadInboxCount();

  const { data: dashboardRes, isLoading: loadingDashboard } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    refetchInterval: 60_000,
  });
  const { data: insightsRes } = useQuery({ queryKey: ["insights"], queryFn: fetchInsights, refetchInterval: 120_000 });
  const { data: ordersRes } = useQuery({ queryKey: ["orders", ""], queryFn: () => fetchOrders(), refetchInterval: 60_000 });
  // ~20s poll as a fallback alongside the live socket (useChatQueueChannel,
  // mounted app-wide in main-tabs.tsx) — chat is urgent enough to warrant a
  // shorter interval than the rest of Today's data.
  const { data: chatQueueRes } = useQuery({
    queryKey: ["chatQueue"],
    queryFn: () => fetchChatQueue(),
    refetchInterval: 20_000,
  });
  const { data: quoteSummaryRes } = useQuery({
    queryKey: ["quoteSummary"],
    queryFn: fetchQuoteSummary,
    refetchInterval: 120_000,
  });
  const { data: logisticsRes } = useQuery({
    queryKey: ["logisticsSummary"],
    queryFn: fetchLogisticsSummary,
    refetchInterval: 120_000,
  });
  // Permission-gated fetch — sales/support-tier admins don't have
  // security.view and would otherwise get a 403 on every Today load.
  const { data: securityRes } = useQuery({
    queryKey: ["securitySummary"],
    queryFn: fetchSecuritySummary,
    refetchInterval: 120_000,
    enabled: canViewSecurity,
  });

  if (loadingDashboard) return <LoadingSpinner />;

  const dashboard = dashboardRes?.data;
  const delta = revenueDeltaPct(dashboard?.revenue_last_7_days);
  const insights = (insightsRes?.data ?? []).slice(0, 2);
  const orders = ordersRes?.data ?? [];
  // Only mark-paid candidates for now — the orders *list* response doesn't
  // carry the financial-revision flag (only the full order detail does), so
  // that half of "needs action" isn't derivable without an extra per-order
  // fetch. Revisit if/when the list endpoint exposes it.
  const needsAction = orders.filter((o) => o.payment_status === "pending" && o.payment_method === "bank_transfer");

  const chatSessions = chatQueueRes?.data ?? [];
  const pendingChats = chatSessions.filter((s) => s.status === "pending");
  const myActiveChats = chatSessions.filter((s) => s.status === "active" && s.admin_id === user?.id);

  const pipeline = quoteSummaryRes?.data;
  const ops = logisticsRes?.data.summary;
  const criticalEventsToday = securityRes?.data.today.critical_events ?? 0;
  const recentOrders = orders.slice(0, 5);
  // Sum, not a unique-order count — an order missing more than one document
  // type contributes to each flag it's actually missing.
  const missingDocs =
    (ops?.missing_commercial_invoice ?? 0) + (ops?.missing_packing_list ?? 0) + (ops?.missing_shipment_document ?? 0);

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="gap-4 p-4">
      <View>
        <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">{todayLabel()}</Text>
        <Text className="text-2xl font-bold text-ink">Today</Text>
      </View>

      <PresenceToggle />

      {(pendingChats.length > 0 || myActiveChats.length > 0) && (
        <View>
          <Text className="mb-2 text-sm font-bold text-ink">Live Chat</Text>
          <View className="gap-2">
            {pendingChats.map((s) => (
              <Pressable key={s.id} onPress={() => navigation.navigate("ChatThread", { sessionId: s.id })}>
                <Card className="flex-row items-center justify-between p-3.5">
                  <View>
                    <Text className="text-[14px] font-semibold text-ink">{s.customer_name}</Text>
                    <Text className="text-xs text-muted">Waiting</Text>
                  </View>
                  <Text className="text-[13px] font-bold text-accent">Accept →</Text>
                </Card>
              </Pressable>
            ))}
            {myActiveChats.map((s) => (
              <Pressable key={s.id} onPress={() => navigation.navigate("ChatThread", { sessionId: s.id })}>
                <Card className="flex-row items-center justify-between p-3.5">
                  <View>
                    <Text className="text-[14px] font-semibold text-ink">{s.customer_name}</Text>
                    <Text className="text-xs text-muted">Active</Text>
                  </View>
                  <Text className="text-[13px] font-bold text-accent">Open →</Text>
                </Card>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {canViewSecurity && criticalEventsToday > 0 && (
        <Pressable onPress={() => navigation.navigate("SecurityTab")}>
          <Card className="border-red-200 bg-red-50 p-4">
            <Text className="text-[14px] font-bold text-red-700">
              {criticalEventsToday} critical security {criticalEventsToday === 1 ? "event" : "events"} today
            </Text>
            <Text className="mt-0.5 text-xs text-red-600">Tap to review →</Text>
          </Card>
        </Pressable>
      )}

      <View className="flex-row flex-wrap gap-3">
        <StatTile label="Revenue today" value={fmtEur(dashboard?.revenue_today)} delta={delta} />
        <StatTile
          label="Orders today"
          value={`${dashboard?.orders_today_paid ?? "—"} / ${dashboard?.orders_today_total ?? "—"}`}
          subtitle="paid / total"
        />
        <StatTile label="Unread inbox" value={String(unreadInbox)} />
        <StatTile label="Unread alerts" value={String(unreadNotifications)} />
      </View>

      <View className="flex-row flex-wrap gap-3">
        <StatTile label="Pending orders" value={String(dashboard?.pending_orders ?? "—")} />
        <StatTile label="Confirmed revenue" value={fmtEur(dashboard?.confirmed_revenue_month)} subtitle="this month" />
        <StatTile
          label="Avg order value"
          value={fmtEur(dashboard?.average_order_value)}
          subtitle={dashboard?.aov_period_label}
        />
        <StatTile label="New customers" value={String(dashboard?.new_customers_today ?? "—")} subtitle="today" />
      </View>

      {pipeline && (
        <View>
          <Text className="mb-2 text-sm font-bold text-ink">Pipeline</Text>
          <View className="flex-row flex-wrap gap-3">
            <StatTile label="New leads" value={String(pipeline.new_count ?? 0)} />
            <StatTile label="Needs review" value={String(pipeline.needs_review_count ?? 0)} />
            <StatTile label="Qualified" value={String(pipeline.qualified_count ?? 0)} />
            <StatTile label="Proposal sent" value={String(pipeline.proposal_sent_count ?? 0)} />
            <StatTile label="Follow-up due" value={String(pipeline.follow_up_due_count ?? 0)} />
            <StatTile label="Unassigned" value={String(pipeline.unassigned_count ?? 0)} />
            <StatTile label="High priority" value={String(pipeline.high_priority_count ?? 0)} />
          </View>
        </View>
      )}

      {ops && (
        <View>
          <Text className="mb-2 text-sm font-bold text-ink">Operations</Text>
          <View className="flex-row flex-wrap gap-3">
            <StatTile label="Awaiting proforma" value={String(ops.awaiting_proforma ?? 0)} />
            <StatTile label="Awaiting deposit" value={String(ops.awaiting_deposit ?? 0)} />
            <StatTile label="Balance due" value={String(ops.balance_due ?? 0)} />
            <StatTile label="Ready to ship" value={String(ops.ready_for_shipment_release ?? 0)} />
            <StatTile label="High risk" value={String(ops.high_risk_orders ?? 0)} />
            <StatTile label="Missing docs" value={String(missingDocs)} />
          </View>
        </View>
      )}

      {insights.length > 0 && (
        <View className="gap-2">
          {insights.map((i) => (
            <Card key={i.id} className="p-4">
              <SeverityPill severity={i.severity} label={i.category.toUpperCase()} />
              <Text className="mt-2 text-[15px] font-semibold text-ink">{decodeHtmlEntities(i.headline)}</Text>
              <Text className="mt-1 text-sm text-muted">{decodeHtmlEntities(i.detail)}</Text>
            </Card>
          ))}
        </View>
      )}

      {needsAction.length > 0 && (
        <View>
          <Text className="mb-2 text-sm font-bold text-ink">Needs your attention</Text>
          <View className="gap-2">
            {needsAction.map((o) => (
              <Pressable
                key={o.id}
                onPress={() => navigation.navigate("OrdersTab", { screen: "OrderDetail", params: { orderId: o.id } })}
              >
                <Card className="flex-row items-center justify-between p-3.5">
                  <View>
                    <Text className="text-[14px] font-semibold text-ink">{o.order_ref}</Text>
                    <Text className="text-xs text-muted">{o.customer_name}</Text>
                  </View>
                  <Text className="text-[13px] font-bold text-accent">Awaiting payment →</Text>
                </Card>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {recentOrders.length > 0 && (
        <View>
          <Text className="mb-2 text-sm font-bold text-ink">Recent Orders</Text>
          <View className="gap-2">
            {recentOrders.map((o) => (
              <Pressable
                key={o.id}
                onPress={() => navigation.navigate("OrdersTab", { screen: "OrderDetail", params: { orderId: o.id } })}
              >
                <Card className="flex-row items-center justify-between p-3.5">
                  <View>
                    <Text className="text-[14px] font-semibold text-ink">{o.order_ref}</Text>
                    <Text className="text-xs text-muted">{o.customer_name}</Text>
                  </View>
                  <Text className="text-[13px] font-bold uppercase text-muted">{o.status}</Text>
                </Card>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function StatTile({
  label,
  value,
  delta,
  subtitle,
}: {
  label: string;
  value: string;
  delta?: number | null;
  subtitle?: string;
}) {
  return (
    <Card className="min-w-[45%] flex-1 p-4">
      <Text className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</Text>
      <Text className="mt-1 text-xl font-bold text-ink">{value}</Text>
      {delta != null && (
        <Text className={`mt-0.5 text-xs font-semibold ${delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          {delta >= 0 ? "+" : ""}
          {delta}% vs yesterday
        </Text>
      )}
      {delta == null && subtitle && <Text className="mt-0.5 text-xs text-faint">{subtitle}</Text>}
    </Card>
  );
}
