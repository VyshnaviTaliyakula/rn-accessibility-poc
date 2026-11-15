import React, { useRef, useState } from 'react';
import { useWebAccessibility } from './hooks/useWebAccessibility';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';

export default function App() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState<{
    field: 'email' | 'password';
    message: string;
  } | null>(null);
  const emailRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const passwordRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const isWeb = Platform.OS === 'web';
  useWebAccessibility();

  const signIn = () => {
    if (!isWeb) {
      Alert.alert('Sign in pressed');
      return;
    }
    setStatus('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError({ field: 'email', message: 'Enter a valid email address.' });
      emailRef.current?.focus();
      return;
    }
    if (!password) {
      setError({ field: 'password', message: 'Enter your password.' });
      passwordRef.current?.focus();
      return;
    }
    setError(null);
    setStatus('Sign in pressed. This demo does not authenticate accounts.');
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      {...(isWeb ? { role: 'main' as const } : {})}
    >
      <View
        style={isWeb && isDesktop ? styles.desktopForm : undefined}
        {...(isWeb ? { role: 'form' as const, 'aria-labelledby': 'login-title' } : {})}
      >
        <Text
          nativeID="login-title"
          style={styles.title}
          accessibilityRole="header"
        >
          Accessibility Testing PoC
        </Text>

        <Text nativeID="emailLabel" style={styles.label}>Email address</Text>
        <TextInput
          ref={emailRef}
          nativeID="email"
          style={styles.input}
          placeholder="Enter email"
          accessibilityLabel={Platform.OS === 'android' ? undefined : 'Email address'}
          accessibilityLabelledBy="emailLabel"
          accessibilityHint="Enter your registered email address"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="username"
          placeholderTextColor="#555555"
          {...(isWeb ? {
            'aria-required': true,
            'aria-invalid': error?.field === 'email',
            'aria-describedby': error?.field === 'email' ? 'login-error' : undefined,
            onSubmitEditing: signIn,
            blurOnSubmit: false,
          } : {})}
          value={email}
          onChangeText={setEmail}
        />

        <Text nativeID="passwordLabel" style={styles.label}>Password</Text>
        <TextInput
          ref={passwordRef}
          nativeID="password"
          style={styles.input}
          placeholder="Enter password"
          accessibilityHint="Enter your registered account password"
          accessibilityLabel={Platform.OS === 'android' ? undefined : 'Password'}
          accessibilityLabelledBy="passwordLabel"
          secureTextEntry
          autoComplete="current-password"
          placeholderTextColor="#555555"
          {...(isWeb ? {
            'aria-required': true,
            'aria-invalid': error?.field === 'password',
            'aria-describedby': error?.field === 'password' ? 'login-error' : undefined,
            onSubmitEditing: signIn,
            blurOnSubmit: false,
          } : {})}
          value={password}
          onChangeText={setPassword}
        />

        <Pressable
          nativeID="sign-in"
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
          accessibilityHint="Signs in to your account"
          onPress={signIn}
        >
          <Text style={styles.buttonText}>Sign in</Text>
        </Pressable>
        {isWeb && (
          <>
            <Text nativeID="login-error" role="alert" style={styles.message}>
              {error?.message}
            </Text>
            <Text role="status" aria-live="polite" style={styles.message}>
              {status}
            </Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  desktopForm: { width: 440, alignSelf: 'center' },
  message: { color: '#111111', fontSize: 16, lineHeight: 24, marginTop: 8 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#111111',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#111111',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#555555',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    color: '#111111',
  },
  button: {
    minHeight: 48,
    backgroundColor: '#174EA6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
