import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

import SoloHomeScreen from '../screens/solo/SoloHomeScreen';
import GalleryScreen from '../screens/solo/GalleryScreen';
import PremiumScreen from '../screens/solo/PremiumScreen';
import SettingsScreen from '../screens/solo/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function SoloTabs() {
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
            iconName = 'home';
          } else if (route.name === 'Gallery') {
            iconName = 'image';
          } else if (route.name === 'Premium') {
            iconName = 'star';
          } else if (route.name === 'Settings') {
            iconName = 'cog';
          }

          return <FontAwesome name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={SoloHomeScreen} />
      <Tab.Screen name="Gallery" component={GalleryScreen} />
      <Tab.Screen name="Premium" component={PremiumScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
