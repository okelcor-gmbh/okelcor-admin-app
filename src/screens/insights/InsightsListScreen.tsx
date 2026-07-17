import { FlatList, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { fetchInsights } from "../../api/insights";
import Card from "../../components/ui/Card";
import SeverityPill from "../../components/ui/SeverityPill";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { decodeHtmlEntities } from "../../lib/decodeHtmlEntities";

const POLL_MS = 120_000; // matches the web admin's insights-bell cadence

export default function InsightsListScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["insights"],
    queryFn: fetchInsights,
    refetchInterval: POLL_MS,
  });

  if (isLoading) return <LoadingSpinner />;

  const insights = data?.data ?? [];

  return (
    <FlatList
      className="flex-1 bg-surface"
      contentContainerClassName="gap-3 p-4"
      data={insights}
      keyExtractor={(i) => i.id}
      refreshing={isRefetching}
      onRefresh={refetch}
      ListEmptyComponent={<EmptyState message="Nothing to flag right now." />}
      renderItem={({ item }) => (
        <Card className="p-4">
          <SeverityPill severity={item.severity} label={item.category.toUpperCase()} />
          <Text className="mt-2 text-[15px] font-semibold text-ink">{decodeHtmlEntities(item.headline)}</Text>
          <Text className="mt-1 text-sm text-muted">{decodeHtmlEntities(item.detail)}</Text>
        </Card>
      )}
    />
  );
}
