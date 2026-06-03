import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { ChatHeader } from '../../components/chat/ChatHeader';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { ChatInput } from '../../components/chat/ChatInput';
import { socketService } from '../../services/socket';
import { useAuthStore } from '../../store/authStore';
import { messageService, ChatMessage } from '../../services/messageService';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

const PAGE_SIZE = 50;

export default function ChatScreen({ navigation }: any) {
  const { user, partner } = useAuthStore();
  const partnerId = partner?.id || partner?._id;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [partnerLastSeen, setPartnerLastSeen] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSendingMedia, setIsSendingMedia] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);

  const flatListRef = useRef<FlatList>(null);
  const shouldScrollToEnd = useRef(true);
  const typingTimeoutRef = useRef<any>(null);

  // ─── Load History ──────────────────────────────────────────────────────────
  const loadHistory = useCallback(async (isLoadMore = false) => {
    if (!partnerId) return;
    try {
      const beforeTimestamp =
        isLoadMore && messages.length > 0 ? messages[0].created_at : undefined;
      const newMessages = await messageService.getHistory(partnerId, beforeTimestamp);

      if (isLoadMore) {
        setMessages((prev) => [...newMessages, ...prev]);
        setHasMore(newMessages.length >= PAGE_SIZE);
      } else {
        setMessages(newMessages);
        setHasMore(newMessages.length >= PAGE_SIZE);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
      Toast.show({ type: 'error', text1: 'Failed to load messages' });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [partnerId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadHistory(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading && messages.length > 0) {
      setIsLoadingMore(true);
      const beforeTimestamp = messages[0].created_at;
      messageService
        .getHistory(partnerId!, beforeTimestamp)
        .then((newMessages) => {
          setMessages((prev) => [...newMessages, ...prev]);
          setHasMore(newMessages.length >= PAGE_SIZE);
        })
        .catch(console.error)
        .finally(() => setIsLoadingMore(false));
    }
  }, [isLoadingMore, hasMore, isLoading, messages, partnerId]);

  // ─── Socket Setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!partnerId || !user?.id) return;

    const setupSocket = async () => {
      const socket = await socketService.connect();

      socketService.emitUserOnline(user.id);
      socketService.joinRoom(partnerId);

      // Receive real-time messages
      socketService.onMessage((incomingMessage: any) => {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === incomingMessage.id || m.id === incomingMessage._id);
          if (exists) return prev;
          const msg: ChatMessage = {
            id: incomingMessage.id || incomingMessage._id,
            sender_id: incomingMessage.senderId || incomingMessage.sender_id,
            message: incomingMessage.message,
            read: incomingMessage.read ?? false,
            created_at: incomingMessage.createdAt || incomingMessage.created_at,
            status: 'delivered',
            media_url: incomingMessage.media_url,
            media_type: incomingMessage.media_type,
            reply_to: incomingMessage.reply_to,
          };
          return [...prev, msg];
        });

        shouldScrollToEnd.current = true;
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        messageService.markAsRead(partnerId).catch(console.error);
      });

      // Message status updates
      socketService.onMessageStatus(({ messageId, status }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, status: status as any } : msg
          )
        );
      });

      // Deletion events
      socketService.onMessageDeleted(({ messageId }) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      });

      // Reaction events
      socketService.onReaction(({ messageId, reaction }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, reaction: msg.reaction === reaction ? null : reaction }
              : msg
          )
        );
      });

      // Partner online status
      socket?.on('user_status_change', (data: { userId: string; status: string; lastSeen?: string }) => {
        if (data.userId === partner?.id || data.userId === partner?._id) {
          setIsPartnerOnline(data.status === 'online');
          if (data.status === 'offline' && data.lastSeen) {
            setPartnerLastSeen(data.lastSeen);
          }
        }
      });

      // Typing indicator
      socketService.onTyping(({ userId, isTyping: typing }) => {
        if (userId === partner?.id || userId === partner?._id) {
          setIsTyping(typing);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          if (typing) {
            typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 4000);
          }
        }
      });
    };

    setupSocket();

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socketService.disconnect();
    };
  }, [partnerId, user?.id, partner?.id, partner?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Send Message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (text: string) => {
      if (!partnerId || !text.trim() || isSending) return;

      setIsSending(true);
      const trimmedText = text.trim();
      const tempId = `temp_${Date.now()}`;
      const userId = user?.id || '';

      // Optimistic message
      const optimistic: ChatMessage = {
        id: tempId,
        sender_id: userId,
        message: trimmedText,
        read: false,
        created_at: new Date().toISOString(),
        status: 'sent',
        reply_to: replyToMessage?.message || null,
        isTemp: true,
      };

      setMessages((prev) => [...prev, optimistic]);
      setReplyToMessage(null);
      shouldScrollToEnd.current = true;
      flatListRef.current?.scrollToEnd({ animated: true });

      try {
        const saved = await messageService.sendMessage(
          partnerId,
          trimmedText,
          replyToMessage?.id
        );
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? { ...saved, status: 'sent' } : msg))
        );
        socketService.sendMessage(partnerId, trimmedText, replyToMessage?.id);
      } catch (err) {
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        Toast.show({ type: 'error', text1: 'Failed to send message' });
      } finally {
        setIsSending(false);
      }
    },
    [partnerId, user?.id, isSending, replyToMessage]
  );

  // ─── Send Media ────────────────────────────────────────────────────────────
  const handleSendMedia = useCallback(() => {
    Alert.alert('Send Media', 'Choose media type', [
      { text: 'Photo', onPress: () => pickMedia('photo') },
      { text: 'Video', onPress: () => pickMedia('video') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pickMedia = async (type: 'photo' | 'video') => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show({ type: 'error', text1: 'Permission required to access media' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === 'photo' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: type === 'photo',
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0] && partnerId) {
      setIsSendingMedia(true);
      try {
        const mediaMessage = await messageService.sendMedia(
          partnerId,
          result.assets[0].uri,
          type
        );
        setMessages((prev) => [...prev, mediaMessage]);
        socketService.sendMedia(partnerId, mediaMessage);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Failed to send media' });
      } finally {
        setIsSendingMedia(false);
      }
    }
  };

  // ─── Delete Message ────────────────────────────────────────────────────────
  const handleDeleteMessage = useCallback((messageId: string) => {
    Alert.alert('Delete Message', 'Delete this message for everyone?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await messageService.deleteMessage(messageId);
            setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
            socketService.deleteMessage(messageId);
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to delete message' });
          }
        },
      },
    ]);
  }, []);

  // ─── React to Message ──────────────────────────────────────────────────────
  const handleReactToMessage = useCallback(async (messageId: string, reaction: string) => {
    try {
      await messageService.addReaction(messageId, reaction);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, reaction: msg.reaction === reaction ? null : reaction }
            : msg
        )
      );
      socketService.sendReaction(messageId, reaction);
    } catch {
      console.error('Failed to add reaction');
    }
  }, []);

  // ─── Typing Indicator ──────────────────────────────────────────────────────
  const handleTyping = useCallback(
    (isTypingNow: boolean) => {
      if (partnerId) socketService.emitTyping(partnerId, isTypingNow);
    },
    [partnerId]
  );

  // ─── Search Messages ───────────────────────────────────────────────────────
  const handleSearchMessages = useCallback(async () => {
    if (!searchQuery.trim() || !partnerId) return;
    try {
      const results = await messageService.searchMessages(partnerId, searchQuery.trim());
      setSearchResults(results);
    } catch {
      Toast.show({ type: 'error', text1: 'Search failed' });
    }
  }, [partnerId, searchQuery]);

  // ─── Render ────────────────────────────────────────────────────────────────
  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <MessageBubble
        text={item.message}
        isMe={item.sender_id === user?.id}
        timestamp={item.created_at}
        seen={item.read}
        status={item.status}
        mediaUrl={item.media_url}
        mediaType={item.media_type}
        reaction={item.reaction}
        replyTo={item.reply_to}
        onDelete={() => handleDeleteMessage(item.id)}
        onReact={(reaction) => handleReactToMessage(item.id, reaction)}
        onReply={() => setReplyToMessage(item)}
      />
    ),
    [user?.id, handleDeleteMessage, handleReactToMessage]
  );

  if (!partnerId) {
    return (
      <View style={[styles.container, styles.centered]}>
        <FontAwesome name="heart-o" size={48} color={COLORS.primary} />
        <Text style={styles.emptyTitle}>No Connection Yet 💔</Text>
        <Text style={styles.emptyText}>Connect with a partner to start chatting</Text>
        <TouchableOpacity
          style={styles.connectButton}
          onPress={() => navigation?.navigate('SoloHome')}
        >
          <Text style={styles.connectButtonText}>Find Your Partner</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ChatHeader
        partnerName={partner?.name || 'My Partner'}
        isOnline={isPartnerOnline}
        lastSeen={partnerLastSeen || partner?.lastSeen}
        onSearch={() => setSearchModalVisible(true)}
        onCall={() => Alert.alert('Coming Soon', 'Video/Audio calls coming soon! 💕')}
      />

      {isTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>
            {partner?.name || 'Partner'} is typing
            <Text style={styles.typingDots}>...</Text>
          </Text>
        </View>
      )}

      {replyToMessage && (
        <View style={styles.replyBar}>
          <View style={styles.replyBarContent}>
            <FontAwesome name="reply" size={12} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.replyBarText} numberOfLines={1}>
              {replyToMessage.message}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setReplyToMessage(null)}>
            <FontAwesome name="times" size={14} color={COLORS.subtext} />
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          onScrollBeginDrag={() => { shouldScrollToEnd.current = false; }}
          onContentSizeChange={() => {
            if (shouldScrollToEnd.current) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
          ListHeaderComponent={
            isLoadingMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={COLORS.subtext} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <FontAwesome name="comments-o" size={48} color={COLORS.border} />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptyText}>Send a message to start the conversation 👋</Text>
            </View>
          }
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ChatInput
          onSendMessage={handleSend}
          onSendMedia={handleSendMedia}
          onTyping={handleTyping}
          partnerId={partnerId}
          isSendingMedia={isSendingMedia}
        />
      </KeyboardAvoidingView>

      {/* ─── Search Modal ─────────────────────────────────────── */}
      <Modal
        visible={searchModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => { setSearchModalVisible(false); setSearchResults([]); setSearchQuery(''); }}
      >
        <View style={styles.searchOverlay}>
          <View style={styles.searchContent}>
            <View style={styles.searchHeader}>
              <Text style={styles.searchTitle}>Search Messages</Text>
              <TouchableOpacity onPress={() => { setSearchModalVisible(false); setSearchResults([]); setSearchQuery(''); }}>
                <FontAwesome name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.searchInputRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor="#777"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchMessages}
                autoFocus
              />
              <TouchableOpacity style={styles.searchBtn} onPress={handleSearchMessages}>
                <FontAwesome name="search" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => {
                    const index = messages.findIndex((m) => m.id === item.id);
                    if (index !== -1) {
                      flatListRef.current?.scrollToIndex({ index, animated: true });
                      setSearchModalVisible(false);
                    }
                  }}
                >
                  <Text style={styles.searchResultText}>{item.message}</Text>
                  <Text style={styles.searchResultDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchQuery ? (
                  <Text style={styles.noResults}>No messages found</Text>
                ) : null
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  emptyText: { color: COLORS.subtext, fontSize: 14, textAlign: 'center', marginTop: 8 },
  connectButton: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, marginTop: 16 },
  connectButtonText: { color: '#fff', fontWeight: 'bold' },
  listContent: { padding: 20, paddingBottom: 20, flexGrow: 1 },
  typingIndicator: { paddingHorizontal: 20, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.03)', borderBottomWidth: 1, borderBottomColor: '#222' },
  typingText: { color: COLORS.subtext, fontSize: 12, fontStyle: 'italic' },
  typingDots: { letterSpacing: 2 },
  replyBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#1a1a1a', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  replyBarContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  replyBarText: { color: COLORS.subtext, fontSize: 12, flex: 1 },
  loadingMore: { padding: 16, alignItems: 'center' },
  // Search modal
  searchOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', paddingTop: 60 },
  searchContent: { flex: 1, padding: 20 },
  searchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  searchTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  searchInputRow: { flexDirection: 'row', marginBottom: 16, gap: 10 },
  searchInput: { flex: 1, backgroundColor: COLORS.card, borderRadius: 12, padding: 12, color: '#fff', fontSize: 16 },
  searchBtn: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 12, justifyContent: 'center', alignItems: 'center' },
  searchResultItem: { backgroundColor: COLORS.card, borderRadius: 12, padding: 15, marginBottom: 10 },
  searchResultText: { color: '#fff', fontSize: 14, marginBottom: 4 },
  searchResultDate: { color: COLORS.subtext, fontSize: 11 },
  noResults: { color: COLORS.subtext, textAlign: 'center', marginTop: 40 },
});
