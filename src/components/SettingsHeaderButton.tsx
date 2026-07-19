import { Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Settings } from "lucide-react-native";

/**
 * Settings lives behind a header icon rather than its own tab — with up to
 * 7 tabs otherwise, the bar was cramped enough to truncate labels. Also a
 * more modern pattern (account/settings out of the primary tab bar).
 */
export default function SettingsHeaderButton() {
  const navigation = useNavigation() as { navigate: (name: string) => void };
  return (
    <Pressable
      onPress={() => navigation.navigate("SettingsTab")}
      hitSlop={8}
      className="mr-1 h-9 w-9 items-center justify-center"
    >
      <Settings size={21} color="#5c5e62" />
    </Pressable>
  );
}
