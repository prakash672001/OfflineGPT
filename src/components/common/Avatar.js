/**
 * Avatar Component
 * User profile images with fallback
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../config/theme';

export const Avatar = ({
  source,
  name,
  size = 40,
  borderRadius,
  backgroundColor,
  textColor = '#ffffff',
  style,
}) => {
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getFontSize = () => {
    if (size < 30) return FONT_SIZES.xs;
    if (size < 50) return FONT_SIZES.md;
    if (size < 70) return FONT_SIZES.xl;
    return FONT_SIZES.xxl;
  };

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: borderRadius ?? size / 2,
  };

  // If we have a source image
  if (source?.uri || typeof source === 'number') {
    return (
      <Image
        source={source}
        style={[containerStyle, style]}
        resizeMode="cover"
      />
    );
  }

  // Fallback to initials
  const gradientColors = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#a8edea', '#fed6e3'],
  ];

  // Generate consistent color based on name
  const colorIndex = name
    ? name.charCodeAt(0) % gradientColors.length
    : 0;
  const bgColor = backgroundColor || gradientColors[colorIndex][0];

  return (
    <View
      style={[
        styles.container,
        containerStyle,
        { backgroundColor: bgColor },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: textColor, fontSize: getFontSize() },
        ]}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
};

// AI Avatar - Specialized for AI responses
export const AIAvatar = ({
  size = 32,
  animating = false,
  style,
}) => {
  return (
    <View
      style={[
        styles.aiAvatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        animating && styles.aiAvatarAnimating,
        style,
      ]}
    >
      <View style={[styles.aiInner, { borderRadius: size / 2 - 2 }]}>
        <Text style={[styles.aiIcon, { fontSize: size * 0.5 }]}>

        </Text>
      </View>
    </View>
  );
};

// Avatar Group - Show multiple avatars stacked
export const AvatarGroup = ({
  avatars = [], // Array of { source?, name }
  max = 4,
  size = 32,
  style,
}) => {
  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <View style={[styles.group, style]}>
      {displayAvatars.map((avatar, index) => (
        <View
          key={index}
          style={[
            styles.groupItem,
            { marginLeft: index > 0 ? -size / 3 : 0, zIndex: max - index },
          ]}
        >
          <Avatar
            source={avatar.source}
            name={avatar.name}
            size={size}
            style={styles.groupAvatar}
          />
        </View>
      ))}
      {remaining > 0 && (
        <View
          style={[
            styles.groupItem,
            styles.remainingBadge,
            { marginLeft: -size / 3, width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={styles.remainingText}>+{remaining}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    fontWeight: '600',
  },
  // AI Avatar
  aiAvatar: {
    backgroundColor: COLORS.brand[100],
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  aiAvatarAnimating: {
    // Add glow effect when animating
  },
  aiInner: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiIcon: {
    color: '#ffffff',
  },
  // Avatar Group
  group: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupItem: {
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 100,
  },
  groupAvatar: {
    borderWidth: 0,
  },
  remainingBadge: {
    backgroundColor: COLORS.brand[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  remainingText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.brand[600],
  },
});

export default Avatar;
