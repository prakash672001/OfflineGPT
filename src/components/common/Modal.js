/**
 * Modal & Bottom Sheet Components
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../config/theme';
import { Icon } from './Icon';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Standard Modal
export const Modal = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnBackdrop = true,
  style,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalContainer}
      >
        <TouchableWithoutFeedback onPress={closeOnBackdrop ? onClose : undefined}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.modalContent,
            { backgroundColor: colors.surface },
            { transform: [{ scale: scaleAnim }], opacity: fadeAnim },
            style,
          ]}
        >
          {(title || showCloseButton) && (
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {title}
              </Text>
              {showCloseButton && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Icon name="x" size={24} color={colors.icon} />
                </TouchableOpacity>
              )}
            </View>
          )}
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

// Bottom Sheet
export const BottomSheet = ({
  visible,
  onClose,
  title,
  children,
  snapPoints = [0.5], // Percentage of screen height
  showHandle = true,
  closeOnBackdrop = true,
  style,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const sheetHeight = SCREEN_HEIGHT * snapPoints[0];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 15,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.sheetContainer}>
        <TouchableWithoutFeedback onPress={closeOnBackdrop ? onClose : undefined}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheetContent,
            {
              backgroundColor: colors.surface,
              height: sheetHeight,
              transform: [{ translateY: slideAnim }],
            },
            style,
          ]}
        >
          {showHandle && (
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>
          )}

          {title && (
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                {title}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="x" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>
          )}

          <ScrollView
            style={styles.sheetBody}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </RNModal>
  );
};

// Action Sheet - List of actions
export const ActionSheet = ({
  visible,
  onClose,
  title,
  actions = [], // Array of { label, icon?, onPress, destructive? }
  cancelLabel = 'Cancel',
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={[Math.min(0.6, (actions.length + 2) * 0.08 + 0.1)]}
    >
      {title && (
        <Text style={[styles.actionSheetTitle, { color: colors.textSecondary }]}>
          {title}
        </Text>
      )}

      <View style={styles.actionsList}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              action.onPress?.();
              onClose();
            }}
            style={[
              styles.actionItem,
              { borderBottomColor: colors.border },
              index === actions.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            {action.icon && (
              <Icon
                name={action.icon}
                size={22}
                color={action.destructive ? COLORS.error : colors.text}
                style={styles.actionIcon}
              />
            )}
            <Text
              style={[
                styles.actionLabel,
                { color: action.destructive ? COLORS.error : colors.text },
              ]}
            >
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={onClose}
        style={[styles.cancelButton, { backgroundColor: colors.surfaceSecondary }]}
      >
        <Text style={[styles.cancelLabel, { color: colors.text }]}>
          {cancelLabel}
        </Text>
      </TouchableOpacity>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  closeButton: {
    padding: SPACING.xs,
  },
  // Bottom Sheet
  sheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContent: {
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  sheetTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  sheetBody: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  // Action Sheet
  actionSheetTitle: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
  actionsList: {
    marginTop: SPACING.sm,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
  },
  actionIcon: {
    marginRight: SPACING.md,
  },
  actionLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  cancelLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
});

export default Modal;
