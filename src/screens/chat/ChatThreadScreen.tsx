import { useLayoutEffect, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, Send } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { fetchCrispMessages, resolveCrispConversation, sendCrispReply } from "../../api/crisp";
import { AdminApiError } from "../../api/client";
import type { CrispMessage } from "../../api/types";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";

type Props = NativeStackScreenProps<RootStackParamList, "ChatThread">;

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatThreadScreen({ route, navigation }: Props) {
  const { sessionId, nickname } = route.params;
  const queryClient = useQueryClient();
  // Crisp conversations can be reopened by the visitor after resolving, so
  // this only hides the header action — it never locks the composer, same
  // as the website's own inbox (chats-inbox.tsx never disables its reply box).
  const [resolved, setResolved] = useState(false);
  const [input, setInput] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["crispMessages", sessionId],
    queryFn: () => fetchCrispMessages(sessionId),
    refetchInterval: 15_000,
  });

  const send = useMutation({
    mutationFn: (body: string) => sendCrispReply(sessionId, body),
    onSuccess: () => {
      setInput("");
      void refetch();
    },
  });

  const resolve = useMutation({
    mutationFn: () => resolveCrispConversation(sessionId),
    onSuccess: () => {
      setResolved(true);
      void queryClient.invalidateQueries({ queryKey: ["crispConversations"] });
    },
  });

  const confirmResolve = () => {
    Alert.alert("Resolve this conversation?", "The visitor will see it's been marked resolved.", [
      { text: "Cancel", style: "cancel" },
      { text: "Resolve", onPress: () => resolve.mutate() },
    ]);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: nickname ?? "Live Chat",
      headerRight: resolved
        ? undefined
        : () => (
            <Pressable onPress={confirmResolve} hitSlop={8} className="mr-1 h-9 w-9 items-center justify-center">
              <CheckCheck size={20} color="#5c5e62" />
            </Pressable>
          ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- confirmResolve closes over stable mutate only
  }, [navigation, nickname, resolved]);

  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    const notConfigured = error instanceof AdminApiError && error.code === "crisp_not_configured";
    return (
      <View className="flex-1 items-center justify-center gap-2 bg-surface p-6">
        <Text className="text-center text-[15px] font-semibold text-ink">
          {notConfigured ? "Chat temporarily unavailable" : "Couldn't load this conversation"}
        </Text>
        <Text className="text-center text-sm text-muted">
          {error instanceof AdminApiError ? error.message : "Check your connection and try again."}
        </Text>
        <Pressable onPress={() => void refetch()} className="mt-2 rounded-full bg-accent-tint px-4 py-2">
          <Text className="text-[13px] font-bold text-accent">Retry</Text>
        </Pressable>
      </View>
    );
  }

  const messages = (data?.data ?? []).filter((m) => m.type === "text" && m.content);

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
        keyExtractor={(m, i) => `${m.timestamp}-${i}`}
        ListEmptyComponent={<EmptyState message="No messages yet." />}
        renderItem={({ item }) => <MessageBubble message={item} />}
      />

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
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message }: { message: CrispMessage }) {
  const isOutbound = message.from === "operator";
  return (
    <View
      className={`max-w-[85%] rounded-2xl p-3.5 ${
        isOutbound ? "self-end bg-accent-tint" : "self-start border border-hairline/[0.06] bg-card"
      }`}
    >
      <Text className="text-[15px] text-ink">{message.content}</Text>
      <Text className="mt-1.5 text-[11px] text-faint">{fmtTime(message.timestamp)}</Text>
    </View>
  );
}
