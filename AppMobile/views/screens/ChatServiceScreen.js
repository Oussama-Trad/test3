import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Dimensions,
  Animated,
  StatusBar,
  RefreshControl,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");

const ChatServiceScreen = ({ navigation }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [departementFilter, setDepartementFilter] = useState("");
  const [locations, setLocations] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [filterAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchInitialData();

    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [locationFilter, departementFilter]);

  const fetchInitialData = async () => {
    await Promise.all([fetchLocations(), fetchDepartements(), fetchAdmins()]);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  }, []);

  const toggleFilters = () => {
    const toValue = showFilters ? 0 : 1;
    setShowFilters(!showFilters);

    Animated.spring(filterAnim, {
      toValue,
      tension: 100,
      friction: 8,
      useNativeDriver: false,
    }).start();
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch("http://172.20.10.2:5000/api/locations-full");
      const data = await res.json();
      setLocations(data);
    } catch (e) {
      console.error("Erreur lors du chargement des sites:", e);
      setLocations([]);
    }
  };

  const fetchDepartements = async () => {
    try {
      const res = await fetch("http://172.20.10.2:5000/api/departments-full");
      const data = await res.json();
      setDepartements(data);
    } catch (e) {
      console.error("Erreur lors du chargement des départements:", e);
      setDepartements([]);
    }
  };

  const fetchAdmins = async () => {
    if (!refreshing) setLoading(true);

    let url = "http://172.20.10.2:5000/api/admins";
    const params = [];
    if (locationFilter) params.push(`locationId=${locationFilter}`);
    if (departementFilter) params.push(`departementId=${departementFilter}`);
    if (params.length > 0) url += "?" + params.join("&");

    try {
      const res = await fetch(url);
      const data = await res.json();
      setAdmins(data);
    } catch (e) {
      console.error("Erreur lors du chargement des administrateurs:", e);
      setAdmins([]);
      Alert.alert("Erreur", "Impossible de charger les administrateurs");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setLocationFilter("");
    setDepartementFilter("");
    setSearch("");
  };

  const filteredAdmins = admins.filter((a) => {
    const fullName = `${a.nom || ""} ${a.prenom || ""}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  const getLocationName = (id) => {
    const loc = locations.find((l) => l.id === id);
    return loc ? loc.nom : "Non spécifié";
  };

  const getDepartementName = (id) => {
    const dep = departements.find((d) => d.id === id);
    return dep ? dep.nom : "Non spécifié";
  };

  const renderItem = ({ item, index }) => {
    const itemAnimation = new Animated.Value(0);

    Animated.timing(itemAnimation, {
      toValue: 1,
      duration: 600,
      delay: index * 100,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View
        style={[
          styles.itemWrapper,
          {
            opacity: itemAnimation,
            transform: [
              {
                translateY: itemAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            navigation.navigate("ChatConversation", { admin: item })
          }
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#FFFFFF", "#FAFBFC"]}
            style={styles.itemGradient}
          >
            <View style={styles.itemHeader}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {item.prenom?.[0]?.toUpperCase() || "A"}
                  </Text>
                </LinearGradient>
                <View style={styles.statusIndicator} />
              </View>

              <View style={styles.itemContent}>
                <Text style={styles.name}>
                  {item.prenom} {item.nom}
                </Text>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text style={styles.info}>
                    {getLocationName(item.locationId)}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="business-outline" size={14} color="#6B7280" />
                  <Text style={styles.info}>
                    {getDepartementName(item.departementId)}
                  </Text>
                </View>
              </View>

              <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* Header moderne avec gradient */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Service Chat</Text>
            <Text style={styles.subtitle}>Contactez nos administrateurs</Text>
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={toggleFilters}
            activeOpacity={0.8}
          >
            <Ionicons
              name={showFilters ? "options" : "filter-outline"}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <View style={styles.container}>
        {/* Barre de recherche moderne */}
        <Animated.View
          style={[
            styles.searchContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.searchWrapper}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#9CA3AF"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un administrateur..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch("")}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Filtres avec animation */}
        <Animated.View
          style={[
            styles.filtersContainer,
            {
              maxHeight: filterAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 200],
              }),
              opacity: filterAnim,
            },
          ]}
        >
          <BlurView intensity={20} tint="light" style={styles.filtersBlur}>
            <View style={styles.filtersContent}>
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Site :</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={locationFilter}
                    onValueChange={setLocationFilter}
                    style={styles.picker}
                  >
                    <Picker.Item label="Tous les sites" value="" />
                    {locations.map((loc) => (
                      <Picker.Item
                        key={loc.id}
                        label={loc.nom}
                        value={loc.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Département :</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={departementFilter}
                    onValueChange={setDepartementFilter}
                    style={styles.picker}
                  >
                    <Picker.Item label="Tous les départements" value="" />
                    {departements.map((dep) => (
                      <Picker.Item
                        key={dep.id}
                        label={dep.nom}
                        value={dep.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={clearFilters}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh-outline" size={16} color="#667eea" />
                <Text style={styles.clearFiltersText}>Réinitialiser</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>

        {/* Contenu principal */}
        {loading && !refreshing ? (
          <Animated.View
            style={[styles.loadingContainer, { opacity: fadeAnim }]}
          >
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.loadingGradient}
            >
              <ActivityIndicator size="large" color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.loadingText}>
              Chargement des administrateurs...
            </Text>
          </Animated.View>
        ) : (
          <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
            <FlatList
              data={filteredAdmins}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <LinearGradient
                    colors={["#F3F4F6", "#E5E7EB"]}
                    style={styles.emptyIcon}
                  >
                    <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                  </LinearGradient>
                  <Text style={styles.emptyTitle}>
                    Aucun administrateur trouvé
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    Essayez de modifier vos critères de recherche
                  </Text>
                </View>
              )}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#667eea"]}
                  tintColor="#667eea"
                  progressBackgroundColor="#FFFFFF"
                />
              }
              ItemSeparatorComponent={() => (
                <View style={styles.itemSeparator} />
              )}
            />
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  header: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    marginTop: 20,
    marginBottom: 15,
  },
  searchWrapper: {
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
    elevation: 3,
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
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    overflow: "hidden",
    marginBottom: 10,
  },
  filtersBlur: {
    borderRadius: 16,
    overflow: "hidden",
  },
  filtersContent: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  filterRow: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  pickerWrapper: {
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  picker: {
    backgroundColor: "transparent",
    color: "#374151",
  },
  clearFiltersButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.3)",
  },
  clearFiltersText: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "600",
    marginLeft: 6,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  listContainer: {
    flex: 1,
  },
  list: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  itemSeparator: {
    height: 12,
  },
  itemWrapper: {
    marginBottom: 0,
  },
  item: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: "#FFFFFF",
  },
  itemGradient: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  itemContent: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    fontWeight: "500",
  },
  arrowContainer: {
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  loadingText: {
    fontSize: 16,
    color: "#4A5568",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    fontWeight: "500",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
});

export default ChatServiceScreen;
