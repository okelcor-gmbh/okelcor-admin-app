import { FlatList, Pressable, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Mail, MessageCircle } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { InboxStackParamList } from "../../navigation/types";
import { fetchInbox } from "../../api/communications";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { timeAgo } from "../../lib/timeAgo";
import { decodeHtmlEntities } from "../../lib/decodeHtmlEntities";

type Props = NativeStackScreenProps<InboxStackParamList, "InboxList">;

const POLL_MS = 30_000;

export default function InboxListScreen({ navigation }: Props) {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["inbox"],
    queryFn: () => fetchInbox(1),
    refetchInterval: POLL_MS,
  });

  if (isLoading) return <LoadingSpinner />;

  const rows = data?.data ?? [];

  return (
    <FlatList
      className="flex-1 bg-surface"
      contentContainerClassName="gap-3 p-4"
      data={rows}
      keyExtractor={(r) => String(r.id)}
      refreshing={isRefetching}
      onRefresh={refetch}
      ListEmptyComponent={<EmptyState message="No conversations yet." />}
      renderItem={({ item }) => {
        const Icon = item.channel === "whatsapp" ? MessageCircle : Mail;
        const disabled = item.customer_id == null;
        return (
          <Pressable
            disabled={disabled}
            onPress={() =>
              navigation.navigate("ThreadDetail", {
                customerId: item.customer_id as number,
                customerName: item.customer_name ?? "Customer",
              })
            }
          >
            <Card className={`p-4 ${disabled ? "opacity-60" : ""}`}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Icon size={14} color="#5c5e62" />
                  <Text className="text-[15px] font-semibold text-ink">
                    {item.customer_name ?? "New inquiry"}
                  </Text>
                  {item.unread && <View className="h-2 w-2 rounded-full bg-accent" />}
                </View>
                <Text className="text-xs text-faint">{timeAgo(item.created_at)}</Text>
              </View>
              {item.subject && <Text className="mt-1.5 text-sm font-medium text-ink">{item.subject}</Text>}
              {item.preview && (
                <Text className="mt-0.5 text-sm text-muted" numberOfLines={2}>
                  {decodeHtmlEntities(item.preview)}
                </Text>
              )}
              {disabled && (
                <Text className="mt-1.5 text-xs italic text-faint">Unmatched lead — view on web</Text>
              )}
            </Card>
          </Pressable>
        );
      }}
    />
  );
}
