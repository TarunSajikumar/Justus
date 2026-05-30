import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { notificationService } from '../../services/notificationService';
import Toast from 'react-native-toast-message';
import FloatingActionMenu from '../../components/FloatingActionMenu';
import { socketService } from '../../services/socket';
import { api } from '../../services/api';
import { moodService } from '../../services/moodService';
import { noteService } from '../../services/noteService';
import { achievementService } from '../../services/achievementService';
import MoodCard from '../../components/home/MoodCard';
import AnniversaryCard from '../../components/home/AnniversaryCard';
import MeetCountdownCard from '../../components/home/MeetCountdownCard';
import AchievementsCard from '../../components/home/AchievementsCard';

function getDaysOfLove(startDate?: string | null): number {
  if (!startDate) return 0;
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diffMs = now.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning ❤️';
  if (hour < 17) return 'Good Afternoon ❤️';
  return 'Good Evening ❤️';
}

function formatLastSeen(lastSeenDateStr?: string | Date | null) {
  if (!lastSeenDateStr) return 'Offline';
  const lastSeen = new Date(lastSeenDateStr);
  const now = new Date();
  const diffMs = now.getTime() - lastSeen.getTime();

  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Offline';
  if (mins < 60) return `Last seen ${mins} mins ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Last seen ${hours} hour${hours > 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  return `Last seen ${days} day${days > 1 ? 's' : ''} ago`;
}

export default function CoupleHomeScreen({ navigation }: any) {
  const {
    user,
    partner,
    relationshipStartDate,
    anniversaryDate,
    nextMeetDate,
    partnerNickname,
  } = useAuthStore();

  const [isSendingPing, setIsSendingPing] = useState(false);

  // States for dynamic integrations
  const [partnerStatus, setPartnerStatus] = useState<{ isOnline: boolean; lastSeen: string | null } | null>(null);
  const [partnerMood, setPartnerMood] = useState<{ mood: string } | null>(null);
  const [partnerNote, setPartnerNote] = useState<{ content: string } | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // Note Modal States
  const [isNoteModalVisible, setNoteModalVisible] = useState(false);
  const [noteInput, setNoteInput] = useState('');

  const displayName = partnerNickname || partner?.name || 'Partner';
  const coupleName = user?.name ? `You & ${displayName}` : 'My Relationship';
  const daysOfLove = getDaysOfLove(relationshipStartDate);

  // Miss You trigger
  const sendMissYouNotification = async (customMessage?: string) => {
    if (isSendingPing) return;
    setIsSendingPing(true);

    try {
      await notificationService.sendMissYouPing(customMessage);
      Toast.show({
        type: 'success',
        text1: '❤️ Ping Sent',
        text2: customMessage ? `Sent: "${customMessage}"` : 'Miss You notification sent ❤️',
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to send ❤️',
        text2: err?.response?.data?.message || 'Partner might be offline',
      });
    } finally {
      setIsSendingPing(false);
    }
  };

  const handleQuickPing = (message: string) => {
    sendMissYouNotification(message);
  };

  const fetchDashboardData = async () => {
    if (!partner) return;
    try {
      const [statusRes, moodRes, noteRes, achRes] = await Promise.all([
        api.get('/users/partner-status').catch(() => null),
        moodService.getPartnerMood().catch(() => null),
        noteService.getPartnerNote().catch(() => null),
        achievementService.getAchievements().catch(() => null),
      ]);

      if (statusRes) setPartnerStatus(statusRes.data);
      if (moodRes) setPartnerMood(moodRes);
      if (noteRes) setPartnerNote(noteRes);
      if (achRes && achRes.success) {
        setUnlockedAchievements(achRes.achievements.map((a: any) => a.code));
      }
    } catch (err) {
      console.log('Error loading dashboard data', err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Socket sync and initial fetch
  useEffect(() => {
    let active = true;

    const setupDashboard = async () => {
      // 1. Initial dashboard fetch
      await fetchDashboardData();

      // 2. Establish and connect WebSocket
      let socket = socketService.getSocket();
      if (!socket) {
        socket = await socketService.connect();
      }

      if (user?._id) {
        socketService.emitUserOnline(user._id);
      }

      // 3. Listen to real-time status changes
      socket?.on('user_status_change', (data: { userId: string; status: string; lastSeen?: string }) => {
        if (partner && data.userId === partner._id) {
          if (active) {
            setPartnerStatus({
              isOnline: data.status === 'online',
              lastSeen: data.lastSeen ? data.lastSeen : null,
            });
            // Re-fetch partner mood & note in case they uploaded/changed something on status change
            moodService.getPartnerMood().then(setPartnerMood).catch(() => null);
            noteService.getPartnerNote().then(setPartnerNote).catch(() => null);
          }
        }
      });
    };

    setupDashboard();

    // Polling interval fallback for status / moods (every 20s)
    const interval = setInterval(() => {
      if (active) fetchDashboardData();
    }, 20000);

    return () => {
      active = false;
      clearInterval(interval);
      const socket = socketService.getSocket();
      socket?.off('user_status_change');
    };
  }, [user?._id, partner?._id]);

  const handleSaveNote = async () => {
    if (!noteInput.trim()) return;
    try {
      await noteService.saveNote(noteInput);
      setNoteModalVisible(false);
      setNoteInput('');
      Toast.show({
        type: 'success',
        text1: 'Note Sent ❤️',
        text2: 'Your partner will see this sweet letter on their home screen.',
      });
      // Refresh achievements to unlock FIRST_NOTE
      const achRes = await achievementService.getAchievements().catch(() => null);
      if (achRes && achRes.success) {
        setUnlockedAchievements(achRes.achievements.map((a: any) => a.code));
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save love note.');
    }
  };

  const getPartnerStatusDisplay = () => {
    if (!partnerStatus) return 'Offline';
    if (partnerStatus.isOnline) return '🟢 Online';
    return formatLastSeen(partnerStatus.lastSeen);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.coupleName}>{coupleName}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => sendMissYouNotification()}
            onLongPress={() => {
              Alert.alert(
                'Quick Ping ❤️',
                'Choose a message to send to your partner',
                [
                  { text: '❤️ Miss You', onPress: () => handleQuickPing('I miss you ❤️') },
                  { text: '📞 Call Me', onPress: () => handleQuickPing('Call me when free 📞') },
                  { text: '🥺 Need You', onPress: () => handleQuickPing('I need you right now 🥺') },
                  { text: '😘 Thinking of You', onPress: () => handleQuickPing('Thinking of you 😘') },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }}
            disabled={isSendingPing}
          >
            {isSendingPing ? (
              <ActivityIndicator color={COLORS.primary} size="small" />
            ) : (
              <FontAwesome name="bell-o" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* 1. Days Together Card */}
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
          <Text style={styles.counterLabel}>Days Together ❤️</Text>
        </LinearGradient>

        {/* 2. Connected Card with Partner Status 🟢 */}
        {partner && (
          <View style={styles.partnerCard}>
            <View style={styles.partnerCardLeft}>
              <View style={styles.heartCircle}>
                <FontAwesome name="heart" size={16} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.partnerStatus}>Connected with {partner.name}</Text>
                <Text style={styles.partnerOnlineText}>{getPartnerStatusDisplay()}</Text>
              </View>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Couple</Text>
            </View>
          </View>
        )}

        {/* 3. Mood Sharing 😊 */}
        <MoodCard
          partnerName={displayName}
          partnerMoodData={partnerMood}
          onMoodSaved={fetchDashboardData}
        />

        {/* 4. Anniversary Countdown */}
        {anniversaryDate && <AnniversaryCard anniversaryDate={anniversaryDate} />}

        {/* 5. Meet Countdown (Live) */}
        {nextMeetDate && <MeetCountdownCard nextMeetDate={nextMeetDate} />}

        {/* 6. Achievements Trophies Card */}
        <AchievementsCard
          unlockedCodes={unlockedAchievements}
          onSeeAllPress={() => navigation.navigate('Achievements')}
        />

        {/* 7. Daily Love Note Card */}
        <View style={styles.noteCard}>
          <View style={styles.noteHeader}>
            <Text style={styles.noteTitle}>Daily Love Note</Text>
            <FontAwesome name="quote-right" size={14} color={COLORS.primary} />
          </View>
          {partnerNote ? (
            <Text style={styles.noteText}>"{partnerNote.content}"</Text>
          ) : (
            <Text style={[styles.noteText, { color: COLORS.subtext, fontStyle: 'italic' }]}>
              {displayName} hasn't left a love note for you today yet.
            </Text>
          )}

          <TouchableOpacity style={styles.leaveNoteBtn} onPress={() => setNoteModalVisible(true)}>
            <FontAwesome name="pencil" size={12} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.leaveNoteBtnText}>Leave Note</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Write Love Note Modal */}
      <Modal
        visible={isNoteModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pen a Daily Love Note 📝</Text>
            <TextInput
              style={styles.modalInput}
              value={noteInput}
              onChangeText={setNoteInput}
              placeholder="Good morning my love ❤️"
              placeholderTextColor="#555"
              multiline={true}
              numberOfLines={4}
              maxLength={200}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setNoteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveNote}>
                <Text style={styles.saveButtonText}>Send note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Action Menu */}
      <FloatingActionMenu />
    </View>
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
    fontSize: 72,
    fontWeight: 'bold',
  },
  counterLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
    marginTop: -5,
  },
  partnerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  partnerCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 77, 109, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  partnerStatus: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  partnerOnlineText: {
    color: COLORS.subtext,
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: 'rgba(255, 77, 109, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 109, 0.3)',
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
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
  leaveNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 15,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  leaveNoteBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 25,
    width: '85%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#111',
    color: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveButton: {
    marginLeft: 10,
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.subtext,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
