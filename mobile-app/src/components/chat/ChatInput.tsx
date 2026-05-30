import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
}

export const ChatInput = ({ onSendMessage }: ChatInputProps) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.attachBtn}>
        <FontAwesome name="plus" size={20} color={COLORS.subtext} />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Write a love note..."
        placeholderTextColor="#777"
        value={text}
        onChangeText={setText}
        multiline
      />

      <TouchableOpacity
        style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
        onPress={handleSend}
        disabled={!text.trim()}
      >
        <FontAwesome name="paper-plane" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingHorizontal: 15,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  attachBtn: {
    padding: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
    marginHorizontal: 10,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#333',
  }
});
