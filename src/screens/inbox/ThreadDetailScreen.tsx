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
import { useAuth } from "../../context/auth-context";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import { timeAgo } from "../../lib/timeAgo";
import { decodeHtmlEntities } from "../../lib/decodeHtmlEntities";
import { stripHtml } from "../../lib/stripHtml";

type Props = NativeStackScreenProps<InboxStackParamList, "ThreadDetail">;

type PendingAttachment = { uri: string; name: string; mimeType: string };

export default function ThreadDetailScreen({ route }: Props) {
  const { customerId, customerName } = route.params;
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
        renderItem={({ item }) => <EmailMessageCard message={item} customerName={customerName} />}
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

function EmailMessageCard({ message, customerName }: { message: Communication; customerName: string }) {
  const { user } = useAuth();
  const isOutbound = message.direction === "outbound";
  const senderName = isOutbound ? (user?.name ?? "You") : customerName;
  const initial = senderName.trim().charAt(0).toUpperCase() || "?";

  return (
    <View className="w-full rounded-2xl border border-hairline/[0.08] bg-card p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-2 pr-2">
          <View
            className={`h-7 w-7 items-center justify-center rounded-full ${isOutbound ? "bg-accent" : "bg-surface"}`}
          >
            <Text className={`text-[12px] font-bold ${isOutbound ? "text-white" : "text-muted"}`}>{initial}</Text>
          </View>
          <Text className="flex-1 text-[14px] font-semibold text-ink" numberOfLines={1}>
            {senderName}
          </Text>
        </View>
        <Text className="text-[11px] text-faint">{timeAgo(message.created_at)}</Text>
      </View>

      {message.subject && (
        <Text className="mt-2 text-[13px] font-medium text-muted" numberOfLines={1}>
          {message.subject}
        </Text>
      )}

      <View className="my-3 h-px bg-hairline/[0.08]" />

      <Text className="text-[15px] leading-[22px] text-ink">{decodeHtmlEntities(stripHtml(message.body))}</Text>

      {message.attachments && message.attachments.length > 0 && (
        <View className="mt-3 flex-row flex-wrap gap-1.5">
          {message.attachments.map((a) => (
            <View
              key={a.url}
              className="flex-row items-center gap-1.5 rounded-full border border-hairline/[0.1] bg-surface px-3 py-1.5"
            >
              <Text className="text-xs text-accent">📎 {a.filename}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
