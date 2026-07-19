import { ScrollView, Text, View, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { fetchDashboard } from "../../api/dashboard";
import { fetchInsights } from "../../api/insights";
import { fetchOrders } from "../../api/orders";
import { fetchChatQueue } from "../../api/chat";
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

      <View className="flex-row flex-wrap gap-3">
        <StatTile label="Revenue today" value={fmtEur(dashboard?.revenue_today)} delta={delta} />
        <StatTile label="Orders paid" value={String(dashboard?.orders_today_paid ?? "—")} />
        <StatTile label="Unread inbox" value={String(unreadInbox)} />
        <StatTile label="Unread alerts" value={String(unreadNotifications)} />
      </View>

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
    </ScrollView>
  );
}

function StatTile({ label, value, delta }: { label: string; value: string; delta?: number | null }) {
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
    </Card>
  );
}
