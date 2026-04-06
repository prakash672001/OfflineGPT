import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '../context/AuthContext';
import { useModel } from '../context/ModelContext';
import { useTheme } from '../context/ThemeContext';

// Onboarding & Auth Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import ModelSelectScreen from '../screens/ModelSelectScreen';

// Main Screens
import ChatScreen from '../screens/ChatScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import DownloadModelsScreen from '../screens/DownloadModelsScreen';
import AboutScreen from '../screens/AboutScreen';
import ToolsHubScreen from '../screens/ToolsHubScreen';

// Tools Screens
import {
  SmartNotesScreen,
  DayPlannerScreen,
  MoneyTrackerScreen,
  FitnessTrackerScreen,
  EmailTemplatesScreen,
  RemindersScreen,
  TranslatorScreen,
} from '../screens/tools';

// Components
import CustomDrawer from '../components/CustomDrawer';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const ONBOARDING_COMPLETE_KEY = '@onboarding_complete';

function MainDrawer() {
  const { theme } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          backgroundColor: theme.background,
          width: 300,
        },
        overlayColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <Drawer.Screen name="Chat" component={ChatScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Subscription" component={SubscriptionScreen} />
      <Drawer.Screen name="About" component={AboutScreen} />
      <Drawer.Screen name="ModelSelect" component={ModelSelectScreen} />
    </Drawer.Navigator>
  );
}

function MainStack() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="MainDrawer" component={MainDrawer} />

      {/* Tools Screens */}
      <Stack.Screen name="ToolsHub" component={ToolsHubScreen} />
      <Stack.Screen name="SmartNotes" component={SmartNotesScreen} />
      <Stack.Screen name="DayPlanner" component={DayPlannerScreen} />
      <Stack.Screen name="MoneyTracker" component={MoneyTrackerScreen} />
      <Stack.Screen name="FitnessTracker" component={FitnessTrackerScreen} />
      <Stack.Screen name="EmailTemplates" component={EmailTemplatesScreen} />
      <Stack.Screen name="Reminders" component={RemindersScreen} />
      <Stack.Screen name="Translator" component={TranslatorScreen} />
      <Stack.Screen name="DownloadModels" component={DownloadModelsScreen} />
    </Stack.Navigator>
  );
}

function ModelSetupStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="ModelSelect" component={ModelSelectScreen} />
      <Stack.Screen name="DownloadModels" component={DownloadModelsScreen} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  const { theme } = useTheme();
  const [showOnboarding, setShowOnboarding] = useState(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      setShowOnboarding(completed !== 'true');
    } catch (error) {
      setShowOnboarding(false);
    }
  };

  if (showOnboarding === null) {
    return null; // Loading
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      {showOnboarding && (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      )}
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading, hasSeenSubscription } = useAuth();
  const { selectedModel, downloadedModels } = useModel();
  const { theme } = useTheme();

  if (isLoading) {
    return null; // Or a loading screen
  }

  const needsModelSetup = !selectedModel || downloadedModels.length === 0;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : !hasSeenSubscription ? (
        <Stack.Screen name="SubscriptionSetup" component={SubscriptionScreen} />
      ) : needsModelSetup ? (
        <Stack.Screen name="ModelSetup" component={ModelSetupStack} />
      ) : (
        <Stack.Screen name="Main" component={MainStack} />
      )}
    </Stack.Navigator>
  );
}
