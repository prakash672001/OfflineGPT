import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { GeminiLogo } from '../components/common';
import { COLORS } from '../config/theme';

const { width } = Dimensions.get('window');

export default function SubscriptionScreen({ navigation }) {
  const { theme } = useTheme();
  const { markSubscriptionSeen, hasSeenSubscription } = useAuth();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState(0); // 0 = free, 1 = lifetime

  const lifetimePrice = "$9.90";

  const handleContinue = async () => {
    if (!hasSeenSubscription) {
      await markSubscriptionSeen();
    } else {
      navigation.goBack();
    }
  };

  const isFreeTrial = selectedPlan === 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.titleSection}>
          <GeminiLogo size={50} />
          <View style={{ height: 20 }} />
          <Text style={[styles.title, { color: theme.text }]}>
            Unlock OfflineGPT <Text style={{ color: COLORS.brand[500] }}>Pro</Text>
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={styles.sectionLabel}>SELECT A PLAN</Text>
          
          <View style={styles.planCardsContainer}>
            {/* 7 Days Free */}
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => setSelectedPlan(0)}
              style={[
                styles.planCard, 
                { backgroundColor: theme.surface, borderColor: selectedPlan === 0 ? COLORS.brand[500] : theme.border }
              ]}
            >
              <View style={styles.planCardTop}>
                <Text style={[styles.planCardTitle, { color: selectedPlan === 0 ? theme.text : theme.textSecondary }]} numberOfLines={2}>
                  7 Days Free
                </Text>
                {selectedPlan === 0 && <Ionicons name="checkmark" color={COLORS.brand[500]} size={20} />}
              </View>
              
              <View style={styles.planCardPricing}>
                <Text style={styles.strikethroughPrice}>{lifetimePrice}</Text>
                <Text style={[styles.freeBadge, { color: COLORS.brand[500] }]}>Free Trial</Text>
              </View>
              <Text style={[styles.planCardDesc, { color: theme.textMuted }]}>
                Full access for 7 days, no charge.
              </Text>
            </TouchableOpacity>

            <View style={{ width: 12 }} />

            {/* Lifetime Access */}
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => setSelectedPlan(1)}
              style={[
                styles.planCard, 
                { backgroundColor: theme.surface, borderColor: selectedPlan === 1 ? COLORS.brand[500] : theme.border }
              ]}
            >
              <View style={styles.planCardTop}>
                <Text style={[styles.planCardTitle, { color: selectedPlan === 1 ? theme.text : theme.textSecondary }]}>
                  Lifetime Access
                </Text>
                {selectedPlan === 1 && <Ionicons name="checkmark" color={COLORS.brand[500]} size={20} />}
              </View>

              <View style={styles.planCardPricing}>
                <Text style={[styles.planCardPrice, { color: theme.text }]}>{lifetimePrice}</Text>
              </View>
              <Text style={[styles.planCardDesc, { color: theme.textMuted }]}>
                One-time payment, use forever.
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.planNote, { color: theme.text }]}>
            One-time payment available for lifetime access.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <View style={[styles.featureBox, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark" color={theme.text} size={20} />
              <Text style={[styles.featureText, { color: theme.text }]}>Unlimited chat</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark" color={theme.text} size={20} />
              <Text style={[styles.featureText, { color: theme.text }]}>Private by default</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark" color={theme.text} size={20} />
              <Text style={[styles.featureText, { color: theme.text }]}>No cloud dependency</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.pricingTimeline}>
          <View style={styles.timelineDots}>
            <View style={[styles.dot, { backgroundColor: theme.text }]} />
            <View style={[styles.timelineLine, { backgroundColor: theme.textMuted }]} />
            <View style={[styles.dot, { backgroundColor: isFreeTrial ? theme.text : theme.textMuted }]} />
          </View>
          
          <View style={styles.timelineContent}>
            <View style={styles.timelineRow}>
              <Text style={[styles.timelineLabel, { color: theme.textSecondary }]}>Due Today</Text>
              <View style={styles.timelineValueRow}>
                {isFreeTrial && (
                  <View style={[styles.badgeContainer, { backgroundColor: theme.text }]}>
                    <Text style={[styles.badgeText, { color: theme.background }]}>7 days Free</Text>
                  </View>
                )}
                <Text style={[styles.timelineValue, { color: COLORS.brand[500] }]}>$0.00</Text>
              </View>
            </View>
            
            <View style={{ height: 26 }} />
            
            <View style={styles.timelineRow}>
              <Text style={[styles.timelineLabel, { color: theme.textSecondary }]}>
                {isFreeTrial ? 'Due After Trial' : 'One-time Payment'}
              </Text>
              <Text style={[styles.timelineValue, { color: theme.text }]}>
                {isFreeTrial ? `${lifetimePrice} lifetime` : lifetimePrice}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <Text style={[styles.disclaimer, { color: theme.textMuted }]}>
            {isFreeTrial 
              ? 'Cancel anytime during your 7 day free trial to not be charged.'
              : 'Enjoy OfflineGPT forever. Price may vary by region.'}
          </Text>
        </Animated.View>
        
        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20, backgroundColor: theme.background }]}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.text }]}
          activeOpacity={0.8}
          onPress={handleContinue}
        >
          <Text style={[styles.primaryButtonText, { color: theme.background }]}>
            {isFreeTrial ? 'Try For Free' : 'Get Lifetime Access'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.legalRow}>
          <Text style={[styles.legalText, { color: theme.textMuted }]}>Privacy Policy</Text>
          <Text style={[styles.separator, { color: theme.textMuted }]}>|</Text>
          <Text style={[styles.legalText, { color: theme.textMuted }]}>Terms of Service</Text>
          <Text style={[styles.separator, { color: theme.textMuted }]}>|</Text>
          <Text style={[styles.legalText, { color: theme.textMuted }]}>Restore</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 26,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  planCardsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  planCard: {
    flex: 1,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1.3,
  },
  planCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  planCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  planCardPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  strikethroughPrice: {
    color: '#9CA3AF',
    fontSize: 18,
    fontWeight: '500',
    textDecorationLine: 'line-through',
  },
  freeBadge: {
    fontSize: 18,
    fontWeight: '500',
  },
  planCardPrice: {
    fontSize: 18,
    fontWeight: '500',
  },
  planCardDesc: {
    fontSize: 11,
    fontWeight: '400',
  },
  planNote: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 20,
  },
  featureBox: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 36,
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
  },
  pricingTimeline: {
    flexDirection: 'row',
    marginBottom: 37,
  },
  timelineDots: {
    alignItems: 'center',
    marginRight: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineLine: {
    width: 1,
    height: 52,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineLabel: {
    fontSize: 16,
  },
  timelineValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  timelineValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 13,
    textAlign: 'center',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  legalText: {
    fontSize: 13,
  },
  separator: {
    fontSize: 13,
  },
});
