/**
 * Chat Screen
 * Main chat interface with new UI theme
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Keyboard,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp, SlideInRight } from 'react-native-reanimated';
import Markdown from 'react-native-markdown-display';

import { useTheme } from '../context/ThemeContext';
import { useChat } from '../context/ChatContext';
import { useModel } from '../context/ModelContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../config/theme';
import { getLandingPageTools, WELCOME_SUGGESTIONS } from '../config/tools';
import { Icon, GeminiLogo } from '../components/common';

export default function ChatScreen({ navigation }) {
  const { isDark, theme } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();
  const {
    messages,
    isGenerating,
    currentConversation,
    sendMessage,
    stopGeneration,
    createNewConversation,
  } = useChat();
  const {
    selectedModel,
    downloadedModels,
    selectModel,
    availableModels,
    customModels = []
  } = useModel();

  const [inputText, setInputText] = useState('');
  const [isIncognito, setIsIncognito] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isModelDropdownVisible, setModelDropdownVisible] = useState(false);
  const flatListRef = useRef(null);

  const tools = getLandingPageTools();
  const isEmpty = !currentConversation || messages.length === 0;

  const markdownRules = {
    text: (node, children, parent, styles, inheritedStyles = {}) => (
      <Text key={node.key} style={[inheritedStyles, styles.text]} selectable={true}>
        {node.content}
      </Text>
    ),
    textgroup: (node, children, parent, styles) => (
      <Text key={node.key} style={styles.textgroup} selectable={true}>
        {children}
      </Text>
    ),
    code_inline: (node, children, parent, styles, inheritedStyles = {}) => (
      <Text key={node.key} style={[inheritedStyles, styles.code_inline]} selectable={true}>
        {node.content}
      </Text>
    ),
    code_block: (node, children, parent, styles, inheritedStyles = {}) => {
      let content = node.content;
      if (typeof content === 'string' && content.endsWith('\n')) {
        content = content.substring(0, content.length - 1);
      }
      return (
        <Text key={node.key} style={[inheritedStyles, styles.code_block]} selectable={true}>
          {content}
        </Text>
      );
    },
    fence: (node, children, parent, styles, inheritedStyles = {}) => {
      let content = node.content;
      if (typeof content === 'string' && content.endsWith('\n')) {
        content = content.substring(0, content.length - 1);
      }
      return (
        <Text key={node.key} style={[inheritedStyles, styles.fence]} selectable={true}>
          {content}
        </Text>
      );
    },
    th: (node, children, parent, styles) => (
      <View key={node.key} style={styles._VIEW_SAFE_th}>
        <Text selectable={true} style={{ color: colors.text, fontWeight: 'bold' }}>{children}</Text>
      </View>
    ),
    td: (node, children, parent, styles) => (
      <View key={node.key} style={styles._VIEW_SAFE_td}>
        <Text selectable={true} style={{ color: colors.text }}>{children}</Text>
      </View>
    ),
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);


  const handleSend = async () => {
    if (!inputText.trim() || isGenerating) return;
    const text = inputText;
    setInputText('');
    Keyboard.dismiss();
    await sendMessage(text);
  };

  const handleNewChat = () => {
    createNewConversation();
    setIsIncognito(false);
  };

  const handleIncognitoChat = () => {
    setIsIncognito(true);
    createNewConversation('Incognito Chat');
  };

  const handleSuggestionPress = (suggestion) => {
    const text = suggestion.text || suggestion;
    setInputText(text);
  };

  const handleToolPress = (tool) => {
    navigation.navigate(tool.screen);
  };

  // Render message bubble
  const renderMessage = ({ item, index }) => {
    const isUser = item.role === 'user';
    const isStreaming = item.role === 'assistant' && isGenerating && !item.content;

    return (
      <Animated.View
        entering={SlideInRight.delay(index * 30).duration(300)}
        style={[
          styles.messageRow,
          isUser ? styles.userMessageRow : styles.aiMessageRow,
        ]}
      >
        {/* Message Bubble without Avatars */}
        <View
          style={[
            styles.messageBubble,
            isUser
              ? [styles.userBubble, { backgroundColor: colors.userBubble }]
              : styles.aiBubble,
          ]}
        >
          {item.content ? (
            <Markdown
              rules={markdownRules}
              style={{
                body: { color: colors.text, fontSize: FONT_SIZES.md, lineHeight: 22 },
                strong: { fontWeight: 'bold', color: colors.text },
                em: { fontStyle: 'italic', color: colors.text },
                code_inline: { backgroundColor: colors.border, color: colors.text, borderRadius: 4, padding: 2 },
                fence: { backgroundColor: colors.border, color: colors.text, borderRadius: 8, padding: 10, marginTop: 5, marginBottom: 5 },
                code_block: { backgroundColor: colors.border, color: colors.text, borderRadius: 8, padding: 10, marginTop: 5, marginBottom: 5 },
                table: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginVertical: 8, overflow: 'hidden' },
                thead: { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' },
                th: { borderWidth: 0.5, borderColor: colors.border, padding: 8, flex: 1 },
                tr: { flexDirection: 'row', borderBottomWidth: 0.5, borderColor: colors.border },
                td: { borderWidth: 0.5, borderColor: colors.border, padding: 8, flex: 1 },
              }}
            >
              {item.content}
            </Markdown>
          ) : isStreaming ? (
            <View style={styles.thinkingRow}>
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
        </View>
      </Animated.View>
    );
  };

  // Render empty state with tools and suggestions
  const renderEmptyState = () => (
    <Animated.View entering={FadeIn.duration(500)} style={styles.emptyContainer}>
      {/* Welcome Text */}
      <Text style={[styles.welcomeTitle, { color: colors.text }]}>
        Welcome to OfflineGPT
      </Text>

      {/* Logo */}
      {!isKeyboardVisible && (
        <View style={styles.logoContainer}>
          <GeminiLogo size={80} />
        </View>
      )}

      {/* Offline Indicator */}
      <View style={[styles.offlineIndicator, { backgroundColor: colors.surfaceSecondary }]}>
        <View style={styles.onlineDot} />
        <Text style={[styles.offlineText, { color: colors.textSecondary }]}>
          Works completely offline. Private and secure.
        </Text>
      </View>

      {/* Free Tools Grid */}
      <View style={styles.toolsSection}>
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
          FREE TOOLS
        </Text>
        <View style={styles.toolsGrid}>
          {tools.slice(0, 8).map((tool, index) => (
            <Animated.View
              key={tool.id}
              entering={FadeInUp.delay(100 + index * 50).duration(400)}
            >
              <TouchableOpacity
                style={[styles.toolItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => handleToolPress(tool)}
                activeOpacity={0.7}
              >
                <View style={[styles.toolIconBg, { backgroundColor: `${tool.color}15` }]}>
                  <Icon name={tool.icon} size={18} color={tool.color} />
                </View>
                <Text style={[styles.toolName, { color: colors.text }]} numberOfLines={1}>
                  {tool.name}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Suggestions */}
      <View style={styles.suggestionsSection}>
        <View style={styles.suggestionsGrid}>
          {WELCOME_SUGGESTIONS.map((suggestion, index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.delay(300 + index * 50).duration(400)}
            >
              <TouchableOpacity
                style={[styles.suggestionItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => handleSuggestionPress(suggestion)}
                activeOpacity={0.7}
              >
                <Icon name={suggestion.icon} size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            paddingTop: insets.top,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.headerButton}
        >
          <Icon name="menu" size={24} color={colors.icon} />
        </TouchableOpacity>

        <View style={styles.modelSelector}>
          <View style={styles.modelInfo}>
            {isIncognito && (
              <Icon name="eye-off" size={14} color={COLORS.brand[500]} style={{ marginRight: 6 }} />
            )}
            <Text style={[styles.modelName, { color: colors.text }]} numberOfLines={1}>
              {selectedModel?.name || 'Select Model'}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleIncognitoChat} style={styles.headerButton}>
            <Icon name="eye-off" size={22} color={colors.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNewChat} style={styles.headerButton}>
            <Icon name="plus" size={24} color={colors.icon} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages or Empty State */}
        {isEmpty ? (
          renderEmptyState()
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            // onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {/* Input Area */}
        <Animated.View
          entering={FadeInUp.duration(400)}
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 8,
            },
          ]}
        >
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Text Input */}
            <View style={styles.textInputWrapper}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message here"
                placeholderTextColor={colors.textTertiary}
                style={[styles.textInput, { color: colors.text }]}
                multiline
                maxLength={4000}
                editable={!isGenerating}
              />
            </View>

            {/* Send/Stop Button */}
            {isGenerating ? (
              <TouchableOpacity
                onPress={stopGeneration}
                style={[styles.sendButton, { backgroundColor: COLORS.error }]}
              >
                <Icon name="square" size={14} color="#ffffff" />
              </TouchableOpacity>
            ) : inputText.trim() ? (
              <TouchableOpacity
                onPress={handleSend}
                style={[styles.sendButton, { backgroundColor: COLORS.brand[600] }]}
              >
                <Icon name="send" size={16} color="#ffffff" />
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={[styles.disclaimer, { color: colors.textTertiary }]}>
            OfflineGPT can make mistakes. Consider checking important info.
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>


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
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  headerActions: {
    flexDirection: 'row',
  },
  modelSelector: {
    flex: 1,
    alignItems: 'center',
  },
  modelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modelName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  // Content
  content: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  // Messages
  messageRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  aiMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    marginHorizontal: SPACING.xs,
  },
  userBubble: {
    maxWidth: '80%',
    borderBottomRightRadius: SPACING.xs,
    alignSelf: 'flex-end',
  },
  aiBubble: {
    width: '100%',
    borderBottomLeftRadius: SPACING.xs,
    backgroundColor: 'transparent',
    paddingLeft: SPACING.sm,
    paddingRight: SPACING.sm,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
  },
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
  },
  logoContainer: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    marginBottom: SPACING.xl,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.xl,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: SPACING.sm,
  },
  offlineText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  // Tools
  toolsSection: {
    width: '100%',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  toolItem: {
    width: 72,
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  toolIconBg: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  toolName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Suggestions
  suggestionsSection: {
    width: '100%',
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.sm,
    maxWidth: 170,
  },
  suggestionText: {
    fontSize: FONT_SIZES.sm,
    flex: 1,
  },
  // Input
  inputContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1.5,
  },
  textInputWrapper: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  textInput: {
    fontSize: FONT_SIZES.md,
    maxHeight: 120,
    minHeight: 40,
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm : 0,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  micButton: {
    padding: SPACING.sm,
    marginBottom: 4,
  },
  disclaimer: {
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
});
