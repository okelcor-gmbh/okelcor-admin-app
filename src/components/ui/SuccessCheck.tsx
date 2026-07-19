import { useEffect, useState } from "react";
import { Animated, Text, View } from "react-native";

/**
 * Brief full-screen success confirmation — for actions significant enough
 * to deserve more than a toast (mark-paid, approve-revision), not every
 * quick action. Auto-dismisses; `visible` is fully controlled by the caller.
 */
export default function SuccessCheck({ visible, label }: { visible: boolean; label: string }) {
  // Lazy useState initializer (not useRef) gives the same "created once" stable
  // Animated.Value reference without tripping react-hooks/refs' render-time
  // ref-access check — Animated.Value is a mutable driver object designed to
  // be read during render for style binding, not a DOM-style ref.
  const [scale] = useState(() => new Animated.Value(0.6));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0.6);
    opacity.setValue(0);
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }),
        Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]),
      Animated.delay(700),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [visible, scale, opacity]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
      <Animated.View
        style={{ transform: [{ scale }], opacity }}
        className="items-center gap-3 rounded-3xl bg-black/80 px-8 py-7"
      >
        <View className="h-14 w-14 items-center justify-center rounded-full bg-emerald-500">
          <Text className="text-2xl font-bold text-white">✓</Text>
        </View>
        <Text className="text-[15px] font-semibold text-white">{label}</Text>
      </Animated.View>
    </View>
  );
}
