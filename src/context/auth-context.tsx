import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { setAuthToken, setUnauthorizedHandler } from "../api/client";
import { fetchMe } from "../api/auth";
import type { AdminUser } from "../api/types";

const TOKEN_KEY = "okelcor_admin_token";

type AuthStatus = "loading" | "signedOut" | "signedIn";

type AuthContextValue = {
  status: AuthStatus;
  user: AdminUser | null;
  /** Persists the token (SecureStore + in-memory client cache) and marks signed in. */
  signIn: (token: string, user: AdminUser) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AdminUser | null>(null);

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    setAuthToken(null);
    setUser(null);
    setStatus("signedOut");
  }, []);

  const signIn = useCallback(async (token: string, nextUser: AdminUser) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setAuthToken(token);
    setUser(nextUser);
    setStatus("signedIn");
  }, []);

  // Any 401 from any API call anywhere in the app triggers a global sign-out.
  useEffect(() => {
    setUnauthorizedHandler(() => void signOut());
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  // Boot: try to restore a persisted token and validate it against /admin/me.
  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync(TOKEN_KEY).catch(() => null);
      if (!token) {
        setStatus("signedOut");
        return;
      }
      setAuthToken(token);
      try {
        const res = await fetchMe();
        setUser(res.data);
        setStatus("signedIn");
      } catch {
        // Expired/invalid token — same as signOut, but token's already gone from memory
        await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
        setAuthToken(null);
        setStatus("signedOut");
      }
    })();
  }, []);

  const value = useMemo(() => ({ status, user, signIn, signOut }), [status, user, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
