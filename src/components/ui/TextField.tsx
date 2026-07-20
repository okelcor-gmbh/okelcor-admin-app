import { forwardRef, type ReactNode } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

type Props = TextInputProps & { label: string; error?: string | null; rightElement?: ReactNode };

const TextField = forwardRef<TextInput, Props>(function TextField({ label, error, rightElement, ...props }, ref) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-[13px] font-semibold text-muted">{label}</Text>
      <View className="justify-center">
        <TextInput
          ref={ref}
          className={`rounded-xl border bg-card px-4 py-3 text-[15px] text-ink ${rightElement ? "pr-11" : ""} ${
            error ? "border-red-400" : "border-hairline/[0.1]"
          }`}
          placeholderTextColor="#9ca3af"
          {...props}
        />
        {rightElement && <View className="absolute right-3">{rightElement}</View>}
      </View>
      {error && <Text className="mt-1 text-[13px] text-red-600">{error}</Text>}
    </View>
  );
});

export default TextField;
