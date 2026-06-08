import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { Goal } from '../../services/goalService';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface GoalsCardProps {
  goals: Goal[];
  onUpdateProgress: (goalId: string) => void;
  onAddGoal: () => void;
}

const GoalsCard: React.FC<GoalsCardProps> = ({ goals, onUpdateProgress, onAddGoal }) => {
  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  if (goals.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.emptyStateContainer}>
          <View style={styles.iconCircle}>
            <FontAwesome name="compass" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>Couple Bucket List</Text>
          <Text style={styles.emptyText}>Create a list of future plans, dreams, and adventures you want to do together!</Text>
          <TouchableOpacity style={styles.gradientBtn} onPress={onAddGoal}>
            <LinearGradient
              colors={[COLORS.primary, '#C23576']}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <FontAwesome name="plus" size={14} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.btnText}>Add First Future Goal</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.activeTitle}>💫 Our Bucket List & Goals</Text>
        <TouchableOpacity style={styles.addChallengeLink} onPress={onAddGoal}>
          <FontAwesome name="plus-circle" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
          <Text style={styles.addLinkText}>Add Goal</Text>
        </TouchableOpacity>
      </View>

      {activeGoals.length === 0 ? (
        <View style={styles.emptyActiveContainer}>
          <Text style={styles.emptyActiveText}>All current plans accomplished! Time to add more 🌍</Text>
        </View>
      ) : (
        activeGoals.map((goal) => {
          const isBucketListItem = goal.target === 1;

          if (isBucketListItem) {
            return (
              <View key={goal._id} style={styles.goalItem}>
                <View style={styles.bucketRow}>
                  <View style={styles.leftContainer}>
                    <View style={styles.emojiContainer}>
                      <Text style={styles.goalEmoji}>{goal.emoji || '✨'}</Text>
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.goalTitle} numberOfLines={2}>
                        {goal.title}
                      </Text>
                      <Text style={styles.badgeTextLabel}>Future Goal 📌</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.checkButton}
                    onPress={() => onUpdateProgress(goal._id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="ellipse-outline" size={24} color={COLORS.subtext} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }

          const progress = Math.min((goal.current / goal.target) * 100, 100);
          const progressColor =
            progress >= 80 ? '#FFD700' : progress >= 50 ? '#FF9F43' : COLORS.primary;

          return (
            <View key={goal._id} style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <View style={styles.emojiContainer}>
                  <Text style={styles.goalEmoji}>{goal.emoji || '🎯'}</Text>
                </View>
                <View style={styles.goalTitleContainer}>
                  <Text style={styles.goalTitle} numberOfLines={1}>{goal.title}</Text>
                  <Text style={styles.goalProgressLabel}>
                    Progress: <Text style={[styles.progressBold, { color: progressColor }]}>{goal.current}</Text> / {goal.target}
                  </Text>
                </View>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${progress}%`, backgroundColor: progressColor },
                    ]}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.plusButton, { shadowColor: progressColor }]}
                  onPress={() => onUpdateProgress(goal._id)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[progressColor, `${progressColor}CC`]}
                    style={styles.plusButtonGradient}
                  >
                    <Text style={styles.plusButtonText}>+1</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {completedGoals.length > 0 && (
        <View style={styles.completedSection}>
          <Text style={styles.completedLabel}>🏆 Completed Plans & Adventures</Text>
          {completedGoals.slice(0, 3).map((goal) => (
            <View key={goal._id} style={styles.completedItem}>
              <View style={styles.completedEmojiContainer}>
                <Text style={styles.completedEmoji}>{goal.emoji || '✨'}</Text>
              </View>
              <Text style={styles.completedTitle} numberOfLines={1}>
                {goal.title}
              </Text>
              <View style={styles.completedBadge}>
                <FontAwesome name="check-circle" size={12} color="#2ECC71" />
                <Text style={styles.completedBadgeText}>Done</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 8,
  },
  activeTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  addChallengeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 77, 109, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  addLinkText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 77, 109, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  emptyText: {
    color: COLORS.subtext,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  gradientBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyActiveContainer: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  emptyActiveText: {
    color: COLORS.subtext,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  goalItem: {
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  bucketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  emojiContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalEmoji: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  goalTitle: {
    color: '#fff',
    fontSize: 13.5,
    fontWeight: '600',
    lineHeight: 18,
  },
  badgeTextLabel: {
    color: COLORS.subtext,
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  checkButton: {
    padding: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalTitleContainer: {
    flex: 1,
  },
  goalProgressLabel: {
    color: COLORS.subtext,
    fontSize: 11,
    marginTop: 2,
  },
  progressBold: {
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  plusButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  plusButtonGradient: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  completedSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  completedLabel: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  completedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(46,204,113,0.04)',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(46,204,113,0.06)',
  },
  completedEmojiContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  completedEmoji: {
    fontSize: 14,
  },
  completedTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12.5,
    flex: 1,
    textDecorationLine: 'line-through',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 204, 113, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.2)',
    gap: 3,
  },
  completedBadgeText: {
    color: '#2ECC71',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default GoalsCard;
