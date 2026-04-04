/**
 * Button Component
 * Reusable button with multiple variants
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../config/theme';
import { Icon } from './Icon';

export const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'md', // sm, md, lg
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  ...props
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: COLORS.brand[600],
          },
          text: {
            color: '#ffffff',
          },
          icon: '#ffffff',
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.surfaceSecondary,
          },
          text: {
            color: colors.text,
          },
          icon: colors.text,
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.border,
          },
          text: {
            color: colors.text,
          },
          icon: colors.text,
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: COLORS.brand[600],
          },
          icon: COLORS.brand[600],
        };
      case 'danger':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: COLORS.error,
          },
          text: {
            color: COLORS.error,
          },
          icon: COLORS.error,
        };
      default:
        return {
          container: {},
          text: {},
          icon: colors.text,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: SPACING.sm,
            paddingHorizontal: SPACING.md,
          },
          text: {
            fontSize: FONT_SIZES.sm,
          },
          iconSize: 16,
        };
      case 'lg':
        return {
          container: {
            paddingVertical: SPACING.lg,
            paddingHorizontal: SPACING.xl,
          },
          text: {
            fontSize: FONT_SIZES.lg,
          },
          iconSize: 22,
        };
      default: // md
        return {
          container: {
            paddingVertical: SPACING.md,
            paddingHorizontal: SPACING.lg,
          },
          text: {
            fontSize: FONT_SIZES.md,
          },
          iconSize: 18,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.text.color}
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Icon
              name={icon}
              size={sizeStyles.iconSize}
              color={variantStyles.icon}
              style={styles.iconLeft}
            />
          )}
          {title && (
            <Text
              style={[
                styles.text,
                variantStyles.text,
                sizeStyles.text,
                textStyle,
              ]}
            >
              {title}
            </Text>
          )}
          {icon && iconPosition === 'right' && (
            <Icon
              name={icon}
              size={sizeStyles.iconSize}
              color={variantStyles.icon}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

// Icon Button - Just icon, no text
export const IconButton = ({
  icon,
  onPress,
  size = 24,
  color,
  backgroundColor,
  disabled = false,
  style,
  ...props
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.iconButton,
        backgroundColor && { backgroundColor },
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <Icon
        name={icon}
        size={size}
        color={color || colors.icon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  iconButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
});

export default Button;
