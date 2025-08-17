import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  Animated,
  Alert,
  Dimensions,
  Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfile } from "../../services/api/employeeApi";
import {
  getLocationsFull,
  getDepartmentsFull,
} from "../../services/api/locationsApi";

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [departementName, setDepartementName] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  // Données simulées pour le fallback
  const mockProfile = {
    id: "EMP001",
    nom: "Dupont",
    prenom: "Marie",
    adresse1: "123 Rue de la Paix",
    adresse2: "Appartement 4B",
    numTel: "+33 6 12 34 56 78",
    numTelParentale: "+33 1 23 45 67 89",
    email: "marie.dupont@company.com",
    poste: "Développeuse Senior",
    dateEmbauche: "2023-01-15",
    salaire: "45000",
    statusEmploye: "Actif",
    locationId: "1",
    departementId: "2",
    photoDeProfil: null,
  };

  useEffect(() => {
    initializeScreen();
    fetchProfile();
  }, []);

  const initializeScreen = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(headerAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(150, [
        Animated.spring(avatarAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(cardAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const res = await getProfile(token);
        if (res.employee) {
          setProfile(res.employee);
          await fetchNames(res.employee);
        } else {
          console.log("Using mock profile data");
          setProfile(mockProfile);
          await fetchNames(mockProfile);
        }
      } else {
        setProfile(mockProfile);
        await fetchNames(mockProfile);
      }
    } catch (e) {
      console.log("Error fetching profile, using mock data:", e);
      setProfile(mockProfile);
      setLocationName("Siège Paris");
      setDepartementName("Développement");
    }
    setLoading(false);
  };

  const fetchNames = async (profileData) => {
    if (!profileData) return;
    try {
      const [locationsRaw, departementsRaw] = await Promise.all([
        getLocationsFull(),
        getDepartmentsFull(),
      ]);
      const locations = Array.isArray(locationsRaw)
        ? locationsRaw
        : locationsRaw.locations || [];
      const departements = Array.isArray(departementsRaw)
        ? departementsRaw
        : departementsRaw.departements || [];
      const loc = locations.find(
        (l) => String(l.id) === String(profileData.locationId)
      );
      const dep = departements.find(
        (d) => String(d.id) === String(profileData.departementId)
      );
      setLocationName(loc ? loc.nom : "Siège Paris");
      setDepartementName(dep ? dep.nom : "Développement");
    } catch (e) {
      console.log("Error fetching locations/departments:", e);
      setLocationName("Siège Paris");
      setDepartementName("Développement");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      "🚪 Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Déconnexion",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("token");

              // Animation de sortie
              Animated.sequence([
                Animated.timing(fadeAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]).start(() => {
                navigation.replace("Auth");
              });
            } catch (e) {
              console.error("Erreur lors de la déconnexion:", e);
              Alert.alert("❌ Erreur", "Impossible de se déconnecter");
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Profil de ${profile.prenom} ${profile.nom}\n${
          profile.poste || "Employé"
        }\n${departementName} - ${locationName}`,
        title: "Partager le profil",
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const getInitials = () => {
    if (!profile) return "NA";
    const firstInitial = profile.prenom
      ? profile.prenom.charAt(0).toUpperCase()
      : "";
    const lastInitial = profile.nom ? profile.nom.charAt(0).toUpperCase() : "";
    return `${firstInitial}${lastInitial}`;
  };

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case "actif":
        return { color: "#4CAF50", icon: "checkmark-circle", label: "Actif" };
      case "inactif":
        return { color: "#F44336", icon: "close-circle", label: "Inactif" };
      case "congé":
        return { color: "#FF9800", icon: "time", label: "En congé" };
      default:
        return { color: "#4CAF50", icon: "checkmark-circle", label: "Actif" };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non défini";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const calculateWorkDuration = () => {
    if (!profile?.dateEmbauche) return "Non défini";
    const hireDate = new Date(profile.dateEmbauche);
    const now = new Date();
    const diffTime = Math.abs(now - hireDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);

    if (years > 0) {
      return `${years} an${years > 1 ? "s" : ""} ${
        months > 0 ? `et ${months} mois` : ""
      }`;
    }
    return `${months} mois`;
  };

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: headerAnim,
          transform: [
            {
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>👤 Mon Profil</Text>
            <Text style={styles.headerSubtitle}>Informations personnelles</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={onRefresh}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderProfileHeader = () => {
    const statusInfo = getStatusInfo(profile?.statusEmploye);

    return (
      <Animated.View
        style={[
          styles.profileHeaderContainer,
          {
            opacity: avatarAnim,
            transform: [{ scale: avatarAnim }],
          },
        ]}
      >
        <BlurView intensity={95} tint="light" style={styles.profileHeaderBlur}>
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0.7)"]}
            style={styles.profileHeaderGradient}
          >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {profile?.photoDeProfil ? (
                <Image
                  source={{ uri: profile.photoDeProfil }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  style={styles.avatarPlaceholder}
                >
                  <Text style={styles.avatarInitials}>{getInitials()}</Text>
                </LinearGradient>
              )}
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() =>
                  navigation.navigate("EditProfile", { profile })
                }
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Nom et poste */}
            <Text style={styles.profileName}>
              {profile?.prenom} {profile?.nom}
            </Text>
            <Text style={styles.profilePosition}>
              {profile?.poste || "Employé"}
            </Text>

            {/* Statut */}
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${statusInfo.color}20` },
                ]}
              >
                <Ionicons
                  name={statusInfo.icon}
                  size={16}
                  color={statusInfo.color}
                />
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
              </View>
            </View>

            {/* Statistiques rapides */}
            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{calculateWorkDuration()}</Text>
                <Text style={styles.statLabel}>Ancienneté</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{departementName}</Text>
                <Text style={styles.statLabel}>Département</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{locationName}</Text>
                <Text style={styles.statLabel}>Site</Text>
              </View>
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    );
  };

  const renderInfoSection = (title, icon, data) => (
    <Animated.View
      style={[
        styles.infoSection,
        {
          opacity: cardAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <BlurView intensity={90} tint="light" style={styles.infoSectionBlur}>
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0.6)"]}
          style={styles.infoSectionGradient}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name={icon} size={20} color="#667eea" />
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          {data.map((item, index) => (
            <View key={index} style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <Ionicons name={item.icon} size={16} color="#666666" />
                <Text style={styles.infoLabel}>{item.label}</Text>
              </View>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );

  const renderActionButtons = () => (
    <Animated.View
      style={[
        styles.actionsContainer,
        {
          opacity: cardAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate("EditProfile", { profile })}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.actionButtonGradient}
        >
          <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Modifier le profil</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#F44336", "#D32F2F"]}
          style={styles.actionButtonGradient}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Déconnexion</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={["#f8f9fa", "#e9ecef", "#f8f9fa"]}
          style={styles.loadingGradient}
        >
          <View style={styles.loadingContent}>
            <Animated.View
              style={[
                styles.loadingAvatar,
                {
                  transform: [
                    {
                      rotate: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.loadingAvatarGradient}
              >
                <Ionicons name="person" size={32} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>
            <Text style={styles.loadingText}>👤 Chargement du profil...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ Erreur de chargement du profil</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const personalInfo = [
    {
      icon: "id-card-outline",
      label: "ID Employé",
      value: profile.id || "Non défini",
    },
    {
      icon: "mail-outline",
      label: "Email",
      value: profile.email || "Non défini",
    },
    {
      icon: "call-outline",
      label: "Téléphone",
      value: profile.numTel || "Non défini",
    },
    {
      icon: "call-outline",
      label: "Tél. Urgence",
      value: profile.numTelParentale || "Non défini",
    },
  ];

  const addressInfo = [
    {
      icon: "home-outline",
      label: "Adresse 1",
      value: profile.adresse1 || "Non défini",
    },
    {
      icon: "home-outline",
      label: "Adresse 2",
      value: profile.adresse2 || "Non défini",
    },
    { icon: "location-outline", label: "Site", value: locationName },
    { icon: "business-outline", label: "Département", value: departementName },
  ];

  const workInfo = [
    {
      icon: "briefcase-outline",
      label: "Poste",
      value: profile.poste || "Non défini",
    },
    {
      icon: "calendar-outline",
      label: "Date d'embauche",
      value: formatDate(profile.dateEmbauche),
    },
    {
      icon: "time-outline",
      label: "Ancienneté",
      value: calculateWorkDuration(),
    },
    {
      icon: "checkmark-circle-outline",
      label: "Statut",
      value: profile.statusEmploye || "Actif",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={["#f8f9fa", "#e9ecef", "#f8f9fa"]}
        style={styles.backgroundGradient}
      >
        {renderHeader()}

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderProfileHeader()}

          {renderInfoSection(
            "📱 Informations personnelles",
            "person-outline",
            personalInfo
          )}
          {renderInfoSection(
            "🏠 Adresse & Localisation",
            "location-outline",
            addressInfo
          )}
          {renderInfoSection(
            "💼 Informations professionnelles",
            "briefcase-outline",
            workInfo
          )}

          {renderActionButtons()}
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  backgroundGradient: {
    flex: 1,
  },

  // Header
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    zIndex: 1000,
  },
  headerGradient: {
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "SF Pro Display",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: "SF Pro Text",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  // Content
  content: {
    flex: 1,
    marginTop: -10,
  },
  contentContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  // Profile Header
  profileHeaderContainer: {
    marginBottom: 20,
  },
  profileHeaderBlur: {
    borderRadius: 24,
    overflow: "hidden",
  },
  profileHeaderGradient: {
    padding: 24,
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "SF Pro Display",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2c3e50",
    fontFamily: "SF Pro Display",
    textAlign: "center",
    marginBottom: 4,
  },
  profilePosition: {
    fontSize: 16,
    color: "#667eea",
    fontFamily: "SF Pro Text",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
  },

  // Status
  statusContainer: {
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "SF Pro Text",
    marginLeft: 6,
  },

  // Quick Stats
  quickStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2c3e50",
    fontFamily: "SF Pro Display",
    textAlign: "center",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "SF Pro Text",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginHorizontal: 8,
  },

  // Info Sections
  infoSection: {
    marginBottom: 16,
  },
  infoSectionBlur: {
    borderRadius: 20,
    overflow: "hidden",
  },
  infoSectionGradient: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
    fontFamily: "SF Pro Display",
    marginLeft: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666666",
    fontFamily: "SF Pro Text",
    marginLeft: 8,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#2c3e50",
    fontFamily: "SF Pro Text",
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },

  // Actions
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "SF Pro Text",
    marginLeft: 8,
  },

  // Loading
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
    overflow: "hidden",
  },
  loadingAvatarGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#667eea",
    fontFamily: "SF Pro Text",
    fontWeight: "600",
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#F44336",
    fontFamily: "SF Pro Text",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "SF Pro Text",
    fontWeight: "600",
  },
});

export default ProfileScreen;
