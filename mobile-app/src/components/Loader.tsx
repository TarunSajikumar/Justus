import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { COLORS } from '../theme/colors';

const Loader = ({ visible }: { visible: boolean }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.container}>
      <View style={styles.loaderBox}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    </View>
  </Modal>
);

export default Loader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderBox: {
    padding: 30,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
});
