import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
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
  const { signUp, login, resendVerification } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Popup & error states
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showNotVerified, setShowNotVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const colors = isDark ? COLORS.dark : COLORS.light;

  const handleSubmit = async () => {
    setErrorMessage('');
    setShowNotVerified(false);

    if (isLogin) {
      // ---- LOGIN ----
      if (!email || !password) {
        setErrorMessage('Please fill in all fields.');
        return;
      }
      setIsLoading(true);
      try {
        await login({ email, password });
        // Success — AuthContext sets isAuthenticated, navigator handles the rest
      } catch (error) {
        if (error.status === 403) {
          // Email not verified
          setShowNotVerified(true);
          setErrorMessage('Email not verified. Check your inbox or resend.');
        } else {
          setErrorMessage(error.message || 'Login failed. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // ---- SIGNUP ----
      if (!name || !email || !password) {
        setErrorMessage('Please fill in all fields.');
        return;
      }
      setIsLoading(true);
      try {
        await signUp({ name, email, password });
        setSignupEmail(email);
        setShowEmailPopup(true);
        // Clear form
        setName('');
        setEmail('');
        setPassword('');
      } catch (error) {
        setErrorMessage(error.message || 'Signup failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerification(email);
      Alert.alert('Sent!', 'Verification email has been resent. Check your inbox.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const handlePopupContinue = () => {
    setShowEmailPopup(false);
    setIsLogin(true);
    setEmail(signupEmail);
    setErrorMessage('');
    setShowNotVerified(false);
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
          {!isLogin && (
            <TextInput
              style={[styles.input, {
                backgroundColor: colors.surface,
                color: colors.text,
              }]}
              placeholder="Full Name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}

          <TextInput
            style={[styles.input, {
              backgroundColor: colors.surface,
              color: colors.text,
            }]}
            placeholder="Email address"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={(t) => { setEmail(t); setErrorMessage(''); setShowNotVerified(false); }}
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

          {/* Error Message */}
          {errorMessage !== '' && (
            <View style={[styles.errorBox, { backgroundColor: showNotVerified ? (COLORS.brand[500] + '15') : (COLORS.error + '15') }]}>
              <Icon name={showNotVerified ? 'mail' : 'alert-circle'} size={18} color={showNotVerified ? COLORS.brand[500] : COLORS.error} />
              <Text style={[styles.errorText, { color: showNotVerified ? COLORS.brand[500] : COLORS.error }]}>
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Resend Verification Button */}
          {showNotVerified && (
            <TouchableOpacity
              style={[styles.resendButton, { backgroundColor: colors.surface }]}
              onPress={handleResend}
              disabled={isResending}
            >
              {isResending ? (
                <ActivityIndicator size="small" color={COLORS.brand[500]} />
              ) : (
                <>
                  <Icon name="refresh-cw" size={16} color={COLORS.brand[500]} />
                  <Text style={[styles.resendText, { color: COLORS.brand[500] }]}>Resend</Text>
                </>
              )}
            </TouchableOpacity>
          )}

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

          {/* Toggle Login/Signup */}
          <TouchableOpacity
            style={styles.toggleAuth}
            onPress={() => { setIsLogin(!isLogin); setErrorMessage(''); setShowNotVerified(false); }}
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

      {/* ===== EMAIL VERIFICATION POPUP ===== */}
      <Modal
        visible={showEmailPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmailPopup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalIconCircle, { backgroundColor: COLORS.brand[500] + '15' }]}>
              <Icon name="mail" size={36} color={COLORS.brand[500]} />
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>Check Your Email!</Text>
            <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
              We've sent a verification link to
            </Text>
            <Text style={[styles.modalEmail, { color: colors.text }]}>{signupEmail}</Text>
            <Text style={[styles.modalBody, { color: colors.textSecondary, marginTop: 8 }]}>
              Click the link in the email to verify your account and complete the signup process.
            </Text>

            <TouchableOpacity
              onPress={handlePopupContinue}
              activeOpacity={0.8}
              style={{ width: '100%', marginTop: 24 }}
            >
              <LinearGradient
                colors={[COLORS.logoGradient.start, COLORS.logoGradient.middle, COLORS.logoGradient.end]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Continue to Login</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: 12,
    gap: 10,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    flex: 1,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: 12,
    gap: 8,
  },
  resendText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalBox: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },
  modalIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalEmail: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  modalButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
