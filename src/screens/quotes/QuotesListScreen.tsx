import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { fetchQuoteRequests } from "../../api/quotes";
import { updateQuoteStatus } from "../../api/quickActions";
import { AdminApiError } from "../../api/client";
import type { AdminQuoteRequest } from "../../api/types";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { timeAgo } from "../../lib/timeAgo";

// Quick one-tap advance for the common linear flow — anything else (closing
// early, reopening) stays a desktop workflow.
const NEXT_STATUS: Record<string, string> = {
  new: "reviewed",
  reviewed: "quoted",
};

export default function QuotesListScreen() {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["quote-requests"],
    queryFn: () => fetchQuoteRequests(1),
  });

  const advance = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateQuoteStatus(id, status),
    onSuccess: () => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      void queryClient.invalidateQueries({ queryKey: ["quote-requests"] });
    },
    onError: (err) => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Couldn't update status", err instanceof AdminApiError ? err.message : "Something went wrong.");
    },
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
        <QuoteRow
          quote={item}
          onAdvance={(status) => advance.mutate({ id: item.id, status })}
          advancing={advance.isPending}
        />
      )}
    />
  );
}

function QuoteRow({
  quote,
  onAdvance,
  advancing,
}: {
  quote: AdminQuoteRequest;
  onAdvance: (status: string) => void;
  advancing: boolean;
}) {
  const next = NEXT_STATUS[quote.status];

  return (
    <Card className="p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-[15px] font-semibold text-ink">{quote.full_name}</Text>
        <Text className="text-xs text-faint">{timeAgo(quote.created_at)}</Text>
      </View>
      {quote.company_name && <Text className="text-sm text-muted">{quote.company_name}</Text>}
      <Text className="mt-1 text-sm text-muted">
        {quote.tyre_category} · {quote.country}
      </Text>
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase text-accent">{quote.status}</Text>
        {next && (
          <Pressable
            onPress={() => onAdvance(next)}
            disabled={advancing}
            className="rounded-full bg-accent-tint px-3 py-1.5"
          >
            <Text className="text-[12px] font-bold capitalize text-accent">Mark {next} →</Text>
          </Pressable>
        )}
      </View>
    </Card>
  );
}
