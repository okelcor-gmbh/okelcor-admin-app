import { ActivityIndicator, View } from "react-native";

export default function LoadingSpinner() {
  return (
    <View className="items-center justify-center py-16">
      <ActivityIndicator color="#E85C1A" />
    </View>
  );
}
