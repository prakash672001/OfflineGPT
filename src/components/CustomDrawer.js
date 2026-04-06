/**
 * Custom Drawer / Sidebar
 * Chat history management with new UI theme
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInLeft, FadeInUp } from 'react-native-reanimated';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useModel } from '../context/ModelContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../config/theme';
import { Icon, Avatar, Badge, ActionSheet, Modal } from './common';

export default function CustomDrawer({ navigation }) {
  const { isDark, toggleTheme } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const { user, signOut } = useAuth();
  const {
    conversations,
    currentConversation,
    setCurrentConversation,
    createNewConversation,
    deleteConversation,
    updateConversationTitle,
    pinConversation,
    unpinConversation,
  } = useChat();
  const { selectedModel } = useModel();
  const insets = useSafeAreaInsets();

  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameText, setRenameText] = useState('');

  // Separate pinned and regular conversations
  const pinnedConversations = conversations.filter(c => c.isPinned);
  const regularConversations = conversations.filter(c => !c.isPinned);

  const handleNewChat = async () => {
    await createNewConversation();
    navigation.closeDrawer();
  };

  const handleNewIncognitoChat = async () => {
    await createNewConversation('Incognito Chat', true);
    navigation.closeDrawer();
  };

  const handleSelectConversation = (conversation) => {
    setCurrentConversation(conversation);
    navigation.closeDrawer();
  };

  const handleLongPress = (conversation) => {
    setSelectedChat(conversation);
    setShowActionSheet(true);
  };

  const handleDeleteConversation = () => {
    if (!selectedChat) return;
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this conversation? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteConversation(selectedChat.id);
            setSelectedChat(null);
          },
        },
      ]
    );
  };

  const handleRenameChat = () => {
    if (!selectedChat) return;
    setRenameText(selectedChat.title);
    setShowRenameModal(true);
  };

  const handleSaveRename = () => {
    if (selectedChat && renameText.trim()) {
      updateConversationTitle(selectedChat.id, renameText.trim());
      setShowRenameModal(false);
      setSelectedChat(null);
    }
  };

  const handlePinChat = () => {
    if (!selectedChat) return;
    if (selectedChat.isPinned) {
      unpinConversation?.(selectedChat.id);
    } else {
      pinConversation?.(selectedChat.id);
    }
    setSelectedChat(null);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const renderConversationItem = (conversation, index) => {
    const isActive = currentConversation?.id === conversation.id;
    const isIncognito = conversation.isIncognito;

    return (
      <Animated.View
        key={conversation.id}
        entering={FadeInLeft.delay(100 + index * 30).duration(300)}
      >
        <TouchableOpacity
          style={[
            styles.conversationItem,
            { backgroundColor: isActive ? colors.surfaceSecondary : 'transparent' },
          ]}
          onPress={() => handleSelectConversation(conversation)}
          onLongPress={() => handleLongPress(conversation)}
          activeOpacity={0.7}
        >
          <Icon
            name={isIncognito ? 'eye-off' : 'message-square'}
            size={18}
            color={isActive ? COLORS.brand[500] : colors.textSecondary}
          />
          <Text
            style={[
              styles.conversationTitle,
              { color: isActive ? colors.text : colors.textSecondary },
              isActive && styles.conversationTitleActive,
            ]}
            numberOfLines={1}
          >
            {conversation.title}
          </Text>
          {conversation.isPinned && (
            <Icon name="bookmark" size={14} color={COLORS.brand[500]} />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const menuItems = [
    { id: 'Settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with User Info */}
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[
          styles.header,
          { paddingTop: insets.top + SPACING.md, backgroundColor: colors.surface },
        ]}
      >
        {/* New Chat Button */}
        <TouchableOpacity
          style={[styles.newChatButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
          onPress={handleNewChat}
          activeOpacity={0.7}
        >
          <View style={[styles.newChatIcon, { backgroundColor: isDark ? '#fff' : '#000' }]}>
            <Icon name="plus" size={16} color={isDark ? '#000' : '#fff'} />
          </View>
          <Text style={[styles.newChatText, { color: colors.text }]}>New chat</Text>
        </TouchableOpacity>

        {/* Incognito Chat Button */}
        <TouchableOpacity
          style={[styles.incognitoButton, { borderColor: colors.border }]}
          onPress={handleNewIncognitoChat}
          activeOpacity={0.7}
        >
          <Icon name="eye-off" size={18} color={colors.icon} />
        </TouchableOpacity>
      </Animated.View>

      {/* Conversations List */}
      <ScrollView
        style={styles.conversationsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.conversationsContent}
      >
        {/* Pinned Section */}
        {pinnedConversations.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
              PINNED
            </Text>
            {pinnedConversations.map((conv, index) => renderConversationItem(conv, index))}
          </View>
        )}

        {/* Recent Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            RECENT
          </Text>
          {regularConversations.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              No history yet. Start a conversation!
            </Text>
          ) : (
            regularConversations.slice(0, 50).map((conv, index) =>
              renderConversationItem(conv, index + pinnedConversations.length)
            )
          )}
        </View>
      </ScrollView>

      {/* Bottom Section */}
      <View style={[styles.bottomSection, { borderTopColor: colors.border }]}>
        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <Animated.View
            key={item.id}
            entering={FadeInUp.delay(200 + index * 50).duration(300)}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.id)}
              activeOpacity={0.7}
            >
              <Icon name={item.icon} size={20} color={colors.textSecondary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* User Profile */}
        <TouchableOpacity
          style={[styles.userProfile, { backgroundColor: colors.surfaceSecondary }]}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.7}
        >
          <Avatar name={user?.firstName || 'User'} size={36} />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
              {user?.firstName || 'User'}
            </Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
              <Text style={[styles.statusText, { color: COLORS.brand[500] }]}>
                Offline Mode
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Action Sheet for Chat Options */}
      <ActionSheet
        visible={showActionSheet}
        onClose={() => {
          setShowActionSheet(false);
          setSelectedChat(null);
        }}
        title={selectedChat?.title}
        actions={[
          {
            label: selectedChat?.isPinned ? 'Unpin Chat' : 'Pin Chat',
            icon: 'bookmark',
            onPress: handlePinChat,
          },
          {
            label: 'Rename',
            icon: 'edit-2',
            onPress: handleRenameChat,
          },
          {
            label: 'Delete',
            icon: 'trash-2',
            onPress: handleDeleteConversation,
            destructive: true,
          },
        ]}
      />

      {/* Rename Modal */}
      <Modal
        visible={showRenameModal}
        onClose={() => {
          setShowRenameModal(false);
          setSelectedChat(null);
        }}
        title="Rename Chat"
      >
        <View style={styles.renameContent}>
          <TextInput
            value={renameText}
            onChangeText={setRenameText}
            placeholder="Enter new name"
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.renameInput,
              { color: colors.text, backgroundColor: colors.surfaceSecondary },
            ]}
            autoFocus
          />
          <View style={styles.renameButtons}>
            <TouchableOpacity
              style={[styles.renameButton, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => setShowRenameModal(false)}
            >
              <Text style={[styles.renameButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.renameButton, { backgroundColor: COLORS.brand[600] }]}
              onPress={handleSaveRename}
            >
              <Text style={[styles.renameButtonText, { color: '#fff' }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  newChatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  newChatIcon: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  incognitoButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Conversations
  conversationsList: {
    flex: 1,
  },
  conversationsContent: {
    paddingHorizontal: SPACING.sm,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: 2,
    gap: SPACING.sm,
  },
  conversationTitle: {
    flex: 1,
    fontSize: FONT_SIZES.md,
  },
  conversationTitleActive: {
    fontWeight: '600',
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    paddingVertical: SPACING.xl,
    fontStyle: 'italic',
  },
  // Bottom Section
  bottomSection: {
    borderTopWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.md,
  },
  menuItemText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: SPACING.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  // Rename Modal
  renameContent: {
    padding: SPACING.lg,
  },
  renameInput: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.lg,
  },
  renameButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  renameButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  renameButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
