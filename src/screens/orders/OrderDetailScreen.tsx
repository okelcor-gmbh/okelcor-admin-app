import { ScrollView, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OrdersStackParamList } from "../../navigation/types";
import { fetchOrder } from "../../api/orders";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import { orderStatusStyle } from "../../lib/orderStatus";

type Props = NativeStackScreenProps<OrdersStackParamList, "OrderDetail">;

export default function OrderDetailScreen({ route }: Props) {
  const { orderId } = route.params;
  const { data, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder(orderId),
  });

  if (isLoading) return <LoadingSpinner />;

  const order = data?.data;
  if (!order) return <EmptyState message="Order not found." />;

  const style = orderStatusStyle(order.status);

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="gap-4 p-4">
      <Card className="p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-ink">{order.order_ref}</Text>
          <View className={`rounded-full px-2.5 py-1 ${style.bg}`}>
            <Text className={`text-[11px] font-bold uppercase ${style.text}`}>{order.status}</Text>
          </View>
        </View>
        <Text className="mt-1 text-sm text-muted">{order.customer_name}</Text>
        <Text className="text-sm text-muted">{order.customer_email}</Text>

        <View className="mt-3 flex-row items-center justify-between border-t border-black/[0.06] pt-3">
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
      </Card>

      <Card className="p-4">
        <Text className="mb-2 text-sm font-bold text-ink">Items</Text>
        {order.items.map((it, idx) => (
          <View key={it.id} className={`flex-row items-center justify-between py-2 ${idx > 0 ? "border-t border-black/[0.04]" : ""}`}>
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
  );
}
