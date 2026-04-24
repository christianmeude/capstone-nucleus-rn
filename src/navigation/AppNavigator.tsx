import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList, StudentTabsParamList } from './types';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { UnsupportedRoleScreen } from '../screens/auth/UnsupportedRoleScreen';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { MyPapersScreen } from '../screens/main/MyPapersScreen';
import { BrowseScreen } from '../screens/main/BrowseScreen';
import { NotificationsScreen } from '../screens/main/NotificationsScreen';
import { InvitationsScreen } from '../screens/main/InvitationsScreen';
import { ResearchDetailScreen } from '../screens/main/ResearchDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<StudentTabsParamList>();

const tabIcons: Record<keyof StudentTabsParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'speedometer-outline',
  MyPapers: 'folder-open-outline',
  Browse: 'search-outline',
  Notifications: 'notifications-outline',
  Invitations: 'people-outline',
};

const StudentTabs = () => {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: 'left',
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={tabIcons[route.name as keyof StudentTabsParamList]}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tabs.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tabs.Screen
        name="MyPapers"
        component={MyPapersScreen}
        options={{ title: 'My Papers' }}
      />
      <Tabs.Screen name="Browse" component={BrowseScreen} options={{ title: 'Browse' }} />
      <Tabs.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Tabs.Screen
        name="Invitations"
        component={InvitationsScreen}
        options={{ title: 'Invites' }}
      />
    </Tabs.Navigator>
  );
};

const FullScreenLoader = () => (
  <View
    style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      backgroundColor: '#f8fafc',
    }}
  >
    <ActivityIndicator size="large" color="#1c4d8d" />
    <Text style={{ color: '#334155', fontSize: 15 }}>Restoring session...</Text>
  </View>
);

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : user.role !== 'student' ? (
          <Stack.Screen
            name="UnsupportedRole"
            component={UnsupportedRoleScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="StudentTabs"
              component={StudentTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ResearchDetail"
              component={ResearchDetailScreen}
              options={{ title: 'Research Detail' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
