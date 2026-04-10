import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  getAvailablePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
} from 'react-native-iap';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { GeminiLogo } from '../components/common';
import { COLORS } from '../config/theme';

const { width } = Dimensions.get('window');

const PRODUCT_ID = 'offlinegpt_lifetime';

export default function SubscriptionScreen({ navigation }) {
  const { theme } = useTheme();
  const {
    markSubscriptionSeen,
    hasSeenSubscription,
    startFreeTrial,
    recordLifetimePurchase,
    subscriptionStatus,
    getRemainingTrialDays,
  } = useAuth();
  const insets = useSafeAreaInsets();
  const [isProcessing, setIsProcessing] = useState(false);
  const [storePrice, setStorePrice] = useState(null);
  const [iapReady, setIapReady] = useState(false);

  // If trial expired, only show lifetime option (no free trial card)
  const trialExpired = subscriptionStatus === 'trial_expired';
  const [selectedPlan, setSelectedPlan] = useState(trialExpired ? 1 : 0);

  const lifetimePrice = storePrice || "$9.90";

  // Initialize IAP connection on mount
  useEffect(() => {
    let purchaseUpdateSub = null;
    let purchaseErrorSub = null;

    const initIAP = async () => {
      try {
        await initConnection();
        setIapReady(true);

        // Fetch product price from Google Play
        const products = await getProducts({ skus: [PRODUCT_ID] });
        if (products.length > 0) {
          setStorePrice(products[0].localizedPrice);
        }

        // Listen for purchase updates
        purchaseUpdateSub = purchaseUpdatedListener(async (purchase) => {
          if (purchase.productId === PRODUCT_ID) {
            try {
              // Finish the transaction (acknowledge on Google Play)
              await finishTransaction({ purchase, isConsumable: false });

              // Record the purchase locally + server
              await recordLifetimePurchase({
                purchaseToken: purchase.purchaseToken || purchase.transactionId,
                transactionId: purchase.transactionId,
                productId: purchase.productId,
              });

              setIsProcessing(false);
            } catch (err) {
              console.log('Error finishing transaction:', err);
              setIsProcessing(false);
            }
          }
        });

        // Listen for purchase errors
        purchaseErrorSub = purchaseErrorListener((error) => {
          console.log('Purchase error:', error);
          if (error.code !== 'E_USER_CANCELLED') {
            Alert.alert('Purchase Error', error.message || 'Something went wrong with the purchase.');
          }
          setIsProcessing(false);
        });

      } catch (err) {
        console.log('IAP init error:', err);
        // IAP not available (e.g. emulator) — still allow free trial
      }
    };

    initIAP();

    return () => {
      if (purchaseUpdateSub) purchaseUpdateSub.remove();
      if (purchaseErrorSub) purchaseErrorSub.remove();
      endConnection();
    };
  }, []);

  const handleContinue = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (selectedPlan === 0 && !trialExpired) {
        // FREE TRIAL
        await startFreeTrial();
        setIsProcessing(false);
      } else {
        // LIFETIME PURCHASE → Google Play IAP
        if (!iapReady) {
          Alert.alert('Store Not Available', 'Google Play is not available on this device. Please try again later.');
          setIsProcessing(false);
          return;
        }

        await requestPurchase({ skus: [PRODUCT_ID] });
        // The purchaseUpdatedListener above handles the rest
      }
    } catch (error) {
      if (error.code === 'E_USER_CANCELLED') {
        // User cancelled — do nothing
      } else {
        Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
      }
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    try {
      const purchases = await getAvailablePurchases();
      const lifetimePurchase = purchases.find(p => p.productId === PRODUCT_ID);

      if (lifetimePurchase) {
        await finishTransaction({ purchase: lifetimePurchase, isConsumable: false });
        await recordLifetimePurchase({
          purchaseToken: lifetimePurchase.purchaseToken || lifetimePurchase.transactionId,
          transactionId: lifetimePurchase.transactionId,
          productId: lifetimePurchase.productId,
        });
        Alert.alert('Restored!', 'Your lifetime access has been restored successfully.');
      } else {
        Alert.alert('No Purchases Found', 'No previous purchases were found on this account.');
      }
    } catch (error) {
      Alert.alert('Restore Failed', error.message || 'Could not restore purchases. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isFreeTrial = selectedPlan === 0 && !trialExpired;

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
            {trialExpired ? (
              <>Your Trial Has <Text style={{ color: COLORS.brand[500] }}>Ended</Text></>
            ) : (
              <>Unlock OfflineGPT <Text style={{ color: COLORS.brand[500] }}>Pro</Text></>
            )}
          </Text>
          {trialExpired && (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Subscribe to continue using OfflineGPT
            </Text>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={styles.sectionLabel}>
            {trialExpired ? 'SUBSCRIBE NOW' : 'SELECT A PLAN'}
          </Text>
          
          <View style={styles.planCardsContainer}>
            {/* 7 Days Free — only show if trial not expired */}
            {!trialExpired && (
              <>
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
              </>
            )}

            {/* Lifetime Access */}
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => setSelectedPlan(1)}
              style={[
                styles.planCard, 
                { backgroundColor: theme.surface, borderColor: (selectedPlan === 1 || trialExpired) ? COLORS.brand[500] : theme.border }
              ]}
            >
              <View style={styles.planCardTop}>
                <Text style={[styles.planCardTitle, { color: (selectedPlan === 1 || trialExpired) ? theme.text : theme.textSecondary }]}>
                  Lifetime Access
                </Text>
                {(selectedPlan === 1 || trialExpired) && <Ionicons name="checkmark" color={COLORS.brand[500]} size={20} />}
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
            {trialExpired
              ? 'One-time payment for unlimited lifetime access.'
              : 'One-time payment available for lifetime access.'}
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
                <Text style={[styles.timelineValue, { color: COLORS.brand[500] }]}>
                  {isFreeTrial ? '$0.00' : lifetimePrice}
                </Text>
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
          style={[styles.primaryButton, { backgroundColor: theme.text, opacity: isProcessing ? 0.6 : 1 }]}
          activeOpacity={0.8}
          onPress={handleContinue}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text style={[styles.primaryButtonText, { color: theme.background }]}>
              {isFreeTrial ? 'Try For Free' : 'Get Lifetime Access'}
            </Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.legalRow}>
          <Text style={[styles.legalText, { color: theme.textMuted }]}>Privacy Policy</Text>
          <Text style={[styles.separator, { color: theme.textMuted }]}>|</Text>
          <Text style={[styles.legalText, { color: theme.textMuted }]}>Terms of Service</Text>
          <Text style={[styles.separator, { color: theme.textMuted }]}>|</Text>
          <TouchableOpacity onPress={handleRestore} disabled={isProcessing}>
            <Text style={[styles.legalText, { color: COLORS.brand[500] }]}>Restore</Text>
          </TouchableOpacity>
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
  subtitle: {
    fontSize: 15,
    marginTop: 8,
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
