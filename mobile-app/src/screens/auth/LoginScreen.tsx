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
  Alert,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { supabase } from "../../lib/supabase";
import { authService } from '../../services/authService';

export default function LoginScreen({ navigation }: any) {
  const [contact, setContact] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);

    try {
      await authService.sendOtp(contact.trim());
      setIsSending(false);
      // Navigate directly to OTP. The verify-otp endpoint will tell us if user exists.
      navigation.navigate('OTP', { mode: 'login', contact: contact.trim() });
    } catch (err: any) {
      setIsSending(false);
      const errorMessage = 
        err?.response?.data?.message || 
        err?.message || 
        'Failed to send OTP';
      
      console.error('Send OTP error:', errorMessage);
      setError(errorMessage);
      
      // Show error alert
      Alert.alert(
        '❌ Error',
        errorMessage + '\n\nPlease try again in a moment.',
        [{ text: 'OK', onPress: () => setError(null) }]
      );
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
            onChangeText={(text) => {
              setContact(text);
              setError(null);
            }}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleSendOtp}
          />
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

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

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorBox: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    fontWeight: '500',
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
