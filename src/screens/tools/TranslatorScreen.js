/**
 * Translator Screen
 * AI-powered translation using Gemini API
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
  Clipboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../config/theme';
import { Icon } from '../../components/common';
import { geminiApi } from '../../services/geminiApi';

const HISTORY_STORAGE_KEY = '@translator_history';

const LANGUAGES = [
  { code: 'auto', name: 'Detect Language', flag: '🔍' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
];

export default function TranslatorScreen({ navigation }) {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();

  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const saveToHistory = async (translation) => {
    try {
      const newHistory = [translation, ...history.slice(0, 19)];
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      Alert.alert('No Text', 'Please enter text to translate');
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

    setIsTranslating(true);
    try {
      const targetLangName = LANGUAGES.find(l => l.code === targetLang)?.name || 'Spanish';
      const sourceLangName = sourceLang === 'auto' ? 'auto' : LANGUAGES.find(l => l.code === sourceLang)?.name;

      const result = await geminiApi.translate(sourceText, targetLangName, sourceLangName);
      setTranslatedText(result);

      // Save to history
      const translation = {
        id: Date.now().toString(),
        sourceText: sourceText.trim(),
        translatedText: result,
        sourceLang,
        targetLang,
        createdAt: new Date().toISOString(),
      };
      await saveToHistory(translation);
    } catch (error) {
      Alert.alert('Error', 'Failed to translate. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') return;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopy = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Text copied to clipboard');
  };

  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
  };

  const handleUseHistory = (item) => {
    setSourceText(item.sourceText);
    setTranslatedText(item.translatedText);
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
  };

  const getLanguage = (code) => LANGUAGES.find(l => l.code === code) || LANGUAGES[1];

  const LanguagePicker = ({ visible, onSelect, onClose, excludeAuto = false }) => {
    if (!visible) return null;
    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        style={[styles.pickerOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
      >
        <View style={[styles.pickerContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.pickerHeader}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Language</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerList}>
            {LANGUAGES.filter(l => !excludeAuto || l.code !== 'auto').map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={styles.pickerItem}
                onPress={() => {
                  onSelect(lang.code);
                  onClose();
                }}
              >
                <Text style={styles.pickerFlag}>{lang.flag}</Text>
                <Text style={[styles.pickerLang, { color: colors.text }]}>{lang.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Translator</Text>
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Icon name="trash-2" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Selector */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <View style={[styles.langSelector, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={styles.langButton}
              onPress={() => setShowSourcePicker(true)}
            >
              <Text style={styles.langFlag}>{getLanguage(sourceLang).flag}</Text>
              <Text style={[styles.langName, { color: colors.text }]}>
                {getLanguage(sourceLang).name}
              </Text>
              <Icon name="chevron-down" size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.swapButton, { backgroundColor: colors.surfaceSecondary }]}
              onPress={handleSwapLanguages}
            >
              <Icon name="repeat" size={18} color={COLORS.brand[500]} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.langButton}
              onPress={() => setShowTargetPicker(true)}
            >
              <Text style={styles.langFlag}>{getLanguage(targetLang).flag}</Text>
              <Text style={[styles.langName, { color: colors.text }]}>
                {getLanguage(targetLang).name}
              </Text>
              <Icon name="chevron-down" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Source Text Input */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={[styles.textCard, { backgroundColor: colors.surface }]}>
            <View style={styles.textHeader}>
              <Text style={[styles.textLabel, { color: colors.textSecondary }]}>
                {getLanguage(sourceLang).name}
              </Text>
              {sourceText.length > 0 && (
                <TouchableOpacity onPress={() => handleCopy(sourceText)}>
                  <Icon name="copy" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              value={sourceText}
              onChangeText={setSourceText}
              placeholder="Enter text to translate..."
              placeholderTextColor={colors.textTertiary}
              style={[styles.textInput, { color: colors.text }]}
              multiline
              numberOfLines={4}
            />
            <Text style={[styles.charCount, { color: colors.textTertiary }]}>
              {sourceText.length} characters
            </Text>
          </View>
        </Animated.View>

        {/* Translate Button */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <TouchableOpacity
            style={[styles.translateButton, { backgroundColor: COLORS.brand[500] }]}
            onPress={handleTranslate}
            disabled={isTranslating}
          >
            {isTranslating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="globe" size={20} color="#fff" />
                <Text style={styles.translateButtonText}>Translate</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Translated Text */}
        {translatedText && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <View style={[styles.textCard, { backgroundColor: colors.surface, borderColor: COLORS.brand[500], borderWidth: 1 }]}>
              <View style={styles.textHeader}>
                <Text style={[styles.textLabel, { color: COLORS.brand[500] }]}>
                  {getLanguage(targetLang).name}
                </Text>
                <TouchableOpacity onPress={() => handleCopy(translatedText)}>
                  <Icon name="copy" size={18} color={COLORS.brand[500]} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.translatedText, { color: colors.text }]}>
                {translatedText}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* History */}
        {history.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
              RECENT TRANSLATIONS
            </Text>
            {history.slice(0, 5).map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.historyCard, { backgroundColor: colors.surface }]}
                onPress={() => handleUseHistory(item)}
              >
                <View style={styles.historyLangs}>
                  <Text style={styles.historyFlag}>{getLanguage(item.sourceLang).flag}</Text>
                  <Icon name="arrow-right" size={12} color={colors.textTertiary} />
                  <Text style={styles.historyFlag}>{getLanguage(item.targetLang).flag}</Text>
                </View>
                <View style={styles.historyContent}>
                  <Text style={[styles.historySource, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.sourceText}
                  </Text>
                  <Text style={[styles.historyTranslated, { color: colors.text }]} numberOfLines={1}>
                    {item.translatedText}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      {/* Language Pickers */}
      <LanguagePicker
        visible={showSourcePicker}
        onSelect={setSourceLang}
        onClose={() => setShowSourcePicker(false)}
      />
      <LanguagePicker
        visible={showTargetPicker}
        onSelect={setTargetLang}
        onClose={() => setShowTargetPicker(false)}
        excludeAuto
      />
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
  clearButton: {
    padding: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  // Language Selector
  langSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  langButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  langFlag: {
    fontSize: 20,
  },
  langName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Text Card
  textCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  textHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  textLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  textInput: {
    fontSize: FONT_SIZES.md,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: FONT_SIZES.xs,
    textAlign: 'right',
    marginTop: SPACING.sm,
  },
  translatedText: {
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
  },
  // Translate Button
  translateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  translateButtonText: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  // Section
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  // History
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  historyLangs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginRight: SPACING.md,
  },
  historyFlag: {
    fontSize: 16,
  },
  historyContent: {
    flex: 1,
  },
  historySource: {
    fontSize: FONT_SIZES.xs,
    marginBottom: 2,
  },
  historyTranslated: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  // Picker
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    width: '85%',
    maxHeight: '70%',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  pickerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  pickerList: {
    padding: SPACING.sm,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.md,
  },
  pickerFlag: {
    fontSize: 24,
  },
  pickerLang: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
});
