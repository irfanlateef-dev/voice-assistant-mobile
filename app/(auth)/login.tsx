import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Eye, EyeOff } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { fontSizes, fontWeights } from '@/constants/typography';
import { DEMO_CREDENTIALS } from '@/constants/config';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  function validate(): boolean {
    const nextErrors: typeof errors = {};
    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = 'Enter a valid email';
    }
    if (!password) {
      nextErrors.password = 'Password is required';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(submitEmail?: string, submitPassword?: string) {
    const loginEmail = submitEmail ?? email;
    const loginPassword = submitPassword ?? password;

    if (!submitEmail && !validate()) {
      return;
    }

    setLoading(true);
    setErrors({});
    const result = await login(loginEmail, loginPassword);
    setLoading(false);

    if (result.success) {
      router.replace('/(app)');
    } else {
      setErrors({ form: result.error });
    }
  }

  async function handleDemoLogin() {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    await handleSubmit(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
  }

  return (
    <ScreenWrapper edges={['bottom', 'left', 'right']} style={styles.screen}>
      <View style={styles.fullBleed}>
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <RadialGradient id="loginGrad" cx="50%" cy="12%" r="55%">
              <Stop offset="0" stopColor="#fde68a" stopOpacity="0.45" />
              <Stop offset="1" stopColor={colors.background} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#loginGrad)" />
        </Svg>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.flex, { paddingTop: insets.top }]}
        >
          <View style={styles.topSection}>
          <View style={styles.header}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logoImage}
            />
            <Text style={styles.appName}>HomeChef AI</Text>
          </View>

          <Card style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue cooking with Grace</Text>

            {errors.form && <Text style={styles.formError}>{errors.form}</Text>}

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
              {errors.email && <Text style={styles.error}>{errors.email}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Your password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.textMuted} />
                  ) : (
                    <Eye size={20} color={colors.textMuted} />
                  )}
                </Pressable>
              </View>
              {errors.password && <Text style={styles.error}>{errors.password}</Text>}
            </View>

            <Button
              title="Sign In"
              onPress={() => handleSubmit()}
              loading={loading}
              fullWidth
              size="lg"
              style={styles.submitButton}
            />

            <Link href="/(auth)/signup" asChild>
              <Pressable style={styles.linkButton}>
                <Text style={styles.linkText}>
                  Don&apos;t have an account?{' '}
                  <Text style={styles.linkHighlight}>Go to Sign Up</Text>
                </Text>
              </Pressable>
            </Link>
          </Card>
        </View>

        <View style={styles.bottomSection}>
          <Button
            title="Demo Login"
            onPress={handleDemoLogin}
            variant="secondary"
            size="md"
            loading={loading}
            fullWidth
          />
        </View>
        </KeyboardAvoidingView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: 'transparent',
  },
  fullBleed: {
    flex: 1,
  },
  flex: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
  },
  bottomSection: {
    paddingBottom: spacing.sm,
    paddingTop: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
  },
  card: {
    marginBottom: 0,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSizes.base,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.error,
  },
  passwordRow: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  error: {
    fontSize: fontSizes.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  formError: {
    fontSize: fontSizes.sm,
    color: colors.error,
    backgroundColor: colors.errorLight,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  linkButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  linkHighlight: {
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
});
