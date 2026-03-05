import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '@groupfit/shared/theme';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function TrainerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.grey,
        tabBarStyle: { backgroundColor: colors.primaryDark, borderTopColor: colors.borderLight },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => <TabIcon emoji="🏠" />,
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'My Sessions',
          tabBarIcon: () => <TabIcon emoji="📅" />,
        }}
      />
      <Tabs.Screen
        name="refer"
        options={{
          title: 'Refer',
          tabBarIcon: () => <TabIcon emoji="🔗" />,
        }}
      />
      <Tabs.Screen
        name="earning"
        options={{
          title: 'My Earnings',
          tabBarIcon: () => <TabIcon emoji="💰" />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Profile',
          tabBarIcon: () => <TabIcon emoji="⚙️" />,
        }}
      />
    </Tabs>
  );
}
