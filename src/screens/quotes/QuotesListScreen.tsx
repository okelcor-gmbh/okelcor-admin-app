import { FlatList, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { fetchQuoteRequests } from "../../api/quotes";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { timeAgo } from "../../lib/timeAgo";

export default function QuotesListScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["quote-requests"],
    queryFn: () => fetchQuoteRequests(1),
  });

  if (isLoading) return <LoadingSpinner />;

  const quotes = data?.data ?? [];

  return (
    <FlatList
      className="flex-1 bg-surface"
      contentContainerClassName="gap-3 p-4"
      data={quotes}
      keyExtractor={(q) => String(q.id)}
      refreshing={isRefetching}
      onRefresh={refetch}
      ListEmptyComponent={<EmptyState message="No quote requests." />}
      renderItem={({ item }) => (
        <Card className="p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-[15px] font-semibold text-ink">{item.full_name}</Text>
            <Text className="text-xs text-faint">{timeAgo(item.created_at)}</Text>
          </View>
          {item.company_name && <Text className="text-sm text-muted">{item.company_name}</Text>}
          <Text className="mt-1 text-sm text-muted">
            {item.tyre_category} · {item.country}
          </Text>
          <Text className="mt-1 text-xs font-semibold uppercase text-accent">{item.status}</Text>
        </Card>
      )}
    />
  );
}
