import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/types";
import { loginTwoFactor } from "../../api/auth";
import { AdminApiError } from "../../api/client";
import { useAuth } from "../../context/auth-context";
import TextField from "../../components/ui/TextField";
import PrimaryButton from "../../components/ui/PrimaryButton";

type Props = NativeStackScreenProps<AuthStackParamList, "Enter2FACode">;

export default function Enter2FACodeScreen({ route }: Props) {
  const { sessionToken } = route.params;
  const { signIn } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await loginTwoFactor(sessionToken, code.trim());
      await signIn(res.data.token, res.data.user);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Could not verify code.");
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="flex-1 justify-center px-6" keyboardShouldPersistTaps="handled">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-ink">Enter your code</Text>
          <Text className="mt-1 text-[15px] text-muted">
            Open your authenticator app and enter the 6-digit code, or use one of your recovery codes.
          </Text>
        </View>

        <TextField
          label="Authentication or recovery code"
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
          placeholder="123456"
          autoFocus
        />

        {error && <Text className="mb-4 text-center text-[14px] text-red-600">{error}</Text>}

        <PrimaryButton label="Verify" onPress={handleSubmit} loading={loading} disabled={code.trim().length === 0} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
