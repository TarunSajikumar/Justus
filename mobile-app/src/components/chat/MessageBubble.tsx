import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

interface MessageBubbleProps {
  text: string;
  isMe: boolean;
  timestamp: string;
}

export const MessageBubble = ({ text, isMe, timestamp }: MessageBubbleProps) => {
  return (
    <View style={[styles.container, isMe ? styles.myContainer : styles.partnerContainer]}>
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.partnerBubble]}>
        <Text style={[styles.text, isMe ? styles.myText : styles.partnerText]}>
          {text}
        </Text>
      </View>
      <Text style={styles.timestamp}>{timestamp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
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
  bubble: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2,
  },
  partnerBubble: {
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: 2,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  myText: {
    color: '#fff',
  },
  partnerText: {
    color: '#eee',
  },
  timestamp: {
    color: COLORS.subtext,
    fontSize: 10,
    marginTop: 4,
  },
});
