import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
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
import { theme } from '../theme';
import { Logo } from '../components/ui';
import { ResearchDetailHeader } from './ResearchDetailHeader';

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
        headerStyle: {
          backgroundColor: theme.colors.surface.base,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          ...theme.typography.h3,
          color: theme.colors.text.primary,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.surface.raised,
          borderTopColor: theme.colors.border.subtle,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingTop: theme.spacing.xs,
          paddingBottom: theme.spacing.sm,
          height: 66,
        },
        tabBarLabelStyle: {
          ...theme.typography.caption,
          marginTop: 2,
        },
        tabBarActiveTintColor: theme.colors.brand.primary,
        tabBarInactiveTintColor: theme.colors.text.muted,
        tabBarIcon: ({ color, size, focused }) => (
          <View style={styles.tabIconWrap}>
            <Ionicons
              name={tabIcons[route.name as keyof StudentTabsParamList]}
              color={color}
              size={size}
            />
            {focused ? <View style={styles.activeDot} /> : null}
          </View>
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
  <View style={styles.loaderContainer}>
    <Logo size="sm" showWordmark={false} />
    <ActivityIndicator size="large" color={theme.colors.brand.primary} />
    <Text style={styles.loaderText}>Restoring session...</Text>
  </View>
);

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface.base },
          headerShadowVisible: false,
          headerTintColor: theme.colors.brand.primary,
          headerTitleStyle: {
            ...theme.typography.h3,
            color: theme.colors.text.primary,
          },
          headerTitleAlign: 'left',
        }}
      >
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
              options={{
                title: 'Research Detail',
                header: (props) => <ResearchDetailHeader {...props} />,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.brand.accent,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface.base,
  },
  loaderText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
});
