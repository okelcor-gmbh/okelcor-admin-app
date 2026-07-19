import { View, type ViewProps } from "react-native";

/** Hairline-border card — mirrors the web admin panel's card language. */
export default function Card({ className = "", ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={`rounded-2xl border border-hairline/[0.06] bg-card ${className}`}
      {...props}
    />
  );
}
