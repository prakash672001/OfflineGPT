/**
 * Day Planner Screen
 * Task management with statistics and different time views
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
import Animated, { FadeInDown, FadeIn, Layout } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../config/theme';
import { Icon } from '../../components/common';

const TASKS_STORAGE_KEY = '@day_planner_tasks';

const VIEW_MODES = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
};

const PRIORITIES = {
  high: { label: 'High', color: COLORS.error },
  medium: { label: 'Medium', color: COLORS.warning },
  low: { label: 'Low', color: COLORS.success },
};

export default function DayPlannerScreen({ navigation }) {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();

  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [showAddTask, setShowAddTask] = useState(false);
  const [viewMode, setViewMode] = useState(VIEW_MODES.DAY);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (stored) {
        setTasks(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const saveTasks = async (updatedTasks) => {
    try {
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      priority: newTaskPriority,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: selectedDate.toISOString(),
    };

    const updatedTasks = [newTask, ...tasks];
    await saveTasks(updatedTasks);
    setNewTaskText('');
    setShowAddTask(false);
  };

  const handleToggleTask = async (taskId) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    await saveTasks(updatedTasks);
  };

  const handleDeleteTask = (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedTasks = tasks.filter(t => t.id !== taskId);
            await saveTasks(updatedTasks);
          },
        },
      ]
    );
  };

  // Filter tasks based on view mode
  const getFilteredTasks = () => {
    const now = new Date();
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    switch (viewMode) {
      case VIEW_MODES.DAY:
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);
        return tasks.filter(task => {
          const taskDate = new Date(task.dueDate || task.createdAt);
          return taskDate >= startOfDay && taskDate < endOfDay;
        });

      case VIEW_MODES.WEEK:
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        return tasks.filter(task => {
          const taskDate = new Date(task.dueDate || task.createdAt);
          return taskDate >= startOfWeek && taskDate < endOfWeek;
        });

      case VIEW_MODES.MONTH:
        const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
        return tasks.filter(task => {
          const taskDate = new Date(task.dueDate || task.createdAt);
          return taskDate >= startOfMonth && taskDate < endOfMonth;
        });

      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();
  const completedTasks = filteredTasks.filter(t => t.completed);
  const pendingTasks = filteredTasks.filter(t => !t.completed);
  const completionRate = filteredTasks.length > 0
    ? Math.round((completedTasks.length / filteredTasks.length) * 100)
    : 0;

  const getViewModeLabel = () => {
    switch (viewMode) {
      case VIEW_MODES.DAY:
        return selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      case VIEW_MODES.WEEK:
        return `Week of ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case VIEW_MODES.MONTH:
        return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      default:
        return '';
    }
  };

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    switch (viewMode) {
      case VIEW_MODES.DAY:
        newDate.setDate(newDate.getDate() + direction);
        break;
      case VIEW_MODES.WEEK:
        newDate.setDate(newDate.getDate() + (direction * 7));
        break;
      case VIEW_MODES.MONTH:
        newDate.setMonth(newDate.getMonth() + direction);
        break;
    }
    setSelectedDate(newDate);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Day Planner</Text>
        <TouchableOpacity
          onPress={() => setShowAddTask(true)}
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
        {/* View Mode Selector */}
        <View style={[styles.viewModeContainer, { backgroundColor: colors.surface }]}>
          {Object.values(VIEW_MODES).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.viewModeButton,
                viewMode === mode && { backgroundColor: COLORS.brand[500] },
              ]}
              onPress={() => setViewMode(mode)}
            >
              <Text
                style={[
                  styles.viewModeText,
                  { color: viewMode === mode ? '#fff' : colors.textSecondary },
                ]}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Navigator */}
        <View style={styles.dateNavigator}>
          <TouchableOpacity onPress={() => navigateDate(-1)} style={styles.navButton}>
            <Icon name="chevron-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.dateLabel, { color: colors.text }]}>
            {getViewModeLabel()}
          </Text>
          <TouchableOpacity onPress={() => navigateDate(1)} style={styles.navButton}>
            <Icon name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.brand[500] }]}>
                {filteredTasks.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.success }]}>
                {completedTasks.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Done
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.warning }]}>
                {pendingTasks.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Pending
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {completionRate}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Progress
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Progress Bar */}
        <View style={[styles.progressContainer, { backgroundColor: colors.surfaceSecondary }]}>
          <Animated.View
            style={[
              styles.progressBar,
              { width: `${completionRate}%`, backgroundColor: COLORS.success },
            ]}
          />
        </View>

        {/* Add Task Form */}
        {showAddTask && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[styles.addTaskForm, { backgroundColor: colors.surface }]}
          >
            <TextInput
              value={newTaskText}
              onChangeText={setNewTaskText}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.textTertiary}
              style={[styles.taskInput, { color: colors.text }]}
              autoFocus
            />
            <View style={styles.prioritySelector}>
              {Object.entries(PRIORITIES).map(([key, { label, color }]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.priorityButton,
                    { borderColor: color },
                    newTaskPriority === key && { backgroundColor: color },
                  ]}
                  onPress={() => setNewTaskPriority(key)}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      { color: newTaskPriority === key ? '#fff' : color },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.addTaskActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => setShowAddTask(false)}
              >
                <Text style={[styles.actionButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: COLORS.brand[500] }]}
                onPress={handleAddTask}
              >
                <Text style={[styles.actionButtonText, { color: '#fff' }]}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Tasks List */}
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
          TASKS
        </Text>

        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="calendar" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No tasks for this period
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Add a task to get started
            </Text>
          </View>
        ) : (
          <>
            {/* Pending Tasks */}
            {pendingTasks.map((task, index) => (
              <Animated.View
                key={task.id}
                entering={FadeInDown.delay(index * 30).duration(300)}
                layout={Layout.springify()}
              >
                <TouchableOpacity
                  style={[styles.taskCard, { backgroundColor: colors.surface }]}
                  onPress={() => handleToggleTask(task.id)}
                  onLongPress={() => handleDeleteTask(task.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      { borderColor: PRIORITIES[task.priority]?.color || colors.border },
                    ]}
                  />
                  <View style={styles.taskContent}>
                    <Text style={[styles.taskText, { color: colors.text }]}>
                      {task.text}
                    </Text>
                    <View style={styles.taskMeta}>
                      <View
                        style={[
                          styles.priorityBadge,
                          { backgroundColor: `${PRIORITIES[task.priority]?.color}15` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityBadgeText,
                            { color: PRIORITIES[task.priority]?.color },
                          ]}
                        >
                          {PRIORITIES[task.priority]?.label}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary, marginTop: SPACING.lg }]}>
                  COMPLETED
                </Text>
                {completedTasks.map((task, index) => (
                  <Animated.View
                    key={task.id}
                    entering={FadeInDown.delay(index * 30).duration(300)}
                    layout={Layout.springify()}
                  >
                    <TouchableOpacity
                      style={[styles.taskCard, { backgroundColor: colors.surface, opacity: 0.7 }]}
                      onPress={() => handleToggleTask(task.id)}
                      onLongPress={() => handleDeleteTask(task.id)}
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
                      <View style={styles.taskContent}>
                        <Text
                          style={[
                            styles.taskText,
                            styles.taskTextCompleted,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {task.text}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </>
            )}
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
  // View Mode
  viewModeContainer: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  viewModeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  // Date Navigator
  dateNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: SPACING.lg,
  },
  navButton: {
    padding: SPACING.sm,
  },
  dateLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  // Statistics
  statsContainer: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    marginVertical: SPACING.sm,
  },
  // Progress Bar
  progressContainer: {
    height: 6,
    borderRadius: 3,
    marginVertical: SPACING.lg,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  // Add Task Form
  addTaskForm: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  taskInput: {
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.md,
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  addTaskActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  // Section
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  // Task Card
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
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
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  priorityBadgeText: {
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
