import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
  Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const EventDetailScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [imageLoaded, setImageLoaded] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🎉 ${event.title}\n\n📅 ${formatDate(
          event.startDate
        )} - ${formatDate(event.endDate)}\n\n📍 ${
          event.locationId || "Lieu à déterminer"
        }\n\n${event.description}`,
        title: event.title,
      });
    } catch (error) {
      console.log("Erreur lors du partage:", error);
    }
  };

  const getEventTypeIcon = () => {
    const title = event.title?.toLowerCase() || "";
    if (title.includes("formation")) return "school";
    if (title.includes("réunion") || title.includes("meeting")) return "people";
    if (title.includes("conférence")) return "mic";
    if (title.includes("célébration") || title.includes("fête")) return "gift";
    if (title.includes("séminaire")) return "library";
    return "calendar";
  };

  const getEventCategory = () => {
    const title = event.title?.toLowerCase() || "";
    if (title.includes("formation"))
      return { label: "Formation", color: "#4facfe" };
    if (title.includes("réunion") || title.includes("meeting"))
      return { label: "Réunion", color: "#667eea" };
    if (title.includes("conférence"))
      return { label: "Conférence", color: "#764ba2" };
    if (title.includes("célébration") || title.includes("fête"))
      return { label: "Célébration", color: "#f093fb" };
    if (title.includes("séminaire"))
      return { label: "Séminaire", color: "#4facfe" };
    return { label: "Événement", color: "#667eea" };
  };

  const renderHeader = () => {
    const headerHeight = scrollY.interpolate({
      inputRange: [0, 200],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });

    return (
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <Animated.View
          style={[styles.headerBackground, { opacity: headerHeight }]}
        >
          <BlurView
            intensity={95}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Animated.Text
            style={[
              styles.headerTitle,
              {
                opacity: headerHeight,
                transform: [{ scale: headerHeight }],
              },
            ]}
            numberOfLines={1}
          >
            {event.title}
          </Animated.Text>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
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
    </View>
  );

  const renderEventImage = () => (
    <Animated.View
      style={[
        styles.imageSection,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {event.photo ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: event.photo }}
            style={styles.eventImage}
            resizeMode="cover"
            onLoad={() => setImageLoaded(true)}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.imageOverlay}
          />
          <View style={styles.imageContent}>
            <View style={styles.eventBadge}>
              <LinearGradient
                colors={[
                  getEventCategory().color,
                  `${getEventCategory().color}80`,
                ]}
                style={styles.eventBadgeGradient}
              >
                <Ionicons name={getEventTypeIcon()} size={16} color="#FFFFFF" />
                <Text style={styles.eventBadgeText}>
                  {getEventCategory().label}
                </Text>
              </LinearGradient>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.imagePlaceholder}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.placeholderGradient}
          >
            <Ionicons name={getEventTypeIcon()} size={60} color="#FFFFFF" />
            <Text style={styles.placeholderText}>Événement</Text>
          </LinearGradient>
        </View>
      )}
    </Animated.View>
  );

  const renderEventDetails = () => (
    <Animated.View
      style={[
        styles.detailsCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <BlurView intensity={95} tint="light" style={styles.cardBlur}>
        <View style={styles.cardContent}>
          <Text style={styles.eventTitle}>{event.title}</Text>

          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar-outline" size={20} color="#667eea" />
              </View>
              <View style={styles.dateTimeInfo}>
                <Text style={styles.dateTimeLabel}>Début</Text>
                <Text style={styles.dateTimeValue}>
                  {formatDate(event.startDate)}
                </Text>
              </View>
            </View>

            <View style={styles.dateTimeRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="time-outline" size={20} color="#4facfe" />
              </View>
              <View style={styles.dateTimeInfo}>
                <Text style={styles.dateTimeLabel}>Fin</Text>
                <Text style={styles.dateTimeValue}>
                  {formatDate(event.endDate)}
                </Text>
              </View>
            </View>
          </View>

          {event.description && (
            <View style={styles.descriptionSection}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#764ba2"
                />
                <Text style={styles.sectionTitle}>Description</Text>
              </View>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#f093fb"
              />
              <Text style={styles.sectionTitle}>Informations</Text>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="location-outline" size={18} color="#4facfe" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Lieu</Text>
                  <Text style={styles.infoValue}>
                    {event.locationId || "Non spécifié"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="business-outline" size={18} color="#667eea" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Département</Text>
                  <Text style={styles.infoValue}>
                    {event.departementId || "Non spécifié"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="share-social" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Partager l'événement</Text>
            </LinearGradient>
          </TouchableOpacity>
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
        {renderHeader()}

        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        >
          {renderEventImage()}
          {renderEventDetails()}
        </Animated.ScrollView>
      </LinearGradient>
    </View>
  );
};

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} à ${time}`;
}

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
    opacity: 0.1,
  },
  floatingElement1: {
    width: 200,
    height: 200,
    backgroundColor: "#FFFFFF",
    top: height * 0.1,
    right: -50,
  },
  floatingElement2: {
    width: 150,
    height: 150,
    backgroundColor: "#4facfe",
    top: height * 0.4,
    left: -75,
  },
  floatingElement3: {
    width: 100,
    height: 100,
    backgroundColor: "#00f2fe",
    bottom: height * 0.2,
    right: width * 0.2,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 24,
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    maxWidth: width * 0.6,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === "ios" ? 100 : 80,
    paddingBottom: 40,
  },
  imageSection: {
    marginBottom: 20,
  },
  imageContainer: {
    position: "relative",
    marginHorizontal: 20,
    borderRadius: 25,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  eventImage: {
    width: "100%",
    height: 250,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  imageContent: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  eventBadge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    overflow: "hidden",
  },
  eventBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  eventBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  imagePlaceholder: {
    marginHorizontal: 20,
    height: 250,
    borderRadius: 25,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  placeholderGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  detailsCard: {
    marginHorizontal: 20,
    borderRadius: 30,
    overflow: "hidden",
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  cardBlur: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  cardContent: {
    padding: 25,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  dateTimeContainer: {
    marginBottom: 25,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 20,
    padding: 20,
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  dateTimeInfo: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
    marginBottom: 2,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  dateTimeValue: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  descriptionSection: {
    marginBottom: 25,
  },
  infoSection: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.3)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginLeft: 10,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  description: {
    fontSize: 16,
    color: "#333333",
    lineHeight: 24,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    textAlign: "justify",
  },
  infoGrid: {
    gap: 15,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 15,
    padding: 15,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
    marginBottom: 2,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  infoValue: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  actionButton: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 30,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 10,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
});

export default EventDetailScreen;
