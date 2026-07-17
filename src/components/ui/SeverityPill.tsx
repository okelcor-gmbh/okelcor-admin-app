import { Text, View } from "react-native";

type Severity = "positive" | "info" | "success" | "warning" | "critical" | "urgent" | string;

const STYLES: Record<string, { bg: string; text: string }> = {
  positive: { bg: "bg-severity-positive-tint", text: "text-severity-positive" },
  success: { bg: "bg-severity-positive-tint", text: "text-severity-positive" },
  info: { bg: "bg-severity-info-tint", text: "text-severity-info" },
  warning: { bg: "bg-severity-warning-tint", text: "text-severity-warning" },
  critical: { bg: "bg-severity-critical-tint", text: "text-severity-critical" },
  urgent: { bg: "bg-severity-critical-tint", text: "text-severity-critical" },
};

export default function SeverityPill({ severity, label }: { severity: Severity; label: string }) {
  const style = STYLES[severity] ?? { bg: "bg-surface", text: "text-muted" };
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${style.bg}`}>
      <Text className={`text-[11px] font-bold uppercase tracking-wide ${style.text}`}>{label}</Text>
    </View>
  );
}
