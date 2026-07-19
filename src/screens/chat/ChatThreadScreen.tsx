import { useLayoutEffect, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Send, X } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { acceptChatSession, closeChatSession, sendChatMessage } from "../../api/chat";
import { AdminApiError } from "../../api/client";
import type { ChatMessage, ChatSessionStatus } from "../../api/types";
import { useChatSessionChannel } from "../../hooks/useChatSessionChannel";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import { timeAgo } from "../../lib/timeAgo";

type Props = NativeStackScreenProps<RootStackParamList, "ChatThread">;

export default function ChatThreadScreen({ route, navigation }: Props) {
  const { sessionId } = route.params;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["chatSession", sessionId],
    queryFn: () => acceptChatSession(sessionId),
    retry: false,
  });

  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [statusOverride, setStatusOverride] = useState<ChatSessionStatus | null>(null);
  const [input, setInput] = useState("");

  const status = statusOverride ?? data?.data.status ?? "pending";
  const messages = [...(data?.data.messages ?? []), ...liveMessages];

  useChatSessionChannel(sessionId, {
    onMessage: (m) => setLiveMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m])),
    onStatusChanged: setStatusOverride,
  });

  const send = useMutation({
    mutationFn: (body: string) => sendChatMessage(sessionId, body),
    onSuccess: (res, body) => {
      setLiveMessages((prev) => [
        ...prev,
        { id: res.data.id, sender_type: "admin", body, created_at: res.data.created_at },
      ]);
      setInput("");
    },
  });

  const close = useMutation({
    mutationFn: () => closeChatSession(sessionId),
    onSuccess: () => navigation.goBack(),
  });

  const confirmClose = () => {
    Alert.alert("Close this chat?", "The customer will see the conversation has ended.", [
      { text: "Cancel", style: "cancel" },
      { text: "Close chat", style: "destructive", onPress: () => close.mutate() },
    ]);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: data?.data.customer_name ?? "Live Chat",
      headerRight:
        status === "closed"
          ? undefined
          : () => (
              <Pressable onPress={confirmClose} hitSlop={8} className="mr-1 h-9 w-9 items-center justify-center">
                <X size={20} color="#5c5e62" />
              </Pressable>
            ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- confirmClose closes over stable mutate/navigation only
  }, [navigation, data?.data.customer_name, status]);

  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    const claimed = error instanceof AdminApiError && error.code === "already_claimed";
    return (
      <View className="flex-1 items-center justify-center gap-2 bg-surface p-6">
        <Text className="text-center text-[15px] font-semibold text-ink">
          {claimed ? "Claimed by another admin" : "Couldn't open this chat"}
        </Text>
        <Text className="text-center text-sm text-muted">
          {claimed
            ? "Someone else on the team already picked this one up."
            : "Check your connection and try again."}
        </Text>
      </View>
    );
  }

  const closed = status === "closed";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-surface"
      keyboardVerticalOffset={90}
    >
      <FlatList
        className="flex-1"
        contentContainerClassName="gap-3 p-4"
        data={messages}
        keyExtractor={(m) => String(m.id)}
        ListEmptyComponent={<EmptyState message="No messages yet." />}
        renderItem={({ item }) => <MessageBubble message={item} />}
      />

      {closed && (
        <View className="border-t border-hairline/[0.06] bg-card px-4 py-3">
          <Text className="text-center text-[13px] text-muted">This chat has ended.</Text>
        </View>
      )}

      {!closed && (
        <View className="border-t border-hairline/[0.06] bg-card px-3 py-3">
          <View className="flex-row items-end gap-2">
            <TextInput
              className="max-h-28 flex-1 rounded-2xl border border-hairline/[0.1] bg-card px-4 py-2.5 text-[15px] text-ink"
              placeholder="Message…"
              placeholderTextColor="#9ca3af"
              value={input}
              onChangeText={setInput}
              multiline
            />
            <Pressable
              onPress={() => send.mutate(input.trim())}
              disabled={!input.trim() || send.isPending}
              className={`mb-1.5 h-9 w-9 items-center justify-center rounded-full ${
                !input.trim() || send.isPending ? "bg-accent/40" : "bg-accent"
              }`}
            >
              <Send size={15} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isOutbound = message.sender_type === "admin";
  return (
    <View
      className={`max-w-[85%] rounded-2xl p-3.5 ${
        isOutbound ? "self-end bg-accent-tint" : "self-start border border-hairline/[0.06] bg-card"
      }`}
    >
      <Text className="text-[15px] text-ink">{message.body}</Text>
      <Text className="mt-1.5 text-[11px] text-faint">{timeAgo(message.created_at)}</Text>
    </View>
  );
}
