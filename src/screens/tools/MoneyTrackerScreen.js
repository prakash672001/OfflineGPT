/**
 * Money Tracker Screen
 * Expense tracking with dashboard, filters, and CSV export
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
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../config/theme';
import { Icon } from '../../components/common';

const EXPENSES_STORAGE_KEY = '@money_tracker_expenses';

const CATEGORIES = [
  { id: 'food', name: 'Food & Dining', icon: 'coffee', color: COLORS.warning },
  { id: 'transport', name: 'Transport', icon: 'truck', color: COLORS.info },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-bag', color: COLORS.brand[500] },
  { id: 'bills', name: 'Bills & Utilities', icon: 'file-text', color: COLORS.error },
  { id: 'entertainment', name: 'Entertainment', icon: 'music', color: '#9333EA' },
  { id: 'health', name: 'Health', icon: 'heart', color: '#EC4899' },
  { id: 'education', name: 'Education', icon: 'book', color: '#14B8A6' },
  { id: 'other', name: 'Other', icon: 'more-horizontal', color: '#6B7280' },
];

const TIME_FILTERS = ['Today', 'Week', 'Month', 'Year', 'All'];

export default function MoneyTrackerScreen({ navigation }) {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();

  const [expenses, setExpenses] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [timeFilter, setTimeFilter] = useState('Month');
  const [categoryFilter, setCategoryFilter] = useState(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const stored = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);
      if (stored) {
        setExpenses(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load expenses:', error);
    }
  };

  const saveExpenses = async (updatedExpenses) => {
    try {
      await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updatedExpenses));
      setExpenses(updatedExpenses);
    } catch (error) {
      console.error('Failed to save expenses:', error);
    }
  };

  const handleAddExpense = async () => {
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      amount,
      description: newDescription.trim() || 'Expense',
      category: selectedCategory,
      date: new Date().toISOString(),
    };

    const updatedExpenses = [newExpense, ...expenses];
    await saveExpenses(updatedExpenses);
    setNewAmount('');
    setNewDescription('');
    setSelectedCategory('other');
    setShowAddExpense(false);
  };

  const handleDeleteExpense = (expenseId) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedExpenses = expenses.filter(e => e.id !== expenseId);
            await saveExpenses(updatedExpenses);
          },
        },
      ]
    );
  };

  const handleExportCSV = async () => {
    try {
      const filteredExpenses = getFilteredExpenses();
      if (filteredExpenses.length === 0) {
        Alert.alert('No Data', 'No expenses to export');
        return;
      }

      // Create CSV content
      const headers = 'Date,Amount,Category,Description\n';
      const rows = filteredExpenses.map(expense => {
        const date = new Date(expense.date).toLocaleDateString();
        const category = CATEGORIES.find(c => c.id === expense.category)?.name || 'Other';
        return `${date},${expense.amount},${category},"${expense.description}"`;
      }).join('\n');

      const csvContent = headers + rows;
      const fileName = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Expenses',
        });
      } else {
        Alert.alert('Success', `Exported to ${fileName}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const getFilteredExpenses = () => {
    let filtered = [...expenses];
    const now = new Date();

    // Time filter
    switch (timeFilter) {
      case 'Today':
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        filtered = filtered.filter(e => new Date(e.date) >= todayStart);
        break;
      case 'Week':
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 7);
        filtered = filtered.filter(e => new Date(e.date) >= weekStart);
        break;
      case 'Month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = filtered.filter(e => new Date(e.date) >= monthStart);
        break;
      case 'Year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        filtered = filtered.filter(e => new Date(e.date) >= yearStart);
        break;
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(e => e.category === categoryFilter);
    }

    return filtered;
  };

  const filteredExpenses = getFilteredExpenses();
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Calculate category breakdown
  const categoryBreakdown = CATEGORIES.map(cat => {
    const catExpenses = filteredExpenses.filter(e => e.category === cat.id);
    const total = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    return { ...cat, total, count: catExpenses.length };
  }).filter(cat => cat.total > 0).sort((a, b) => b.total - a.total);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Money Tracker</Text>
        <TouchableOpacity onPress={handleExportCSV} style={styles.exportButton}>
          <Icon name="download" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Card */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <View style={[styles.totalCard, { backgroundColor: COLORS.brand[500] }]}>
            <Text style={styles.totalLabel}>Total Spent</Text>
            <Text style={styles.totalAmount}>${totalExpenses.toFixed(2)}</Text>
            <Text style={styles.totalPeriod}>{timeFilter}</Text>
          </View>
        </Animated.View>

        {/* Time Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {TIME_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                { backgroundColor: timeFilter === filter ? COLORS.brand[500] : colors.surface },
              ]}
              onPress={() => setTimeFilter(filter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: timeFilter === filter ? '#fff' : colors.text },
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
              BY CATEGORY
            </Text>
            <View style={[styles.breakdownContainer, { backgroundColor: colors.surface }]}>
              {categoryBreakdown.map((cat, index) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryRow,
                    categoryFilter === cat.id && { backgroundColor: `${cat.color}10` },
                  ]}
                  onPress={() => setCategoryFilter(categoryFilter === cat.id ? null : cat.id)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}15` }]}>
                    <Icon name={cat.icon} size={18} color={cat.color} />
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={[styles.categoryName, { color: colors.text }]}>
                      {cat.name}
                    </Text>
                    <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>
                      {cat.count} transaction{cat.count !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Text style={[styles.categoryAmount, { color: cat.color }]}>
                    ${cat.total.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Add Expense Button */}
        {!showAddExpense && (
          <TouchableOpacity
            style={[styles.addExpenseButton, { backgroundColor: colors.surface }]}
            onPress={() => setShowAddExpense(true)}
          >
            <Icon name="plus-circle" size={24} color={COLORS.brand[500]} />
            <Text style={[styles.addExpenseText, { color: COLORS.brand[500] }]}>
              Add Expense
            </Text>
          </TouchableOpacity>
        )}

        {/* Add Expense Form */}
        {showAddExpense && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[styles.addForm, { backgroundColor: colors.surface }]}
          >
            <View style={styles.amountInputContainer}>
              <Text style={[styles.currencySymbol, { color: colors.text }]}>$</Text>
              <TextInput
                value={newAmount}
                onChangeText={setNewAmount}
                placeholder="0.00"
                placeholderTextColor={colors.textTertiary}
                style={[styles.amountInput, { color: colors.text }]}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>

            <TextInput
              value={newDescription}
              onChangeText={setNewDescription}
              placeholder="Description (optional)"
              placeholderTextColor={colors.textTertiary}
              style={[styles.descriptionInput, { color: colors.text, backgroundColor: colors.surfaceSecondary }]}
            />

            <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
              Category
            </Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    { borderColor: cat.color },
                    selectedCategory === cat.id && { backgroundColor: cat.color },
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Icon
                    name={cat.icon}
                    size={16}
                    color={selectedCategory === cat.id ? '#fff' : cat.color}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: selectedCategory === cat.id ? '#fff' : cat.color },
                    ]}
                    numberOfLines={1}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.formButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => setShowAddExpense(false)}
              >
                <Text style={[styles.formButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formButton, { backgroundColor: COLORS.brand[500] }]}
                onPress={handleAddExpense}
              >
                <Text style={[styles.formButtonText, { color: '#fff' }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Recent Transactions */}
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
          TRANSACTIONS
        </Text>

        {filteredExpenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="credit-card" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No expenses yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Start tracking your spending
            </Text>
          </View>
        ) : (
          filteredExpenses.slice(0, 50).map((expense, index) => {
            const category = CATEGORIES.find(c => c.id === expense.category) || CATEGORIES[7];
            return (
              <Animated.View
                key={expense.id}
                entering={FadeInDown.delay(150 + index * 30).duration(300)}
              >
                <TouchableOpacity
                  style={[styles.transactionCard, { backgroundColor: colors.surface }]}
                  onLongPress={() => handleDeleteExpense(expense.id)}
                >
                  <View style={[styles.transactionIcon, { backgroundColor: `${category.color}15` }]}>
                    <Icon name={category.icon} size={18} color={category.color} />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionDescription, { color: colors.text }]}>
                      {expense.description}
                    </Text>
                    <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                      {formatDate(expense.date)} • {category.name}
                    </Text>
                  </View>
                  <Text style={[styles.transactionAmount, { color: COLORS.error }]}>
                    -${expense.amount.toFixed(2)}
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
  exportButton: {
    padding: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  // Total Card
  totalCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  totalLabel: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    marginVertical: SPACING.xs,
  },
  totalPeriod: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  // Filter
  filterScroll: {
    marginBottom: SPACING.lg,
  },
  filterContent: {
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  filterChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  // Section
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  // Category Breakdown
  breakdownContainer: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  categoryCount: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  categoryAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  // Add Button
  addExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginVertical: SPACING.md,
    gap: SPACING.sm,
  },
  addExpenseText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  // Add Form
  addForm: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '600',
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'center',
    minWidth: 100,
  },
  descriptionInput: {
    fontSize: FONT_SIZES.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  categoryLabel: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  categoryChipText: {
    fontSize: FONT_SIZES.xs,
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
  // Transactions
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: FONT_SIZES.md,
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
