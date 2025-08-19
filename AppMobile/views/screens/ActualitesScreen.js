import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Platform,
  RefreshControl,
  Animated,
  StatusBar,
  TextInput,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../../context/UserContext";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const API_URL = "http://172.20.10.2:5000/api";
const { width, height } = Dimensions.get("window");

// Fonction utilitaire pour sécuriser le rendu des valeurs
const safeRender = (value) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const ActualitesScreen = () => {
  const { user } = useContext(UserContext);
  const [actualites, setActualites] = useState([]);
  const [filteredActualites, setFilteredActualites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fadeAnim] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  useEffect(() => {
    fetchActualites();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    filterActualites();
  }, [searchQuery, actualites]);

  const fetchActualites = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/actualites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // Correction : si data n'a pas la clé actualites, on tente data directement (pour compatibilité web/mobile)
      if (Array.isArray(data.actualites)) {
        setActualites(data.actualites);
      } else if (Array.isArray(data)) {
        setActualites(data);
      } else {
        setActualites([]);
      }
    } catch (e) {
      console.error("Erreur lors du chargement des actualités:", e);
      setActualites([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchActualites();
  }, []);

  const filterActualites = () => {
    if (!searchQuery.trim()) {
      setFilteredActualites(actualites);
    } else {
      const filtered = actualites.filter(
        (item) =>
          item.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredActualites(filtered);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const renderItem = ({ item, index }) => {
    const itemAnimation = new Animated.Value(0);

    Animated.timing(itemAnimation, {
      toValue: 1,
      duration: 600,
      delay: index * 150,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            opacity: itemAnimation,
            transform: [
              {
                translateY: itemAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() =>
            navigation.navigate("ActualiteDetail", { actualite: item })
          }
        >
          <LinearGradient
            colors={["#FFFFFF", "#FAFBFC"]}
            style={styles.cardGradient}
          >
            <View style={styles.imageContainer}>
              {item.photo ? (
                <Image
                  source={{
                    uri: item.photo.startsWith("http")
                      ? item.photo
                      : `${API_URL}/uploads/${item.photo}`,
                  }}
                  style={styles.image}
                  resizeMode="cover"
                />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="image-outline" size={32} color="#9CA3AF" />
                  </View>
                )}
            </View>

            <View style={styles.textContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={2}>
                  {safeRender(item.titre)}
                </Text>
                <View style={styles.arrowContainer}>
                  <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </View>
              </View>

              <Text style={styles.desc} numberOfLines={3}>
                {safeRender(item.description)}
              </Text>

              <View style={styles.metaInfo}>
                <View style={styles.dateContainer}>
                  <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                  <Text style={styles.dateText}>
                    {new Date().toLocaleDateString("fr-FR")}
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Nouveau</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />
        <View style={styles.loadingContent}>
          <Animated.View style={[styles.loadingIcon, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={["#3B82F6", "#1D4ED8"]}
              style={styles.loadingGradient}
            >
              <ActivityIndicator size="large" color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>
          <Animated.Text style={[styles.loadingText, { opacity: fadeAnim }]}>
            Chargement des actualités...
          </Animated.Text>
          <Animated.Text style={[styles.loadingSubtext, { opacity: fadeAnim }]}>
            Veuillez patienter
          </Animated.Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!filteredActualites.length && !loading) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />
        <Animated.View style={[styles.emptyContent, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={["#F3F4F6", "#E5E7EB"]}
            style={styles.emptyIcon}
          >
            <Ionicons name="newspaper-outline" size={64} color="#9CA3AF" />
          </LinearGradient>
          <Text style={styles.emptyTitle}>
            {searchQuery ? "Aucun résultat trouvé" : "Aucune actualité"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery
              ? "Essayez avec d'autres mots-clés"
              : "Les actualités apparaîtront ici"}
          </Text>
          {searchQuery && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearSearch}
              activeOpacity={0.8}
            >
              <Text style={styles.clearButtonText}>Effacer la recherche</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />

      {/* Header avec recherche */}
      <View style={styles.header}>
        <LinearGradient
          colors={["#F8FAFF", "#FFFFFF"]}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Actualités</Text>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#9CA3AF"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher des actualités..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={clearSearch}
                style={styles.clearSearchButton}
              >
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>
        </LinearGradient>
      </View>

      <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
        <FlatList
          data={filteredActualites}
          renderItem={renderItem}
          keyExtractor={(item, index) => String(item?._id ?? item?.id ?? index)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3B82F6"]}
              tintColor="#3B82F6"
              progressBackgroundColor="#FFFFFF"
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  header: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 25,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 20,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  clearSearchButton: {
    padding: 4,
  },
  listContainer: {
    flex: 1,
  },
  list: {
    padding: 20,
    paddingTop: 10,
    flexGrow: 1,
  },
  separator: {
    height: 16,
  },
  cardWrapper: {
    marginBottom: 0,
  },
  card: {
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    backgroundColor: "#FFFFFF",
  },
  cardGradient: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  imageContainer: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    // Ajout d'un effet de clarté
    opacity: 1,
    // Pour forcer la netteté sur certains appareils
    borderRadius: 0,
    // Supprimer tout filtre ou effet
    // Pas de filter: brightness ici, mais on s'assure qu'il n'y a pas d'assombrissement
  },

  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    padding: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
    lineHeight: 26,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  arrowContainer: {
    marginLeft: 12,
    marginTop: 2,
  },
  desc: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 16,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 13,
    color: "#9CA3AF",
    marginLeft: 6,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3B82F6",
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingIcon: {
    marginBottom: 24,
  },
  loadingGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  emptyContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  clearButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  clearButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
});

export default ActualitesScreen;
