import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/auth-context";
import AuthStackNavigator from "./auth-stack";
import MainTabs from "./main-tabs";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { View } from "react-native";

export default function RootNavigator() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {status === "signedIn" ? <MainTabs /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
}
