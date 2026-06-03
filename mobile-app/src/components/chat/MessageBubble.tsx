import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';

interface MessageBubbleProps {
  text: string;
  isMe: boolean;
  timestamp: string;
  seen?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  mediaType?: 'photo' | 'video';
  reaction?: string | null;
  replyTo?: string | null;
  onDelete?: () => void;
  onReact?: (reaction: string) => void;
  onReply?: () => void;
}

const EMOJI_REACTIONS = ['❤️', '😂', '😮', '😢', '👍', '🔥'];

export const MessageBubble = ({
  text,
  isMe,
  timestamp,
  seen,
  status,
  mediaUrl,
  mediaType,
  reaction,
  replyTo,
  onDelete,
  onReact,
  onReply,
}: MessageBubbleProps) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const getStatusIcon = () => {
    const resolvedStatus = status || (seen ? 'read' : 'sent');
    switch (resolvedStatus) {
      case 'read':
        return { icon: 'check-circle', color: COLORS.primary };
      case 'delivered':
        return { icon: 'check-circle-o', color: COLORS.success };
      case 'sent':
      default:
        return { icon: 'check', color: COLORS.subtext };
    }
  };

  const handleLongPress = () => {
    setShowActions(true);
  };

  const statusInfo = getStatusIcon();

  return (
    <View style={[styles.container, isMe ? styles.myContainer : styles.partnerContainer]}>
      {/* Reply preview */}
      {replyTo && (
        <View style={[styles.replyPreview, isMe ? styles.myReplyPreview : styles.partnerReplyPreview]}>
          <View style={styles.replyBar} />
          <Text style={styles.replyText} numberOfLines={1}>
            {replyTo}
          </Text>
        </View>
      )}

      <TouchableOpacity
        onLongPress={handleLongPress}
        activeOpacity={0.8}
        style={[styles.bubble, isMe ? styles.myBubble : styles.partnerBubble]}
      >
        {/* Media preview */}
        {mediaUrl && mediaType === 'photo' && (
          <TouchableOpacity onPress={() => setImageModalVisible(true)}>
            <Image source={{ uri: mediaUrl }} style={styles.mediaImage} resizeMode="cover" />
          </TouchableOpacity>
        )}
        {mediaUrl && mediaType === 'video' && (
          <View style={styles.videoContainer}>
            <FontAwesome name="play-circle" size={40} color="#fff" />
            <Text style={styles.videoLabel}>Video</Text>
          </View>
        )}

        {/* Message text */}
        {text ? (
          <Text style={[styles.text, isMe ? styles.myText : styles.partnerText]}>{text}</Text>
        ) : null}
      </TouchableOpacity>

      {/* Reaction bubble */}
      {reaction && (
        <View style={[styles.reactionBubble, isMe ? styles.myReactionBubble : styles.partnerReactionBubble]}>
          <Text style={styles.reactionEmoji}>{reaction}</Text>
        </View>
      )}

      {/* Timestamp + status */}
      <View style={[styles.statusContainer, isMe ? styles.myStatusContainer : styles.partnerStatusContainer]}>
        <Text style={styles.timestamp}>{formattedTime}</Text>
        {isMe && (
          <FontAwesome name={statusInfo.icon as any} size={11} color={statusInfo.color} style={{ marginLeft: 4 }} />
        )}
      </View>

      {/* Actions Modal */}
      <Modal
        visible={showActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActions(false)}
      >
        <TouchableOpacity
          style={styles.actionOverlay}
          activeOpacity={1}
          onPress={() => { setShowActions(false); setShowReactions(false); }}
        >
          <View style={styles.actionMenu}>
            {/* Emoji Reactions row */}
            <View style={styles.emojiRow}>
              {EMOJI_REACTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[styles.emojiBtn, reaction === emoji && styles.emojiBtnActive]}
                  onPress={() => {
                    onReact?.(emoji);
                    setShowActions(false);
                  }}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actionDivider} />

            {/* Action buttons */}
            {onReply && (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => { onReply(); setShowActions(false); }}
              >
                <FontAwesome name="reply" size={16} color="#fff" />
                <Text style={styles.actionLabel}>Reply</Text>
              </TouchableOpacity>
            )}
            {isMe && onDelete && (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => { onDelete(); setShowActions(false); }}
              >
                <FontAwesome name="trash" size={16} color={COLORS.danger} />
                <Text style={[styles.actionLabel, { color: COLORS.danger }]}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Full-screen image modal */}
      {mediaUrl && (
        <Modal visible={imageModalVisible} transparent animationType="fade" onRequestClose={() => setImageModalVisible(false)}>
          <View style={styles.imageModalOverlay}>
            <TouchableOpacity style={styles.imageModalClose} onPress={() => setImageModalVisible(false)}>
              <FontAwesome name="times" size={24} color="#fff" />
            </TouchableOpacity>
            <Image source={{ uri: mediaUrl }} style={styles.fullImage} resizeMode="contain" />
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  myContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  partnerContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 6,
    marginBottom: 4,
    maxWidth: '100%',
  },
  myReplyPreview: { alignSelf: 'flex-end' },
  partnerReplyPreview: { alignSelf: 'flex-start' },
  replyBar: {
    width: 3,
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginRight: 8,
  },
  replyText: {
    color: COLORS.subtext,
    fontSize: 11,
    flex: 1,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '100%',
  },
  myBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  partnerBubble: {
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: 4,
  },
  mediaImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 4,
  },
  videoContainer: {
    width: 200,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  videoLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  myText: { color: '#fff' },
  partnerText: { color: '#eee' },
  reactionBubble: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#333',
  },
  myReactionBubble: { left: -10 },
  partnerReactionBubble: { right: -10 },
  reactionEmoji: { fontSize: 14 },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  myStatusContainer: { justifyContent: 'flex-end' },
  partnerStatusContainer: { justifyContent: 'flex-start' },
  timestamp: {
    color: COLORS.subtext,
    fontSize: 10,
  },
  actionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionMenu: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    width: 260,
    borderWidth: 1,
    borderColor: '#333',
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  emojiBtn: {
    padding: 6,
    borderRadius: 20,
  },
  emojiBtnActive: {
    backgroundColor: 'rgba(255, 77, 141, 0.2)',
  },
  emojiText: { fontSize: 22 },
  actionDivider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 12,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 15,
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
});
