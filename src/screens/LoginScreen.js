import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Icon, GeminiLogo } from '../components/common';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../config/theme';

export default function LoginScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const colors = isDark ? COLORS.dark : COLORS.light;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.log('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (email && password) {
      setIsLoading(true);
      try {
        await signInWithGoogle(); // Mock auth - use same flow
      } catch (error) {
        console.log('Sign in error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Theme Toggle */}
      <Animated.View
        entering={FadeIn.delay(200).duration(500)}
        style={styles.themeToggle}
      >
        <TouchableOpacity
          style={[styles.themeButton, { backgroundColor: colors.surface }]}
          onPress={toggleTheme}
        >
          <Icon
            name={isDark ? 'sun' : 'moon'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.content}>
        {/* Logo and Title */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(800)}
          style={styles.header}
        >
          <View style={[styles.logoContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <GeminiLogo size={48} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>OfflineGPT</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Secure. Private. On-device AI.
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(800)}
          style={styles.formContainer}
        >
          <TextInput
            style={[styles.input, {
              backgroundColor: colors.surface,
              color: colors.text,
            }]}
            placeholder="Email address"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[styles.input, {
              backgroundColor: colors.surface,
              color: colors.text,
            }]}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
            style={styles.submitButtonWrapper}
          >
            <LinearGradient
              colors={[COLORS.logoGradient.start, COLORS.logoGradient.middle, COLORS.logoGradient.end]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButton}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? 'Sign in' : 'Create account'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary, backgroundColor: colors.background }]}>
              Or continue with
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity
            style={[styles.googleButton, { backgroundColor: colors.surface }]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <View style={styles.googleIconContainer}>
              <Text style={styles.googleIcon}>G</Text>
            </View>
            <Text style={[styles.googleButtonText, { color: colors.text }]}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Toggle Login/Signup */}
          <TouchableOpacity
            style={styles.toggleAuth}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={[styles.toggleAuthText, { color: COLORS.logoGradient.start }]}>
              {isLogin ? "No account? Sign up" : "Have an account? Sign in"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <Animated.View
          entering={FadeInUp.delay(700).duration(800)}
          style={styles.footer}
        >
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Models run locally. Battery usage may increase during inference.
          </Text>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    marginTop: 8,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  input: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: BORDER_RADIUS.xxxl,
    fontSize: FONT_SIZES.lg,
    marginBottom: 12,
  },
  submitButtonWrapper: {
    width: '100%',
    marginTop: 8,
  },
  submitButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: FONT_SIZES.sm,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: BORDER_RADIUS.xxxl,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.logoGradient.start,
  },
  googleButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '500',
  },
  toggleAuth: {
    alignItems: 'center',
    marginTop: 24,
  },
  toggleAuthText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
  },
});
