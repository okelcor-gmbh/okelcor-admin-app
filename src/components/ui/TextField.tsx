import { Text, TextInput, View, type TextInputProps } from "react-native";

export default function TextField({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string | null }) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-[13px] font-semibold text-muted">{label}</Text>
      <TextInput
        className={`rounded-xl border bg-card px-4 py-3 text-[15px] text-ink ${
          error ? "border-red-400" : "border-hairline/[0.1]"
        }`}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error && <Text className="mt-1 text-[13px] text-red-600">{error}</Text>}
    </View>
  );
}
