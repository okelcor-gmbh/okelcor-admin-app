import { useEffect } from "react";
import { Image, Text, View } from "react-native";
import PrimaryButton from "./PrimaryButton";
import { useAppLock } from "../../context/app-lock-context";

export default function LockScreen() {
  const { unlock } = useAppLock();

  useEffect(() => {
    // Try immediately on mount — most users never need to tap the button.
    void unlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once on mount only, not on every unlock() identity change
  }, []);

  return (
    <View className="absolute inset-0 z-[999] items-center justify-center bg-surface px-8">
      <Image source={require("../../../assets/icon.png")} className="mb-5 h-16 w-16 rounded-2xl" resizeMode="contain" />
      <Text className="text-xl font-bold text-ink">Okelcor Admin is locked</Text>
      <Text className="mt-1 mb-8 text-center text-[15px] text-muted">
        Unlock with Face ID or your device passcode to continue.
      </Text>
      <PrimaryButton label="Unlock" onPress={() => void unlock()} />
    </View>
  );
}
