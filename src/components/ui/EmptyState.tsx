import { Text, View } from "react-native";

export default function EmptyState({ message }: { message: string }) {
  return (
    <View className="items-center justify-center px-6 py-16">
      <Text className="text-center text-[15px] text-muted">{message}</Text>
    </View>
  );
}
