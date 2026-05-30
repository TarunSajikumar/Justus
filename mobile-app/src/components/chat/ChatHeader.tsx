import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';

interface ChatHeaderProps {
  partnerName: string;
  isOnline: boolean;
}

export const ChatHeader = ({ partnerName, isOnline }: ChatHeaderProps) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.left}>
          <TouchableOpacity style={styles.avatar}>
            <FontAwesome name="user" size={18} color={COLORS.subtext} />
          </TouchableOpacity>
          <View>
            <Text style={styles.name}>{partnerName}</Text>
            <Text style={[styles.status, isOnline && styles.onlineText]}>
              {isOnline ? 'Online now ❤️' : 'Away'}
            </Text>
          </View>
        </View>

        <View style={styles.right}>
          <TouchableOpacity style={styles.iconBtn}>
            <FontAwesome name="phone" size={20} color="#fff" />
          </TouchableOpacity>
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
    marginLeft: 20,
    padding: 5,
  }
});
