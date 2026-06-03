import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
  TextInput,
  Modal,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { clearAuthData, useAuthStore } from '../../store/authStore';
import { userService } from '../../services/userService';
import { api } from '../../services/api';
import Toast from 'react-native-toast-message';

// ============ Types ============
interface SettingRowProps {
  icon: string;
  iconColor?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightContent?: React.ReactNode;
  danger?: boolean;
  last?: boolean;
}

interface SectionHeaderProps {
  title: string;
}

// ============ Sub-components (memoized for performance) ============
const SectionHeader = React.memo(({ title }: SectionHeaderProps) => (
  <Text style={styles.sectionTitle}>{title}</Text>
));

SectionHeader.displayName = 'SectionHeader';

const SettingRow = React.memo(({
  icon,
  iconColor,
  label,
  value,
  onPress,
  rightContent,
  danger,
  last,
}: SettingRowProps) => {
  const handlePress = useCallback(() => {
    if (onPress) onPress();
  }, [onPress]);

  const backgroundColor = iconColor ? `${iconColor}18` : '#1e1e1e';
  const iconColorToUse = iconColor || COLORS.subtext;

  return (
    <TouchableOpacity
      style={[styles.settingRow, last && styles.settingRowLast]}
      onPress={handlePress}
      disabled={!onPress && !rightContent}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingIcon, { backgroundColor }]}>
        <FontAwesome name={icon as any} size={15} color={iconColorToUse} />
      </View>
      <Text style={[styles.settingLabel, danger && { color: COLORS.danger }]}>
        {label}
      </Text>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {rightContent}
        {onPress && !rightContent && (
          <FontAwesome name="chevron-right" size={12} color="#444" />
        )}
      </View>
    </TouchableOpacity>
  );
});

SettingRow.displayName = 'SettingRow';

// ============ Main Component ============
export default function SettingsScreen({ navigation }: any) {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  // Notification preferences
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifMilestones, setNotifMilestones] = useState(true);
  const [notifPings, setNotifPings] = useState(true);

  // Modal states
  const [nicknameModal, setNicknameModal] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(user?.partnerNickname || '');
  const [isSavingNickname, setIsSavingNickname] = useState(false);

  const [pingModal, setPingModal] = useState(false);
  const [pingInput, setPingInput] = useState(user?.partnerPingMessage || 'I miss you, where are you? ❤️');
  const [isSavingPing, setIsSavingPing] = useState(false);

  // ============ Memoized Values ============
  const initials = useMemo(() => {
    if (!user?.name) return '?';
    return user.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [user?.name]);

  const displayStatus = useMemo(() => {
    return user?.relationship_status === 'couple'
      ? 'In a Relationship ❤️'
      : 'Solo Mode';
  }, [user?.relationship_status]);

  const statusColor = useMemo(() => {
    return user?.relationship_status === 'couple' ? COLORS.success : COLORS.subtext;
  }, [user?.relationship_status]);

  // ============ Handlers ============
  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearAuthData();
            logout();
            Toast.show({ type: 'success', text1: 'Logged out successfully' });
          } catch (error) {
            Toast.show({ type: 'error', text1: 'Logout failed', text2: 'Please try again' });
          }
        },
      },
    ]);
  }, [logout]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      '⚠️ This will permanently delete your account and ALL your data. This action is IRREVERSIBLE.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete('/auth/account');
              await clearAuthData();
              logout();
              Toast.show({ type: 'success', text1: 'Account deleted permanently' });
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Failed to delete account',
                text2: error?.response?.data?.message || 'Please contact support',
              });
            }
          },
        },
      ]
    );
  }, [logout]);

  const handleSaveNickname = useCallback(async () => {
    const trimmedNickname = nicknameInput.trim();
    if (!trimmedNickname) {
      Toast.show({ type: 'info', text1: 'Nickname cannot be empty' });
      return;
    }

    setIsSavingNickname(true);
    try {
      await userService.updatePartnerNickname(trimmedNickname);
      if (user) setUser({ ...user, partnerNickname: trimmedNickname });
      setNicknameModal(false);
      Toast.show({ type: 'success', text1: 'Nickname saved ❤️' });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Could not save nickname',
        text2: error?.response?.data?.message || 'Please try again later',
      });
    } finally {
      setIsSavingNickname(false);
    }
  }, [nicknameInput, user, setUser]);

  const handleSavePing = useCallback(async () => {
    const trimmedPing = pingInput.trim();
    const finalMessage = trimmedPing || 'I miss you, where are you? ❤️';

    setIsSavingPing(true);
    try {
      await userService.updatePingMessage(finalMessage);
      if (user) setUser({ ...user, partnerPingMessage: finalMessage });
      setPingModal(false);
      Toast.show({ type: 'success', text1: 'Ping message saved ❤️' });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Could not save message',
        text2: error?.response?.data?.message || 'Please try again later',
      });
    } finally {
      setIsSavingPing(false);
    }
  }, [pingInput, user, setUser]);

  const handlePrivacyPolicy = useCallback(() => {
    Alert.alert('Privacy Policy', 'View our privacy policy at justus.app/privacy');
  }, []);

  const handleTermsOfService = useCallback(() => {
    Alert.alert('Terms of Service', 'View our terms at justus.app/terms');
  }, []);

  const handleContactSupport = useCallback(() => {
    Alert.alert('Contact Support', 'How would you like to reach us?', [
      { text: 'Email', onPress: () => Alert.alert('Email', 'support@justus.app') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, []);

  const truncatedPingMessage = useMemo(() => {
    if (!user?.partnerPingMessage) return 'Default';
    const msg = user.partnerPingMessage;
    return msg.length > 22 ? `"${msg.slice(0, 22)}…"` : `"${msg}"`;
  }, [user?.partnerPingMessage]);

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Settings</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileContact}>
              {user?.phone || user?.email || 'No contact info'}
            </Text>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={styles.statusText}>{displayStatus}</Text>
            </View>
          </View>
        </View>

        {/* Partner Settings (only when coupled) */}
        {user?.relationship_status === 'couple' && (
          <>
            <SectionHeader title="PARTNER" />
            <View style={styles.settingGroup}>
              <SettingRow
                icon="heart"
                iconColor={COLORS.primary}
                label="Partner Nickname"
                value={user?.partnerNickname || 'Not set'}
                onPress={() => setNicknameModal(true)}
              />
              <SettingRow
                icon="bell"
                iconColor="#FF9F43"
                label="Miss You Ping Message"
                value={truncatedPingMessage}
                onPress={() => setPingModal(true)}
                last
              />
            </View>
          </>
        )}

        {/* Notifications */}
        <SectionHeader title="NOTIFICATIONS" />
        <View style={styles.settingGroup}>
          <SettingRow
            icon="comment"
            iconColor="#4D96FF"
            label="New Messages"
            rightContent={
              <Switch
                value={notifMessages}
                onValueChange={setNotifMessages}
                trackColor={{ false: '#333', true: COLORS.primary }}
                thumbColor="#fff"
              />
            }
          />
          <SettingRow
            icon="trophy"
            iconColor="#FFD700"
            label="Milestones & Anniversaries"
            rightContent={
              <Switch
                value={notifMilestones}
                onValueChange={setNotifMilestones}
                trackColor={{ false: '#333', true: COLORS.primary }}
                thumbColor="#fff"
              />
            }
          />
          <SettingRow
            icon="bell"
            iconColor="#6BCB77"
            label="Miss You Pings"
            rightContent={
              <Switch
                value={notifPings}
                onValueChange={setNotifPings}
                trackColor={{ false: '#333', true: COLORS.primary }}
                thumbColor="#fff"
              />
            }
            last
          />
        </View>

        {/* Account */}
        <SectionHeader title="ACCOUNT" />
        <View style={styles.settingGroup}>
          <SettingRow
            icon="shield"
            iconColor="#9B5DE5"
            label="Privacy Policy"
            onPress={handlePrivacyPolicy}
          />
          <SettingRow
            icon="file-text-o"
            iconColor={COLORS.subtext}
            label="Terms of Service"
            onPress={handleTermsOfService}
          />
          <SettingRow
            icon="envelope-o"
            iconColor="#4D96FF"
            label="Contact Support"
            onPress={handleContactSupport}
            last
          />
        </View>

        {/* App Info */}
        <SectionHeader title="APP" />
        <View style={styles.settingGroup}>
          <SettingRow
            icon="info-circle"
            iconColor={COLORS.subtext}
            label="Version"
            value="1.0.0"
            last
          />
        </View>

        {/* Danger Zone */}
        <SectionHeader title="DANGER ZONE" />
        <View style={styles.settingGroup}>
          <SettingRow
            icon="sign-out"
            iconColor={COLORS.danger}
            label="Logout"
            onPress={handleLogout}
            danger
          />
          <SettingRow
            icon="trash-o"
            iconColor={COLORS.danger}
            label="Delete Account"
            onPress={handleDeleteAccount}
            danger
            last
          />
        </View>
      </ScrollView>

      {/* Nickname Modal */}
      <Modal
        visible={nicknameModal}
        transparent
        animationType="slide"
        onRequestClose={() => setNicknameModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContent}
            >
              <View style={styles.modalInner}>
                <Text style={styles.modalTitle}>Partner Nickname</Text>
                <Text style={styles.modalSub}>
                  What do you call your partner? This is just for you.
                </Text>
                <TextInput
                  style={styles.modalInput}
                  value={nicknameInput}
                  onChangeText={setNicknameInput}
                  placeholder="e.g. Babe, Honey, My Love…"
                  placeholderTextColor="#555"
                  maxLength={30}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleSaveNickname}
                />
                <Text style={styles.charCount}>{nicknameInput.length}/30</Text>
                <View style={styles.modalBtns}>
                  <TouchableOpacity
                    style={styles.modalCancel}
                    onPress={() => setNicknameModal(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalSave, isSavingNickname && styles.disabledButton]}
                    onPress={handleSaveNickname}
                    disabled={isSavingNickname}
                  >
                    {isSavingNickname ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.modalSaveText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Ping Message Modal */}
      <Modal
        visible={pingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setPingModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContent}
            >
              <View style={styles.modalInner}>
                <Text style={styles.modalTitle}>Miss You Ping</Text>
                <Text style={styles.modalSub}>
                  What message do you want to send when you miss your partner?
                </Text>
                <TextInput
                  style={[styles.modalInput, styles.modalInputMultiline]}
                  value={pingInput}
                  onChangeText={setPingInput}
                  placeholder="I miss you, where are you? ❤️"
                  placeholderTextColor="#555"
                  multiline
                  maxLength={120}
                  autoFocus
                  returnKeyType="done"
                />
                <Text style={styles.charCount}>{pingInput.length}/120</Text>
                <View style={styles.modalBtns}>
                  <TouchableOpacity
                    style={styles.modalCancel}
                    onPress={() => setPingModal(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalSave, isSavingPing && styles.disabledButton]}
                    onPress={handleSavePing}
                    disabled={isSavingPing}
                  >
                    {isSavingPing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.modalSaveText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

// ============ Styles ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  contentContainer: {
    paddingBottom: 80,
  },
  pageTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },

  // Profile card
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  profileContact: {
    color: COLORS.subtext,
    fontSize: 13,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    color: COLORS.subtext,
    fontSize: 12,
  },

  // Sections
  sectionTitle: {
    color: COLORS.subtext,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 6,
  },
  settingGroup: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    gap: 12,
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    flex: 1,
    color: '#ddd',
    fontSize: 14,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    color: COLORS.subtext,
    fontSize: 13,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  modalInner: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  modalSub: {
    color: COLORS.subtext,
    fontSize: 13,
    marginBottom: 18,
    lineHeight: 20,
  },
  modalInput: {
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  modalInputMultiline: {
    height: 90,
    textAlignVertical: 'top',
  },
  charCount: {
    color: COLORS.subtext,
    fontSize: 11,
    textAlign: 'right',
    marginBottom: 16,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
  },
  modalCancelText: {
    color: COLORS.subtext,
    fontWeight: 'bold',
  },
  modalSave: {
    flex: 2,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
