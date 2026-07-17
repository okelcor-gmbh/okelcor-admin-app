import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Bell, Sparkles, Inbox, Package, FileText, ShieldAlert, Settings } from "lucide-react-native";
import type { MainTabParamList, InboxStackParamList, OrdersStackParamList } from "./types";
import { useAuth } from "../context/auth-context";
import { usePushRegistration } from "../hooks/usePushRegistration";
import { useUnreadNotificationsCount } from "../hooks/useUnreadNotificationsCount";

import NotificationsListScreen from "../screens/notifications/NotificationsListScreen";
import InsightsListScreen from "../screens/insights/InsightsListScreen";
import InboxListScreen from "../screens/inbox/InboxListScreen";
import ThreadDetailScreen from "../screens/inbox/ThreadDetailScreen";
import OrdersListScreen from "../screens/orders/OrdersListScreen";
import OrderDetailScreen from "../screens/orders/OrderDetailScreen";
import QuotesListScreen from "../screens/quotes/QuotesListScreen";
import SecurityGlanceScreen from "../screens/security/SecurityGlanceScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();
const InboxStack = createNativeStackNavigator<InboxStackParamList>();
const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();

function InboxStackNavigator() {
  return (
    <InboxStack.Navigator>
      <InboxStack.Screen name="InboxList" component={InboxListScreen} options={{ title: "Inbox" }} />
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
      <OrdersStack.Screen name="OrdersList" component={OrdersListScreen} options={{ title: "Orders" }} />
      <OrdersStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Order" }} />
    </OrdersStack.Navigator>
  );
}

export default function MainTabs() {
  const { user } = useAuth();
  const canViewSecurity = user?.permissions.includes("security.view") ?? false;
  const unreadCount = useUnreadNotificationsCount();
  usePushRegistration(true);

  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: "#E85C1A" }}>
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
        component={QuotesListScreen}
        options={{ title: "Quotes", tabBarIcon: ({ color, size }) => <FileText color={color} size={size} /> }}
      />
      {canViewSecurity && (
        <Tab.Screen
          name="SecurityTab"
          component={SecurityGlanceScreen}
          options={{ title: "Security", tabBarIcon: ({ color, size }) => <ShieldAlert color={color} size={size} /> }}
        />
      )}
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{ title: "Settings", tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}
