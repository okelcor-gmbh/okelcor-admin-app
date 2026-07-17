import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "./types";
import LoginScreen from "../screens/auth/LoginScreen";
import Enter2FACodeScreen from "../screens/auth/Enter2FACodeScreen";
import Setup2FAScreen from "../screens/auth/Setup2FAScreen";
import RecoveryCodesScreen from "../screens/auth/RecoveryCodesScreen";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Enter2FACode" component={Enter2FACodeScreen} options={{ headerShown: true, title: "" }} />
      <Stack.Screen name="Setup2FA" component={Setup2FAScreen} options={{ headerShown: true, title: "" }} />
      <Stack.Screen
        name="RecoveryCodes"
        component={RecoveryCodesScreen}
        options={{ headerShown: true, title: "", gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
