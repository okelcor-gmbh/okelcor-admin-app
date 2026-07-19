import { Pressable, Switch, Text, View } from "react-native";
import Constants from "expo-constants";
import { useAuth } from "../../context/auth-context";
import { useAppLock } from "../../context/app-lock-context";
import Card from "../../components/ui/Card";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { biometricAvailable, biometricEnabled, setBiometricEnabled } = useAppLock();

  return (
    <View className="flex-1 bg-surface px-4 pt-4">
      <Card className="p-4">
        <Text className="text-base font-bold text-ink">{user?.name}</Text>
        <Text className="mt-0.5 text-sm text-muted">{user?.email}</Text>
        <Text className="mt-1 text-xs font-semibold uppercase tracking-wide text-accent">
          {user?.role_label ?? user?.role}
        </Text>
      </Card>

      <Card className="mt-4 flex-row items-center justify-between p-4">
        <View className="flex-1 pr-3">
          <Text className="text-[15px] font-semibold text-ink">Require Face ID to open</Text>
          <Text className="mt-0.5 text-xs text-muted">
            {biometricAvailable
              ? "Locks the app whenever it's backgrounded — this app can approve payments and financial changes."
              : "Not available — set up Face ID/Touch ID and a passcode on this device first."}
          </Text>
        </View>
        <Switch
          value={biometricEnabled}
          onValueChange={(v) => void setBiometricEnabled(v)}
          disabled={!biometricAvailable}
          trackColor={{ true: "#E85C1A" }}
        />
      </Card>

      <Pressable
        onPress={() => void signOut()}
        className="mt-4 items-center rounded-2xl border border-hairline/[0.06] bg-card py-3.5 active:bg-surface"
      >
        <Text className="text-[15px] font-semibold text-red-600">Sign Out</Text>
      </Pressable>

      <Text className="mt-auto mb-6 text-center text-xs text-faint">
        Okelcor Admin · v{Constants.expoConfig?.version ?? "1.0.0"}
      </Text>
    </View>
  );
}
