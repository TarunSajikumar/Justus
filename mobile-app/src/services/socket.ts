import { io, Socket } from 'socket.io-client';
import { storageService } from './storageService';
import { BASE_URL } from './api';

// Derive socket URL from the API base (strip /api suffix)
const SOCKET_URL = BASE_URL.replace('/api', '');

class SocketService {
  private socket: Socket | null = null;

  async connect() {
    const token = await storageService.getItem('userToken');

    this.socket = io(SOCKET_URL, {
      auth: { token },         // JWT — backend verifies this on connect
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    this.socket.on('connect_error', (err) => {
      console.error('❌ Socket connect error:', err.message);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return this.socket;
  }

  getSocket() {
    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  /** Emit user-online event */
  emitUserOnline(userId: string) {
    this.socket?.emit('user-online', userId);
  }

  /** Join the shared room with your partner */
  joinRoom(partnerId: string) {
    this.socket?.emit('join_room', partnerId);
  }

  /** Send a text message to your partner */
  sendMessage(receiverId: string, message: string, replyToId?: string | null) {
    this.socket?.emit('send_message', { receiverId, message, reply_to: replyToId || null });
  }

  /** Send a media message object (already persisted) to partner in real-time */
  sendMedia(receiverId: string, mediaMessage: any) {
    this.socket?.emit('send_media', { receiverId, mediaMessage });
  }

  /** Notify partner that a message was deleted */
  deleteMessage(messageId: string) {
    this.socket?.emit('delete_message', { messageId });
  }

  /** Send an emoji reaction to a message */
  sendReaction(messageId: string, reaction: string) {
    this.socket?.emit('message_reaction', { messageId, reaction });
  }

  /** Emit typing indicator (true = started typing, false = stopped) */
  emitTyping(partnerId: string, isTyping: boolean) {
    this.socket?.emit('typing', { partnerId, isTyping });
  }

  /** @deprecated Use emitTyping instead */
  sendTyping(partnerId: string) {
    this.socket?.emit('typing', { partnerId, isTyping: true });
  }

  /** Listen for incoming messages */
  onMessage(callback: (message: any) => void) {
    this.socket?.off('message');
    this.socket?.on('message', callback);
  }

  /** Listen for message status updates (delivered, read) */
  onMessageStatus(callback: (data: { messageId: string; status: string }) => void) {
    this.socket?.off('message_status');
    this.socket?.on('message_status', callback);
  }

  /** Listen for message deletion events */
  onMessageDeleted(callback: (data: { messageId: string }) => void) {
    this.socket?.off('message_deleted');
    this.socket?.on('message_deleted', callback);
  }

  /** Listen for reaction events */
  onReaction(callback: (data: { messageId: string; reaction: string }) => void) {
    this.socket?.off('message_reaction');
    this.socket?.on('message_reaction', callback);
  }

  /** Listen for typing events */
  onTyping(callback: (data: { userId: string; isTyping: boolean }) => void) {
    this.socket?.off('user_typing');
    this.socket?.on('user_typing', callback);
  }

  /** Remove a specific listener */
  off(event: string) {
    this.socket?.off(event);
  }
}

export const socketService = new SocketService();
