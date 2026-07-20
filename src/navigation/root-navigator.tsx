import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, useColorScheme } from "react-native";
import { useAuth } from "../context/auth-context";
import AuthStackNavigator from "./auth-stack";
import MainTabs from "./main-tabs";
import ChatsListScreen from "../screens/chat/ChatsListScreen";
import ChatThreadScreen from "../screens/chat/ChatThreadScreen";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { navigationRef } from "./navigationRef";
import type { RootStackParamList } from "./types";

const RootStack = createNativeStackNavigator<RootStackParamList>();

// React Navigation's own chrome (headers, tab bar) has a separate theme
// system from NativeWind's CSS variables — has to be wired independently,
// matched to the same palette as src/theme/colorVars.ts.
const lightNavTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: "#E85C1A", background: "#f0f2f5", card: "#ffffff", text: "#1a1a1a", border: "rgba(0,0,0,0.06)" },
};

const darkNavTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, primary: "#E85C1A", background: "#0d0d0f", card: "#1c1c1e", text: "#f5f5f7", border: "rgba(255,255,255,0.08)" },
};

export default function RootNavigator() {
  const { status } = useAuth();
  const scheme = useColorScheme();

  if (status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} theme={scheme === "dark" ? darkNavTheme : lightNavTheme}>
      {status === "signedIn" ? (
        <RootStack.Navigator>
          <RootStack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <RootStack.Screen name="ChatsList" component={ChatsListScreen} options={{ title: "Live Chat" }} />
          <RootStack.Screen name="ChatThread" component={ChatThreadScreen} options={{ title: "Live Chat" }} />
        </RootStack.Navigator>
      ) : (
        <AuthStackNavigator />
      )}
    </NavigationContainer>
  );
}
