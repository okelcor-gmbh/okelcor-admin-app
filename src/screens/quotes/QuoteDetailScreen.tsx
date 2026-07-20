import type { ReactNode } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { QuotesStackParamList } from "../../navigation/types";
import { fetchQuoteRequestDetail } from "../../api/quotes";
import { updateQuoteStatus } from "../../api/quickActions";
import { AdminApiError } from "../../api/client";
import { useAuth } from "../../context/auth-context";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { timeAgo } from "../../lib/timeAgo";

type Props = NativeStackScreenProps<QuotesStackParamList, "QuoteDetail">;

// Mirrors QuotesListScreen's quick one-tap advance — anything else stays a
// desktop workflow.
const NEXT_STATUS: Record<string, string> = {
  new: "reviewed",
  reviewed: "quoted",
};

function fmtMoney(n?: number | null, currency?: string | null): string {
  if (n == null) return "—";
  return `${currency ?? "EUR"} ${n.toFixed(2)}`;
}

export default function QuoteDetailScreen({ route, navigation }: Props) {
  const { quoteId } = route.params;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  // sales_manager has quotes.manage (read) but not quotes.update — same
  // split verified against okelcor-api's AdminPermissions map.
  const canUpdate = user?.permissions.includes("quotes.update") ?? false;

  const { data, isLoading } = useQuery({
    queryKey: ["quote", quoteId],
    queryFn: () => fetchQuoteRequestDetail(quoteId),
  });

  const advance = useMutation({
    mutationFn: (status: string) => updateQuoteStatus(quoteId, status),
    onSuccess: () => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      void queryClient.invalidateQueries({ queryKey: ["quote", quoteId] });
      void queryClient.invalidateQueries({ queryKey: ["quote-requests"] });
    },
    onError: (err) => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Couldn't update status", err instanceof AdminApiError ? err.message : "Something went wrong.");
    },
  });

  if (isLoading) return <LoadingSpinner />;

  const quote = data?.data;
  if (!quote) return null;

  const next = NEXT_STATUS[quote.status];
  const tyreItems = quote.tyre_items && quote.tyre_items.length > 0 ? quote.tyre_items : null;
  const quoteItems = quote.quote_items ?? [];

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="gap-4 p-4">
      <Card className="p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-ink">{quote.ref_number}</Text>
          <Text className="text-xs font-bold uppercase text-accent">{quote.status}</Text>
        </View>
        <Text className="mt-0.5 text-xs text-faint">{timeAgo(quote.created_at)}</Text>
        {canUpdate && next && (
          <Pressable
            onPress={() => advance.mutate(next)}
            disabled={advance.isPending}
            className="mt-3 self-start rounded-full bg-accent-tint px-3.5 py-2"
          >
            <Text className="text-[13px] font-bold capitalize text-accent">Mark {next} →</Text>
          </Pressable>
        )}
      </Card>

      <Section title="Client Information">
        <InfoRow label="Name" value={quote.full_name} />
        {quote.contact_person && <InfoRow label="Contact" value={quote.contact_person} />}
        {quote.company_name && <InfoRow label="Company" value={quote.company_name} />}
        {(quote.company_address || quote.company_city) && (
          <InfoRow
            label="Company address"
            value={[quote.company_address, quote.company_city, quote.company_postal_code]
              .filter(Boolean)
              .join(", ")}
          />
        )}
        {quote.email && <InfoRow label="Email" value={quote.email} />}
        {quote.phone && <InfoRow label="Phone" value={quote.phone} />}
        <InfoRow label="Country" value={quote.country} />
        {quote.business_type && <InfoRow label="Business type" value={quote.business_type} />}
        {quote.vat_number && <InfoRow label="VAT number" value={quote.vat_number} />}
      </Section>

      <Section title="Product Request">
        <InfoRow label="Category" value={quote.tyre_category} />
        {quote.brand_preference && <InfoRow label="Brand preference" value={quote.brand_preference} />}
        {quote.tyre_condition && <InfoRow label="Condition" value={quote.tyre_condition} />}
        {quote.used_tyre_grade && <InfoRow label="Grade" value={quote.used_tyre_grade} />}
        {tyreItems
          ? tyreItems.map((t, i) => (
              <InfoRow
                key={i}
                label={t.size ?? `Item ${i + 1}`}
                value={`${t.quantity ?? "—"}× ${[t.brand, t.condition].filter(Boolean).join(" ")}`.trim()}
              />
            ))
          : (quote.tyre_size || quote.quantity != null) && (
              <InfoRow label="Size / Qty" value={`${quote.tyre_size ?? "—"} × ${quote.quantity ?? "—"}`} />
            )}
        {quote.used_tyre_notes && <InfoRow label="Notes" value={quote.used_tyre_notes} multiline />}
      </Section>

      {(quote.delivery_location || quote.delivery_address || quote.delivery_timeline || quote.incoterm) && (
        <Section title="Delivery">
          {quote.delivery_location && <InfoRow label="Location" value={quote.delivery_location} />}
          {(quote.delivery_address || quote.delivery_city) && (
            <InfoRow
              label="Address"
              value={[quote.delivery_address, quote.delivery_city, quote.delivery_postal_code]
                .filter(Boolean)
                .join(", ")}
            />
          )}
          {quote.delivery_timeline && <InfoRow label="Timeline" value={quote.delivery_timeline} />}
          {quote.incoterm && (
            <InfoRow
              label="Incoterm"
              value={`${quote.incoterm}${quote.incoterm_type ? ` (${quote.incoterm_type})` : ""}`}
            />
          )}
          {quote.budget_range && <InfoRow label="Budget" value={quote.budget_range} />}
        </Section>
      )}

      {(quote.notes || quote.admin_notes) && (
        <Section title="Notes">
          {quote.notes && <InfoRow label="From customer" value={quote.notes} multiline />}
          {quote.admin_notes && <InfoRow label="Internal" value={quote.admin_notes} multiline />}
        </Section>
      )}

      {quoteItems.length > 0 && (
        <Section title="Quote Items">
          {quoteItems.map((item, idx) => (
            <View
              key={item.id}
              className={`pb-2 ${idx < quoteItems.length - 1 ? "mb-2 border-b border-hairline/[0.06]" : ""}`}
            >
              <Text className="text-[14px] font-semibold text-ink">
                {[item.brand, item.model, item.size].filter(Boolean).join(" ") || `Item ${idx + 1}`}
              </Text>
              <Text className="text-xs text-muted">
                {item.quantity}× {fmtMoney(item.unit_price, item.currency)} ={" "}
                {fmtMoney(item.line_total, item.currency)}
              </Text>
            </View>
          ))}
        </Section>
      )}

      {quote.proposal_status && quote.proposal_status !== "none" && (
        <Section title="Proposal">
          <InfoRow label="Status" value={quote.proposal_status} />
          {quote.proposal_number && <InfoRow label="Number" value={quote.proposal_number} />}
          {quote.proposal_total != null && (
            <InfoRow label="Total" value={fmtMoney(quote.proposal_total, quote.proposal_currency)} />
          )}
        </Section>
      )}

      {quote.order_id && (
        <Pressable
          onPress={() =>
            (navigation as unknown as { navigate: (name: string, params?: object) => void }).navigate("OrdersTab", {
              screen: "OrderDetail",
              params: { orderId: quote.order_id },
            })
          }
        >
          <Card className="flex-row items-center justify-between p-4">
            <Text className="text-[14px] font-semibold text-ink">Linked order {quote.order_ref}</Text>
            <Text className="text-[13px] font-bold text-accent">View →</Text>
          </Card>
        </Pressable>
      )}
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View>
      <Text className="mb-2 text-sm font-bold text-ink">{title}</Text>
      <Card className="p-4">{children}</Card>
    </View>
  );
}

function InfoRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <View className={multiline ? "mb-2.5" : "mb-2.5 flex-row items-start justify-between gap-3"}>
      <Text className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</Text>
      <Text className={`text-[14px] text-ink ${multiline ? "mt-1" : "flex-1 text-right"}`}>{value}</Text>
    </View>
  );
}
