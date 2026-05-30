import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { FontAwesome } from '@expo/vector-icons';
import { achievementService } from '../../services/achievementService';
import { LinearGradient } from 'expo-linear-gradient';

const ALL_ACHIEVEMENTS = [
  {
    code: 'FIRST_CONNECTION',
    title: 'First Connection',
    desc: 'Joined hands and connected your profiles in JUsT us ❤️',
    icon: 'heart',
    color: '#FF4D8D',
  },
  {
    code: 'FIRST_MEMORY',
    title: 'First Shared Memory',
    desc: 'Stored your very first shared memory photo in the secure Vault 📸',
    icon: 'image',
    color: '#4D96FF',
  },
  {
    code: 'FIRST_NOTE',
    title: 'First Love Letter',
    desc: 'Penned and left your very first dynamic love note for your partner 📝',
    icon: 'quote-left',
    color: '#6BCB77',
  },
  {
    code: '100_DAYS',
    title: '100 Days of Love',
    desc: 'Crossed the milestone of 100 beautiful days together hand-in-hand ✨',
    icon: 'star',
    color: '#FFD700',
  },
  {
    code: '365_DAYS',
    title: 'One Year Forever',
    desc: 'Celebrated a golden year of walking through life together 🏆',
    icon: 'trophy',
    color: '#9B5DE5',
  },
];

export default function AchievementsScreen({ navigation }: any) {
  const [unlocked, setUnlocked] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = async () => {
    try {
      const res = await achievementService.getAchievements();
      if (res.success && res.achievements) {
        setUnlocked(res.achievements);
      }
    } catch (e) {
      console.log('Failed to fetch achievements', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const getUnlockDate = (code: string) => {
    const item = unlocked.find((u) => u.code === code);
    if (!item) return null;
    return new Date(item.unlockedAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const unlockedCount = unlocked.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome name="chevron-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Showcase Banner */}
          <LinearGradient
            colors={[COLORS.primary, '#9B5DE5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.showcase}
          >
            <FontAwesome name="trophy" size={54} color="#FFD700" style={styles.trophyIcon} />
            <Text style={styles.showcaseCount}>{unlockedCount} / {ALL_ACHIEVEMENTS.length}</Text>
            <Text style={styles.showcaseLabel}>Milestones Unlocked</Text>
          </LinearGradient>

          {/* Achievements List */}
          <View style={styles.listContainer}>
            {ALL_ACHIEVEMENTS.map((ach) => {
              const unlockDate = getUnlockDate(ach.code);
              const isUnlocked = !!unlockDate;

              return (
                <View key={ach.code} style={[styles.achRow, !isUnlocked && styles.achRowLocked]}>
                  {/* Icon section */}
                  <View
                    style={[
                      styles.iconCircle,
                      isUnlocked
                        ? { backgroundColor: `${ach.color}15`, borderColor: ach.color }
                        : { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: COLORS.border },
                    ]}
                  >
                    <FontAwesome
                      name={ach.icon as any}
                      size={20}
                      color={isUnlocked ? ach.color : COLORS.subtext}
                    />
                  </View>

                  {/* Text section */}
                  <View style={styles.textContainer}>
                    <Text style={[styles.achTitle, isUnlocked && styles.achTitleUnlocked]}>
                      {ach.title}
                    </Text>
                    <Text style={styles.achDesc}>{ach.desc}</Text>
                    {isUnlocked && (
                      <View style={styles.unlockedBadge}>
                        <FontAwesome name="check-circle" size={12} color={COLORS.success} style={{ marginRight: 4 }} />
                        <Text style={styles.unlockedText}>Unlocked on {unlockDate}</Text>
                      </View>
                    )}
                  </View>

                  {/* Lock Indicator */}
                  {!isUnlocked && (
                    <View style={styles.lockContainer}>
                      <FontAwesome name="lock" size={14} color="rgba(255,255,255,0.15)" />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  backBtn: { padding: 10 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  showcase: {
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  trophyIcon: {
    marginBottom: 10,
  },
  showcaseCount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  showcaseLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  listContainer: {
    marginTop: 10,
  },
  achRow: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achRowLocked: {
    opacity: 0.5,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  achTitle: {
    color: COLORS.subtext,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  achTitleUnlocked: {
    color: '#fff',
    fontWeight: 'bold',
  },
  achDesc: {
    color: COLORS.subtext,
    fontSize: 12,
    lineHeight: 16,
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  unlockedText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '600',
  },
  lockContainer: {
    marginLeft: 10,
  },
});
