/**
 * Email Templates Screen
 * Generate professional emails with AI and open in email app
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Clipboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../config/theme';
import { Icon } from '../../components/common';
import { geminiApi } from '../../services/geminiApi';

const TEMPLATES_STORAGE_KEY = '@email_templates';

const EMAIL_TYPES = [
  { id: 'professional', name: 'Professional', icon: 'briefcase', color: COLORS.brand[500] },
  { id: 'follow-up', name: 'Follow-up', icon: 'repeat', color: COLORS.info },
  { id: 'thank-you', name: 'Thank You', icon: 'heart', color: COLORS.error },
  { id: 'apology', name: 'Apology', icon: 'frown', color: COLORS.warning },
  { id: 'request', name: 'Request', icon: 'help-circle', color: '#9333EA' },
  { id: 'introduction', name: 'Introduction', icon: 'user-plus', color: COLORS.success },
  { id: 'meeting', name: 'Meeting', icon: 'calendar', color: '#EC4899' },
  { id: 'custom', name: 'Custom', icon: 'edit-3', color: '#6B7280' },
];

export default function EmailTemplatesScreen({ navigation }) {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();

  const [savedTemplates, setSavedTemplates] = useState([]);
  const [selectedType, setSelectedType] = useState('professional');
  const [context, setContext] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const stored = await AsyncStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (stored) {
        setSavedTemplates(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const saveTemplate = async (template) => {
    try {
      const updatedTemplates = [template, ...savedTemplates];
      await AsyncStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updatedTemplates));
      setSavedTemplates(updatedTemplates);
      Alert.alert('Saved', 'Email template saved successfully');
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const handleGenerate = async () => {
    if (!context.trim()) {
      Alert.alert('Missing Context', 'Please describe what the email should be about');
      return;
    }

    if (!geminiApi.isAvailable()) {
      Alert.alert(
        'API Key Required',
        'Please add your Gemini API key in Settings to use this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => navigation.navigate('Settings') },
        ]
      );
      return;
    }

    setIsGenerating(true);
    try {
      const typeName = EMAIL_TYPES.find(t => t.id === selectedType)?.name || 'Professional';
      const result = await geminiApi.generateEmailTemplate(typeName, context);

      // Parse subject and body
      const subjectMatch = result.match(/Subject:\s*(.+?)(?:\n|$)/i);
      const subject = subjectMatch ? subjectMatch[1].trim() : 'Email';
      const body = result.replace(/Subject:\s*.+?(?:\n|$)/i, '').trim();

      setGeneratedEmail({ subject, body, type: selectedType });
      setShowResult(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate email. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenEmail = async () => {
    if (!generatedEmail) return;

    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(generatedEmail.subject)}&body=${encodeURIComponent(generatedEmail.body)}`;

    try {
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert('Error', 'No email app available');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open email app');
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedEmail) return;
    const fullEmail = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    Clipboard.setString(fullEmail);
    Alert.alert('Copied', 'Email copied to clipboard');
  };

  const handleSaveTemplate = () => {
    if (!generatedEmail) return;
    const template = {
      id: Date.now().toString(),
      ...generatedEmail,
      context,
      createdAt: new Date().toISOString(),
    };
    saveTemplate(template);
  };

  const handleUseTemplate = (template) => {
    setGeneratedEmail({ subject: template.subject, body: template.body, type: template.type });
    setShowResult(true);
  };

  const handleDeleteTemplate = (templateId) => {
    Alert.alert(
      'Delete Template',
      'Are you sure you want to delete this template?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedTemplates = savedTemplates.filter(t => t.id !== templateId);
            await AsyncStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updatedTemplates));
            setSavedTemplates(updatedTemplates);
          },
        },
      ]
    );
  };

  const selectedTypeInfo = EMAIL_TYPES.find(t => t.id === selectedType);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Email Templates</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Generated Email Result */}
      {showResult && generatedEmail && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[styles.resultOverlay, { backgroundColor: colors.background }]}
        >
          <View style={[styles.resultHeader, { paddingTop: insets.top + SPACING.sm }]}>
            <TouchableOpacity onPress={() => setShowResult(false)} style={styles.backButton}>
              <Icon name="x" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Generated Email</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.resultScroll} contentContainerStyle={styles.resultContent}>
            {/* Recipient Input */}
            <View style={[styles.recipientContainer, { backgroundColor: colors.surface }]}>
              <Icon name="mail" size={20} color={colors.textSecondary} />
              <TextInput
                value={recipientEmail}
                onChangeText={setRecipientEmail}
                placeholder="recipient@email.com"
                placeholderTextColor={colors.textTertiary}
                style={[styles.recipientInput, { color: colors.text }]}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Subject */}
            <View style={[styles.emailCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emailLabel, { color: colors.textSecondary }]}>Subject</Text>
              <Text style={[styles.emailSubject, { color: colors.text }]}>
                {generatedEmail.subject}
              </Text>
            </View>

            {/* Body */}
            <View style={[styles.emailCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emailLabel, { color: colors.textSecondary }]}>Body</Text>
              <Text style={[styles.emailBody, { color: colors.text }]}>
                {generatedEmail.body}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.resultActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: COLORS.brand[500] }]}
                onPress={handleOpenEmail}
              >
                <Icon name="send" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Open in Email</Text>
              </TouchableOpacity>

              <View style={styles.secondaryActions}>
                <TouchableOpacity
                  style={[styles.secondaryButton, { backgroundColor: colors.surface }]}
                  onPress={handleCopyToClipboard}
                >
                  <Icon name="copy" size={18} color={colors.text} />
                  <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Copy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryButton, { backgroundColor: colors.surface }]}
                  onPress={handleSaveTemplate}
                >
                  <Icon name="bookmark" size={18} color={colors.text} />
                  <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryButton, { backgroundColor: colors.surface }]}
                  onPress={() => setShowResult(false)}
                >
                  <Icon name="edit-2" size={18} color={colors.text} />
                  <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Email Type Selector */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            EMAIL TYPE
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeScroll}
          >
            {EMAIL_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  selectedType === type.id && { borderColor: type.color, borderWidth: 2 },
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <View style={[styles.typeIcon, { backgroundColor: `${type.color}15` }]}>
                  <Icon name={type.icon} size={20} color={type.color} />
                </View>
                <Text style={[styles.typeName, { color: colors.text }]}>{type.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Context Input */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            DESCRIBE YOUR EMAIL
          </Text>
          <View style={[styles.contextContainer, { backgroundColor: colors.surface }]}>
            <TextInput
              value={context}
              onChangeText={setContext}
              placeholder={`What is this ${selectedTypeInfo?.name.toLowerCase()} email about? Include key details...`}
              placeholderTextColor={colors.textTertiary}
              style={[styles.contextInput, { color: colors.text }]}
              multiline
              numberOfLines={4}
            />
          </View>
        </Animated.View>

        {/* Generate Button */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <TouchableOpacity
            style={[
              styles.generateButton,
              { backgroundColor: selectedTypeInfo?.color || COLORS.brand[500] },
            ]}
            onPress={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="zap" size={20} color="#fff" />
                <Text style={styles.generateButtonText}>Generate Email</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Saved Templates */}
        {savedTemplates.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
              SAVED TEMPLATES
            </Text>
            {savedTemplates.map((template, index) => {
              const type = EMAIL_TYPES.find(t => t.id === template.type) || EMAIL_TYPES[0];
              return (
                <TouchableOpacity
                  key={template.id}
                  style={[styles.templateCard, { backgroundColor: colors.surface }]}
                  onPress={() => handleUseTemplate(template)}
                  onLongPress={() => handleDeleteTemplate(template.id)}
                >
                  <View style={[styles.templateIcon, { backgroundColor: `${type.color}15` }]}>
                    <Icon name={type.icon} size={18} color={type.color} />
                  </View>
                  <View style={styles.templateInfo}>
                    <Text style={[styles.templateSubject, { color: colors.text }]} numberOfLines={1}>
                      {template.subject}
                    </Text>
                    <Text style={[styles.templatePreview, { color: colors.textSecondary }]} numberOfLines={1}>
                      {template.body.substring(0, 50)}...
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        )}

        {/* Tips */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <View style={[styles.tipsCard, { backgroundColor: `${COLORS.info}10` }]}>
            <Icon name="info" size={18} color={COLORS.info} />
            <Text style={[styles.tipsText, { color: COLORS.info }]}>
              Tip: Be specific about the purpose, tone, and any important details you want included.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
    marginLeft: -SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  // Section
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  // Type Selector
  typeScroll: {
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  typeCard: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    minWidth: 90,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  typeName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  // Context
  contextContainer: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
  },
  contextInput: {
    fontSize: FONT_SIZES.md,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  // Generate Button
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  // Saved Templates
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  templateInfo: {
    flex: 1,
  },
  templateSubject: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  templatePreview: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  // Tips
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  tipsText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  // Result Overlay
  resultOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  resultScroll: {
    flex: 1,
  },
  resultContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  recipientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  recipientInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
  },
  emailCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  emailLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  emailSubject: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  emailBody: {
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
  },
  resultActions: {
    marginTop: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.sm,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
  },
  secondaryButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
});
