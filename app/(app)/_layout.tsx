import { Redirect, Tabs } from 'expo-router';
import { TabBar } from '@/components/layout/TabBar';
import { useAuth } from '@/hooks/useAuth';

export default function AppLayout() {
  const { isAuthenticated, isHydrated } = useAuth();

  if (isHydrated && !isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Kitchen',
        }}
      />
      <Tabs.Screen
        name="cook"
        options={{
          title: 'Cook',
        }}
      />
    </Tabs>
  );
}
