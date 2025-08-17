import React, { useEffect, useRef, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../../context/UserContext";

const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useContext(UserContext);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const cardAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Mise à jour de l'heure toutes les minutes
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Animations d'entrée séquentielles
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 600,
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
      ]),
      // Animation des cartes en cascade
      Animated.stagger(
        100,
        cardAnimations.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();

    return () => clearInterval(timeInterval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulation du rafraîchissement
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "🌅 Bonjour";
    if (hour < 18) return "☀️ Bon après-midi";
    return "🌙 Bonsoir";
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const quickActions = [
    {
      title: "Actualités",
      subtitle: "Dernières nouvelles",
      icon: "newspaper",
      color: "#4facfe",
      gradient: ["#4facfe", "#00f2fe"],
      screen: "Actualites",
      index: 0,
    },
    {
      title: "Événements",
      subtitle: "Prochains événements",
      icon: "calendar",
      color: "#667eea",
      gradient: ["#667eea", "#764ba2"],
      screen: "Events",
      index: 1,
    },
    {
      title: "Documents",
      subtitle: "Mes documents",
      icon: "document-text",
      color: "#f093fb",
      gradient: ["#f093fb", "#f5576c"],
      screen: "Document",
      index: 2,
    },
    {
      title: "Conversations",
      subtitle: "Messages & chat",
      icon: "chatbubbles",
      color: "#4facfe",
      gradient: ["#4facfe", "#00f2fe"],
      screen: "Conversations",
      index: 3,
    },
    {
      title: "Congés",
      subtitle: "Demandes de congés",
      icon: "calendar-outline",
      color: "#764ba2",
      gradient: ["#764ba2", "#667eea"],
      screen: "MyLeaves",
      index: 4,
    },
    {
      title: "Partenariats",
      subtitle: "Nos partenaires",
      icon: "business",
      color: "#f5576c",
      gradient: ["#f5576c", "#f093fb"],
      screen: "Partenariats",
      index: 5,
    },
  ];

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

  const renderHeader = () => (
    <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
      <BlurView intensity={95} tint="light" style={styles.headerBlur}>
        <View style={styles.headerContent}>
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>
              {user?.prenom || "Utilisateur"} !
            </Text>
          </View>
          <View style={styles.timeSection}>
            <Text style={styles.time}>{formatTime()}</Text>
            <Text style={styles.date}>{formatDate()}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>🎯</Text>
            <Text style={styles.statLabel}>Productif</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>📍</Text>
            <Text style={styles.statLabel}>{user?.location || "Bureau"}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>👥</Text>
            <Text style={styles.statLabel}>
              {user?.departement || "Équipe"}
            </Text>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );

  const renderWelcomeCard = () => (
    <Animated.View
      style={[
        styles.welcomeCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
        },
      ]}
    >
      <BlurView intensity={95} tint="light" style={styles.welcomeCardBlur}>
        <LinearGradient
          colors={["rgba(102, 126, 234, 0.1)", "rgba(118, 75, 162, 0.1)"]}
          style={styles.welcomeGradient}
        >
          <View style={styles.welcomeContent}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.logoGradient}
              >
                <Text style={styles.logoText}>L</Text>
              </LinearGradient>
            </View>
            <Text style={styles.welcomeTitle}>LeoinMobApp</Text>
            <Text style={styles.welcomeSubtitle}>
              Votre hub digital pour rester connecté avec votre équipe et
              accéder à toutes vos ressources professionnelles
            </Text>
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4facfe" />
                <Text style={styles.featureText}>Actualités en temps réel</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#667eea" />
                <Text style={styles.featureText}>Gestion des documents</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#764ba2" />
                <Text style={styles.featureText}>Communication intégrée</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );

  const renderQuickAction = (action) => (
    <Animated.View
      key={action.title}
      style={[
        styles.actionCard,
        {
          opacity: cardAnimations[action.index],
          transform: [
            {
              scale: cardAnimations[action.index].interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate(action.screen)}
        activeOpacity={0.8}
      >
        <BlurView intensity={90} tint="light" style={styles.actionCardBlur}>
          <LinearGradient
            colors={[`${action.color}20`, `${action.color}10`]}
            style={styles.actionCardGradient}
          >
            <View style={styles.actionIconContainer}>
              <LinearGradient
                colors={action.gradient}
                style={styles.actionIconGradient}
              >
                <Ionicons name={action.icon} size={28} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            <View style={styles.actionArrow}>
              <Ionicons name="chevron-forward" size={16} color={action.color} />
            </View>
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>🚀 Accès rapide</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map(renderQuickAction)}
      </View>
    </View>
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

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFFFFF"
              colors={["#667eea", "#764ba2"]}
            />
          }
        >
          {renderHeader()}
          {renderWelcomeCard()}
          {renderQuickActions()}
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  backgroundGradient: {
    flex: 1,
  },
  floatingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  floatingElement: {
    position: "absolute",
    borderRadius: 100,
    opacity: 0.08,
  },
  floatingElement1: {
    width: 250,
    height: 250,
    backgroundColor: "#FFFFFF",
    top: height * 0.05,
    right: -125,
  },
  floatingElement2: {
    width: 180,
    height: 180,
    backgroundColor: "#4facfe",
    top: height * 0.25,
    left: -90,
  },
  floatingElement3: {
    width: 120,
    height: 120,
    backgroundColor: "#00f2fe",
    bottom: height * 0.3,
    right: width * 0.1,
  },
  floatingElement4: {
    width: 200,
    height: 200,
    backgroundColor: "#f093fb",
    bottom: height * 0.1,
    left: -100,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight + 20,
    paddingBottom: 40,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    zIndex: 10,
  },
  headerBlur: {
    borderRadius: 25,
    padding: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    color: "#666666",
    marginBottom: 5,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  userName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  timeSection: {
    alignItems: "flex-end",
  },
  time: {
    fontSize: 24,
    fontWeight: "700",
    color: "#667eea",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  date: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  statCard: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "500",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  welcomeCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 30,
    overflow: "hidden",
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  welcomeCardBlur: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  welcomeGradient: {
    padding: 30,
  },
  welcomeContent: {
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 20,
    borderRadius: 30,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoGradient: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 15,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 25,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  featuresContainer: {
    alignSelf: "stretch",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  featureText: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 10,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 20,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 15,
  },
  actionCard: {
    width: (width - 55) / 2,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginBottom: 15,
  },
  actionCardBlur: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  actionCardGradient: {
    padding: 20,
    height: 140,
    position: "relative",
  },
  actionIconContainer: {
    marginBottom: 15,
    borderRadius: 20,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  actionIconGradient: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 5,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#666666",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    flex: 1,
  },
  actionArrow: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default HomeScreen;
