import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  SafeAreaView,
  Animated,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "../../components/CustomButton";

const { width, height } = Dimensions.get("window");

const AuthScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(100));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [floatingAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animation d'entrée séquentielle
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Animation flottante continue
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const floatingTransform = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Background avec gradient moderne */}
      <LinearGradient
        colors={["#0F172A", "#1E293B", "#334155"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Éléments décoratifs flottants */}
      <Animated.View
        style={[
          styles.floatingElement1,
          {
            opacity: fadeAnim,
            transform: [{ translateY: floatingTransform }],
          },
        ]}
      >
        <LinearGradient
          colors={["rgba(59, 130, 246, 0.3)", "rgba(147, 51, 234, 0.3)"]}
          style={styles.floatingCircle}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingElement2,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: floatingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 15],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={["rgba(236, 72, 153, 0.2)", "rgba(59, 130, 246, 0.2)"]}
          style={styles.floatingCircle2}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Logo et titre section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={["#3B82F6", "#8B5CF6"]}
                style={styles.logoGradient}
              >
                <Ionicons name="newspaper" size={32} color="#FFFFFF" />
              </LinearGradient>
            </View>

            <Text style={styles.title}>Bienvenue</Text>
            <Text style={styles.subtitle}>
              Découvrez l'actualité avec une expérience moderne et intuitive
            </Text>
          </View>

          {/* Buttons section avec glass morphism */}
          <BlurView intensity={20} tint="light" style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.modernButton}
              onPress={() => navigation.navigate("Login")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#3B82F6", "#1D4ED8"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons
                  name="log-in-outline"
                  size={20}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.modernButtonText}>Se connecter</Text>
                <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modernButton, styles.registerButtonContainer]}
              onPress={() => navigation.navigate("Register")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
                style={styles.buttonGradient}
              >
                <Ionicons
                  name="person-add-outline"
                  size={20}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <Text
                  style={[styles.modernButtonText, styles.registerButtonText]}
                >
                  Créer un compte
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>

          {/* Section d'information supplémentaire */}
          <View style={styles.infoSection}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}></View>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}></View>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}></View>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  floatingElement1: {
    position: "absolute",
    top: height * 0.15,
    right: -50,
    width: 150,
    height: 150,
  },
  floatingElement2: {
    position: "absolute",
    bottom: height * 0.2,
    left: -75,
    width: 200,
    height: 200,
  },
  floatingCircle: {
    width: "100%",
    height: "100%",
    borderRadius: 75,
  },
  floatingCircle2: {
    width: "100%",
    height: "100%",
    borderRadius: 100,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 60,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 16,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    lineHeight: 24,
    paddingHorizontal: 20,
    fontWeight: "400",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    marginBottom: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  modernButton: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonContainer: {
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  buttonIcon: {
    marginRight: 12,
  },
  modernButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    flex: 1,
    textAlign: "center",
  },
  registerButtonText: {
    color: "#FFFFFF",
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  featureText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 13,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  featureDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 16,
  },
});

export default AuthScreen;
