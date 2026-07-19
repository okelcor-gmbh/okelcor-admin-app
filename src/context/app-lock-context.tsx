import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";

const ENABLED_KEY = "okelcor_biometric_lock_enabled";

type AppLockContextValue = {
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  isLocked: boolean;
  setBiometricEnabled: (value: boolean) => Promise<void>;
  unlock: () => Promise<boolean>;
};

const AppLockContext = createContext<AppLockContextValue | null>(null);

export function AppLockProvider({ children }: { children: React.ReactNode }) {
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Check hardware/enrollment support and load the persisted preference once.
  useEffect(() => {
    (async () => {
      const [hasHardware, isEnrolled, stored] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        SecureStore.getItemAsync(ENABLED_KEY).catch(() => null),
      ]);
      const available = hasHardware && isEnrolled;
      setBiometricAvailable(available);
      const enabled = available && stored === "1";
      setBiometricEnabledState(enabled);
      setIsLocked(enabled); // require unlock on cold launch if enabled
    })();
  }, []);

  // Re-lock whenever the app leaves the foreground, so it's locked again
  // when the user comes back — not just on cold launch.
  useEffect(() => {
    if (!biometricEnabled) return;
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "background") setIsLocked(true);
    });
    return () => sub.remove();
  }, [biometricEnabled]);

  const setBiometricEnabled = useCallback(async (value: boolean) => {
    await SecureStore.setItemAsync(ENABLED_KEY, value ? "1" : "0");
    setBiometricEnabledState(value);
  }, []);

  const unlock = useCallback(async () => {
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock Okelcor Admin",
      disableDeviceFallback: false,
    });
    if (res.success) setIsLocked(false);
    return res.success;
  }, []);

  const value = useMemo(
    () => ({ biometricAvailable, biometricEnabled, isLocked, setBiometricEnabled, unlock }),
    [biometricAvailable, biometricEnabled, isLocked, setBiometricEnabled, unlock]
  );

  return <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>;
}

export function useAppLock(): AppLockContextValue {
  const ctx = useContext(AppLockContext);
  if (!ctx) throw new Error("useAppLock must be used within AppLockProvider");
  return ctx;
}
