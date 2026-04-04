/**
 * Onboarding Screen
 * Welcome screens for new users
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  withSpring,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../config/theme';
import { Icon } from '../components/common';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_COMPLETE_KEY = '@onboarding_complete';

const SLIDES = [
  {
    id: '1',
    icon: 'cpu',
    title: 'Offline AI Power',
    description: 'Run powerful AI models directly on your device. No internet required, complete privacy guaranteed.',
    color: COLORS.brand[500],
  },
  {
    id: '2',
    icon: 'lock',
    title: '100% Private',
    description: 'Your conversations never leave your device. All data is stored locally and encrypted.',
    color: COLORS.success,
  },
  {
    id: '3',
    icon: 'grid',
    title: 'Productivity Tools',
    description: 'Smart Notes, Day Planner, Money Tracker, and more. All powered by AI to help you stay organized.',
    color: COLORS.warning,
  },
  {
    id: '4',
    icon: 'zap',
    title: 'Ready to Start',
    description: 'Download a model and start chatting. Your AI assistant is always available, online or offline.',
    color: COLORS.info,
  },
];

export default function OnboardingScreen({ navigation }) {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.value = offsetX;
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      navigation.replace('Login');
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
      navigation.replace('Login');
    }
  };

  const renderSlide = ({ item, index }) => {
    return (
      <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
        <Animated.View
          entering={FadeIn.delay(200).duration(500)}
          style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}
        >
          <Icon name={item.icon} size={64} color={item.color} />
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(300).duration(500)}
          style={[styles.title, { color: colors.text }]}
        >
          {item.title}
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(400).duration(500)}
          style={[styles.description, { color: colors.textSecondary }]}
        >
          {item.description}
        </Animated.Text>
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {SLIDES.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: isActive ? COLORS.brand[500] : colors.border,
                  width: isActive ? 24 : 8,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip Button */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {/* Bottom Section */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + SPACING.xl }]}>
        {renderDots()}

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: COLORS.brand[500] }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Icon name={currentIndex === SLIDES.length - 1 ? 'check' : 'arrow-right'} size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.lg,
  },
  skipText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: BORDER_RADIUS.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.lg,
  },
  bottom: {
    paddingHorizontal: SPACING.lg,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.sm,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
