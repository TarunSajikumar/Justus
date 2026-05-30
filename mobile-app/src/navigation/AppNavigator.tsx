import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import SoloDashboard from '@/screens/solo/SoloHomeScreen'
import CoupleDashboard from '@/screens/couple/CoupleHomeScreen'

const Tab = createBottomTabNavigator()

export default function AppNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Solo" component={SoloDashboard} options={{ title: 'Solo' }} />
      <Tab.Screen name="Couple" component={CoupleDashboard} options={{ title: 'Couple' }} />
    </Tab.Navigator>
  )
}
