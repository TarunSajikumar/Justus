import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Button } from './Button';

interface AddMemoryModalProps {
  visible: boolean;
  onClose: () => void;
  /** Called with (imageUri, caption). Parent handles the actual upload. */
  onSave: (imageUri: string, caption: string) => void;
  isUploading?: boolean;
}

export const AddMemoryModal = ({ visible, onClose, onSave, isUploading = false }: AddMemoryModalProps) => {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!image) return;
    onSave(image, caption.trim());
    // Reset state after save initiated (parent controls modal close)
    setImage(null);
    setCaption('');
  };

  const handleClose = () => {
    setImage(null);
    setCaption('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>New Memory ❤️</Text>
            <TouchableOpacity onPress={handleClose} disabled={isUploading}>
              <FontAwesome name="times" size={24} color={COLORS.subtext} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.imagePicker} onPress={pickImage} disabled={isUploading}>
            {image ? (
              <Image source={{ uri: image }} style={styles.preview} />
            ) : (
              <View style={styles.placeholder}>
                <FontAwesome name="camera" size={40} color="#444" />
                <Text style={styles.placeholderText}>Select a Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Write a caption..."
            placeholderTextColor="#777"
            value={caption}
            onChangeText={setCaption}
            multiline
            editable={!isUploading}
          />

          {isUploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.uploadingText}>Uploading memory...</Text>
            </View>
          ) : (
            <Button
              title="Save Memory ❤️"
              onPress={handleSave}
              loading={false}
              disabled={!image}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  imagePicker: {
    width: '100%',
    height: 220,
    backgroundColor: '#111',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.subtext,
    marginTop: 10,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#111',
    borderRadius: 15,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  uploadingText: {
    color: COLORS.subtext,
    marginLeft: 10,
    fontSize: 14,
  },
});
