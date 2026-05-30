import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { api } from '../../services/api';
import { saveAuthData } from '../../store/authStore';
import { useAuthStore } from '../../store/authStore';

export default function SignupDetailsScreen({ navigation, route }: any) {
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);

  const isValid = name.trim().length >= 2 && birthday.length >= 10;

  const handleContinue = async () => {
    if (!isValid) {
      Alert.alert('Incomplete', 'Please fill in your name and birthday (YYYY-MM-DD)');
      return;
    }
    setIsSubmitting(true);

    try {
      // PUT /api/auth/profile
      const response = await api.put('/auth/profile', {
        name: name.trim(),
        birthday: birthday.trim(),
        gender: gender.trim().toLowerCase()
      });

      const { user, success } = response.data;

      if (success && user) {
        setUser(user);
        if (token) {
          await saveAuthData(token, user);
        }
        // RootNavigator will detect relationship_status (now 'solo') and show RelationshipSetup
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      const msg = err?.response?.data?.message || err.message || 'Failed to save profile';
      Alert.alert('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>🌸</Text>
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.subtitle}>Tell us a bit about yourself to get started.</Text>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            placeholder="e.g. Tarun"
            placeholderTextColor="#555"
            value={name}
            onChangeText={setName}
            style={styles.input}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Birthday (YYYY-MM-DD)</Text>
          <TextInput
            placeholder="2004-05-10"
            placeholderTextColor="#555"
            value={birthday}
            onChangeText={setBirthday}
            style={styles.input}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Gender</Text>
          <View style={styles.genderRow}>
            {['Male', 'Female', 'Other'].map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, (!isValid || isSubmitting) && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Complete Profile →</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, padding: 25, paddingTop: 70 },
  header: { marginBottom: 36 },
  emoji: { fontSize: 44, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  subtitle: { color: COLORS.subtext, fontSize: 15, lineHeight: 22 },
  inputWrapper: { marginBottom: 24 },
  inputLabel: { color: COLORS.subtext, fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  input: { backgroundColor: COLORS.card, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: COLORS.border },
  genderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  genderBtn: { flex: 1, backgroundColor: COLORS.card, padding: 15, borderRadius: 12, alignItems: 'center', marginHorizontal: 5, borderWidth: 1, borderColor: COLORS.border },
  genderBtnActive: { borderColor: COLORS.primary, backgroundColor: '#2a1520' },
  genderText: { color: COLORS.subtext, fontWeight: '600' },
  genderTextActive: { color: COLORS.primary },
  button: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 18, alignItems: 'center', marginTop: 20 },
  buttonDisabled: { backgroundColor: '#2a1520' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
