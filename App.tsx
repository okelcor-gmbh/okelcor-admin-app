import "./global.css";
import { useEffect } from "react";
import { View, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./src/context/auth-context";
import { AppLockProvider } from "./src/context/app-lock-context";
import AppLockGate from "./src/components/AppLockGate";
import { registerNotificationCategories, handleNotificationResponse } from "./src/lib/notificationActions";
import { lightVars, darkVars } from "./src/theme/colorVars";

// How to present a notification that arrives while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export default function App() {
  const scheme = useColorScheme();

  useEffect(() => {
    void registerNotificationCategories();
    const sub = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    return () => sub.remove();
  }, []);

  return (
    <View style={[{ flex: 1 }, scheme === "dark" ? darkVars : lightVars]}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppLockProvider>
              <AppLockGate />
              <StatusBar style="auto" />
            </AppLockProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </View>
  );
}
