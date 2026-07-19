import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OrdersStackParamList } from "../../navigation/types";
import { fetchOrder } from "../../api/orders";
import { approveFinancialRevision, rejectFinancialRevision, markOrderPaid, updateOrderStatus } from "../../api/quickActions";
import { AdminApiError } from "../../api/client";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import SuccessCheck from "../../components/ui/SuccessCheck";
import { orderStatusStyle } from "../../lib/orderStatus";

type Props = NativeStackScreenProps<OrdersStackParamList, "OrderDetail">;

// Quick one-tap advance only for the common linear flow — anything unusual
// (awaiting_proforma, cancellations) stays a desktop workflow.
const NEXT_STATUS: Record<string, string> = {
  pending: "confirmed",
  confirmed: "processing",
  processing: "shipped",
  shipped: "delivered",
};

export default function OrderDetailScreen({ route }: Props) {
  const { orderId } = route.params;
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder(orderId),
  });

  const flashSuccess = (label: string) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSuccess(label);
    setTimeout(() => setSuccess(null), 1100);
  };

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["order", orderId] });

  const onActionError = (err: unknown) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    const message = err instanceof AdminApiError ? err.message : "Something went wrong.";
    Alert.alert("Couldn't complete that", message);
  };

  const approveRevision = useMutation({
    mutationFn: () => approveFinancialRevision(orderId),
    onSuccess: () => { flashSuccess("Revision approved"); invalidate(); },
    onError: onActionError,
  });

  const rejectRevision = useMutation({
    mutationFn: () => rejectFinancialRevision(orderId),
    onSuccess: () => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); invalidate(); },
    onError: onActionError,
  });

  const markPaid = useMutation({
    mutationFn: () => markOrderPaid(orderId),
    onSuccess: () => { flashSuccess("Marked as paid"); invalidate(); },
    onError: onActionError,
  });

  const bumpStatus = useMutation({
    mutationFn: (status: string) => updateOrderStatus(orderId, status),
    onSuccess: () => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); invalidate(); },
    onError: onActionError,
  });

  if (isLoading) return <LoadingSpinner />;

  const order = data?.data;
  if (!order) return <EmptyState message="Order not found." />;

  const style = orderStatusStyle(order.status);
  const canMarkPaid = order.payment_status === "pending" && order.payment_method === "bank_transfer";
  const nextStatus = NEXT_STATUS[order.status];

  const confirmApprove = () => {
    Alert.alert(
      "Approve this revision?",
      "This applies the financial changes and supersedes any issued documents.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Approve", style: "default", onPress: () => approveRevision.mutate() },
      ]
    );
  };

  const confirmMarkPaid = () => {
    Alert.alert(
      "Mark this order as paid?",
      `Confirms the €${Number(order.total).toFixed(2)} bank transfer has been received.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Mark Paid", style: "default", onPress: () => markPaid.mutate() },
      ]
    );
  };

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 bg-surface" contentContainerClassName="gap-4 p-4">
        {order.financials_revision_required && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 p-4">
            <Text className="text-sm font-bold text-amber-900 dark:text-amber-200">Financial revision pending</Text>
            {order.financials_revision_reason && (
              <Text className="mt-1 text-sm text-amber-800 dark:text-amber-300">{order.financials_revision_reason}</Text>
            )}
            <View className="mt-3 flex-row gap-2">
              <Pressable
                onPress={confirmApprove}
                disabled={approveRevision.isPending}
                className="flex-1 items-center rounded-xl bg-amber-900 py-2.5"
              >
                <Text className="text-[13px] font-bold text-white">Approve</Text>
              </Pressable>
              <Pressable
                onPress={() => rejectRevision.mutate()}
                disabled={rejectRevision.isPending}
                className="flex-1 items-center rounded-xl border border-amber-300 dark:border-amber-700 bg-card py-2.5"
              >
                <Text className="text-[13px] font-bold text-amber-900 dark:text-amber-200">Reject</Text>
              </Pressable>
            </View>
          </Card>
        )}

        <Card className="p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-ink">{order.order_ref}</Text>
            <View className={`rounded-full px-2.5 py-1 ${style.bg}`}>
              <Text className={`text-[11px] font-bold uppercase ${style.text}`}>{order.status}</Text>
            </View>
          </View>
          <Text className="mt-1 text-sm text-muted">{order.customer_name}</Text>
          <Text className="text-sm text-muted">{order.customer_email}</Text>

          <View className="mt-3 flex-row items-center justify-between border-t border-hairline/[0.06] pt-3">
            <Text className="text-sm text-muted">Payment</Text>
            <Text className="text-sm font-semibold text-ink">{order.payment_status ?? "—"}</Text>
          </View>
          <View className="mt-1 flex-row items-center justify-between">
            <Text className="text-sm text-muted">Total</Text>
            <Text className="text-[15px] font-bold text-ink">€{Number(order.total).toFixed(2)}</Text>
          </View>

          {order.carrier && (
            <View className="mt-1 flex-row items-center justify-between">
              <Text className="text-sm text-muted">Carrier</Text>
              <Text className="text-sm font-semibold text-ink">{order.carrier}</Text>
            </View>
          )}
          {order.tracking_number && (
            <View className="mt-1 flex-row items-center justify-between">
              <Text className="text-sm text-muted">Tracking</Text>
              <Text className="text-sm font-semibold text-ink">{order.tracking_number}</Text>
            </View>
          )}

          {(canMarkPaid || nextStatus) && (
            <View className="mt-3 flex-row gap-2 border-t border-hairline/[0.06] pt-3">
              {canMarkPaid && (
                <Pressable
                  onPress={confirmMarkPaid}
                  disabled={markPaid.isPending}
                  className="flex-1 items-center rounded-xl bg-accent py-2.5"
                >
                  <Text className="text-[13px] font-bold text-white">Mark Paid</Text>
                </Pressable>
              )}
              {nextStatus && (
                <Pressable
                  onPress={() => bumpStatus.mutate(nextStatus)}
                  disabled={bumpStatus.isPending}
                  className="flex-1 items-center rounded-xl border border-hairline/[0.1] bg-card py-2.5"
                >
                  <Text className="text-[13px] font-bold text-ink capitalize">Mark {nextStatus}</Text>
                </Pressable>
              )}
            </View>
          )}
        </Card>

        <Card className="p-4">
          <Text className="mb-2 text-sm font-bold text-ink">Items</Text>
          {order.items.map((it, idx) => (
            <View key={it.id} className={`flex-row items-center justify-between py-2 ${idx > 0 ? "border-t border-hairline/[0.04]" : ""}`}>
              <View className="flex-1 pr-2">
                <Text className="text-sm text-ink">{it.product_name}</Text>
                <Text className="text-xs text-faint">
                  Qty {it.quantity} · €{Number(it.unit_price).toFixed(2)} each
                </Text>
              </View>
              <Text className="text-sm font-semibold text-ink">€{Number(it.subtotal).toFixed(2)}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>

      <SuccessCheck visible={success !== null} label={success ?? ""} />
    </View>
  );
}
