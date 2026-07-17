import { useCallback } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { fetchNotifications, markNotificationRead } from "../../api/notifications";
import type { AdminNotification } from "../../api/types";
import Card from "../../components/ui/Card";
import SeverityPill from "../../components/ui/SeverityPill";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { timeAgo } from "../../lib/timeAgo";
import { resolveActionUrl } from "../../lib/actionUrl";
import { decodeHtmlEntities } from "../../lib/decodeHtmlEntities";

const POLL_MS = 30_000;

export default function NotificationsListScreen() {
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchNotifications(1),
    refetchInterval: POLL_MS,
  });

  const markRead = useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handlePress = useCallback(
    (n: AdminNotification) => {
      if (!n.read) markRead.mutate(n.id);
      resolveActionUrl(n.action_url, navigation);
    },
    [markRead, navigation]
  );

  if (isLoading) return <LoadingSpinner />;

  const notifications = data?.data ?? [];

  return (
    <FlatList
      className="flex-1 bg-surface"
      contentContainerClassName="gap-3 p-4"
      data={notifications}
      keyExtractor={(n) => String(n.id)}
      refreshing={isRefetching}
      onRefresh={refetch}
      ListEmptyComponent={<EmptyState message="No notifications yet." />}
      renderItem={({ item }) => (
        <Pressable onPress={() => handlePress(item)}>
          <Card className={`p-4 ${!item.read ? "border-accent/30" : ""}`}>
            <View className="flex-row items-center justify-between">
              <SeverityPill severity={item.severity ?? "info"} label={(item.severity ?? "info").toUpperCase()} />
              <Text className="text-xs text-faint">{timeAgo(item.created_at)}</Text>
            </View>
            <Text className="mt-2 text-[15px] font-semibold text-ink">{item.title}</Text>
            {item.body && (
              <Text className="mt-1 text-sm text-muted" numberOfLines={2}>
                {decodeHtmlEntities(item.body)}
              </Text>
            )}
          </Card>
        </Pressable>
      )}
    />
  );
}
