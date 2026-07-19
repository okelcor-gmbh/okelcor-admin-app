import { useState } from "react";
import { Switch, Text, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { updatePresence } from "../../api/presence";
import { useAuth } from "../../context/auth-context";
import Card from "./Card";

export default function PresenceToggle() {
  const { user, updateUser } = useAuth();
  const [pending, setPending] = useState(false);

  const mutation = useMutation({
    mutationFn: updatePresence,
    onMutate: () => setPending(true),
    onSuccess: (res) => {
      updateUser({ available_for_chat: res.data.available_for_chat });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onSettled: () => setPending(false),
  });

  const available = user?.available_for_chat ?? false;

  return (
    <Card className="flex-row items-center justify-between p-4">
      <View className="flex-1 pr-3">
        <Text className="text-[15px] font-semibold text-ink">Available for live chat</Text>
        <Text className="mt-0.5 text-xs text-muted">
          {available ? "Customers can be routed to you right now." : "You won't get new chat requests."}
        </Text>
      </View>
      <Switch
        value={available}
        onValueChange={(v) => mutation.mutate(v)}
        disabled={pending}
        trackColor={{ true: "#E85C1A" }}
      />
    </Card>
  );
}
