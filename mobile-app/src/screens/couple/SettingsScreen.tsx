import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { FontAwesome } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { clearAuthData } from '../../store/authStore';

export default function SettingsScreen({ navigation }: any) {
  const logout = useAuthStore((state) => state.logout);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout? ❤️",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await clearAuthData();
            logout();
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent and will delete all your shared memories. 🥺",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => {} }
      ]
    );
  };

  const SettingItem = ({ icon, label, value, onToggle, isLast, isDestructive, onPress }: any) => (
    <TouchableOpacity
      style={[styles.item, isLast && { borderBottomWidth: 0 }]}
      onPress={onPress}
      disabled={onToggle !== undefined}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, isDestructive && { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
          <FontAwesome name={icon} size={18} color={isDestructive ? COLORS.danger : COLORS.primary} />
        </View>
        <Text style={[styles.itemLabel, isDestructive && { color: COLORS.danger }]}>{label}</Text>
      </View>
      {onToggle !== undefined ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#333', true: COLORS.primary }}
        />
      ) : (
        <FontAwesome name="chevron-right" size={14} color="#333" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="chevron-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <View style={styles.section}>
          <SettingItem
            icon="moon-o"
            label="Dark Mode"
            value={darkMode}
            onToggle={setDarkMode}
          />
          <SettingItem
            icon="bell-o"
            label="Push Notifications"
            value={notifications}
            onToggle={setNotifications}
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>PRIVACY & SECURITY</Text>
        <View style={styles.section}>
          <SettingItem icon="lock" label="Vault Security" onPress={() => {}} />
          <SettingItem icon="eye-slash" label="Incognito Mode" onPress={() => {}} isLast />
        </View>

        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.section}>
          <SettingItem icon="sign-out" label="Logout" onPress={handleLogout} isDestructive />
          <SettingItem icon="trash" label="Delete Account" onPress={handleDeleteAccount} isDestructive isLast />
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>JUST US v1.0.0</Text>
          <Text style={styles.madeWith}>Made with ❤️ for Lovers</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 30 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  sectionTitle: { color: COLORS.subtext, fontSize: 12, fontWeight: 'bold', marginLeft: 25, marginBottom: 10, letterSpacing: 1.5 },
  section: { backgroundColor: COLORS.card, marginHorizontal: 20, borderRadius: 20, overflow: 'hidden', marginBottom: 25 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: '#111' },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255, 77, 109, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemLabel: { color: '#fff', fontSize: 16, fontWeight: '500' },
  footer: { alignItems: 'center', marginVertical: 40 },
  version: { color: COLORS.subtext, fontSize: 12, fontWeight: 'bold' },
  madeWith: { color: '#444', fontSize: 12, marginTop: 5 }
});
