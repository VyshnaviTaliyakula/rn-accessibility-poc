
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text
        style={styles.title}
        accessibilityRole="header"
      >
        Accessibility Testing PoC
      </Text>

      <Text nativeID="emailLabel" style={styles.label}>Email address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        accessibilityLabel={Platform.OS === 'android' ? undefined : 'Email address'}
        accessibilityLabelledBy="emailLabel"
        accessibilityHint="Enter your registered email address"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text nativeID="passwordLabel" style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        accessibilityHint="Enter your registered account password"
        accessibilityLabel={Platform.OS === 'android' ? undefined : 'Password'}
        accessibilityLabelledBy="passwordLabel"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Sign in"
        accessibilityHint="Signs in to your account"
        onPress={() => Alert.alert('Sign in pressed')}
      >
        <Text style={styles.buttonText}>Sign in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
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
