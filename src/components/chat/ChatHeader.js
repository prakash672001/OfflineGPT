/**
 * Chat Header Component
 * Header with model selector and actions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../../config/theme';
import { Icon, BottomSheet } from '../common';
import { useModel } from '../../context/ModelContext';

export const ChatHeader = ({
  onMenuPress,
  onNewChat,
  onSettingsPress,
  isIncognito = false,
  style,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const { selectedModel, availableModels, downloadedModels, selectModel } = useModel();
  const [showModelSelector, setShowModelSelector] = useState(false);

  return (
    <>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
          style,
        ]}
      >
        {/* Left - Menu Button */}
        <TouchableOpacity
          onPress={onMenuPress}
          style={styles.iconButton}
        >
          <Icon name="menu" size={24} color={colors.icon} />
        </TouchableOpacity>

        {/* Center - Model Selector */}
        <TouchableOpacity
          onPress={() => setShowModelSelector(true)}
          style={styles.modelSelector}
        >
          <View style={styles.modelInfo}>
            {isIncognito && (
              <Icon
                name="eye-off"
                size={14}
                color={COLORS.brand[500]}
                style={styles.incognitoIcon}
              />
            )}
            <Text style={[styles.modelName, { color: colors.text }]} numberOfLines={1}>
              {selectedModel?.name || 'Select Model'}
            </Text>
            <Icon name="chevron-down" size={16} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>

        {/* Right - New Chat Button */}
        <TouchableOpacity
          onPress={onNewChat}
          style={styles.iconButton}
        >
          <Icon name="plus" size={24} color={colors.icon} />
        </TouchableOpacity>
      </View>

      {/* Model Selector Bottom Sheet */}
      <BottomSheet
        visible={showModelSelector}
        onClose={() => setShowModelSelector(false)}
        title="Select Model"
        snapPoints={[0.6]}
      >
        <View style={styles.modelList}>
          {availableModels.map((model) => {
            const isDownloaded = downloadedModels.includes(model.id);
            const isActive = selectedModel?.id === model.id;

            return (
              <TouchableOpacity
                key={model.id}
                onPress={() => {
                  if (isDownloaded) {
                    selectModel(model);
                    setShowModelSelector(false);
                  }
                }}
                style={[
                  styles.modelItem,
                  { backgroundColor: isActive ? colors.surfaceSecondary : 'transparent' },
                ]}
              >
                <View
                  style={[
                    styles.modelIconContainer,
                    { backgroundColor: isActive ? `${COLORS.brand[500]}20` : colors.surfaceSecondary },
                  ]}
                >
                  <Icon
                    name="cpu"
                    size={20}
                    color={isActive ? COLORS.brand[500] : colors.icon}
                  />
                </View>

                <View style={styles.modelDetails}>
                  <View style={styles.modelHeader}>
                    <Text style={[styles.modelItemName, { color: colors.text }]}>
                      {model.name}
                    </Text>
                    {model.recommended && (
                      <View style={[styles.recommendedBadge, { backgroundColor: COLORS.brand[100] }]}>
                        <Text style={[styles.recommendedText, { color: COLORS.brand[600] }]}>
                          Recommended
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.modelDescription, { color: colors.textSecondary }]}>
                    {model.description}
                  </Text>
                  <View style={styles.modelMeta}>
                    {isDownloaded ? (
                      <Text style={[styles.modelStatus, { color: COLORS.success }]}>
                        Ready
                      </Text>
                    ) : (
                      <View style={styles.downloadInfo}>
                        <Icon name="download" size={12} color={colors.textTertiary} />
                        <Text style={[styles.modelSize, { color: colors.textTertiary }]}>
                          {model.size}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {isActive && (
                  <Icon name="check" size={20} color={COLORS.brand[500]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  iconButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  modelSelector: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  modelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  incognitoIcon: {
    marginRight: SPACING.xs,
  },
  modelName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  // Model List
  modelList: {
    paddingBottom: SPACING.xl,
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xs,
  },
  modelIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  modelDetails: {
    flex: 1,
  },
  modelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  modelItemName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginRight: SPACING.sm,
  },
  recommendedBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  recommendedText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  modelDescription: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.xs,
  },
  modelMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modelStatus: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  downloadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modelSize: {
    fontSize: FONT_SIZES.xs,
  },
});

export default ChatHeader;
