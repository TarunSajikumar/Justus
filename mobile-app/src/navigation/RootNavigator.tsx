import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import SplashScreen from '../screens/auth/SplashScreen';
import LoginSignupScreen from '../screens/auth/LoginSignupScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import SignupDetailsScreen from '../screens/auth/SignupDetailsScreen';
import RelationshipSetupScreen from '../screens/auth/RelationshipSetupScreen';

// Authenticated tabs
import SoloTabs from './SoloTabs';
import CoupleTabs from './CoupleTabs';

// Store + services
import { useAuthStore, getAuthData } from '../store/authStore';
import { authService } from '../services/authService';

const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <AuthStack.Screen name="LoginSignup" component={LoginSignupScreen} />
      <AuthStack.Screen name="OTP" component={OtpVerificationScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  const { user } = useAuthStore();

  const isProfileComplete = !!user?.name;
  const isCouple = user?.relationship_status === 'couple';

  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {!isProfileComplete ? (
        <MainStack.Screen name="SignupDetails" component={SignupDetailsScreen} />
      ) : isCouple ? (
        <MainStack.Screen name="CoupleTabs" component={CoupleTabs} />
      ) : (
        <>
          <MainStack.Screen name="RelationshipSetup" component={RelationshipSetupScreen} />
          <MainStack.Screen name="SoloTabs" component={SoloTabs} />
          <MainStack.Screen name="CoupleTabs" component={CoupleTabs} />
        </>
      )}
    </MainStack.Navigator>
  );
}

export default function RootNavigator() {
  const { token, setToken, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // 1. Load token + cached user from secure storage
        const authData = await getAuthData();

        if (authData?.token) {
          setToken(authData.token);

          // Set cached user immediately so UI can show something
          if (authData.user) {
            setUser(authData.user);
          }

          // 2. Fetch fresh profile from backend (gets real relationship_status + partner)
          try {
            await authService.me();
          } catch (e) {
            // Network error — use cached user, still better than nothing
            console.warn('Could not refresh profile, using cached data:', e);
          }
        }
      } catch (e) {
        console.error('Failed to restore session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  if (isLoading) {
    return <SplashScreen navigation={null} />;
  }

  return (
    <NavigationContainer>
      {!token ? <AuthNavigator /> : <MainNavigator />}
    </NavigationContainer>
  );
}
