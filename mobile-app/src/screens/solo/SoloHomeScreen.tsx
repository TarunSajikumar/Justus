import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';

export default function SoloHomeScreen() {
  const { user } = useAuthStore();
  const displayName = user?.name || 'There';

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Welcome Card */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.welcomeCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSub}>{displayName}, your journey continues...</Text>
        </View>
        <View style={styles.avatarCircle}>
          <FontAwesome name="user" size={30} color={COLORS.primary} />
        </View>
      </LinearGradient>

      {/* Daily Quote */}
      <View style={styles.quoteCard}>
        <FontAwesome name="quote-left" size={16} color={COLORS.primary} />
        <Text style={styles.quoteText}>
          "Self-love is the source of all our other loves."
        </Text>
        <Text style={styles.quoteAuthor}>— Pierre Corneille</Text>
      </View>

      {/* Connect CTA */}
      <View style={styles.connectCard}>
        <FontAwesome name="heart" size={22} color={COLORS.primary} style={{ marginBottom: 10 }} />
        <Text style={styles.connectTitle}>Find Your Partner?</Text>
        <Text style={styles.connectText}>
          Use an invite code to link with your partner and unlock the Couple experience.
        </Text>
      </View>

      {/* Placeholder Memories Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Personal Gallery</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.emptyGallery}>
        <FontAwesome name="camera" size={36} color={COLORS.border} />
        <Text style={styles.emptyText}>Your memories will appear here</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
  },
  welcomeCard: {
    marginTop: 60,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  welcomeSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: SPACING.lg,
  },
  quoteText: {
    color: '#fff',
    fontSize: 16,
    fontStyle: 'italic',
    marginVertical: 10,
    lineHeight: 24,
  },
  quoteAuthor: {
    color: COLORS.subtext,
    textAlign: 'right',
    fontSize: 12,
  },
  connectCard: {
    backgroundColor: 'rgba(255, 77, 109, 0.08)',
    borderRadius: 20,
    padding: 24,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 109, 0.25)',
    alignItems: 'center',
  },
  connectTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  connectText: {
    color: COLORS.subtext,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    color: COLORS.primary,
    fontSize: 14,
  },
  emptyGallery: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.subtext,
    marginTop: 12,
    fontSize: 14,
  },
});
