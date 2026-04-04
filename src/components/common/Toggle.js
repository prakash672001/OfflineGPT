/**
 * Toggle/Switch Component
 */

import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../config/theme';

export const Toggle = ({
  value,
  onValueChange,
  disabled = false,
  size = 'md', // sm, md, lg
  activeColor = COLORS.brand[600],
  inactiveColor,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      tension: 100,
      friction: 10,
    }).start();
  }, [value]);

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          track: { width: 36, height: 20 },
          thumb: { width: 16, height: 16 },
          thumbTranslate: 16,
        };
      case 'lg':
        return {
          track: { width: 56, height: 32 },
          thumb: { width: 28, height: 28 },
          thumbTranslate: 24,
        };
      default: // md
        return {
          track: { width: 44, height: 24 },
          thumb: { width: 20, height: 20 },
          thumbTranslate: 20,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const defaultInactiveColor = '#d1d5db';

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor || defaultInactiveColor, activeColor],
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, sizeStyles.thumbTranslate],
  });

  return (
    <TouchableOpacity
      onPress={() => !disabled && onValueChange?.(!value)}
      activeOpacity={0.8}
      disabled={disabled}
      style={[disabled && styles.disabled, style]}
    >
      <Animated.View
        style={[
          styles.track,
          sizeStyles.track,
          { backgroundColor },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            sizeStyles.thumb,
            { transform: [{ translateX }] },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
  },
  thumb: {
    backgroundColor: '#ffffff',
    borderRadius: BORDER_RADIUS.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Toggle;
