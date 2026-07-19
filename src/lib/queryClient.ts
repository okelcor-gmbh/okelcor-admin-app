import { QueryClient } from "@tanstack/react-query";

// Exported (not local to App.tsx) so non-React modules — the Pusher event
// handlers in useChatQueueChannel/useChatSessionChannel — can call
// invalidateQueries/setQueryData without going through a hook.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});
