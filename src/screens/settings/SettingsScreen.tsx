import { Pressable, Text, View } from "react-native";
import Constants from "expo-constants";
import { useAuth } from "../../context/auth-context";
import Card from "../../components/ui/Card";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  return (
    <View className="flex-1 bg-surface px-4 pt-4">
      <Card className="p-4">
        <Text className="text-base font-bold text-ink">{user?.name}</Text>
        <Text className="mt-0.5 text-sm text-muted">{user?.email}</Text>
        <Text className="mt-1 text-xs font-semibold uppercase tracking-wide text-accent">
          {user?.role_label ?? user?.role}
        </Text>
      </Card>

      <Pressable
        onPress={() => void signOut()}
        className="mt-4 items-center rounded-2xl border border-black/[0.06] bg-white py-3.5 active:bg-surface"
      >
        <Text className="text-[15px] font-semibold text-red-600">Sign Out</Text>
      </Pressable>

      <Text className="mt-auto mb-6 text-center text-xs text-faint">
        Okelcor Admin · v{Constants.expoConfig?.version ?? "1.0.0"}
      </Text>
    </View>
  );
}
