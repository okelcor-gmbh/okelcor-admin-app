import { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OrdersStackParamList } from "../../navigation/types";
import { fetchOrders } from "../../api/orders";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { timeAgo } from "../../lib/timeAgo";
import { orderStatusStyle } from "../../lib/orderStatus";

type Props = NativeStackScreenProps<OrdersStackParamList, "OrdersList">;

export default function OrdersListScreen({ navigation }: Props) {
  const [query, setQuery] = useState("");

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["orders", query],
    queryFn: () => fetchOrders(query || undefined),
  });

  const orders = data?.data ?? [];

  return (
    <View className="flex-1 bg-surface">
      <View className="border-b border-hairline/[0.06] bg-card px-4 py-3">
        <TextInput
          className="rounded-xl border border-hairline/[0.1] bg-surface px-4 py-2.5 text-[15px] text-ink"
          placeholder="Search by order ref, customer…"
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          contentContainerClassName="gap-3 p-4"
          data={orders}
          keyExtractor={(o) => String(o.id)}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={<EmptyState message="No orders found." />}
          renderItem={({ item }) => {
            const style = orderStatusStyle(item.status);
            return (
              <Pressable onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}>
                <Card className="p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[15px] font-bold text-ink">{item.order_ref}</Text>
                    <View className={`rounded-full px-2.5 py-1 ${style.bg}`}>
                      <Text className={`text-[11px] font-bold uppercase ${style.text}`}>{item.status}</Text>
                    </View>
                  </View>
                  <Text className="mt-1 text-sm text-muted">{item.customer_name}</Text>
                  <View className="mt-2 flex-row items-center justify-between">
                    <Text className="text-[15px] font-bold text-ink">€{Number(item.total).toFixed(2)}</Text>
                    <Text className="text-xs text-faint">{timeAgo(item.created_at)}</Text>
                  </View>
                </Card>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
