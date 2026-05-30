import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  TextInput,
  Modal
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { FontAwesome } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { BlurView } from 'expo-blur';
import { Button } from '../../components/Button';
import Toast from 'react-native-toast-message';

export default function VaultScreen({ navigation }: any) {
  const [locked, setLocked] = useState(true);
  const [activeTab, setActiveTab] = useState('photos');
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [secretNote, setSecretNote] = useState('');
  const [notes, setNotes] = useState<any[]>([
    { id: '1', text: 'Open on our 1st Anniversary ❤️', date: 'Jan 12, 2025' }
  ]);

  const authenticate = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock your Private Vault 🔒',
    });

    if (result.success) {
      setLocked(false);
    }
  };

  const handleSaveNote = () => {
    if (!secretNote.trim()) return;
    const newNote = {
      id: Date.now().toString(),
      text: secretNote,
      date: new Date().toLocaleDateString()
    };
    setNotes([newNote, ...notes]);
    setSecretNote('');
    setNoteModalVisible(false);
    Toast.show({
      type: 'success',
      text1: 'Note Hidden 🔒',
      text2: 'Only you and your partner can see this.'
    });
  };

  if (locked) {
    return (
      <View style={styles.lockedContainer}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        <FontAwesome name="lock" size={80} color={COLORS.primary} />
        <Text style={styles.lockedTitle}>Private Vault</Text>
        <Text style={styles.lockedSub}>Encrypted, private, and secure.</Text>
        <Button title="Unlock Vault" onPress={authenticate} style={{ width: 200 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="chevron-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Private Vault 🔒</Text>
        <TouchableOpacity onPress={() => setLocked(true)}>
          <FontAwesome name="sign-out" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'photos' && styles.activeTab]}
          onPress={() => setActiveTab('photos')}
        >
          <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>Photos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
          onPress={() => setActiveTab('notes')}
        >
          <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>Secret Notes</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'photos' ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="image" size={50} color="#333" />
          <Text style={styles.emptyText}>No hidden photos yet.</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.noteCard}>
              <View style={styles.noteHeader}>
                <FontAwesome name="sticky-note-o" size={16} color={COLORS.primary} />
                <Text style={styles.noteDate}>{item.date}</Text>
              </View>
              <Text style={styles.noteText}>{item.text}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => activeTab === 'notes' ? setNoteModalVisible(true) : Alert.alert('Photos', 'Photo upload logic reused from Memories.')}
      >
        <FontAwesome name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal visible={noteModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Secret Note 🔒</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Write something for your partner..."
              placeholderTextColor="#777"
              multiline
              value={secretNote}
              onChangeText={setSecretNote}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setNoteModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNote}>
                <Text style={styles.saveText}>Hide Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 60 },
  lockedContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 40 },
  lockedTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 20 },
  lockedSub: { color: COLORS.subtext, textAlign: 'center', marginTop: 10, marginBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 20 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  tabBar: { flexDirection: 'row', marginHorizontal: 25, marginBottom: 20, backgroundColor: COLORS.card, borderRadius: 15, padding: 5 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#222' },
  tabText: { color: COLORS.subtext, fontWeight: '600' },
  activeTabText: { color: COLORS.primary },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#444', fontSize: 16, marginTop: 15 },
  list: { paddingHorizontal: 25 },
  noteCard: { backgroundColor: COLORS.card, borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#222' },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  noteDate: { color: COLORS.subtext, fontSize: 12 },
  noteText: { color: '#eee', fontSize: 15, lineHeight: 22 },
  fab: { position: 'absolute', bottom: 40, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 25 },
  modalContent: { backgroundColor: COLORS.card, borderRadius: 25, padding: 25 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  noteInput: { backgroundColor: '#111', borderRadius: 15, padding: 15, color: '#fff', fontSize: 16, minHeight: 150, textAlignVertical: 'top', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: { padding: 15 },
  cancelText: { color: COLORS.subtext, fontSize: 16, fontWeight: '600' },
  saveBtn: { backgroundColor: COLORS.primary, paddingVertical: 15, paddingHorizontal: 25, borderRadius: 15 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
