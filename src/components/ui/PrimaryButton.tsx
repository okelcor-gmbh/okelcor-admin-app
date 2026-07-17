import { ActivityIndicator, Pressable, Text } from "react-native";

export default function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`items-center rounded-xl py-3.5 ${isDisabled ? "bg-accent/50" : "bg-accent active:bg-accent/90"}`}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-[15px] font-bold text-white">{label}</Text>}
    </Pressable>
  );
}
