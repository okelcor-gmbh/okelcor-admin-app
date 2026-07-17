import { ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/types";
import { useAuth } from "../../context/auth-context";
import PrimaryButton from "../../components/ui/PrimaryButton";

type Props = NativeStackScreenProps<AuthStackParamList, "RecoveryCodes">;

export default function RecoveryCodesScreen({ route }: Props) {
  const { codes, token, user } = route.params;
  const { signIn } = useAuth();

  return (
    <View className="flex-1 bg-surface px-6 py-10">
      <Text className="text-2xl font-bold text-ink">Save your recovery codes</Text>
      <Text className="mt-1 text-[15px] text-muted">
        Two-factor authentication is enabled. These codes will not be shown again — store them somewhere
        safe. Each one can be used once, in place of your authenticator app, if you lose access to it.
      </Text>

      <ScrollView className="my-8 max-h-80 rounded-2xl border border-black/[0.06] bg-white">
        {codes.map((c, i) => (
          <View
            key={c}
            className={`px-5 py-3.5 ${i > 0 ? "border-t border-black/[0.04]" : ""}`}
          >
            <Text className="text-center font-mono text-[16px] tracking-wider text-ink">{c}</Text>
          </View>
        ))}
      </ScrollView>

      <PrimaryButton label="I've saved these — Continue" onPress={() => void signIn(token, user)} />
    </View>
  );
}
