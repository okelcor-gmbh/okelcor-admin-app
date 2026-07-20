import { StyleSheet, useColorScheme } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import { Home, Bell, Sparkles, Inbox, Package, FileText, ShieldAlert } from "lucide-react-native";
import type { MainTabParamList, InboxStackParamList, OrdersStackParamList, QuotesStackParamList } from "./types";
import { useAuth } from "../context/auth-context";
import { usePushRegistration } from "../hooks/usePushRegistration";
import { useUnreadNotificationsCount } from "../hooks/useUnreadNotificationsCount";
import { useAppBadge } from "../hooks/useAppBadge";
import SettingsHeaderButton from "../components/SettingsHeaderButton";

import TodayScreen from "../screens/today/TodayScreen";
import NotificationsListScreen from "../screens/notifications/NotificationsListScreen";
import InsightsListScreen from "../screens/insights/InsightsListScreen";
import InboxListScreen from "../screens/inbox/InboxListScreen";
import ThreadDetailScreen from "../screens/inbox/ThreadDetailScreen";
import OrdersListScreen from "../screens/orders/OrdersListScreen";
import OrderDetailScreen from "../screens/orders/OrderDetailScreen";
import QuotesListScreen from "../screens/quotes/QuotesListScreen";
import QuoteDetailScreen from "../screens/quotes/QuoteDetailScreen";
import SecurityGlanceScreen from "../screens/security/SecurityGlanceScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();
const InboxStack = createNativeStackNavigator<InboxStackParamList>();
const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();
const QuotesStack = createNativeStackNavigator<QuotesStackParamList>();

function InboxStackNavigator() {
  return (
    <InboxStack.Navigator>
      <InboxStack.Screen
        name="InboxList"
        component={InboxListScreen}
        options={{ title: "Inbox", headerRight: () => <SettingsHeaderButton /> }}
      />
      <InboxStack.Screen
        name="ThreadDetail"
        component={ThreadDetailScreen}
        options={({ route }) => ({ title: route.params.customerName })}
      />
    </InboxStack.Navigator>
  );
}

function OrdersStackNavigator() {
  return (
    <OrdersStack.Navigator>
      <OrdersStack.Screen
        name="OrdersList"
        component={OrdersListScreen}
        options={{ title: "Orders", headerRight: () => <SettingsHeaderButton /> }}
      />
      <OrdersStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Order" }} />
    </OrdersStack.Navigator>
  );
}

function QuotesStackNavigator() {
  return (
    <QuotesStack.Navigator>
      <QuotesStack.Screen
        name="QuotesList"
        component={QuotesListScreen}
        options={{ title: "Quotes", headerRight: () => <SettingsHeaderButton /> }}
      />
      <QuotesStack.Screen name="QuoteDetail" component={QuoteDetailScreen} options={{ title: "Quote" }} />
    </QuotesStack.Navigator>
  );
}

export default function MainTabs() {
  const { user } = useAuth();
  const scheme = useColorScheme();
  const canViewSecurity = user?.permissions.includes("security.view") ?? false;
  const unreadCount = useUnreadNotificationsCount();
  usePushRegistration(true);
  useAppBadge();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#E85C1A",
        tabBarInactiveTintColor: scheme === "dark" ? "#71717a" : "#9ca3af",
        tabBarLabelStyle: { fontSize: 9, fontWeight: "600", letterSpacing: -0.2, textAlign: "center" },
        tabBarItemStyle: { paddingHorizontal: 2, alignItems: "center", justifyContent: "center" },
        tabBarIconStyle: { marginTop: 2 },
        tabBarStyle: { borderTopWidth: 0, elevation: 0 },
        tabBarBackground: () => (
          <BlurView intensity={92} tint={scheme === "dark" ? "dark" : "light"} style={StyleSheet.absoluteFill} />
        ),
        headerRight: () => <SettingsHeaderButton />,
      }}
    >
      <Tab.Screen
        name="TodayTab"
        component={TodayScreen}
        options={{ title: "Today", tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsListScreen}
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen
        name="InsightsTab"
        component={InsightsListScreen}
        options={{ title: "Insights", tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} /> }}
      />
      <Tab.Screen
        name="InboxTab"
        component={InboxStackNavigator}
        options={{ title: "Inbox", headerShown: false, tabBarIcon: ({ color, size }) => <Inbox color={color} size={size} /> }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStackNavigator}
        options={{ title: "Orders", headerShown: false, tabBarIcon: ({ color, size }) => <Package color={color} size={size} /> }}
      />
      <Tab.Screen
        name="QuotesTab"
        component={QuotesStackNavigator}
        options={{ title: "Quotes", headerShown: false, tabBarIcon: ({ color, size }) => <FileText color={color} size={size} /> }}
      />
      {canViewSecurity && (
        <Tab.Screen
          name="SecurityTab"
          component={SecurityGlanceScreen}
          options={{ title: "Security", tabBarIcon: ({ color, size }) => <ShieldAlert color={color} size={size} /> }}
        />
      )}
      {/* Settings has no tab bar button — reached via the header icon on every other tab — kept
          registered here so navigation.navigate("SettingsTab") still resolves. */}
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{ title: "Settings", headerRight: () => null, tabBarButton: () => null }}
      />
    </Tab.Navigator>
  );
}
