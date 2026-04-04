/**
 * Input Component
 * Reusable text input with variants
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../config/theme';
import { Icon } from './Icon';

export const Input = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  helper,
  icon,
  iconPosition = 'left',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  disabled = false,
  variant = 'default', // default, filled, outline
  size = 'md', // sm, md, lg
  onFocus,
  onBlur,
  style,
  inputStyle,
  ...props
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: colors.surfaceSecondary,
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: isFocused ? COLORS.brand[500] : colors.border,
        };
      default:
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: isFocused ? COLORS.brand[500] : colors.border,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.md,
          fontSize: FONT_SIZES.sm,
        };
      case 'lg':
        return {
          paddingVertical: SPACING.lg,
          paddingHorizontal: SPACING.xl,
          fontSize: FONT_SIZES.lg,
        };
      default:
        return {
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.lg,
          fontSize: FONT_SIZES.md,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.container,
          variantStyles,
          error && styles.errorBorder,
          disabled && styles.disabled,
        ]}
      >
        {icon && iconPosition === 'left' && (
          <Icon
            name={icon}
            size={20}
            color={colors.textTertiary}
            style={styles.iconLeft}
          />
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            sizeStyles,
            { color: colors.text },
            icon && iconPosition === 'left' && { paddingLeft: 0 },
            (icon && iconPosition === 'right' || secureTextEntry) && { paddingRight: 0 },
            multiline && styles.multiline,
            inputStyle,
          ]}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.iconRight}
          >
            <Icon
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        )}

        {icon && iconPosition === 'right' && !secureTextEntry && (
          <Icon
            name={icon}
            size={20}
            color={colors.textTertiary}
            style={styles.iconRight}
          />
        )}
      </View>

      {(error || helper) && (
        <Text
          style={[
            styles.helper,
            { color: error ? COLORS.error : colors.textTertiary },
          ]}
        >
          {error || helper}
        </Text>
      )}

      {maxLength && (
        <Text style={[styles.counter, { color: colors.textTertiary }]}>
          {value?.length || 0}/{maxLength}
        </Text>
      )}
    </View>
  );
};

// Search Input - Specialized for search
export const SearchInput = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  style,
  ...props
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;

  return (
    <View style={[styles.searchWrapper, style]}>
      <Icon
        name="search"
        size={20}
        color={colors.textTertiary}
        style={styles.searchIcon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        style={[
          styles.searchInput,
          { color: colors.text, backgroundColor: colors.surfaceSecondary },
        ]}
        {...props}
      />
      {value?.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            onChangeText?.('');
            onClear?.();
          }}
          style={styles.clearButton}
        >
          <Icon name="x" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
  },
  multiline: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  iconLeft: {
    marginLeft: SPACING.lg,
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginRight: SPACING.lg,
    marginLeft: SPACING.sm,
  },
  helper: {
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  counter: {
    fontSize: FONT_SIZES.xs,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  errorBorder: {
    borderColor: COLORS.error,
  },
  disabled: {
    opacity: 0.5,
  },
  // Search styles
  searchWrapper: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: SPACING.md,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  searchInput: {
    paddingVertical: SPACING.md,
    paddingLeft: SPACING.xxxl + SPACING.sm,
    paddingRight: SPACING.xxxl,
    borderRadius: BORDER_RADIUS.xl,
    fontSize: FONT_SIZES.md,
  },
  clearButton: {
    position: 'absolute',
    right: SPACING.md,
    top: '50%',
    transform: [{ translateY: -9 }],
    zIndex: 1,
  },
});

export default Input;
