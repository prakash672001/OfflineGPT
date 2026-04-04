/**
 * Reminders Screen
 * Manage reminders with push notifications
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../config/theme';
import { Icon } from '../../components/common';

const REMINDERS_STORAGE_KEY = '@reminders';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const QUICK_TIMES = [
  { label: '5 min', minutes: 5 },
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: 'Tomorrow', minutes: 1440 },
];

export default function RemindersScreen({ navigation }) {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();

  const [reminders, setReminders] = useState([]);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminderText, setNewReminderText] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    loadReminders();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const loadReminders = async () => {
    try {
      const stored = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out past reminders that are completed
        const now = new Date();
        const activeReminders = parsed.filter(r => {
          if (r.completed) return true;
          if (r.datetime) {
            return new Date(r.datetime) > now || !r.completed;
          }
          return true;
        });
        setReminders(activeReminders);
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  };

  const saveReminders = async (updatedReminders) => {
    try {
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updatedReminders));
      setReminders(updatedReminders);
    } catch (error) {
      console.error('Failed to save reminders:', error);
    }
  };

  const scheduleNotification = async (reminder) => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please enable notifications in settings');
      return null;
    }

    try {
      const trigger = new Date(reminder.datetime);
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Reminder',
          body: reminder.text,
          sound: true,
        },
        trigger,
      });
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  };

  const cancelNotification = async (notificationId) => {
    if (notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      } catch (error) {
        console.error('Failed to cancel notification:', error);
      }
    }
  };

  const handleAddReminder = async () => {
    if (!newReminderText.trim()) {
      Alert.alert('Missing Text', 'Please enter a reminder');
      return;
    }

    if (!selectedTime) {
      Alert.alert('Missing Time', 'Please select when to remind you');
      return;
    }

    const datetime = new Date();
    datetime.setMinutes(datetime.getMinutes() + selectedTime.minutes);

    const newReminder = {
      id: Date.now().toString(),
      text: newReminderText.trim(),
      datetime: datetime.toISOString(),
      completed: false,
      createdAt: new Date().toISOString(),
      notificationId: null,
    };

    // Schedule notification
    const notificationId = await scheduleNotification(newReminder);
    newReminder.notificationId = notificationId;

    const updatedReminders = [newReminder, ...reminders];
    await saveReminders(updatedReminders);

    setNewReminderText('');
    setSelectedTime(null);
    setShowAddReminder(false);

    Alert.alert('Reminder Set', `You'll be reminded in ${selectedTime.label}`);
  };

  const handleToggleReminder = async (reminderId) => {
    const updatedReminders = reminders.map(reminder => {
      if (reminder.id === reminderId) {
        if (!reminder.completed && reminder.notificationId) {
          cancelNotification(reminder.notificationId);
        }
        return { ...reminder, completed: !reminder.completed, notificationId: null };
      }
      return reminder;
    });
    await saveReminders(updatedReminders);
  };

  const handleDeleteReminder = (reminderId) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const reminder = reminders.find(r => r.id === reminderId);
            if (reminder?.notificationId) {
              await cancelNotification(reminder.notificationId);
            }
            const updatedReminders = reminders.filter(r => r.id !== reminderId);
            await saveReminders(updatedReminders);
          },
        },
      ]
    );
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    if (date.toDateString() === now.toDateString()) {
      return `Today at ${timeStr}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${timeStr}`;
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ` at ${timeStr}`;
    }
  };

  const getTimeRemaining = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date - now;

    if (diff < 0) return 'Overdue';

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const pendingReminders = reminders.filter(r => !r.completed);
  const completedReminders = reminders.filter(r => r.completed);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Reminders</Text>
        <TouchableOpacity
          onPress={() => setShowAddReminder(true)}
          style={[styles.addButton, { backgroundColor: COLORS.brand[500] }]}
        >
          <Icon name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Permission Warning */}
        {!hasPermission && (
          <View style={[styles.warningCard, { backgroundColor: `${COLORS.warning}15` }]}>
            <Icon name="alert-triangle" size={20} color={COLORS.warning} />
            <View style={styles.warningContent}>
              <Text style={[styles.warningTitle, { color: COLORS.warning }]}>
                Notifications Disabled
              </Text>
              <Text style={[styles.warningText, { color: colors.textSecondary }]}>
                Enable notifications to receive reminder alerts
              </Text>
            </View>
            <TouchableOpacity onPress={requestPermissions}>
              <Text style={[styles.enableButton, { color: COLORS.warning }]}>Enable</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Add Reminder Form */}
        {showAddReminder && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[styles.addForm, { backgroundColor: colors.surface }]}
          >
            <TextInput
              value={newReminderText}
              onChangeText={setNewReminderText}
              placeholder="What do you want to be reminded about?"
              placeholderTextColor={colors.textTertiary}
              style={[styles.reminderInput, { color: colors.text }]}
              multiline
              autoFocus
            />

            <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
              Remind me in:
            </Text>
            <View style={styles.quickTimes}>
              {QUICK_TIMES.map((time) => (
                <TouchableOpacity
                  key={time.label}
                  style={[
                    styles.timeChip,
                    { backgroundColor: colors.surfaceSecondary },
                    selectedTime?.label === time.label && { backgroundColor: COLORS.brand[500] },
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      { color: selectedTime?.label === time.label ? '#fff' : colors.text },
                    ]}
                  >
                    {time.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.formButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => {
                  setShowAddReminder(false);
                  setNewReminderText('');
                  setSelectedTime(null);
                }}
              >
                <Text style={[styles.formButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formButton, { backgroundColor: COLORS.brand[500] }]}
                onPress={handleAddReminder}
              >
                <Text style={[styles.formButtonText, { color: '#fff' }]}>Set Reminder</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Pending Reminders */}
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
          UPCOMING ({pendingReminders.length})
        </Text>

        {pendingReminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="bell" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No reminders
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Tap + to add a new reminder
            </Text>
          </View>
        ) : (
          pendingReminders.map((reminder, index) => {
            const isPast = new Date(reminder.datetime) < new Date();
            return (
              <Animated.View
                key={reminder.id}
                entering={FadeInDown.delay(index * 30).duration(300)}
                layout={Layout.springify()}
              >
                <TouchableOpacity
                  style={[
                    styles.reminderCard,
                    { backgroundColor: colors.surface },
                    isPast && { borderLeftColor: COLORS.error, borderLeftWidth: 3 },
                  ]}
                  onPress={() => handleToggleReminder(reminder.id)}
                  onLongPress={() => handleDeleteReminder(reminder.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      { borderColor: isPast ? COLORS.error : COLORS.brand[500] },
                    ]}
                  />
                  <View style={styles.reminderContent}>
                    <Text style={[styles.reminderText, { color: colors.text }]}>
                      {reminder.text}
                    </Text>
                    <View style={styles.reminderMeta}>
                      <Icon name="clock" size={12} color={isPast ? COLORS.error : colors.textSecondary} />
                      <Text
                        style={[
                          styles.reminderTime,
                          { color: isPast ? COLORS.error : colors.textSecondary },
                        ]}
                      >
                        {formatDateTime(reminder.datetime)}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.timeBadge, { backgroundColor: isPast ? `${COLORS.error}15` : `${COLORS.brand[500]}15` }]}>
                    <Text style={[styles.timeBadgeText, { color: isPast ? COLORS.error : COLORS.brand[500] }]}>
                      {getTimeRemaining(reminder.datetime)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })
        )}

        {/* Completed Reminders */}
        {completedReminders.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary, marginTop: SPACING.xl }]}>
              COMPLETED ({completedReminders.length})
            </Text>
            {completedReminders.slice(0, 10).map((reminder, index) => (
              <Animated.View
                key={reminder.id}
                entering={FadeInDown.delay(index * 30).duration(300)}
                layout={Layout.springify()}
              >
                <TouchableOpacity
                  style={[styles.reminderCard, { backgroundColor: colors.surface, opacity: 0.6 }]}
                  onPress={() => handleToggleReminder(reminder.id)}
                  onLongPress={() => handleDeleteReminder(reminder.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      styles.checkboxCompleted,
                      { backgroundColor: COLORS.success, borderColor: COLORS.success },
                    ]}
                  >
                    <Icon name="check" size={12} color="#fff" />
                  </View>
                  <View style={styles.reminderContent}>
                    <Text
                      style={[
                        styles.reminderText,
                        styles.reminderTextCompleted,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {reminder.text}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </>
        )}
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
  addButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  // Warning
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  warningText: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  enableButton: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  // Add Form
  addForm: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  reminderInput: {
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.md,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  formLabel: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
  },
  quickTimes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  timeChip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  timeChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  formActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  formButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  formButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  // Section
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  // Reminder Card
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    marginRight: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    borderWidth: 0,
  },
  reminderContent: {
    flex: 1,
  },
  reminderText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  reminderTextCompleted: {
    textDecorationLine: 'line-through',
  },
  reminderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  reminderTime: {
    fontSize: FONT_SIZES.xs,
  },
  timeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  timeBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.sm,
  },
});
