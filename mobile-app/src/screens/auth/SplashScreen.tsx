import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../../theme/colors";

// SplashScreen is now a pure loading indicator.
// Session restoration and routing is handled by RootNavigator.
export default function SplashScreen({ navigation }: any) {
  return (
    <LinearGradient
      colors={["#0F0F0F", "#1A1A1A", COLORS.primary]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoHeart}>❤️</Text>
        </View>

        <Text style={styles.appName}>JUST US</Text>
        <Text style={styles.tagline}>Two Hearts, One Soul</Text>

        <ActivityIndicator
          size="large"
          color="#FFFFFF"
          style={styles.loader}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  content: {
    alignItems: "center",
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoHeart: {
    fontSize: 50,
  },
  appName: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  tagline: {
    color: "#ddd",
    marginTop: 10,
    fontSize: 18,
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  loader: {
    marginTop: 50,
  }
});
