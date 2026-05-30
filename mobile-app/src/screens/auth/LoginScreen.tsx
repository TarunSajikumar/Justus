import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { supabase } from "../../lib/supabase";
import { authService } from '../../services/authService';

export default function LoginScreen({ navigation }: any) {
  const [contact, setContact] = useState('');
  const [isSending, setIsSending] = useState(false);

  const testSupabase = async () => {
    console.log("Testing Supabase connection...");
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      console.error("Supabase Error:", error);
    } else {
      console.log("Supabase Success:", data);
      alert("Supabase connected successfully ✅");
    }
  };

  const handleSendOtp = async () => {
    if (!contact.trim()) return;
    setIsSending(true);

    try {
      await authService.sendOtp(contact.trim());
      setIsSending(false);
      // Navigate directly to OTP. The verify-otp endpoint will tell us if user exists.
      navigation.navigate('OTP', { mode: 'login', contact: contact.trim() });
    } catch (err) {
      console.error('Send OTP error', err);
      setIsSending(false);
      // fallback: navigate to OTP anyway
      navigation.navigate('OTP', { mode: 'login', contact: contact.trim() });
    }
  };

  const isEmail = contact.includes('@');
  const isPhone = /^\+?[0-9]{7,}$/.test(contact);
  const isValid = isEmail || isPhone || contact.length >= 6;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>❤️</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Enter your phone or email to receive a one-time code
          </Text>
        </View>

        {/* Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Phone or Email</Text>
          <TextInput
            placeholder="+91 98765 43210 or you@email.com"
            placeholderTextColor="#555"
            value={contact}
            onChangeText={setContact}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleSendOtp}
          />
        </View>

        {/* Send OTP Button */}
        <TouchableOpacity
          style={[styles.button, (!isValid || isSending) && styles.buttonDisabled]}
          onPress={handleSendOtp}
          disabled={!isValid || isSending}
          activeOpacity={0.8}
        >
          {isSending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Send OTP →</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Go to Signup */}
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Signup')}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryBtnText}>
            New to JustUs?{' '}
            <Text style={styles.link}>Create account</Text>
          </Text>
        </TouchableOpacity>

        {/* Supabase Test Button */}
        <TouchableOpacity
          style={[styles.button, { marginTop: 20, backgroundColor: '#3ECF8E' }]}
          onPress={testSupabase}
        >
          <Text style={styles.buttonText}>Test Supabase Connection</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 25,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  emoji: {
    fontSize: 44,
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    color: COLORS.subtext,
    fontSize: 15,
    lineHeight: 22,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputLabel: {
    color: COLORS.subtext,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#2a1520',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.subtext,
    fontSize: 13,
    marginHorizontal: 12,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  secondaryBtnText: {
    color: COLORS.subtext,
    fontSize: 15,
  },
  link: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
