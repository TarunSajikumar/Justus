import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { FontAwesome } from '@expo/vector-icons';
import { AddMemoryModal } from '../../components/AddMemoryModal';
import { useAuthStore } from '../../store/authStore';
import { memoryService, Memory } from '../../services/memoryService';

const { width } = Dimensions.get('window');

export default function GalleryScreen() {
  const { user } = useAuthStore();
  const coupleId = user?.couple_id;

  const [modalVisible, setModalVisible] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchMemories = useCallback(async (silent = false) => {
    if (!coupleId) {
      setIsLoading(false);
      return;
    }
    if (!silent) setIsLoading(true);
    try {
      const data = await memoryService.getMemories(coupleId);
      setMemories(data);
    } catch (err) {
      console.error('Failed to load memories:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [coupleId]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMemories(true);
  };

  const handleSaveMemory = async (imageUri: string, caption: string) => {
    if (!coupleId) return;
    setIsUploading(true);
    try {
      const newMemory = await memoryService.uploadMemory(coupleId, imageUri, caption);
      setMemories((prev) => [newMemory, ...prev]);
      setModalVisible(false);
    } catch (err: any) {
      console.error('Upload failed:', err);
      Alert.alert('Upload failed', err?.response?.data?.message || 'Could not save memory. Try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const renderMemory = ({ item }: { item: Memory }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <FontAwesome name="calendar" size={14} color={COLORS.primary} />
        <Text style={styles.dateText}>
          {new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </View>

      <Image source={{ uri: item.image_url }} style={styles.image} />

      {item.caption ? (
        <View style={styles.cardFooter}>
          <Text style={styles.caption}>{item.caption}</Text>
        </View>
      ) : null}
    </View>
  );

  if (!coupleId) {
    return (
      <View style={[styles.container, styles.centered]}>
        <FontAwesome name="heart-o" size={48} color={COLORS.primary} />
        <Text style={styles.emptyTitle}>No Couple Yet</Text>
        <Text style={styles.emptyText}>Connect with your partner to share memories together.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Our Story 📸</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <FontAwesome name="plus" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={memories}
          keyExtractor={(item) => item.id}
          renderItem={renderMemory}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <FontAwesome name="camera" size={48} color={COLORS.border} />
              <Text style={styles.emptyTitle}>No Memories Yet</Text>
              <Text style={styles.emptyText}>Tap + to add your first shared memory ❤️</Text>
            </View>
          }
        />
      )}

      <AddMemoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveMemory}
        isUploading={isUploading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 25,
    marginBottom: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  dateText: {
    color: COLORS.subtext,
    fontSize: 13,
    marginLeft: 8,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: width - 40,
  },
  cardFooter: {
    padding: 15,
  },
  caption: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: COLORS.subtext,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
