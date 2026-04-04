/**
 * Tools Hub Screen
 * Central hub for all productivity tools
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../config/theme';
import { TOOLS } from '../config/tools';
import { Icon } from '../components/common';

export default function ToolsHubScreen({ navigation }) {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();

  const toolCategories = [
    {
      title: 'Productivity',
      tools: [
        TOOLS.find(t => t.id === 'smartNotes'),
        TOOLS.find(t => t.id === 'dayPlanner'),
        TOOLS.find(t => t.id === 'emailTemplates'),
      ].filter(Boolean),
    },
    {
      title: 'Finance & Health',
      tools: [
        TOOLS.find(t => t.id === 'moneyTracker'),
        TOOLS.find(t => t.id === 'fitnessTracker'),
      ].filter(Boolean),
    },
    {
      title: 'Utilities',
      tools: [
        TOOLS.find(t => t.id === 'translator'),
        TOOLS.find(t => t.id === 'reminders'),
      ].filter(Boolean),
    },
  ];

  const handleToolPress = (tool) => {
    navigation.navigate(tool.screen);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tools Hub</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View
          entering={FadeInDown.delay(50).duration(400)}
          style={[styles.heroSection, { backgroundColor: colors.surface }]}
        >
          <View style={[styles.heroIcon, { backgroundColor: `${COLORS.brand[500]}15` }]}>
            <Icon name="grid" size={32} color={COLORS.brand[500]} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Your Productivity Tools
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Smart Notes is your central hub. Write daily notes and let AI extract tasks, expenses, and reminders automatically.
          </Text>
        </Animated.View>

        {/* Tool Categories */}
        {toolCategories.map((category, categoryIndex) => (
          <Animated.View
            key={category.title}
            entering={FadeInDown.delay(100 + categoryIndex * 50).duration(400)}
          >
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
              {category.title.toUpperCase()}
            </Text>
            <View style={[styles.toolsGrid]}>
              {category.tools.map((tool, toolIndex) => (
                <TouchableOpacity
                  key={tool.id}
                  style={[styles.toolCard, { backgroundColor: colors.surface }]}
                  onPress={() => handleToolPress(tool)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.toolIcon,
                      { backgroundColor: `${tool.color}15` },
                    ]}
                  >
                    <Icon name={tool.icon} size={24} color={tool.color} />
                  </View>
                  <Text style={[styles.toolName, { color: colors.text }]}>
                    {tool.name}
                  </Text>
                  <Text
                    style={[styles.toolDescription, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {tool.description}
                  </Text>
                  {tool.requiresOnline && (
                    <View style={styles.onlineBadge}>
                      <Icon name="wifi" size={10} color={COLORS.info} />
                      <Text style={[styles.onlineText, { color: COLORS.info }]}>
                        Online
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        ))}

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            QUICK ACTIONS
          </Text>
          <View style={[styles.quickActions, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('SmartNotes')}
            >
              <Icon name="plus" size={20} color={COLORS.brand[500]} />
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                New Note
              </Text>
            </TouchableOpacity>
            <View style={[styles.quickDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('DayPlanner')}
            >
              <Icon name="calendar" size={20} color={COLORS.success} />
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                Today's Plan
              </Text>
            </TouchableOpacity>
            <View style={[styles.quickDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('MoneyTracker')}
            >
              <Icon name="plus-circle" size={20} color={COLORS.warning} />
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                Add Expense
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Info Footer */}
        <View style={styles.footer}>
          <Icon name="info" size={14} color={colors.textTertiary} />
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            Tools marked with "Online" require internet and Gemini API key
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
  // Hero Section
  heroSection: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Sections
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
    marginLeft: SPACING.xs,
  },
  // Tools Grid
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  toolCard: {
    width: '47%',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  toolName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  toolDescription: {
    fontSize: FONT_SIZES.xs,
    lineHeight: 16,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: 4,
  },
  onlineText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.sm,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  quickDivider: {
    width: 1,
    marginVertical: SPACING.sm,
  },
  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
  },
});
