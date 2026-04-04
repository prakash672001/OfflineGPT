/**
 * Card Component
 * Reusable card container with variants
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../config/theme';

export const Card = ({
  children,
  variant = 'default', // default, elevated, outlined
  onPress,
  disabled = false,
  padding = 'md',
  style,
  ...props
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surface,
          ...SHADOWS.md,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.border,
        };
      default:
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderLight,
        };
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'sm':
        return { padding: SPACING.sm };
      case 'lg':
        return { padding: SPACING.xl };
      default:
        return { padding: SPACING.lg };
    }
  };

  const variantStyles = getVariantStyles();
  const paddingStyles = getPaddingStyles();

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      disabled={disabled}
      activeOpacity={onPress ? 0.7 : 1}
      style={[
        styles.card,
        variantStyles,
        paddingStyles,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {children}
    </Wrapper>
  );
};

// Tool Card - Specialized for tools on landing page
export const ToolCard = ({
  icon,
  title,
  color,
  onPress,
  compact = false,
  style,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.toolCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
        compact && styles.toolCardCompact,
        style,
      ]}
    >
      <View
        style={[
          styles.toolIconContainer,
          { backgroundColor: `${color}15` },
          compact && styles.toolIconContainerCompact,
        ]}
      >
        {icon}
      </View>
      <View style={styles.toolTextContainer}>
        <Text style={[styles.toolTitle, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Stats Card - For dashboards
export const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  color = COLORS.brand[500],
  trend,
  onPress,
  style,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[
        styles.statsCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
    >
      <View style={styles.statsHeader}>
        {icon && (
          <View style={[styles.statsIcon, { backgroundColor: `${color}15` }]}>
            {icon}
          </View>
        )}
        {trend && (
          <View
            style={[
              styles.trendBadge,
              { backgroundColor: trend > 0 ? COLORS.successLight : COLORS.errorLight },
            ]}
          >
            <Text
              style={[
                styles.trendText,
                { color: trend > 0 ? COLORS.success : COLORS.error },
              ]}
            >
              {trend > 0 ? '+' : ''}{trend}%
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.statsValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statsTitle, { color: colors.textSecondary }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.statsSubtitle, { color: colors.textTertiary }]}>
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
  // Tool Card
  toolCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    alignItems: 'center',
    minWidth: 80,
  },
  toolCardCompact: {
    padding: SPACING.sm,
    minWidth: 70,
  },
  toolIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  toolIconContainerCompact: {
    width: 36,
    height: 36,
  },
  toolTextContainer: {
    alignItems: 'center',
  },
  toolTitle: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Stats Card
  statsCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    minWidth: 140,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsSubtitle: {
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  trendBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default Card;
