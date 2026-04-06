/**
 * Settings Screen
 * Comprehensive settings with export/import data, theme, models, etc.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

import { useTheme } from '../context/ThemeContext';
import { useChat } from '../context/ChatContext';
import { useModel, AVAILABLE_MODELS } from '../context/ModelContext';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../config/theme';
import { APP_INFO, API_CONFIG } from '../config/features';
import { Icon, Toggle, Badge } from '../components/common';

export default function SettingsScreen({ navigation }) {
  const { isDark, toggleTheme } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();
  const {
    deleteAllConversations,
    exportAllData,
    importAllData,
    conversations
  } = useChat();
  const {
    selectedModel,
    downloadedModels,
    selectModel,
    deleteModel,
    availableModels
  } = useModel();
  const { signOut } = useAuth();

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [streamResponse, setStreamResponse] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);

  // Export app data
  const handleExportData = async () => {
    try {
      setIsExporting(true);

      // Get all data
      const chatData = await exportAllData();

      // Create export object with all app data
      const exportData = {
        appName: APP_INFO.NAME,
        version: APP_INFO.VERSION,
        exportDate: new Date().toISOString(),
        data: {
          chats: chatData,
          settings: {
            theme: isDark ? 'dark' : 'light',
            streamResponse,
            hapticFeedback,
            saveHistory,
          },
          selectedModelId: selectedModel?.id,
        },
      };

      // Convert to JSON string
      const jsonString = JSON.stringify(exportData, null, 2);

      // Create file
      const fileName = `OfflineGPT_Backup_${new Date().toISOString().split('T')[0]}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, jsonString);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Export OfflineGPT Data',
          UTI: 'public.json',
        });
      } else {
        Alert.alert('Export Complete', `Data saved to: ${fileName}`);
      }

      setIsExporting(false);
    } catch (error) {
      console.log('Export error:', error);
      setIsExporting(false);
      Alert.alert('Export Failed', 'Could not export data. Please try again.');
    }
  };

  // Import app data
  const handleImportData = async () => {
    try {
      setIsImporting(true);

      // Pick a JSON file
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setIsImporting(false);
        return;
      }

      // Read the file
      const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const importData = JSON.parse(fileContent);

      // Validate the data
      if (!importData.appName || importData.appName !== APP_INFO.NAME) {
        throw new Error('Invalid backup file');
      }

      // Confirm import
      Alert.alert(
        'Import Data',
        'This will replace all your current data. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setIsImporting(false) },
          {
            text: 'Import',
            style: 'destructive',
            onPress: async () => {
              try {
                // Import chat data
                if (importData.data?.chats) {
                  await importAllData(importData.data.chats);
                }

                Alert.alert('Success', 'Data imported successfully!');
              } catch (err) {
                Alert.alert('Error', 'Failed to import data');
              }
              setIsImporting(false);
            },
          },
        ]
      );
    } catch (error) {
      console.log('Import error:', error);
      setIsImporting(false);
      Alert.alert('Import Failed', 'Could not import data. Make sure the file is a valid OfflineGPT backup.');
    }
  };

  // Clear all chats
  const handleClearChats = () => {
    Alert.alert(
      'Clear All Chats',
      'This will permanently delete all your conversations. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            deleteAllConversations();
            Alert.alert('Done', 'All chats have been deleted.');
          },
        },
      ]
    );
  };

  // Sign out
  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const SettingItem = ({ icon, iconColor, title, subtitle, onPress, rightComponent, showChevron = true }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Icon name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightComponent || (showChevron && onPress && (
        <Icon name="chevron-right" size={20} color={colors.textTertiary} />
      ))}
    </TouchableOpacity>
  );

  const Divider = () => <View style={[styles.divider, { backgroundColor: colors.border }]} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            APPEARANCE
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <SettingItem
              icon={isDark ? 'moon' : 'sun'}
              iconColor={COLORS.brand[500]}
              title="Dark Mode"
              subtitle="Switch between light and dark theme"
              showChevron={false}
              rightComponent={
                <Toggle value={isDark} onValueChange={toggleTheme} />
              }
            />
          </View>
        </Animated.View>

        {/* AI Model Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            AI MODEL
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <SettingItem
              icon="cpu"
              iconColor={COLORS.logoGradient.start}
              title="Manage Models"
              subtitle={`${downloadedModels?.length || 0} models downloaded`}
              onPress={() => navigation.navigate('ModelSelect')}
            />
          </View>
        </Animated.View>



        {/* Data & Storage Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            DATA & STORAGE
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <SettingItem
              icon="upload"
              iconColor={COLORS.success}
              title="Export Data"
              subtitle="Backup all your chats and settings"
              onPress={handleExportData}
              rightComponent={
                isExporting ? (
                  <ActivityIndicator size="small" color={COLORS.brand[500]} />
                ) : (
                  <Icon name="chevron-right" size={20} color={colors.textTertiary} />
                )
              }
            />
            <Divider />
            <SettingItem
              icon="download"
              iconColor={COLORS.info}
              title="Import Data"
              subtitle="Restore from a backup file"
              onPress={handleImportData}
              rightComponent={
                isImporting ? (
                  <ActivityIndicator size="small" color={COLORS.brand[500]} />
                ) : (
                  <Icon name="chevron-right" size={20} color={colors.textTertiary} />
                )
              }
            />
            <Divider />
            <SettingItem
              icon="trash-2"
              iconColor={COLORS.error}
              title="Clear All Chats"
              subtitle={`${conversations?.length || 0} conversations`}
              onPress={handleClearChats}
            />
          </View>
        </Animated.View>

        {/* API Settings Section */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            ONLINE FEATURES
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <SettingItem
              icon="cloud"
              iconColor={COLORS.tools.translator}
              title="Google Gemini API"
              subtitle="For online tools (optional)"
              onPress={() => {
                Alert.alert(
                  'Gemini API',
                  'The Gemini API is used for online features like Smart Notes, Email Templates, and Translator. Get your free API key from Google AI Studio.',
                  [{ text: 'OK' }]
                );
              }}
            />
          </View>
        </Animated.View>

        {/* Account Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            ACCOUNT
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <SettingItem
              icon="user"
              iconColor={COLORS.brand[500]}
              title="Profile"
              subtitle="Manage your account"
              onPress={() => navigation.navigate('Profile')}
            />
            <Divider />
            <SettingItem
              icon="log-out"
              iconColor={COLORS.error}
              title="Sign Out"
              subtitle="Sign out of your account"
              onPress={handleSignOut}
            />
          </View>
        </Animated.View>

        {/* About Section */}
        <Animated.View entering={FadeInDown.delay(350).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            ABOUT
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <SettingItem
              icon="info"
              iconColor={colors.textSecondary}
              title="About OfflineGPT"
              subtitle={`Version ${APP_INFO.VERSION}`}
              onPress={() => navigation.navigate('About')}
            />
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            OfflineGPT v{APP_INFO.VERSION}
          </Text>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            All data is stored locally on your device
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
    marginLeft: -SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xl,
    marginLeft: SPACING.xs,
  },
  card: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 70,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.xs,
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
  },
});
