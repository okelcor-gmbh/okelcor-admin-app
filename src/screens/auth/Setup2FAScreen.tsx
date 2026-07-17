import { useCallback, useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/types";
import { setupTwoFactorEnable, setupTwoFactorConfirm } from "../../api/auth";
import { AdminApiError } from "../../api/client";
import TextField from "../../components/ui/TextField";
import PrimaryButton from "../../components/ui/PrimaryButton";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

type Props = NativeStackScreenProps<AuthStackParamList, "Setup2FA">;

export default function Setup2FAScreen({ route, navigation }: Props) {
  const { tempToken } = route.params;

  const [secret, setSecret] = useState<string | null>(null);
  const [otpauthUri, setOtpauthUri] = useState<string | null>(null);
  const [loadingSecret, setLoadingSecret] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const initSetup = useCallback(async () => {
    setLoadingSecret(true);
    setInitError(null);
    try {
      const res = await setupTwoFactorEnable(tempToken);
      setSecret(res.data.secret);
      setOtpauthUri(res.data.otpauth_uri);
    } catch (err) {
      setInitError(err instanceof AdminApiError ? err.message : "Could not start 2FA setup.");
    } finally {
      setLoadingSecret(false);
    }
  }, [tempToken]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, one-time setup init
    void initSetup();
  }, [initSetup]);

  const handleConfirm = async () => {
    setConfirmError(null);
    setConfirming(true);
    try {
      const res = await setupTwoFactorConfirm(tempToken, code.trim());
      navigation.navigate("RecoveryCodes", {
        codes: res.data.recovery_codes,
        token: res.data.token,
        user: res.data.user,
      });
    } catch (err) {
      setConfirmError(err instanceof AdminApiError ? err.message : "The provided code is invalid.");
    } finally {
      setConfirming(false);
    }
  };

  if (loadingSecret) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <LoadingSpinner />
      </View>
    );
  }

  if (initError || !otpauthUri || !secret) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-6">
        <Text className="mb-4 text-center text-[15px] text-red-600">
          {initError ?? "Setup session has expired. Please log in again."}
        </Text>
        <PrimaryButton label="Try again" onPress={() => void initSetup()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="px-6 py-10" keyboardShouldPersistTaps="handled">
        <Text className="text-2xl font-bold text-ink">Set up two-factor authentication</Text>
        <Text className="mt-1 text-[15px] text-muted">
          Required for every admin account. Scan this with an authenticator app (Google Authenticator, Authy, 1Password).
        </Text>

        <View className="my-8 items-center rounded-2xl border border-black/[0.06] bg-white p-6">
          <QRCode value={otpauthUri} size={200} />
        </View>

        <View className="mb-6 rounded-xl border border-black/[0.06] bg-white px-4 py-3">
          <Text className="mb-1 text-[13px] font-semibold text-muted">Can&apos;t scan? Enter manually:</Text>
          <Text className="font-mono text-[14px] text-ink">{secret}</Text>
        </View>

        <TextField
          label="6-digit code from your app"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="123456"
        />

        {confirmError && <Text className="mb-4 text-center text-[14px] text-red-600">{confirmError}</Text>}

        <PrimaryButton
          label="Enable & Continue"
          onPress={handleConfirm}
          loading={confirming}
          disabled={code.length !== 6}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
