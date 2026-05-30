import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { ChatHeader } from '../../components/chat/ChatHeader';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { ChatInput } from '../../components/chat/ChatInput';
import { socketService } from '../../services/socket';
import { useAuthStore } from '../../store/authStore';
import { messageService, ChatMessage } from '../../services/messageService';

export default function ChatScreen() {
  const { user, partner } = useAuthStore();
  const coupleId = user?.couple_id;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Load message history from DB on mount
  const loadHistory = useCallback(async () => {
    if (!coupleId) return;
    try {
      const history = await messageService.getHistory(coupleId);
      setMessages(history);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [coupleId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Connect socket for real-time delivery
  useEffect(() => {
    if (!coupleId || !user?.id) return;

    const setup = async () => {
      const socket = await socketService.connect();

      // Join the couple's dedicated room
      socket?.emit('join_room', coupleId);

      // Receive real-time messages from partner
      socketService.onMessage((incomingMessage: any) => {
        // Avoid duplicates if we already persisted it ourselves
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === incomingMessage.id);
          if (exists) return prev;
          return [...prev, incomingMessage];
        });
      });

      socket?.on('user_status_change', (data: { userId: string; status: string }) => {
        if (data.userId === partner?.id) {
          setIsPartnerOnline(data.status === 'online');
        }
      });
    };

    setup();

    return () => {
      socketService.disconnect();
    };
  }, [coupleId, user?.id, partner?.id]);

  const handleSend = async (text: string) => {
    if (!coupleId || !text.trim()) return;

    try {
      // 1. Persist to DB
      const saved = await messageService.sendMessage(coupleId, text.trim());

      // 2. Add to local state immediately (optimistic)
      setMessages((prev) => [...prev, saved]);

      // 3. Emit via socket so partner gets it in real-time
      socketService.sendMessage({ roomId: coupleId, text: text.trim(), id: saved.id });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (!coupleId) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.emptyText}>Connect with a partner first to start chatting 💌</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ChatHeader
        partnerName={partner?.name || 'My Partner'}
        isOnline={isPartnerOnline}
      />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              text={item.message}
              isMe={item.sender_id === user?.id}
              timestamp={item.created_at}
            />
          )}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No messages yet. Say hi! 👋</Text>
            </View>
          }
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ChatInput onSendMessage={handleSend} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: COLORS.subtext,
    fontSize: 15,
    textAlign: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
});
