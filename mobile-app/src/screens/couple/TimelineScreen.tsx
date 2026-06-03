import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { FontAwesome } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { timelineService, TimelineEvent } from '../../services/timelineService';
import Toast from 'react-native-toast-message';

const EVENT_TYPES = [
  { label: 'All', value: 'all', icon: 'list', color: COLORS.subtext },
  { label: 'Milestones', value: 'milestone', icon: 'trophy', color: '#FFD700' },
  { label: 'Memories', value: 'memory', icon: 'heart', color: COLORS.primary },
  { label: 'Dates', value: 'date', icon: 'calendar', color: '#4D96FF' },
  { label: 'Custom', value: 'custom', icon: 'star', color: '#6BCB77' },
];

const getEventConfig = (type: string) => {
  switch (type) {
    case 'milestone':
      return { icon: 'trophy', color: '#FFD700', bg: 'rgba(255, 215, 0, 0.12)' };
    case 'memory':
      return { icon: 'heart', color: COLORS.primary, bg: 'rgba(255, 77, 141, 0.12)' };
    case 'date':
      return { icon: 'calendar', color: '#4D96FF', bg: 'rgba(77, 150, 255, 0.12)' };
    case 'custom':
    default:
      return { icon: 'star', color: '#6BCB77', bg: 'rgba(107, 203, 119, 0.12)' };
  }
};

const formatEventDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getDaysAgo = (dateString: string) => {
  const eventDate = new Date(dateString);
  eventDate.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 0) return `In ${Math.abs(diff)} days`;
  return `${diff} days ago`;
};

interface EventFormModalProps {
  visible: boolean;
  title: string;
  eventTitle: string;
  eventDescription: string;
  eventDate: Date;
  eventType: string;
  isLoading: boolean;
  showDelete?: boolean;
  onChangeTitle: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onChangeDate: (d: Date) => void;
  onChangeType: (t: string) => void;
  onSave: () => void;
  onDelete?: () => void;
  onClose: () => void;
}

function EventFormModal({
  visible, title, eventTitle, eventDescription, eventDate, eventType,
  isLoading, showDelete, onChangeTitle, onChangeDescription, onChangeDate,
  onChangeType, onSave, onDelete, onClose,
}: EventFormModalProps) {
  const [showDateInput, setShowDateInput] = useState(false);
  const [dateStr, setDateStr] = useState(eventDate.toISOString().split('T')[0]);

  const handleDateConfirm = () => {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      onChangeDate(parsed);
      setShowDateInput(false);
    } else {
      Toast.show({ type: 'error', text1: 'Invalid date format', text2: 'Use YYYY-MM-DD' });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.content}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome name="times" size={20} color={COLORS.subtext} />
            </TouchableOpacity>
          </View>

          {/* Event Type Selector */}
          <Text style={modalStyles.label}>Event Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={modalStyles.typeRow}>
            {EVENT_TYPES.filter((t) => t.value !== 'all').map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[
                  modalStyles.typeBtn,
                  eventType === t.value && { backgroundColor: t.color, borderColor: t.color },
                ]}
                onPress={() => onChangeType(t.value)}
              >
                <FontAwesome name={t.icon as any} size={14} color={eventType === t.value ? '#fff' : t.color} />
                <Text style={[modalStyles.typeBtnText, eventType === t.value && { color: '#fff' }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Title */}
          <Text style={modalStyles.label}>Title *</Text>
          <TextInput
            style={modalStyles.input}
            value={eventTitle}
            onChangeText={onChangeTitle}
            placeholder="e.g. First kiss, First trip together..."
            placeholderTextColor="#555"
            maxLength={80}
          />

          {/* Description */}
          <Text style={modalStyles.label}>Description (optional)</Text>
          <TextInput
            style={[modalStyles.input, modalStyles.multiline]}
            value={eventDescription}
            onChangeText={onChangeDescription}
            placeholder="Add a sweet note about this moment..."
            placeholderTextColor="#555"
            multiline
            numberOfLines={3}
            maxLength={300}
          />

          {/* Date */}
          <Text style={modalStyles.label}>Date</Text>
          <TouchableOpacity style={modalStyles.datePicker} onPress={() => setShowDateInput(!showDateInput)}>
            <FontAwesome name="calendar" size={16} color={COLORS.primary} />
            <Text style={modalStyles.datePickerText}>{formatEventDate(eventDate.toISOString())}</Text>
            <FontAwesome name="chevron-down" size={12} color={COLORS.subtext} />
          </TouchableOpacity>
          {showDateInput && (
            <View style={modalStyles.dateInputRow}>
              <TextInput
                style={[modalStyles.input, { flex: 1 }]}
                value={dateStr}
                onChangeText={setDateStr}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#555"
                keyboardType="numeric"
              />
              <TouchableOpacity style={modalStyles.dateConfirmBtn} onPress={handleDateConfirm}>
                <Text style={modalStyles.dateConfirmText}>OK</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Buttons */}
          <View style={modalStyles.btnRow}>
            {showDelete && onDelete && (
              <TouchableOpacity style={modalStyles.deleteBtn} onPress={onDelete}>
                <FontAwesome name="trash" size={16} color={COLORS.danger} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
              <Text style={modalStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.saveBtn, isLoading && { opacity: 0.6 }]}
              onPress={onSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={modalStyles.saveText}>Save ❤️</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function TimelineScreen({ navigation }: any) {
  const { user, partner } = useAuthStore();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [filterType, setFilterType] = useState('all');

  // Form state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [eventType, setEventType] = useState<'milestone' | 'memory' | 'date' | 'custom'>('custom');

  const loadEvents = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await timelineService.getEvents(filterType === 'all' ? undefined : filterType);
      // Sort newest event date first
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEvents(data);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load timeline' });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filterType]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadEvents(true);
  };

  const resetForm = () => {
    setEventTitle('');
    setEventDescription('');
    setEventDate(new Date());
    setEventType('custom');
    setSelectedEvent(null);
  };

  const openAddModal = () => {
    resetForm();
    setAddModalVisible(true);
  };

  const openEditModal = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setEventTitle(event.title);
    setEventDescription(event.description || '');
    setEventDate(new Date(event.date));
    setEventType(event.type);
    setEditModalVisible(true);
  };

  const handleAddEvent = async () => {
    if (!eventTitle.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter a title' });
      return;
    }
    setIsSaving(true);
    try {
      const newEvent = await timelineService.createEvent({
        title: eventTitle.trim(),
        description: eventDescription.trim(),
        date: eventDate.toISOString(),
        type: eventType,
      });
      setEvents((prev) => [newEvent, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      resetForm();
      setAddModalVisible(false);
      Toast.show({ type: 'success', text1: 'Memory added to timeline! ❤️' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to add event' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditEvent = async () => {
    if (!selectedEvent || !eventTitle.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter a title' });
      return;
    }
    setIsSaving(true);
    try {
      const updated = await timelineService.updateEvent(selectedEvent.id, {
        title: eventTitle.trim(),
        description: eventDescription.trim(),
        date: eventDate.toISOString(),
        type: eventType,
      });
      setEvents((prev) =>
        prev
          .map((e) => (e.id === selectedEvent.id ? updated : e))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
      resetForm();
      setEditModalVisible(false);
      Toast.show({ type: 'success', text1: 'Event updated! ❤️' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update event' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    Alert.alert(
      'Delete Event',
      'Remove this memory from your timeline? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await timelineService.deleteEvent(selectedEvent.id);
              setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
              setEditModalVisible(false);
              Toast.show({ type: 'success', text1: 'Event deleted' });
            } catch {
              Toast.show({ type: 'error', text1: 'Failed to delete event' });
            }
          },
        },
      ]
    );
  };

  const filteredEvents = filterType === 'all'
    ? events
    : events.filter((e) => e.type === filterType);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <FontAwesome name="chevron-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Our Timeline</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <FontAwesome name="plus" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>💑</Text>
        <Text style={styles.heroTitle}>Our Story</Text>
        <Text style={styles.heroSubtitle}>Every moment that brought us closer ❤️</Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {EVENT_TYPES.map((t) => (
          <TouchableOpacity
            key={t.value}
            style={[
              styles.filterTab,
              filterType === t.value && styles.filterTabActive,
            ]}
            onPress={() => setFilterType(t.value)}
          >
            <FontAwesome
              name={t.icon as any}
              size={13}
              color={filterType === t.value ? '#fff' : t.color}
            />
            <Text
              style={[
                styles.filterTabText,
                filterType === t.value && styles.filterTabTextActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Timeline List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your timeline...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
          }
          contentContainerStyle={styles.timelineContent}
        >
          {filteredEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📖</Text>
              <Text style={styles.emptyTitle}>No events yet</Text>
              <Text style={styles.emptySubtitle}>
                {filterType === 'all'
                  ? 'Add your first memory to the timeline!'
                  : `No ${filterType} events yet. Add one!`}
              </Text>
              <TouchableOpacity style={styles.addFirstBtn} onPress={openAddModal}>
                <FontAwesome name="plus" size={14} color="#fff" />
                <Text style={styles.addFirstBtnText}>Add Memory</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.timeline}>
              {filteredEvents.map((event, index) => {
                const config = getEventConfig(event.type);
                const isLast = index === filteredEvents.length - 1;
                return (
                  <View key={event.id} style={styles.eventRow}>
                    {/* Timeline spine */}
                    <View style={styles.spineColumn}>
                      <View style={[styles.eventDot, { backgroundColor: config.color, shadowColor: config.color }]} />
                      {!isLast && <View style={styles.spine} />}
                    </View>

                    {/* Event card */}
                    <TouchableOpacity
                      style={[styles.eventCard, { borderLeftColor: config.color }]}
                      onPress={() => openEditModal(event)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.eventIconBadge, { backgroundColor: config.bg }]}>
                        <FontAwesome name={config.icon as any} size={16} color={config.color} />
                      </View>
                      <View style={styles.eventBody}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        {event.description ? (
                          <Text style={styles.eventDescription} numberOfLines={2}>
                            {event.description}
                          </Text>
                        ) : null}
                        <View style={styles.eventMeta}>
                          <Text style={styles.eventDate}>{formatEventDate(event.date)}</Text>
                          <View style={styles.eventDaysAgo}>
                            <Text style={styles.eventDaysAgoText}>{getDaysAgo(event.date)}</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <FontAwesome name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Add Modal */}
      <EventFormModal
        visible={addModalVisible}
        title="Add Memory ❤️"
        eventTitle={eventTitle}
        eventDescription={eventDescription}
        eventDate={eventDate}
        eventType={eventType}
        isLoading={isSaving}
        onChangeTitle={setEventTitle}
        onChangeDescription={setEventDescription}
        onChangeDate={setEventDate}
        onChangeType={(t) => setEventType(t as any)}
        onSave={handleAddEvent}
        onClose={() => { setAddModalVisible(false); resetForm(); }}
      />

      {/* Edit Modal */}
      <EventFormModal
        visible={editModalVisible}
        title="Edit Memory"
        eventTitle={eventTitle}
        eventDescription={eventDescription}
        eventDate={eventDate}
        eventType={eventType}
        isLoading={isSaving}
        showDelete
        onChangeTitle={setEventTitle}
        onChangeDescription={setEventDescription}
        onChangeDate={setEventDate}
        onChangeType={(t) => setEventType(t as any)}
        onSave={handleEditEvent}
        onDelete={handleDeleteEvent}
        onClose={() => { setEditModalVisible(false); resetForm(); }}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  backBtn: { padding: 8 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  addBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  hero: { alignItems: 'center', paddingVertical: 20 },
  heroEmoji: { fontSize: 48, marginBottom: 8 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold', letterSpacing: 0.5 },
  heroSubtitle: { color: COLORS.subtext, fontSize: 14, marginTop: 4 },
  filterContainer: { flexGrow: 0, marginBottom: 8 },
  filterContent: { paddingHorizontal: 20, gap: 8, paddingBottom: 4 },
  filterTab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  filterTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterTabText: { color: COLORS.subtext, fontSize: 13, fontWeight: '600' },
  filterTabTextActive: { color: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: COLORS.subtext, fontSize: 14 },
  timelineContent: { paddingHorizontal: 20, paddingBottom: 100 },
  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  emptySubtitle: { color: COLORS.subtext, fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
  addFirstBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, marginTop: 8 },
  addFirstBtnText: { color: '#fff', fontWeight: 'bold' },
  timeline: { paddingTop: 8 },
  eventRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  spineColumn: { width: 28, alignItems: 'center' },
  eventDot: { width: 14, height: 14, borderRadius: 7, shadowOpacity: 0.6, shadowRadius: 6, elevation: 4, marginTop: 18 },
  spine: { flex: 1, width: 2, backgroundColor: '#1a1a1a', marginTop: 4, minHeight: 40 },
  eventCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginLeft: 12, borderLeftWidth: 3, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  eventIconBadge: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  eventBody: { flex: 1 },
  eventTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  eventDescription: { color: COLORS.subtext, fontSize: 13, lineHeight: 18, marginBottom: 8 },
  eventMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventDate: { color: COLORS.subtext, fontSize: 11 },
  eventDaysAgo: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  eventDaysAgoText: { color: COLORS.subtext, fontSize: 10 },
  fab: { position: 'absolute', bottom: 30, right: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: COLORS.primary, shadowOpacity: 0.5, shadowRadius: 12 },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  content: { backgroundColor: COLORS.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  label: { color: COLORS.subtext, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 12 },
  typeRow: { flexGrow: 0, marginBottom: 4 },
  typeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#333', marginRight: 8, backgroundColor: 'transparent' },
  typeBtnText: { color: COLORS.subtext, fontSize: 13 },
  input: { backgroundColor: '#111', color: '#fff', borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, borderColor: COLORS.border },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  datePicker: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#111', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  datePickerText: { color: '#fff', fontSize: 15, flex: 1 },
  dateInputRow: { flexDirection: 'row', gap: 10, marginTop: 8, alignItems: 'center' },
  dateConfirmBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 },
  dateConfirmText: { color: '#fff', fontWeight: 'bold' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 20, alignItems: 'center' },
  deleteBtn: { width: 46, height: 46, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  cancelText: { color: COLORS.subtext, fontWeight: 'bold' },
  saveBtn: { flex: 1.5, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.primary },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
