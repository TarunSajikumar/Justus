import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const actions = [
  {
    icon: 'calendar',
    label: 'Date',
    route: 'EditRelationshipDate',
    color: '#4D96FF',
  },
  {
    icon: 'lock',
    label: 'Vault',
    route: 'Vault',
    color: '#6BCB77',
  },
  {
    icon: 'history',
    label: 'Memory',
    route: 'Timeline',
    color: '#FFD93D',
  },
  {
    icon: 'pencil',
    label: 'Note',
    route: 'CreateMemory',
    color: COLORS.primary,
  },
  {
    icon: 'camera',
    label: 'Photo',
    route: 'UploadMemory',
    color: COLORS.secondary,
  },
];

export default function FloatingActionMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigation = useNavigation<any>();
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;

    Animated.spring(animation, {
      toValue,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    setIsOpen(!isOpen);
  };

  const handleAction = (route: string) => {
    toggleMenu();
    navigation.navigate(route);
  };

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const overlayOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <>
      {/* Background Overlay */}
      {isOpen && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
        </TouchableWithoutFeedback>
      )}

      <View style={styles.container} pointerEvents="box-none">
        {/* Action Items */}
        {actions.map((action, index) => {
          const translateY = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -70 * (index + 1)],
          });

          const scale = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });

          const opacity = animation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0, 1],
          });

          return (
            <Animated.View
              key={action.label}
              style={[
                styles.actionContainer,
                {
                  opacity,
                  transform: [{ translateY }, { scale }],
                },
              ]}
            >
              <Text style={styles.actionLabel}>{action.label}</Text>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: action.color }]}
                onPress={() => handleAction(action.route)}
              >
                <FontAwesome name={action.icon as any} size={20} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Main FAB */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleMenu}
          style={styles.fabContainer}
        >
          <Animated.View style={[styles.fab, { transform: [{ rotate: rotation }] }]}>
            <FontAwesome name="plus" size={24} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 24,
    bottom: 100,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  fabContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ff4f93',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#ff4f93',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 200,
    right: 0,
    bottom: 0,
    paddingBottom: 7, // Center it slightly better with the FAB
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
