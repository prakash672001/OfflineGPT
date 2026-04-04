/**
 * Chat Input Component
 * Text input with attachments and voice input
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  Platform,
  Keyboard,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../../config/theme';
import { Icon } from '../common';
import { FEATURES } from '../../config/features';

export const ChatInput = ({
  value,
  onChangeText,
  onSend,
  onVoicePress,
  onAttachPress,
  onCameraPress,
  onDocumentPress,
  onStopGeneration,
  isGenerating = false,
  disabled = false,
  placeholder = 'Message...',
  attachment,
  onRemoveAttachment,
  modelName,
  style,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [inputHeight, setInputHeight] = useState(48);
  const menuAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);

  // Animate menu
  useEffect(() => {
    Animated.spring(menuAnim, {
      toValue: isMenuOpen ? 1 : 0,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [isMenuOpen]);

  const handleSend = () => {
    if (value.trim() || attachment) {
      onSend?.();
      setInputHeight(48);
    }
  };

  const handleContentSizeChange = (e) => {
    const height = e.nativeEvent.contentSize.height;
    setInputHeight(Math.min(Math.max(48, height + 16), 150));
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuOption = (action) => {
    setIsMenuOpen(false);
    action?.();
  };

  const menuTranslateY = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const showSendButton = value.trim().length > 0 || attachment;

  return (
    <View style={[styles.container, style]}>
      {/* Attachment Preview */}
      {attachment && (
        <View style={styles.attachmentContainer}>
          <View style={[styles.attachmentPreview, { backgroundColor: colors.surfaceSecondary }]}>
            <Image
              source={{ uri: attachment.uri }}
              style={styles.attachmentImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={onRemoveAttachment}
              style={styles.removeAttachment}
            >
              <Icon name="x" size={14} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main Input Container */}
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.inputBg, borderColor: colors.border },
          SHADOWS.lg,
        ]}
      >
        {/* Plus Button / Attachment Menu */}
        <View style={styles.plusContainer}>
          <TouchableOpacity
            onPress={toggleMenu}
            style={[
              styles.plusButton,
              { backgroundColor: isMenuOpen ? colors.surfaceSecondary : 'transparent' },
            ]}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: menuAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '45deg'],
                    }),
                  },
                ],
              }}
            >
              <Icon
                name="plus"
                size={22}
                color={isMenuOpen ? colors.text : colors.icon}
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Attachment Menu */}
          {isMenuOpen && (
            <Animated.View
              style={[
                styles.menu,
                { backgroundColor: colors.surface, borderColor: colors.border },
                SHADOWS.xl,
                {
                  opacity: menuAnim,
                  transform: [{ translateY: menuTranslateY }],
                },
              ]}
            >
              {FEATURES.CAMERA_INPUT && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuOption(onCameraPress)}
                >
                  <View style={[styles.menuIcon, { backgroundColor: '#9333ea15' }]}>
                    <Icon name="camera" size={20} color="#9333ea" />
                  </View>
                  <View>
                    <Text style={[styles.menuLabel, { color: colors.text }]}>
                      Camera
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuOption(onAttachPress)}
              >
                <View style={[styles.menuIcon, { backgroundColor: '#3b82f615' }]}>
                  <Icon name="image" size={20} color="#3b82f6" />
                </View>
                <View>
                  <Text style={[styles.menuLabel, { color: colors.text }]}>
                    Photo
                  </Text>
                </View>
              </TouchableOpacity>

              {FEATURES.DOCUMENT_INPUT && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuOption(onDocumentPress)}
                >
                  <View style={[styles.menuIcon, { backgroundColor: '#f9731615' }]}>
                    <Icon name="file-text" size={20} color="#f97316" />
                  </View>
                  <View>
                    <Text style={[styles.menuLabel, { color: colors.text }]}>
                      Document
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </View>

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          multiline
          editable={!disabled}
          onContentSizeChange={handleContentSizeChange}
          style={[
            styles.input,
            { color: colors.text, height: inputHeight },
          ]}
        />

        {/* Right Actions */}
        <View style={styles.rightActions}>
          {isGenerating ? (
            <TouchableOpacity
              onPress={onStopGeneration}
              style={[styles.stopButton, { backgroundColor: COLORS.error }]}
            >
              <Icon name="square" size={14} color="#ffffff" />
            </TouchableOpacity>
          ) : showSendButton ? (
            <TouchableOpacity
              onPress={handleSend}
              style={[styles.sendButton, { backgroundColor: COLORS.brand[600] }]}
              disabled={disabled}
            >
              <Icon name="send" size={18} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <View style={styles.inputActions}>
              {FEATURES.VOICE_INPUT && (
                <TouchableOpacity
                  onPress={onVoicePress}
                  style={styles.actionButton}
                >
                  <Icon name="mic" size={22} color={colors.icon} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  // Attachment Preview
  attachmentContainer: {
    marginBottom: SPACING.sm,
  },
  attachmentPreview: {
    alignSelf: 'flex-start',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  attachmentImage: {
    width: 80,
    height: 80,
  },
  removeAttachment: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: BORDER_RADIUS.full,
    padding: 4,
  },
  // Input Container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  plusContainer: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  plusButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Menu
  menu: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.xs,
    minWidth: 160,
    zIndex: 100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  menuLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  // Input
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm : 0,
    maxHeight: 150,
    minHeight: 40,
  },
  // Right Actions
  rightActions: {
    marginBottom: SPACING.sm,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: SPACING.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatInput;
