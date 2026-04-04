/**
 * About Screen
 * App information with Gemini theme
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/common';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { useTheme } from '../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../config/theme';
import { APP_INFO } from '../config/features';
import { GeminiLogo } from '../components/common';

export default function AboutScreen({ navigation }) {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();

  const openLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Info */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.appInfo}>
          <View style={[styles.iconBg, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <GeminiLogo size={56} />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>OfflineGPT</Text>
          <Text style={[styles.version, { color: colors.textSecondary }]}>
            Version {APP_INFO.VERSION}
          </Text>
          <Text style={[styles.tagline, { color: colors.textTertiary }]}>
            AI that works anywhere, anytime
          </Text>
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.description, { color: colors.text }]}>
              OfflineGPT is a revolutionary mobile AI assistant that runs entirely
              on your device. No internet connection required, no data sent to
              external servers - your conversations stay completely private.
            </Text>
          </View>
        </Animated.View>

        {/* Features */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            Key Features
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {[
              { icon: 'wifi-off', title: '100% Offline', desc: 'Works without internet', color: COLORS.logoGradient.start },
              { icon: 'shield', title: 'Private & Secure', desc: 'Data stays on device', color: COLORS.success },
              { icon: 'zap', title: 'Fast Response', desc: 'Instant local processing', color: COLORS.warning },
              { icon: 'box', title: 'Multiple Models', desc: 'Choose the best AI for you', color: COLORS.logoGradient.end },
            ].map((feature, index, arr) => (
              <View
                key={index}
                style={[
                  styles.featureItem,
                  index !== arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
              >
                <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                  <Icon name={feature.icon} size={20} color={feature.color} />
                </View>
                <View style={styles.featureText}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>
                    {feature.title}
                  </Text>
                  <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                    {feature.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Powered By */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            Powered By
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.techItem}>
              <Text style={[styles.techName, { color: colors.text }]}>llama.cpp</Text>
              <Text style={[styles.techDesc, { color: colors.textSecondary }]}>
                High-performance inference engine
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.techItem}>
              <Text style={[styles.techName, { color: colors.text }]}>React Native</Text>
              <Text style={[styles.techDesc, { color: colors.textSecondary }]}>
                Cross-platform mobile framework
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.techItem}>
              <Text style={[styles.techName, { color: colors.text }]}>GGUF Models</Text>
              <Text style={[styles.techDesc, { color: colors.textSecondary }]}>
                Optimized quantized AI models
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Links */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Links</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => openLink('https://github.com')}
            >
              <Icon name="github" size={22} color={colors.text} />
              <Text style={[styles.linkText, { color: colors.text }]}>GitHub</Text>
              <Icon name="external-link" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => openLink('https://twitter.com')}
            >
              <Icon name="twitter" size={22} color={colors.text} />
              <Text style={[styles.linkText, { color: colors.text }]}>Twitter</Text>
              <Icon name="external-link" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => openLink('mailto:support@offlinegpt.app')}
            >
              <Icon name="mail" size={22} color={colors.text} />
              <Text style={[styles.linkText, { color: colors.text }]}>Contact Us</Text>
              <Icon name="external-link" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            Made with love for offline AI enthusiasts
          </Text>
          <Text style={[styles.copyright, { color: colors.textTertiary }]}>
            2024 OfflineGPT. All rights reserved.
          </Text>
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
    paddingBottom: SPACING.lg,
  },
  backButton: {
    padding: SPACING.sm,
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  appInfo: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  iconBg: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
  },
  version: {
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.xs,
  },
  tagline: {
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
    marginTop: SPACING.xxl,
    marginLeft: SPACING.xs,
  },
  card: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
  },
  description: {
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  featureDesc: {
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  techItem: {
    paddingVertical: SPACING.sm,
  },
  techName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  techDesc: {
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.xs,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  linkText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xxxl,
    paddingTop: SPACING.xxl,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
  },
  copyright: {
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.sm,
  },
});
