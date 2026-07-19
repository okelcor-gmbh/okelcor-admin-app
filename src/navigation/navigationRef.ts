import { createNavigationContainerRef } from "@react-navigation/native";
import type { MainTabParamList } from "./types";

// Lets code outside the component tree (the notification response listener
// in App.tsx) navigate — e.g. after a push notification action fires.
export const navigationRef = createNavigationContainerRef<MainTabParamList>();
