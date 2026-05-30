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
  const partnerId = partner?.id;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Load message history from DB on mount
  const loadHistory = useCallback(async () => {
    if (!partnerId) return;
    try {
      const history = await messageService.getHistory(partnerId);
      setMessages(history);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Connect socket for real-time delivery
  useEffect(() => {
    if (!partnerId || !user?.id) return;

    const setup = async () => {
      const socket = await socketService.connect();

      // Emit online status immediately after connection
      socketService.emitUserOnline(user.id);

      // Join the partner's dedicated room
      socketService.joinRoom(partnerId);

      // Receive real-time messages from partner
      socketService.onMessage((incomingMessage: any) => {
        // Avoid duplicates if we already persisted it ourselves
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === incomingMessage.id);
          if (exists) return prev;
          return [...prev, incomingMessage];
        });

        // Auto-scroll to the new message
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });

      socket?.on('user_status_change', (data: { userId: string; status: string }) => {
        if (data.userId === partner?.id) {
          setIsPartnerOnline(data.status === 'online');
        }
      });

      // Typing indicator listener
      socketService.onTyping(({ userId }) => {
        if (userId === partner?.id) {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
          }, 2000);
        }
      });
    };

    setup();

    return () => {
      socketService.disconnect();
    };
  }, [partnerId, user?.id, partner?.id]);

  const handleSend = async (text: string) => {
    if (!partnerId || !text.trim()) return;

    try {
      // 1. Persist to DB
      const saved = await messageService.sendMessage(partnerId, text.trim());

      // 2. Add to local state immediately (optimistic)
      setMessages((prev) => [...prev, saved]);

      // 3. Emit via socket so partner gets it in real-time
      socketService.sendMessage(partnerId, text.trim());

      // 4. Auto-scroll to the new message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (!partnerId) {
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

      {isTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>{partner?.name} is typing...</Text>
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
          renderItem={({ item }) => (
            <MessageBubble
              text={item.message}
              isMe={item.sender_id === user?.id}
              timestamp={item.created_at}
              seen={item.read}
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
        <ChatInput onSendMessage={handleSend} partnerId={partnerId} />
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
  typingIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  typingText: {
    color: COLORS.subtext,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
