import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

function getDaysOfLove(createdAt?: string): number {
  if (!createdAt) return 0;
  const start = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function CoupleHomeScreen() {
  const { user, partner } = useAuthStore();
  const coupleName =
    user?.name && partner?.name
      ? `${user.name} & ${partner.name}`
      : user?.name || 'My Relationship';

  const daysOfLove = getDaysOfLove(user?.created_at);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()} ❤️</Text>
          <Text style={styles.coupleName}>{coupleName}</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <FontAwesome name="bell-o" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Relationship Counter Card */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.counterCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.avatarRow}>
          <View style={styles.avatarCircle}>
            <FontAwesome name="user" size={24} color={COLORS.primary} />
          </View>
          <FontAwesome name="heart" size={20} color="#fff" style={{ marginHorizontal: 15 }} />
          <View style={styles.avatarCircle}>
            <FontAwesome name="user" size={24} color={COLORS.secondary} />
          </View>
        </View>
        <Text style={styles.counterValue}>{daysOfLove}</Text>
        <Text style={styles.counterLabel}>{daysOfLove === 1 ? 'Day' : 'Days'} Together</Text>
      </LinearGradient>

      {/* Daily Love Note */}
      <View style={styles.noteCard}>
        <View style={styles.noteHeader}>
          <Text style={styles.noteTitle}>Daily Love Note</Text>
          <FontAwesome name="quote-right" size={14} color={COLORS.primary} />
        </View>
        <Text style={styles.noteText}>
          "I love you not only for what you are, but for what I am when I am with you."
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionGrid}>
        <TouchableOpacity style={styles.actionItem}>
          <View style={[styles.actionIcon, { backgroundColor: '#FF4D8D20' }]}>
            <FontAwesome name="pencil" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.actionLabel}>Note</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionItem}>
          <View style={[styles.actionIcon, { backgroundColor: '#FF85A120' }]}>
            <FontAwesome name="camera" size={18} color={COLORS.secondary} />
          </View>
          <Text style={styles.actionLabel}>Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionItem}>
          <View style={[styles.actionIcon, { backgroundColor: '#4D96FF20' }]}>
            <FontAwesome name="calendar" size={18} color="#4D96FF" />
          </View>
          <Text style={styles.actionLabel}>Date</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionItem}>
          <View style={[styles.actionIcon, { backgroundColor: '#6BCB7720' }]}>
            <FontAwesome name="lock" size={18} color="#6BCB77" />
          </View>
          <Text style={styles.actionLabel}>Vault</Text>
        </TouchableOpacity>
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
  header: {
    marginTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  greeting: {
    color: COLORS.subtext,
    fontSize: 14,
  },
  coupleName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  counterCard: {
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    color: '#fff',
    fontSize: 52,
    fontWeight: 'bold',
  },
  counterLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  noteCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  noteTitle: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  noteText: {
    color: '#fff',
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  actionItem: {
    alignItems: 'center',
    width: (width - 40 - 48) / 4,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    color: COLORS.subtext,
    fontSize: 12,
    fontWeight: '500',
  },
});
