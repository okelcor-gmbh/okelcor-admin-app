import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { View, useColorScheme } from "react-native";
import { useAuth } from "../context/auth-context";
import AuthStackNavigator from "./auth-stack";
import MainTabs from "./main-tabs";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { navigationRef } from "./navigationRef";

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
      {status === "signedIn" ? <MainTabs /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
}
