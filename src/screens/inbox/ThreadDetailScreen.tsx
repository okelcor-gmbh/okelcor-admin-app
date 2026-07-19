import { useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import { Paperclip, Send, X } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { InboxStackParamList } from "../../navigation/types";
import { fetchCustomerCommunications, sendCustomerEmail } from "../../api/communications";
import type { Communication } from "../../api/types";
import { AdminApiError } from "../../api/client";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import { timeAgo } from "../../lib/timeAgo";
import { decodeHtmlEntities } from "../../lib/decodeHtmlEntities";
import { stripHtml } from "../../lib/stripHtml";

type Props = NativeStackScreenProps<InboxStackParamList, "ThreadDetail">;

type PendingAttachment = { uri: string; name: string; mimeType: string };

export default function ThreadDetailScreen({ route }: Props) {
  const { customerId } = route.params;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["communications", customerId],
    queryFn: () => fetchCustomerCommunications(customerId),
  });

  const [body, setBody] = useState("");
  const [attachment, setAttachment] = useState<PendingAttachment | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const messages = data?.data ?? [];
  const lastSubject = [...messages].reverse().find((m) => m.subject)?.subject ?? "your message";

  const send = useMutation({
    mutationFn: () =>
      sendCustomerEmail(customerId, {
        subject: lastSubject.startsWith("Re:") ? lastSubject : `Re: ${lastSubject}`,
        body: body.trim().replace(/\n/g, "<br>"),
        attachment,
      }),
    onSuccess: () => {
      setBody("");
      setAttachment(null);
      setSendError(null);
      void queryClient.invalidateQueries({ queryKey: ["communications", customerId] });
    },
    onError: (err) => {
      setSendError(
        err instanceof AdminApiError && err.code === "email_send_failed"
          ? "Couldn't send — the message was logged, you can try again."
          : "Couldn't send your reply."
      );
    },
  });

  const pickAttachment = async () => {
    const res = await DocumentPicker.getDocumentAsync({ multiple: false });
    if (res.canceled) return;
    const asset = res.assets[0];
    setAttachment({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? "application/octet-stream" });
  };

  if (isLoading) return <LoadingSpinner />;

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

      <View className="border-t border-hairline/[0.06] bg-card px-3 py-3">
        {attachment && (
          <View className="mb-2 flex-row items-center gap-2 self-start rounded-full bg-surface px-3 py-1.5">
            <Text className="text-xs text-muted" numberOfLines={1}>
              {attachment.name}
            </Text>
            <Pressable onPress={() => setAttachment(null)}>
              <X size={12} color="#5c5e62" />
            </Pressable>
          </View>
        )}
        {sendError && <Text className="mb-2 text-xs text-red-600">{sendError}</Text>}
        <View className="flex-row items-end gap-2">
          <Pressable
            onPress={() => void pickAttachment()}
            className="mb-1.5 h-9 w-9 items-center justify-center rounded-full bg-surface"
          >
            <Paperclip size={16} color="#5c5e62" />
          </Pressable>
          <TextInput
            className="max-h-28 flex-1 rounded-2xl border border-hairline/[0.1] bg-card px-4 py-2.5 text-[15px] text-ink"
            placeholder="Reply…"
            placeholderTextColor="#9ca3af"
            value={body}
            onChangeText={setBody}
            multiline
          />
          <Pressable
            onPress={() => send.mutate()}
            disabled={!body.trim() || send.isPending}
            className={`mb-1.5 h-9 w-9 items-center justify-center rounded-full ${
              !body.trim() || send.isPending ? "bg-accent/40" : "bg-accent"
            }`}
          >
            <Send size={15} color="#fff" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message }: { message: Communication }) {
  const isOutbound = message.direction === "outbound";
  return (
    <View
      className={`max-w-[85%] rounded-2xl p-3.5 ${
        isOutbound ? "self-end bg-accent-tint" : "self-start border border-hairline/[0.06] bg-card"
      }`}
    >
      {message.subject && <Text className="mb-1 text-xs font-semibold text-muted">{message.subject}</Text>}
      <Text className="text-[15px] text-ink">{decodeHtmlEntities(stripHtml(message.body))}</Text>
      {message.attachments?.map((a) => (
        <Text key={a.url} className="mt-1 text-xs text-accent">
          📎 {a.filename}
        </Text>
      ))}
      <Text className="mt-1.5 text-[11px] text-faint">{timeAgo(message.created_at)}</Text>
    </View>
  );
}
