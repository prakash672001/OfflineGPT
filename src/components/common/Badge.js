/**
 * Badge Component
 * Status indicators and labels
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../config/theme';

export const Badge = ({
  label,
  variant = 'default', // default, success, error, warning, info, brand
  size = 'md', // sm, md, lg
  dot = false, // Show dot instead of label
  style,
  textStyle,
}) => {
  const { isDark } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: isDark ? `${COLORS.success}20` : COLORS.successLight,
          textColor: COLORS.success,
          dotColor: COLORS.success,
        };
      case 'error':
        return {
          backgroundColor: isDark ? `${COLORS.error}20` : COLORS.errorLight,
          textColor: COLORS.error,
          dotColor: COLORS.error,
        };
      case 'warning':
        return {
          backgroundColor: isDark ? `${COLORS.warning}20` : COLORS.warningLight,
          textColor: COLORS.warning,
          dotColor: COLORS.warning,
        };
      case 'info':
        return {
          backgroundColor: isDark ? `${COLORS.info}20` : COLORS.infoLight,
          textColor: COLORS.info,
          dotColor: COLORS.info,
        };
      case 'brand':
        return {
          backgroundColor: isDark ? `${COLORS.brand[500]}20` : COLORS.brand[100],
          textColor: COLORS.brand[600],
          dotColor: COLORS.brand[500],
        };
      default:
        return {
          backgroundColor: isDark ? COLORS.dark.surfaceSecondary : COLORS.light.surfaceSecondary,
          textColor: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary,
          dotColor: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 2,
          paddingHorizontal: SPACING.sm,
          fontSize: FONT_SIZES.xs,
          dotSize: 6,
        };
      case 'lg':
        return {
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.md,
          fontSize: FONT_SIZES.md,
          dotSize: 10,
        };
      default: // md
        return {
          paddingVertical: 3,
          paddingHorizontal: SPACING.sm,
          fontSize: FONT_SIZES.sm,
          dotSize: 8,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  if (dot) {
    return (
      <View
        style={[
          styles.dot,
          {
            width: sizeStyles.dotSize,
            height: sizeStyles.dotSize,
            backgroundColor: variantStyles.dotColor,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyles.backgroundColor,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: variantStyles.textColor,
            fontSize: sizeStyles.fontSize,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

// Status Badge with animated dot
export const StatusBadge = ({
  status = 'offline', // online, offline, away
  label,
  style,
}) => {
  const statusConfig = {
    online: { color: COLORS.success, label: label || 'Online' },
    offline: { color: COLORS.error, label: label || 'Offline' },
    away: { color: COLORS.warning, label: label || 'Away' },
  };

  const config = statusConfig[status] || statusConfig.offline;

  return (
    <View style={[styles.statusBadge, style]}>
      <View style={[styles.statusDot, { backgroundColor: config.color }]} />
      <Text style={[styles.statusText, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
  dot: {
    borderRadius: BORDER_RADIUS.full,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
});

export default Badge;
