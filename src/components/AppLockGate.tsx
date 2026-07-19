import { useAuth } from "../context/auth-context";
import { useAppLock } from "../context/app-lock-context";
import LockScreen from "./ui/LockScreen";
import RootNavigator from "../navigation/root-navigator";

/** Only ever locks an authenticated session — never blocks the login screen itself. */
export default function AppLockGate() {
  const { status } = useAuth();
  const { isLocked, biometricEnabled } = useAppLock();

  return (
    <>
      <RootNavigator />
      {status === "signedIn" && biometricEnabled && isLocked && <LockScreen />}
    </>
  );
}
