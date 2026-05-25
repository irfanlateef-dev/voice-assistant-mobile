import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Eye, EyeOff } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { fontSizes, fontWeights } from '@/constants/typography';

export default function SignupScreen() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) {
      nextErrors.name = 'Name is required';
    }
    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = 'Enter a valid email';
    }
    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) {
      return;
    }

    setLoading(true);
    setErrors({});
    const result = await signup(name, email, password, confirmPassword);
    setLoading(false);

    if (result.success) {
      router.replace('/(app)');
    } else {
      setErrors({ form: result.error });
    }
  }

  return (
    <ScreenWrapper scroll edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <RadialGradient id="signupGrad" cx="50%" cy="15%" r="60%">
              <Stop offset="0" stopColor="#fde68a" stopOpacity="0.5" />
              <Stop offset="1" stopColor={colors.background} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#signupGrad)" />
        </Svg>

        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Svg width={56} height={56}>
              <Defs>
                <LinearGradient id="logoGradSignup" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={colors.primary} />
                  <Stop offset="1" stopColor={colors.accent} />
                </LinearGradient>
              </Defs>
              <Rect width={56} height={56} rx={borderRadius.md} fill="url(#logoGradSignup)" />
            </Svg>
            <Text style={styles.logoEmoji}>🍲</Text>
          </View>
          <Text style={styles.appName}>HomeChef AI</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start cooking hands-free with Grace</Text>

          {errors.form && <Text style={styles.formError}>{errors.form}</Text>}

          {(['name', 'email', 'password', 'confirmPassword'] as const).map((field) => {
            const labels = {
              name: 'Name',
              email: 'Email',
              password: 'Password',
              confirmPassword: 'Confirm Password',
            };
            const values = { name, email, password, confirmPassword };
            const setters = {
              name: setName,
              email: setEmail,
              password: setPassword,
              confirmPassword: setConfirmPassword,
            };
            const isPassword = field === 'password' || field === 'confirmPassword';

            return (
              <View style={styles.field} key={field}>
                <Text style={styles.label}>{labels[field]}</Text>
                {isPassword ? (
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        errors[field] && styles.inputError,
                      ]}
                      value={values[field]}
                      onChangeText={setters[field]}
                      placeholder={labels[field]}
                      placeholderTextColor={colors.textMuted}
                      secureTextEntry={field === 'password' ? !showPassword : !showPassword}
                      autoCapitalize="none"
                    />
                    {field === 'password' && (
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
                    )}
                  </View>
                ) : (
                  <TextInput
                    style={[styles.input, errors[field] && styles.inputError]}
                    value={values[field]}
                    onChangeText={setters[field]}
                    placeholder={labels[field]}
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize={field === 'name' ? 'words' : 'none'}
                    keyboardType={field === 'email' ? 'email-address' : 'default'}
                  />
                )}
                {errors[field] && <Text style={styles.error}>{errors[field]}</Text>}
              </View>
            );
          })}

          <Button
            title="Sign Up"
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            size="lg"
            style={styles.submitButton}
          />

          <Link href="/(auth)/login" asChild>
            <Pressable style={styles.linkButton}>
              <Text style={styles.linkText}>
                Already have an account?{' '}
                <Text style={styles.linkHighlight}>Sign In</Text>
              </Text>
            </Pressable>
          </Link>
        </Card>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoEmoji: {
    position: 'absolute',
    fontSize: 28,
  },
  appName: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
  },
  card: {
    marginBottom: spacing.lg,
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
    marginBottom: spacing.md,
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
