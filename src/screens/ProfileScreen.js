/**
 * Profile Screen
 * User profile with Gemini theme
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/common';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useModel } from '../context/ModelContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../config/theme';

export default function ProfileScreen({ navigation }) {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const { user } = useAuth();
  const { conversations } = useChat();
  const { selectedModel, downloadedModels } = useModel();
  const insets = useSafeAreaInsets();

  const stats = [
    { label: 'Chats', value: conversations.length, icon: 'message-square' },
    { label: 'Models', value: downloadedModels.length, icon: 'cpu' },
    { label: 'Messages', value: conversations.reduce((acc, c) => acc + 5, 0), icon: 'mail' },
  ];

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity style={styles.editButton}>
          <Icon name="edit-2" size={22} color={COLORS.logoGradient.start} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Animated.View entering={FadeIn.duration(600)}>
          <LinearGradient
            colors={[COLORS.logoGradient.start, COLORS.logoGradient.middle, COLORS.logoGradient.end]}
            style={styles.profileCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.avatarContainer}>
              {user?.photo ? (
                <Image source={{ uri: user.photo }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: '#fff' }]}>
                  <Text style={[styles.avatarText, { color: COLORS.logoGradient.start }]}>
                    {user?.name?.charAt(0) || 'U'}
                  </Text>
                </View>
              )}
              <View style={styles.onlineBadge} />
            </View>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@email.com'}</Text>

            {/* Current Model */}
            <View style={styles.modelBadge}>
              <Icon name="zap" size={14} color="#fff" />
              <Text style={styles.modelBadgeText}>
                Using {selectedModel?.name || 'No Model'}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={styles.statsContainer}>
            {stats.map((stat) => (
              <View
                key={stat.label}
                style={[styles.statCard, { backgroundColor: colors.surface }]}
              >
                <View style={[styles.statIcon, { backgroundColor: COLORS.logoGradient.start + '20' }]}>
                  <Icon name={stat.icon} size={20} color={COLORS.logoGradient.start} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Account Info */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            Account
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Account Type
              </Text>
              <View style={styles.infoValueContainer}>
                <Text style={[styles.infoValue, { color: colors.text }]}>Free</Text>
                <TouchableOpacity
                  style={[styles.upgradeButton, { backgroundColor: COLORS.logoGradient.start }]}
                  onPress={() => navigation.navigate('Subscription')}
                >
                  <Text style={styles.upgradeText}>Upgrade</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Provider
              </Text>
              <View style={styles.infoValueContainer}>
                <Icon name="user" size={18} color={colors.text} />
                <Text style={[styles.infoValue, { color: colors.text }]}>Google</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Member Since
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Storage */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            Storage Used
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.storageHeader}>
              <Text style={[styles.storageUsed, { color: colors.text }]}>
                {downloadedModels.length > 0 ? '1.2 GB' : '0 GB'}
              </Text>
              <Text style={[styles.storageTotal, { color: colors.textSecondary }]}>
                of 64 GB
              </Text>
            </View>
            <View style={[styles.storageBar, { backgroundColor: colors.surfaceSecondary }]}>
              <LinearGradient
                colors={[COLORS.logoGradient.start, COLORS.logoGradient.end]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.storageProgress,
                  { width: downloadedModels.length > 0 ? '2%' : '0%' },
                ]}
              />
            </View>
            <Text style={[styles.storageInfo, { color: colors.textTertiary }]}>
              Models: {downloadedModels.length > 0 ? '~1.2 GB' : '0 GB'} | Chats: ~5 MB
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
    paddingBottom: SPACING.lg,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  editButton: {
    padding: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    borderRadius: BORDER_RADIUS.xxl,
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  userEmail: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  modelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.lg,
    gap: SPACING.xs,
  },
  modelBadgeText: {
    color: '#fff',
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
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
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZES.md,
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: SPACING.sm,
  },
  upgradeButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  upgradeText: {
    color: '#fff',
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.md,
  },
  storageUsed: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: SPACING.xs,
  },
  storageTotal: {
    fontSize: FONT_SIZES.md,
  },
  storageBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  storageProgress: {
    height: '100%',
    borderRadius: 4,
  },
  storageInfo: {
    fontSize: FONT_SIZES.xs,
  },
});
