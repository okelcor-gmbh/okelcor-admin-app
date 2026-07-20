type MinimalNavigation = { navigate: (name: string, params?: object) => void };

const ORDER_RE = /^\/admin\/orders\/(\d+)/;

/**
 * Maps a web-admin-style action_url to a native screen where one exists.
 * Anything without a v1 screen equivalent is a silent no-op rather than a
 * broken navigation — matches the "quick reaction, not full parity" scope.
 */
export function resolveActionUrl(actionUrl: string | null | undefined, navigation: MinimalNavigation) {
  if (!actionUrl) return;

  const orderMatch = actionUrl.match(ORDER_RE);
  if (orderMatch) {
    navigation.navigate("OrdersTab", { screen: "OrderDetail", params: { orderId: Number(orderMatch[1]) } });
  }
}
