import { ScrollView, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { fetchSecuritySummary } from "../../api/security";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";

export default function SecurityGlanceScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ["security-summary"],
    queryFn: fetchSecuritySummary,
  });

  if (isLoading) return <LoadingSpinner />;

  const summary = data?.data;
  if (!summary) return <EmptyState message="Security data unavailable." />;

  const recentEvents = summary.recent_events ?? [];

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="gap-4 p-4">
      <Card className="p-4">
        <Text className="mb-3 text-sm font-bold text-ink">Today</Text>
        <View className="flex-row items-center justify-between py-1">
          <Text className="text-sm text-muted">Failed logins</Text>
          <Text className="text-[15px] font-bold text-ink">{summary.today.failed_logins ?? 0}</Text>
        </View>
        <View className="flex-row items-center justify-between py-1">
          <Text className="text-sm text-muted">Critical events</Text>
          <Text className="text-[15px] font-bold text-ink">{summary.today.critical_events ?? 0}</Text>
        </View>
      </Card>

      <Card className="p-4">
        <Text className="mb-3 text-sm font-bold text-ink">Recent events</Text>
        {recentEvents.length === 0 ? (
          <Text className="text-sm text-muted">No recent events.</Text>
        ) : (
          recentEvents.slice(0, 10).map((e, idx) => (
            <View key={e.id} className={`py-2 ${idx > 0 ? "border-t border-hairline/[0.04]" : ""}`}>
              <Text className="text-sm text-ink">{e.description ?? e.type}</Text>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}
