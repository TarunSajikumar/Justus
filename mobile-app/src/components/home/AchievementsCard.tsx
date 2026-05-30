import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { FontAwesome } from '@expo/vector-icons';

interface AchievementsCardProps {
  unlockedCodes: string[];
  onSeeAllPress: () => void;
}

const CORE_ACHIEVEMENTS = [
  { code: 'FIRST_CONNECTION', title: 'First Connection' },
  { code: 'FIRST_MEMORY', title: 'First Memory' },
  { code: '100_DAYS', title: '100 Days Together' },
];

export default function AchievementsCard({ unlockedCodes, onSeeAllPress }: AchievementsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <FontAwesome name="trophy" size={18} color="#FFD700" style={{ marginRight: 8 }} />
          <Text style={styles.title}>Achievements</Text>
        </View>
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.checklist}>
        {CORE_ACHIEVEMENTS.map((item) => {
          const isUnlocked = unlockedCodes.includes(item.code);
          return (
            <View key={item.code} style={styles.checkItem}>
              <View style={[styles.checkbox, isUnlocked && styles.checkboxUnlocked]}>
                {isUnlocked && <FontAwesome name="check" size={10} color="#fff" />}
              </View>
              <Text style={[styles.itemText, isUnlocked && styles.itemTextUnlocked]}>
                {item.title}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  checklist: {
    marginTop: 5,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  checkboxUnlocked: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success,
  },
  itemText: {
    color: COLORS.subtext,
    fontSize: 14,
  },
  itemTextUnlocked: {
    color: '#fff',
    fontWeight: '600',
  },
});
