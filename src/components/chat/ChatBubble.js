/**
 * Chat Bubble Component
 * Message display for user and AI responses
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../config/theme';
import { Icon, AIAvatar, Avatar } from '../common';

export const ChatBubble = ({
  message,
  isUser,
  isStreaming = false,
  userName,
  onLongPress,
  onCopy,
  onRetry,
  style,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;

  // Parse bold text (**text**)
  const formatText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <Text key={index} style={styles.boldText}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer, style]}>
      {/* Avatar */}
      {!isUser && (
        <View style={styles.avatarContainer}>
          <AIAvatar size={32} animating={isStreaming} />
        </View>
      )}

      {/* Message Content */}
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={onLongPress}
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: colors.userBubble }]
            : styles.aiBubble,
        ]}
      >
        {/* Image Attachment */}
        {message.imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: message.imageUrl }}
              style={styles.attachedImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Text Content */}
        {message.content ? (
          <Text
            style={[
              styles.messageText,
              { color: colors.text },
              isUser && styles.userText,
            ]}
          >
            {formatText(message.content)}
            {isStreaming && (
              <Text style={styles.cursor}>|</Text>
            )}
          </Text>
        ) : isStreaming ? (
          <View style={styles.thinkingContainer}>
            <View style={styles.thinkingDots}>
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={[styles.dot, { backgroundColor: COLORS.brand[500] }]}
                />
              ))}
            </View>
            <Text style={[styles.thinkingText, { color: colors.textSecondary }]}>
              Thinking...
            </Text>
          </View>
        ) : null}

        {/* Error State */}
        {message.isError && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={16} color={COLORS.error} />
            <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      {/* User Avatar */}
      {isUser && (
        <View style={styles.avatarContainer}>
          <Avatar name={userName} size={32} />
        </View>
      )}
    </View>
  );
};

// Thinking/Processing Indicator
export const ThinkingBubble = () => {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <AIAvatar size={32} animating />
      </View>
      <View style={[styles.bubble, styles.aiBubble]}>
        <View style={styles.thinkingContainer}>
          <View style={styles.thinkingDots}>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: COLORS.brand[500] },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.thinkingText, { color: colors.textSecondary }]}>
            Processing...
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginTop: SPACING.xs,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  userBubble: {
    borderTopRightRadius: SPACING.xs,
    marginLeft: SPACING.sm,
    marginRight: SPACING.sm,
  },
  aiBubble: {
    borderTopLeftRadius: SPACING.xs,
    marginLeft: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: 'transparent',
    paddingLeft: 0,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
  },
  userText: {
    // User specific text styles
  },
  boldText: {
    fontWeight: '700',
  },
  cursor: {
    color: COLORS.brand[500],
  },
  // Image
  imageContainer: {
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  attachedImage: {
    width: 200,
    height: 150,
    borderRadius: BORDER_RADIUS.md,
  },
  // Thinking
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  thinkingDots: {
    flexDirection: 'row',
    marginRight: SPACING.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
    opacity: 0.6,
  },
  thinkingText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  retryButton: {
    marginLeft: SPACING.sm,
  },
  retryText: {
    color: COLORS.brand[600],
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});

export default ChatBubble;
