import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const SplashScreen = ({ navigation }) => {
  // Animation references
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(50)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const orbPosition = useRef(new Animated.Value(0)).current;
  const shimmerPosition = useRef(new Animated.Value(-screenWidth)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Set status bar style
    StatusBar.setBarStyle("light-content", true);
    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor("transparent", true);
      StatusBar.setTranslucent(true);
    }

    // Start entrance animations
    const startAnimations = () => {
      // Logo animation
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Title animation (delayed)
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(titleTranslateY, {
            toValue: 0,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(titleOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }, 200);

      // Subtitle animation (more delayed)
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(subtitleTranslateY, {
            toValue: 0,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(subtitleOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }, 400);

      // Start continuous animations
      startContinuousAnimations();
    };

    // Continuous animations
    const startContinuousAnimations = () => {
      // Floating orb animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(orbPosition, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(orbPosition, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Shimmer effect
      Animated.loop(
        Animated.timing(shimmerPosition, {
          toValue: screenWidth,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();

      // Pulse effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startAnimations();

    // Navigation timer
    const timer = setTimeout(() => {
      navigation.replace("Auth");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  // Calculate orb movement
  const orbTranslateX = orbPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 50],
  });

  const orbTranslateY = orbPosition.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -30, 0],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated Background Orbs */}
        <Animated.View
          style={[
            styles.backgroundOrb,
            styles.orb1,
            {
              transform: [
                { translateX: orbTranslateX },
                { translateY: orbTranslateY },
                { scale: pulseScale },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.backgroundOrb,
            styles.orb2,
            {
              transform: [
                { translateX: Animated.multiply(orbTranslateX, -0.7) },
                { translateY: Animated.multiply(orbTranslateY, 0.5) },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.backgroundOrb,
            styles.orb3,
            {
              transform: [
                { translateX: Animated.multiply(orbTranslateX, 0.3) },
                { translateY: Animated.multiply(orbTranslateY, -0.8) },
              ],
            },
          ]}
        />

        {/* Main Content */}
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Logo Container with Glow Effect */}
            <View style={styles.logoContainer}>
              <Animated.View
                style={[
                  styles.logoGlow,
                  {
                    transform: [{ scale: pulseScale }],
                    opacity: logoOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.3],
                    }),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.logoWrapper,
                  {
                    transform: [{ scale: logoScale }],
                    opacity: logoOpacity,
                  },
                ]}
              >
                <BlurView intensity={20} style={styles.logoBlur}>
                  <LinearGradient
                    colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]}
                    style={styles.logoBackground}
                  >
                    <Image
                      source={require("../../assets/splash-icon.png")}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                  </LinearGradient>
                </BlurView>
              </Animated.View>

              {/* Shimmer Effect */}
              <Animated.View
                style={[
                  styles.shimmer,
                  {
                    transform: [{ translateX: shimmerPosition }],
                  },
                ]}
              />
            </View>

            {/* App Name */}
            <Animated.View
              style={[
                styles.titleContainer,
                {
                  transform: [{ translateY: titleTranslateY }],
                  opacity: titleOpacity,
                },
              ]}
            >
              <Text style={styles.title}>LEOIN</Text>
              <View style={styles.titleUnderline} />
            </Animated.View>

            {/* Tagline */}
            <Animated.View
              style={[
                styles.subtitleContainer,
                {
                  transform: [{ translateY: subtitleTranslateY }],
                  opacity: subtitleOpacity,
                },
              ]}
            ></Animated.View>

            {/* Decorative Elements */}
            <Animated.View
              style={[styles.decorativeElements, { opacity: subtitleOpacity }]}
            >
              <View style={styles.decorativeLine} />
              <Ionicons
                name="diamond"
                size={16}
                color="rgba(255,255,255,0.6)"
              />
              <View style={styles.decorativeLine} />
            </Animated.View>
          </View>

          {/* Bottom Branding */}
          <Animated.View
            style={[styles.bottomBranding, { opacity: subtitleOpacity }]}
          >
            <Text style={styles.brandingText}>Powered by Innovation</Text>
            <View style={styles.brandingDots}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#667eea",
  },
  backgroundGradient: {
    flex: 1,
    position: "relative",
  },

  // Background Orbs
  backgroundOrb: {
    position: "absolute",
    borderRadius: 100,
    opacity: 0.1,
  },
  orb1: {
    width: 200,
    height: 200,
    backgroundColor: "#ffffff",
    top: "10%",
    left: "20%",
  },
  orb2: {
    width: 150,
    height: 150,
    backgroundColor: "#f093fb",
    top: "60%",
    right: "15%",
  },
  orb3: {
    width: 120,
    height: 120,
    backgroundColor: "#764ba2",
    bottom: "20%",
    left: "10%",
  },

  // Main Container
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  // Logo Section
  logoContainer: {
    position: "relative",
    marginBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#ffffff",
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  logoBlur: {
    flex: 1,
    borderRadius: 70,
    overflow: "hidden",
  },
  logoBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 70,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  logo: {
    width: 80,
    height: 80,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 60,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    transform: [{ skewX: "-20deg" }],
  },

  // Title Section
  titleContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "900",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
    textAlign: "center",
    letterSpacing: 3,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: "#f093fb",
    borderRadius: 2,
    marginTop: 8,
    shadowColor: "#f093fb",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },

  // Subtitle Section
  subtitleContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    textAlign: "center",
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtext: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    textAlign: "center",
    letterSpacing: 1,
  },

  // Decorative Elements
  decorativeElements: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  decorativeLine: {
    width: 30,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    marginHorizontal: 12,
  },

  // Bottom Branding
  bottomBranding: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
  },
  brandingText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    letterSpacing: 1,
    marginBottom: 12,
  },
  brandingDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 3,
  },
});

export default SplashScreen;
