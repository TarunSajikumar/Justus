import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

import CoupleHomeScreen from '../screens/couple/CoupleHomeScreen';
import ChatScreen from '../screens/couple/ChatScreen';
import GalleryScreen from '../screens/couple/GalleryScreen';
import TimelineScreen from '../screens/couple/TimelineScreen';
import SettingsScreen from '../screens/couple/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function CoupleTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.subtext,
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = 'heart';
          } else if (route.name === 'Chat') {
            iconName = 'comments';
          } else if (route.name === 'Gallery') {
            iconName = 'image';
          } else if (route.name === 'Timeline') {
            iconName = 'history';
          } else if (route.name === 'Settings') {
            iconName = 'cog';
          }

          return <FontAwesome name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={CoupleHomeScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Gallery" component={GalleryScreen} />
      <Tab.Screen name="Timeline" component={TimelineScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
