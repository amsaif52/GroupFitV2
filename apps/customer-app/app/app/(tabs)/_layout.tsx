import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '@groupfit/shared/theme';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.grey,
        tabBarStyle: { backgroundColor: colors.primaryLight, borderTopColor: colors.borderLight },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon emoji="🏠" />,
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'My Sessions',
          tabBarIcon: ({ color }) => <TabIcon emoji="📅" />,
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: 'Activities',
          tabBarIcon: ({ color }) => <TabIcon emoji="💪" />,
        }}
      />
      <Tabs.Screen
        name="trainers"
        options={{
          title: 'My Trainers',
          tabBarIcon: ({ color }) => <TabIcon emoji="👤" />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <TabIcon emoji="⚙️" />,
        }}
      />
    </Tabs>
  );
}
