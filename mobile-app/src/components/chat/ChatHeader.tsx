import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';

interface ChatHeaderProps {
  partnerName: string;
  isOnline: boolean;
  lastSeen?: string | Date | null;
  onSearch?: () => void;
  onCall?: () => void;
}

function formatLastSeen(lastSeenDateStr?: string | Date | null): string {
  if (!lastSeenDateStr) return 'Offline';
  try {
    const lastSeen = new Date(lastSeenDateStr);
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();

    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Away (just now)';
    if (mins < 60) return `Away (${mins}m ago)`;

    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Away (${hours}h ago)`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `Away (${days}d ago)`;

    return 'Away';
  } catch {
    return 'Away';
  }
}

export const ChatHeader = ({ partnerName, isOnline, lastSeen, onSearch, onCall }: ChatHeaderProps) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.left}>
          <TouchableOpacity style={styles.avatar}>
            <FontAwesome name="user" size={18} color={COLORS.subtext} />
          </TouchableOpacity>
          <View>
            <Text style={styles.name}>{partnerName}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, isOnline && styles.statusDotOnline]} />
              <Text style={[styles.status, isOnline && styles.onlineText]}>
                {isOnline ? 'Online now ❤️' : formatLastSeen(lastSeen)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.right}>
          {onSearch && (
            <TouchableOpacity style={styles.iconBtn} onPress={onSearch}>
              <FontAwesome name="search" size={18} color="#fff" />
            </TouchableOpacity>
          )}
          {onCall && (
            <TouchableOpacity style={styles.iconBtn} onPress={onCall}>
              <FontAwesome name="phone" size={20} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconBtn}>
            <FontAwesome name="video-camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: Platform.OS === 'android' ? 30 : 0,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.subtext,
  },
  statusDotOnline: {
    backgroundColor: COLORS.success,
  },
  status: {
    color: COLORS.subtext,
    fontSize: 12,
  },
  onlineText: {
    color: COLORS.success,
  },
  right: {
    flexDirection: 'row',
  },
  iconBtn: {
    marginLeft: 18,
    padding: 5,
  },
});
