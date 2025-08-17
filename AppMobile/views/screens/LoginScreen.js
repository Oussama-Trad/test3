import React, { useState, useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  TextInput,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { login } from "../../services/api/employeeApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../../context/UserContext";

const { width, height } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  const [adresse1, setAdresse1] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { setUser } = useContext(UserContext);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const keyboardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animations d'entrée
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(logoAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(formAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Gestion du clavier
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        Animated.timing(keyboardAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        Animated.timing(keyboardAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!adresse1.trim()) {
      newErrors.adresse1 = "L'adresse est requise";
    } else if (adresse1.length < 3) {
      newErrors.adresse1 = "L'adresse doit contenir au moins 3 caractères";
    }

    if (!password.trim()) {
      newErrors.password = "Le mot de passe est requis";
    } else if (password.length < 4) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 4 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      // Animation d'erreur
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.98,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    setLoading(true);

    // Animation de chargement
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.98,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    try {
      const res = await login(adresse1, password);
      if (res.token) {
        await AsyncStorage.setItem("token", res.token);
        setUser(res.employee);

        // Animation de succès
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          navigation.replace("MainTabs");
        });
      } else {
        setLoading(false);
        Alert.alert(
          "❌ Erreur de connexion",
          res.message || "Adresse ou mot de passe invalide"
        );

        // Reset animation
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    } catch (e) {
      setLoading(false);
      Alert.alert("❌ Erreur", "Impossible de contacter le serveur");

      // Reset animation
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const renderFloatingElements = () => (
    <View style={styles.floatingContainer} pointerEvents="none">
      <Animated.View
        style={[
          styles.floatingElement,
          styles.floatingElement1,
          { opacity: fadeAnim },
        ]}
      />
      <Animated.View
        style={[
          styles.floatingElement,
          styles.floatingElement2,
          { opacity: fadeAnim },
        ]}
      />
      <Animated.View
        style={[
          styles.floatingElement,
          styles.floatingElement3,
          { opacity: fadeAnim },
        ]}
      />
      <Animated.View
        style={[
          styles.floatingElement,
          styles.floatingElement4,
          { opacity: fadeAnim },
        ]}
      />
    </View>
  );

  const renderLogo = () => (
    <Animated.View
      style={[
        styles.logoContainer,
        {
          opacity: logoAnim,
          transform: [
            { scale: logoAnim },
            {
              translateY: keyboardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -50],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.logoGradient}
      >
        <Text style={styles.logoText}>L</Text>
      </LinearGradient>
      <Text style={styles.appName}>Leoin</Text>
      <Text style={styles.appTagline}>Votre espace professionnel</Text>
    </Animated.View>
  );

  const renderForm = () => (
    <Animated.View
      style={[
        styles.formContainer,
        {
          opacity: formAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
            {
              translateY: keyboardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -30],
              }),
            },
          ],
        },
      ]}
    >
      <BlurView intensity={95} tint="light" style={styles.formBlur}>
        <View style={styles.formContent}>
          <Text style={styles.formTitle}>👋 Connexion</Text>
          <Text style={styles.formSubtitle}>
            Connectez-vous pour accéder à votre espace
          </Text>

          {/* Champ adresse */}
          <View style={styles.inputContainer}>
            <View
              style={[
                styles.inputWrapper,
                errors.adresse1 && styles.inputError,
              ]}
            >
              <Ionicons
                name="home-outline"
                size={20}
                color="#667eea"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={adresse1}
                onChangeText={(text) => {
                  setAdresse1(text);
                  if (errors.adresse1) {
                    setErrors((prev) => ({ ...prev, adresse1: null }));
                  }
                }}
                placeholder="Adresse principale"
                placeholderTextColor="#999999"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {errors.adresse1 && (
              <Text style={styles.errorText}>{errors.adresse1}</Text>
            )}
          </View>

          {/* Champ mot de passe */}
          <View style={styles.inputContainer}>
            <View
              style={[
                styles.inputWrapper,
                errors.password && styles.inputError,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#667eea"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: null }));
                  }
                }}
                placeholder="Mot de passe"
                placeholderTextColor="#999999"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#999999"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Bouton de connexion */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={loading ? ["#cccccc", "#aaaaaa"] : ["#667eea", "#764ba2"]}
              style={styles.loginButtonGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.loginButtonText}>Se connecter</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Lien vers inscription */}
          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate("Register")}
            activeOpacity={0.7}
          >
            <Text style={styles.registerLinkText}>
              Pas encore de compte ?{" "}
              <Text style={styles.registerLinkHighlight}>Créer un compte</Text>
            </Text>
          </TouchableOpacity>

          {/* Fonctionnalités */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color="#4facfe"
              />
              <Text style={styles.featureText}>Connexion sécurisée</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="cloud-outline" size={16} color="#667eea" />
              <Text style={styles.featureText}>Données synchronisées</Text>
            </View>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={["#667eea", "#764ba2", "#667eea"]}
        style={styles.backgroundGradient}
      >
        {renderFloatingElements()}

        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.content}>
              {!keyboardVisible && renderLogo()}
              {renderForm()}
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
    position: "relative",
  },
  floatingContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  floatingElement: {
    position: "absolute",
    borderRadius: 50,
    opacity: 0.1,
  },
  floatingElement1: {
    width: 100,
    height: 100,
    backgroundColor: "#ffffff",
    top: "10%",
    left: "10%",
    borderRadius: 50,
  },
  floatingElement2: {
    width: 150,
    height: 150,
    backgroundColor: "#ffffff",
    top: "20%",
    right: "15%",
    borderRadius: 75,
  },
  floatingElement3: {
    width: 80,
    height: 80,
    backgroundColor: "#ffffff",
    bottom: "30%",
    left: "20%",
    borderRadius: 40,
  },
  floatingElement4: {
    width: 120,
    height: 120,
    backgroundColor: "#ffffff",
    bottom: "15%",
    right: "10%",
    borderRadius: 60,
  },
  keyboardContainer: {
    flex: 1,
    zIndex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 5,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appTagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    maxWidth: 380,
  },
  formBlur: {
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
  },
  formContent: {
    padding: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  formTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  formSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 30,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputError: {
    borderColor: "#ff6b6b",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
    paddingVertical: 15,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  passwordToggle: {
    padding: 5,
    marginLeft: 10,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  loginButton: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  registerLink: {
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 20,
  },
  registerLinkText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  registerLinkHighlight: {
    color: "#FFFFFF",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginLeft: 5,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
});

export default LoginScreen;
