/**
 * Fitness Tracker Screen
 * Track workouts, calories, steps, and other health metrics
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../config/theme';
import { Icon } from '../../components/common';

const FITNESS_STORAGE_KEY = '@fitness_tracker';

const ACTIVITY_TYPES = [
  { id: 'workout', name: 'Workout', icon: 'activity', color: COLORS.error, unit: 'min' },
  { id: 'steps', name: 'Steps', icon: 'navigation', color: COLORS.success, unit: 'steps' },
  { id: 'calories', name: 'Calories', icon: 'zap', color: COLORS.warning, unit: 'kcal' },
  { id: 'water', name: 'Water', icon: 'droplet', color: COLORS.info, unit: 'glasses' },
  { id: 'sleep', name: 'Sleep', icon: 'moon', color: '#9333EA', unit: 'hours' },
  { id: 'weight', name: 'Weight', icon: 'trending-down', color: '#EC4899', unit: 'kg' },
];

const GOALS = {
  workout: 30,
  steps: 10000,
  calories: 2000,
  water: 8,
  sleep: 8,
};

export default function FitnessTrackerScreen({ navigation }) {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();

  const [entries, setEntries] = useState([]);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [selectedType, setSelectedType] = useState('workout');
  const [newValue, setNewValue] = useState('');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const stored = await AsyncStorage.getItem(FITNESS_STORAGE_KEY);
      if (stored) {
        setEntries(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load fitness entries:', error);
    }
  };

  const saveEntries = async (updatedEntries) => {
    try {
      await AsyncStorage.setItem(FITNESS_STORAGE_KEY, JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
    } catch (error) {
      console.error('Failed to save fitness entries:', error);
    }
  };

  const handleAddEntry = async () => {
    const value = parseFloat(newValue);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Invalid Value', 'Please enter a valid number');
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      type: selectedType,
      value,
      notes: newNotes.trim(),
      date: new Date().toISOString(),
    };

    const updatedEntries = [newEntry, ...entries];
    await saveEntries(updatedEntries);
    setNewValue('');
    setNewNotes('');
    setShowAddEntry(false);
  };

  const handleDeleteEntry = (entryId) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedEntries = entries.filter(e => e.id !== entryId);
            await saveEntries(updatedEntries);
          },
        },
      ]
    );
  };

  // Get today's stats
  const getTodayStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEntries = entries.filter(e => new Date(e.date) >= today);

    return ACTIVITY_TYPES.map(type => {
      const typeEntries = todayEntries.filter(e => e.type === type.id);
      const total = typeEntries.reduce((sum, e) => sum + e.value, 0);
      const goal = GOALS[type.id];
      const progress = goal ? Math.min((total / goal) * 100, 100) : 0;
      return { ...type, total, goal, progress };
    });
  };

  const todayStats = getTodayStats();

  // Get weekly stats for chart
  const getWeeklyStats = (type) => {
    const stats = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayEntries = entries.filter(e =>
        e.type === type &&
        new Date(e.date) >= date &&
        new Date(e.date) < nextDate
      );

      const total = dayEntries.reduce((sum, e) => sum + e.value, 0);
      stats.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: total,
      });
    }

    return stats;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const selectedTypeInfo = ACTIVITY_TYPES.find(t => t.id === selectedType);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Fitness Tracker</Text>
        <TouchableOpacity
          onPress={() => setShowAddEntry(true)}
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
        {/* Today's Progress */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            TODAY'S PROGRESS
          </Text>
          <View style={[styles.progressGrid]}>
            {todayStats.map((stat, index) => (
              <TouchableOpacity
                key={stat.id}
                style={[styles.progressCard, { backgroundColor: colors.surface }]}
                onPress={() => {
                  setSelectedType(stat.id);
                  setShowAddEntry(true);
                }}
              >
                <View style={[styles.progressIcon, { backgroundColor: `${stat.color}15` }]}>
                  <Icon name={stat.icon} size={20} color={stat.color} />
                </View>
                <Text style={[styles.progressValue, { color: colors.text }]}>
                  {stat.total.toLocaleString()}
                </Text>
                <Text style={[styles.progressUnit, { color: colors.textSecondary }]}>
                  {stat.unit}
                </Text>
                {stat.goal && (
                  <View style={[styles.progressBarContainer, { backgroundColor: colors.surfaceSecondary }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${stat.progress}%`, backgroundColor: stat.color },
                      ]}
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Add Entry Form */}
        {showAddEntry && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[styles.addForm, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.formTitle, { color: colors.text }]}>Log Activity</Text>

            {/* Activity Type Selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.typeScroll}
              contentContainerStyle={styles.typeContent}
            >
              {ACTIVITY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeChip,
                    { borderColor: type.color },
                    selectedType === type.id && { backgroundColor: type.color },
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <Icon
                    name={type.icon}
                    size={16}
                    color={selectedType === type.id ? '#fff' : type.color}
                  />
                  <Text
                    style={[
                      styles.typeChipText,
                      { color: selectedType === type.id ? '#fff' : type.color },
                    ]}
                  >
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Value Input */}
            <View style={styles.valueInputContainer}>
              <TextInput
                value={newValue}
                onChangeText={setNewValue}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                style={[styles.valueInput, { color: colors.text }]}
                keyboardType="decimal-pad"
              />
              <Text style={[styles.valueUnit, { color: colors.textSecondary }]}>
                {selectedTypeInfo?.unit}
              </Text>
            </View>

            {/* Notes Input */}
            <TextInput
              value={newNotes}
              onChangeText={setNewNotes}
              placeholder="Notes (optional)"
              placeholderTextColor={colors.textTertiary}
              style={[styles.notesInput, { color: colors.text, backgroundColor: colors.surfaceSecondary }]}
            />

            {/* Actions */}
            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.formButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => setShowAddEntry(false)}
              >
                <Text style={[styles.formButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formButton, { backgroundColor: selectedTypeInfo?.color || COLORS.brand[500] }]}
                onPress={handleAddEntry}
              >
                <Text style={[styles.formButtonText, { color: '#fff' }]}>Log</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Weekly Chart Preview */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            WEEKLY OVERVIEW
          </Text>
          <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Steps</Text>
              <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
                Last 7 days
              </Text>
            </View>
            <View style={styles.chartBars}>
              {getWeeklyStats('steps').map((day, index) => {
                const maxValue = Math.max(...getWeeklyStats('steps').map(d => d.value), 1);
                const height = (day.value / maxValue) * 80;
                return (
                  <View key={index} style={styles.chartBarContainer}>
                    <View
                      style={[
                        styles.chartBar,
                        { height: Math.max(height, 4), backgroundColor: COLORS.success },
                      ]}
                    />
                    <Text style={[styles.chartBarLabel, { color: colors.textSecondary }]}>
                      {day.day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* Recent Activity */}
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
          RECENT ACTIVITY
        </Text>

        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="activity" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No activity logged
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Start tracking your fitness journey
            </Text>
          </View>
        ) : (
          entries.slice(0, 20).map((entry, index) => {
            const type = ACTIVITY_TYPES.find(t => t.id === entry.type) || ACTIVITY_TYPES[0];
            return (
              <Animated.View
                key={entry.id}
                entering={FadeInDown.delay(150 + index * 30).duration(300)}
              >
                <TouchableOpacity
                  style={[styles.activityCard, { backgroundColor: colors.surface }]}
                  onLongPress={() => handleDeleteEntry(entry.id)}
                >
                  <View style={[styles.activityIcon, { backgroundColor: `${type.color}15` }]}>
                    <Icon name={type.icon} size={18} color={type.color} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={[styles.activityType, { color: colors.text }]}>
                      {type.name}
                    </Text>
                    {entry.notes && (
                      <Text style={[styles.activityNotes, { color: colors.textSecondary }]} numberOfLines={1}>
                        {entry.notes}
                      </Text>
                    )}
                  </View>
                  <View style={styles.activityValue}>
                    <Text style={[styles.activityValueText, { color: type.color }]}>
                      {entry.value.toLocaleString()}
                    </Text>
                    <Text style={[styles.activityValueUnit, { color: colors.textSecondary }]}>
                      {type.unit}
                    </Text>
                  </View>
                  <Text style={[styles.activityTime, { color: colors.textTertiary }]}>
                    {formatDate(entry.date)}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })
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
  // Section
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  // Progress Grid
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  progressCard: {
    width: '47%',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  progressIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  progressValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  progressUnit: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginTop: SPACING.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  // Add Form
  addForm: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
  },
  formTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  typeScroll: {
    marginBottom: SPACING.lg,
  },
  typeContent: {
    gap: SPACING.sm,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  typeChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  valueInputContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  valueInput: {
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'center',
    minWidth: 80,
  },
  valueUnit: {
    fontSize: FONT_SIZES.lg,
    marginLeft: SPACING.sm,
  },
  notesInput: {
    fontSize: FONT_SIZES.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
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
  // Chart
  chartCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  chartTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  chartSubtitle: {
    fontSize: FONT_SIZES.xs,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 20,
    borderRadius: 10,
    marginBottom: SPACING.xs,
  },
  chartBarLabel: {
    fontSize: FONT_SIZES.xs,
  },
  // Activity List
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityType: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  activityNotes: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  activityValue: {
    alignItems: 'flex-end',
    marginRight: SPACING.sm,
  },
  activityValueText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  activityValueUnit: {
    fontSize: FONT_SIZES.xs,
  },
  activityTime: {
    fontSize: FONT_SIZES.xs,
    minWidth: 50,
    textAlign: 'right',
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
