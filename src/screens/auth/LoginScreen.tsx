import { useRef, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/types";
import { login } from "../../api/auth";
import { AdminApiError } from "../../api/client";
import TextField from "../../components/ui/TextField";
import PrimaryButton from "../../components/ui/PrimaryButton";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      if ("requires_2fa_setup" in res) {
        navigation.navigate("Setup2FA", { tempToken: res.data.temp_token });
      } else {
        navigation.navigate("Enter2FACode", { sessionToken: res.data.session_token });
      }
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Could not sign in. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-surface"
    >
      <ScrollView contentContainerClassName="flex-1 justify-center px-6" keyboardShouldPersistTaps="handled">
        <View className="mb-10 items-center">
          <Image
            source={require("../../../assets/icon.png")}
            className="mb-4 h-14 w-14 rounded-2xl"
            resizeMode="contain"
          />
          <Text className="text-2xl font-bold text-ink">Okelcor Admin</Text>
          <Text className="mt-1 text-[15px] text-muted">Sign in to continue</Text>
        </View>

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          placeholder="you@okelcor.com"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          blurOnSubmit={false}
        />
        <TextField
          ref={passwordRef}
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoComplete="password"
          textContentType="password"
          placeholder="••••••••"
          returnKeyType="done"
          onSubmitEditing={() => void handleSubmit()}
          rightElement={
            <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              {showPassword ? <EyeOff size={18} color="#9ca3af" /> : <Eye size={18} color="#9ca3af" />}
            </Pressable>
          }
        />

        {error && <Text className="mb-4 text-center text-[14px] text-red-600">{error}</Text>}

        <PrimaryButton
          label="Sign In"
          onPress={handleSubmit}
          loading={loading}
          disabled={!email || !password}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
