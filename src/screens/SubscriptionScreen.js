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
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Basic access to offline AI',
    features: [
      { text: '2 AI models', included: true },
      { text: 'Basic chat features', included: true },
      { text: 'Local processing', included: true },
      { text: 'Unlimited messages', included: true },
      { text: 'Priority support', included: false },
      { text: 'Advanced models', included: false },
    ],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'Everything you need for power users',
    features: [
      { text: 'All AI models', included: true },
      { text: 'Advanced chat features', included: true },
      { text: 'Local processing', included: true },
      { text: 'Unlimited messages', included: true },
      { text: 'Priority support', included: true },
      { text: 'Early access to new models', included: true },
    ],
    popular: true,
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$99',
    period: 'one-time',
    description: 'Pay once, use forever',
    features: [
      { text: 'All Pro features', included: true },
      { text: 'Lifetime updates', included: true },
      { text: 'All future models', included: true },
      { text: 'Priority support forever', included: true },
      { text: 'Early beta access', included: true },
      { text: 'Exclusive features', included: true },
    ],
    popular: false,
  },
];

export default function SubscriptionScreen({ navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState('free');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Subscription</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.titleSection}>
          <LinearGradient
            colors={[theme.gradientStart, theme.gradientEnd]}
            style={styles.iconBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="diamond" size={32} color="#fff" />
          </LinearGradient>
          <Text style={[styles.title, { color: theme.text }]}>
            Upgrade Your Experience
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Unlock premium features and access to all AI models
          </Text>
        </Animated.View>

        {/* Plans */}
        {PLANS.map((plan, index) => (
          <Animated.View
            key={plan.id}
            entering={FadeInDown.delay(200 + index * 100).duration(400)}
          >
            <TouchableOpacity
              style={[
                styles.planCard,
                { backgroundColor: theme.cardBackground },
                selectedPlan === plan.id && {
                  borderColor: theme.primary,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.8}
            >
              {plan.popular && (
                <View style={[styles.popularBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.popularText}>Most Popular</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <View>
                  <Text style={[styles.planName, { color: theme.text }]}>
                    {plan.name}
                  </Text>
                  <Text style={[styles.planDesc, { color: theme.textSecondary }]}>
                    {plan.description}
                  </Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={[styles.planPrice, { color: theme.text }]}>
                    {plan.price}
                  </Text>
                  <Text style={[styles.planPeriod, { color: theme.textMuted }]}>
                    {plan.period}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <View style={styles.features}>
                {plan.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <Ionicons
                      name={feature.included ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={feature.included ? theme.success : theme.textMuted}
                    />
                    <Text
                      style={[
                        styles.featureText,
                        {
                          color: feature.included
                            ? theme.text
                            : theme.textMuted,
                        },
                      ]}
                    >
                      {feature.text}
                    </Text>
                  </View>
                ))}
              </View>

              <View
                style={[
                  styles.radioOuter,
                  { borderColor: selectedPlan === plan.id ? theme.primary : theme.border },
                ]}
              >
                {selectedPlan === plan.id && (
                  <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Subscribe Button */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <TouchableOpacity
            style={[styles.subscribeButton, { backgroundColor: theme.primary }]}
            activeOpacity={0.8}
          >
            <Text style={styles.subscribeText}>
              {selectedPlan === 'free' ? 'Continue with Free' : 'Subscribe Now'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.disclaimer, { color: theme.textMuted }]}>
            Cancel anytime. Prices may vary by region.
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBg: {
    width: 70,
    height: 70,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
  },
  planCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
  },
  planDesc: {
    fontSize: 13,
    marginTop: 4,
    maxWidth: width * 0.5,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '800',
  },
  planPeriod: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  features: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
  },
  radioOuter: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  subscribeButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  subscribeText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});
