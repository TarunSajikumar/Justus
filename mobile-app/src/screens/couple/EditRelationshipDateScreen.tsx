import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { FontAwesome } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

type DateType = 'since' | 'anniversary' | 'meet';

export default function EditRelationshipDateScreen({ navigation }: any) {
  const {
    relationshipStartDate,
    setRelationshipStartDate,
    anniversaryDate,
    setAnniversaryDate,
    nextMeetDate,
    setNextMeetDate,
    partner,
  } = useAuthStore();

  const [selectedSince, setSelectedSince] = useState<Date>(
    relationshipStartDate ? new Date(relationshipStartDate) : new Date()
  );
  const [selectedAnniversary, setSelectedAnniversary] = useState<Date>(
    anniversaryDate ? new Date(anniversaryDate) : new Date()
  );
  const [selectedMeet, setSelectedMeet] = useState<Date>(
    nextMeetDate ? new Date(nextMeetDate) : new Date(Date.now() + 86400000 * 7) // + 7 days default
  );

  const [activePicker, setActivePicker] = useState<DateType | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const calculateDays = (date: Date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffMs = now.getTime() - start.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  };

  const handleSave = async () => {
    try {
      const sinceStr = selectedSince.toISOString().split('T')[0];
      const anniversaryStr = selectedAnniversary.toISOString().split('T')[0];
      const meetStr = selectedMeet.toISOString();

      await authService.updateRelationshipDate({
        relationshipStartDate: sinceStr,
        anniversaryDate: anniversaryStr,
        nextMeetDate: meetStr,
      });

      setRelationshipStartDate(sinceStr);
      setAnniversaryDate(anniversaryStr);
      setNextMeetDate(meetStr);

      Alert.alert(
        "❤️ Relationship Dates Updated",
        "Your anniversaries and countdowns have been updated! ❤️",
        [{ text: "Awesome", onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert("Error", "Failed to update relationship dates.");
    }
  };

  const openPicker = (type: DateType) => {
    setActivePicker(type);
    setShowPicker(true);
  };

  const getPickerValue = () => {
    if (activePicker === 'since') return selectedSince;
    if (activePicker === 'anniversary') return selectedAnniversary;
    return selectedMeet;
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (date) {
      if (activePicker === 'since') setSelectedSince(date);
      else if (activePicker === 'anniversary') setSelectedAnniversary(date);
      else if (activePicker === 'meet') setSelectedMeet(date);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome name="chevron-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relationship Dates</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.loveHeader}>
          <Text style={styles.emoji}>💕</Text>
          <Text style={styles.loveTitle}>Your Love Story</Text>
          <Text style={styles.partnerContext}>Connected with {partner?.name || 'Partner'} ❤️</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.subLabel}>Tap any card below to select its date:</Text>

        {/* 1. Relationship Since */}
        <TouchableOpacity
          style={[styles.previewCard, activePicker === 'since' && styles.activeCard]}
          onPress={() => openPicker('since')}
        >
          <Text style={styles.cardLabel}>Relationship Since</Text>
          <Text style={styles.cardDate}>{formatDate(selectedSince)}</Text>
          <LinearGradient
            colors={['rgba(255, 77, 109, 0.1)', 'rgba(255, 77, 109, 0.05)']}
            style={styles.daysBadge}
          >
            <Text style={styles.daysText}>{calculateDays(selectedSince)} Days Together ❤️</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* 2. Custom Anniversary */}
        <TouchableOpacity
          style={[styles.previewCard, activePicker === 'anniversary' && styles.activeCard]}
          onPress={() => openPicker('anniversary')}
        >
          <Text style={[styles.cardLabel, { color: COLORS.primary }]}>Anniversary Date</Text>
          <Text style={styles.cardDate}>{formatDate(selectedAnniversary)}</Text>
          <Text style={styles.cardDesc}>This will drive your upcoming anniversary card.</Text>
        </TouchableOpacity>

        {/* 3. Next Date Night / Meet */}
        <TouchableOpacity
          style={[styles.previewCard, activePicker === 'meet' && styles.activeCard]}
          onPress={() => openPicker('meet')}
        >
          <Text style={[styles.cardLabel, { color: COLORS.secondary }]}>Next Date Night ❤️</Text>
          <Text style={styles.cardDate}>
            {selectedMeet.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <Text style={styles.cardDesc}>This drives your live meet dashboard countdown.</Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={getPickerValue()}
            mode={activePicker === 'meet' ? 'datetime' : 'date'}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={activePicker === 'meet' ? undefined : new Date()}
            minimumDate={activePicker === 'meet' ? new Date() : undefined}
            textColor="#fff"
            themeVariant="dark"
          />
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save All Dates</Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginBottom: 20,
  },
  backBtn: { padding: 10 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' },
  loveHeader: { alignItems: 'center', marginVertical: 10 },
  emoji: { fontSize: 40, marginBottom: 5 },
  loveTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  partnerContext: { color: COLORS.primary, fontSize: 16, marginTop: 4, fontWeight: '600' },
  divider: { width: '100%', height: 1, backgroundColor: COLORS.border, marginVertical: 20 },
  subLabel: { color: COLORS.subtext, fontSize: 14, marginBottom: 20, fontStyle: 'italic', alignSelf: 'flex-start' },
  previewCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  activeCard: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255, 77, 109, 0.03)',
  },
  cardLabel: { color: COLORS.subtext, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  cardDate: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  daysBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 109, 0.3)',
  },
  daysText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 },
  cardDesc: {
    color: COLORS.subtext,
    fontSize: 12,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 18,
    width: '100%',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 20,
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
