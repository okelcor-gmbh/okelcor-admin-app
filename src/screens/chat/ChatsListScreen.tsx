import { FlatList, Pressable, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { fetchCrispConversations } from "../../api/crisp";
import type { CrispConversation, CrispConversationState } from "../../api/types";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const STATE_LABEL: Record<CrispConversationState, string> = {
  pending: "Pending",
  unresolved: "Open",
  resolved: "Resolved",
};

const STATE_CLASS: Record<CrispConversationState, string> = {
  pending: "bg-amber-100 text-amber-700",
  unresolved: "bg-blue-100 text-blue-700",
  resolved: "bg-surface text-faint",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function ChatsListScreen() {
  const navigation = useNavigation() as { navigate: (name: string, params?: object) => void };

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["crispConversations"],
    queryFn: () => fetchCrispConversations(),
    refetchInterval: 15_000,
  });

  if (isLoading) return <LoadingSpinner />;

  // Open conversations first, most recently updated within each group.
  const conversations = [...(data?.data ?? [])].sort((a, b) => {
    if (a.state !== b.state) return a.state === "resolved" ? 1 : b.state === "resolved" ? -1 : 0;
    return b.updated_at - a.updated_at;
  });

  return (
    <FlatList
      className="flex-1 bg-surface"
      contentContainerClassName="gap-2 p-4"
      data={conversations}
      keyExtractor={(c) => c.session_id}
      refreshing={isRefetching}
      onRefresh={refetch}
      ListEmptyComponent={<EmptyState message="No conversations yet." />}
      renderItem={({ item }) => <ConversationRow conversation={item} navigation={navigation} />}
    />
  );
}

function ConversationRow({
  conversation,
  navigation,
}: {
  conversation: CrispConversation;
  navigation: { navigate: (name: string, params?: object) => void };
}) {
  return (
    <Pressable
      onPress={() =>
        navigation.navigate("ChatThread", {
          sessionId: conversation.session_id,
          nickname: conversation.meta.nickname,
        })
      }
    >
      <Card className="p-3.5">
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 pr-2 text-[14px] font-semibold text-ink" numberOfLines={1}>
            {conversation.meta.nickname || "Visitor"}
          </Text>
          <Text className="text-xs text-faint">{timeAgo(conversation.updated_at)}</Text>
        </View>
        {conversation.meta.email && (
          <Text className="text-xs text-muted" numberOfLines={1}>
            {conversation.meta.email}
          </Text>
        )}
        <Text className="mt-0.5 text-[13px] text-muted" numberOfLines={1}>
          {conversation.last_message || "—"}
        </Text>
        <View className="mt-2 flex-row items-center justify-between">
          <View className={`rounded-full px-2 py-0.5 ${STATE_CLASS[conversation.state]}`}>
            <Text className="text-[10px] font-bold uppercase tracking-wide">
              {STATE_LABEL[conversation.state]}
            </Text>
          </View>
          {conversation.unread.operator > 0 && (
            <View className="h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5">
              <Text className="text-[11px] font-bold text-white">{conversation.unread.operator}</Text>
            </View>
          )}
        </View>
      </Card>
    </Pressable>
  );
}
