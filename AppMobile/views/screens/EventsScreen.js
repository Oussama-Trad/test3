import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Dimensions,
  TextInput,
  Animated,
  StatusBar,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../../context/UserContext";

const { width, height } = Dimensions.get("window");
const API_URL = "http://172.20.10.2:5000/api/events";

const EventsScreen = () => {
  const navigation = useNavigation();
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const filterAnim = useRef(new Animated.Value(0)).current;

  const filters = [
    { key: "all", label: "Tous", icon: "calendar", color: "#667eea" },
    { key: "today", label: "Aujourd'hui", icon: "today", color: "#4facfe" },
    {
      key: "week",
      label: "Cette semaine",
      icon: "calendar-outline",
      color: "#764ba2",
    },
    {
      key: "month",
      label: "Ce mois",
      icon: "calendar-clear",
      color: "#f093fb",
    },
  ];

  useEffect(() => {
    // Animations d'entrée
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
        Animated.timing(searchAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(filterAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const fetchEvents = async (showRefresh = false) => {
    if (!user) return;

    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const url = `${API_URL}?locationId=${user.locationId}&departementId=${user.departementId}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error("Erreur API");

      const data = await response.json();
      // Correction : accepte les deux formats de réponse (data.events ou data)
      if (Array.isArray(data.events)) {
        setEvents(data.events);
      } else if (Array.isArray(data)) {
        setEvents(data);
      } else {
        setEvents([]);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Correction : recharge les events à chaque fois que l'écran devient actif (utile pour Expo)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEvents();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchEvents();
  }, [user]);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, selectedFilter]);

  const filterEvents = () => {
    let filtered = [...events];

    // Filtrage par recherche
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrage par période
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (selectedFilter) {
      case "today":
        filtered = filtered.filter((event) => {
          const eventDate = new Date(event.startDate);
          return (
            eventDate >= startOfDay &&
            eventDate < new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
          );
        });
        break;
      case "week":
        filtered = filtered.filter((event) => {
          const eventDate = new Date(event.startDate);
          return eventDate >= startOfWeek;
        });
        break;
      case "month":
        filtered = filtered.filter((event) => {
          const eventDate = new Date(event.startDate);
          return eventDate >= startOfMonth;
        });
        break;
    }

    // Tri par date
    filtered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    setFilteredEvents(filtered);
  };

  const getEventTypeIcon = (title) => {
    const titleLower = title?.toLowerCase() || "";
    if (titleLower.includes("formation")) return "school";
    if (titleLower.includes("réunion") || titleLower.includes("meeting"))
      return "people";
    if (titleLower.includes("conférence")) return "mic";
    if (titleLower.includes("célébration") || titleLower.includes("fête"))
      return "gift";
    if (titleLower.includes("séminaire")) return "library";
    return "calendar";
  };

  const getEventCategory = (title) => {
    const titleLower = title?.toLowerCase() || "";
    if (titleLower.includes("formation"))
      return { label: "Formation", color: "#4facfe" };
    if (titleLower.includes("réunion") || titleLower.includes("meeting"))
      return { label: "Réunion", color: "#667eea" };
    if (titleLower.includes("conférence"))
      return { label: "Conférence", color: "#764ba2" };
    if (titleLower.includes("célébration") || titleLower.includes("fête"))
      return { label: "Célébration", color: "#f093fb" };
    if (titleLower.includes("séminaire"))
      return { label: "Séminaire", color: "#4facfe" };
    return { label: "Événement", color: "#667eea" };
  };

  const isEventSoon = (startDate) => {
    const now = new Date();
    const eventDate = new Date(startDate);
    const diffHours = (eventDate - now) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 24;
  };

  const isEventToday = (startDate) => {
    const now = new Date();
    const eventDate = new Date(startDate);
    return eventDate.toDateString() === now.toDateString();
  };

  const renderHeader = () => (
    <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={[styles.headerBlur, { backgroundColor: '#fff', borderRadius: 24, padding: 20, margin: 10, elevation: 2 }]}> 
          <Text style={styles.headerTitle}>🎉 Événements</Text>
          <Text style={styles.headerSubtitle}>
            {user?.locationId || "Site"} • {user?.departementId || "Département"}
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{filteredEvents.length}</Text>
              <Text style={styles.statLabel}>Événements</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {filteredEvents.filter((e) => isEventToday(e.startDate)).length}
              </Text>
              <Text style={styles.statLabel}>Aujourd'hui</Text>
            </View>
          </View>
        </View>
    </Animated.View>
  );

  const renderSearchBar = () => (
    <Animated.View
      style={[
        styles.searchContainer,
        {
          opacity: searchAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
        <View style={[styles.searchBlur, { borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.2)" }]}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#667eea"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un événement..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#999999" />
            </TouchableOpacity>
          ) : null}
        </View>
        </View>
    </Animated.View>
  );

  const renderFilters = () => (
    <Animated.View
      style={[
        styles.filtersContainer,
        {
          opacity: filterAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <FlatList
        data={filters}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.filtersList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === item.key && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter(item.key)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={
                selectedFilter === item.key
                  ? [item.color, `${item.color}80`]
                  : ["rgba(255,255,255,0.8)", "rgba(255,255,255,0.6)"]
              }
              style={styles.filterChipGradient}
            >
              <Ionicons
                name={item.icon}
                size={16}
                color={selectedFilter === item.key ? "#FFFFFF" : item.color}
              />
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === item.key && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      />
    </Animated.View>
  );

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

  const renderEventItem = ({ item, index }) => {
    const category = getEventCategory(item.title);
    const isSoon = isEventSoon(item.startDate);
    const isToday = isEventToday(item.startDate);

    return (
      <Animated.View
        style={[
          styles.eventCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: Animated.add(
                  slideAnim,
                  new Animated.Value(index * 10)
                ),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("EventDetail", { event: item })}
          activeOpacity={0.8}
        >
          <View style={[styles.eventCardBlur, { backgroundColor: '#fff', borderRadius: 20, padding: 16, elevation: 2 }]}> 
            <View style={styles.eventCardContent}>
              {/* Badge de statut */}
              {(isToday || isSoon) && (
                <View style={styles.statusBadge}>
                  <LinearGradient
                    colors={
                      isToday ? ["#ff6b6b", "#ee5a52"] : ["#ffa726", "#ff9800"]
                    }
                    style={styles.statusBadgeGradient}
                  >
                    <Ionicons
                      name={isToday ? "flash" : "time"}
                      size={12}
                      color="#FFFFFF"
                    />
                    <Text style={styles.statusBadgeText}>
                      {isToday ? "Aujourd'hui" : "Bientôt"}
                    </Text>
                  </LinearGradient>
                </View>
              )}

              {/* Image ou placeholder */}
              <View style={styles.eventImageContainer}>
                {item.photo ? (
                  <Image
                    source={{ uri: item.photo }}
                    style={styles.eventImage}
                    resizeMode="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={[category.color, `${category.color}80`]}
                    style={styles.eventImagePlaceholder}
                  >
                    <Ionicons
                      name={getEventTypeIcon(item.title)}
                      size={40}
                      color="#FFFFFF"
                    />
                  </LinearGradient>
                )}

                {/* Badge de catégorie */}
                <View style={styles.categoryBadge}>
                  <LinearGradient
                    colors={[category.color, `${category.color}80`]}
                    style={styles.categoryBadgeGradient}
                  >
                    <Ionicons
                      name={getEventTypeIcon(item.title)}
                      size={12}
                      color="#FFFFFF"
                    />
                    <Text style={styles.categoryBadgeText}>
                      {category.label}
                    </Text>
                  </LinearGradient>
                </View>
              </View>

              {/* Contenu textuel */}
              <View style={styles.eventTextContent}>
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                <View style={styles.eventDateContainer}>
                  <Ionicons name="calendar-outline" size={14} color="#667eea" />
                  <Text style={styles.eventDate} numberOfLines={1}>
                    {formatDateShort(item.startDate)}
                  </Text>
                </View>

                <View style={styles.eventLocation}>
                  <Ionicons name="location-outline" size={14} color="#4facfe" />
                  <Text style={styles.eventLocationText} numberOfLines={1}>
                    {item.locationId || "Lieu à déterminer"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() =>
                    navigation.navigate("EventDetail", { event: item })
                  }
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#667eea", "#764ba2"]}
                    style={styles.viewButtonGradient}
                  >
                    <Text style={styles.viewButtonText}>Voir détails</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#FFFFFF"
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View
      style={[
        styles.emptyContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.emptyIconContainer}
      >
        <Ionicons name="calendar-outline" size={60} color="#FFFFFF" />
      </LinearGradient>
      <Text style={styles.emptyTitle}>Aucun événement</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? "Aucun événement ne correspond à votre recherche"
          : "Aucun événement prévu pour le moment"}
      </Text>
      {searchQuery && (
        <TouchableOpacity
          style={styles.clearSearchButton}
          onPress={() => setSearchQuery("")}
        >
          <Text style={styles.clearSearchText}>Effacer la recherche</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <LinearGradient
        colors={["#667eea", "#764ba2", "#667eea"]}
        style={styles.loadingGradient}
      >
        {renderFloatingElements()}
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Chargement des événements...</Text>
          <Text style={styles.loadingSubtext}>Veuillez patienter</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <LinearGradient
        colors={["#667eea", "#764ba2", "#667eea"]}
        style={styles.errorGradient}
      >
        {renderFloatingElements()}
        <View style={styles.errorContent}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="warning-outline" size={60} color="#FFFFFF" />
          </View>
          <Text style={styles.errorTitle}>Erreur de connexion</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorDebug}>
            Site : {user?.locationId || "Non défini"}
          </Text>
          <Text style={styles.errorDebug}>
            Département : {user?.departementId || "Non défini"}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchEvents()}
            activeOpacity={0.8}
          >
            <View
              style={styles.retryButtonBlur}
            >
              <Ionicons name="refresh" size={20} color="#667eea" />
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  if (loading) return renderLoadingState();
  if (error) return renderErrorState();

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
        {renderSearchBar()}
        {renderFilters()}

        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {filteredEvents.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={filteredEvents}
              keyExtractor={(item) => item._id}
              renderItem={renderEventItem}
              contentContainerStyle={styles.eventsList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => fetchEvents(true)}
                  tintColor="#FFFFFF"
                  colors={["#667eea", "#764ba2"]}
                />
              }
              initialNumToRender={5}
              maxToRenderPerBatch={10}
              windowSize={10}
            />
          )}
        </Animated.View>
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

function formatDateShort(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const isTomorrow =
    d.toDateString() ===
    new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

  if (isToday)
    return `Aujourd'hui à ${d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  if (isTomorrow)
    return `Demain à ${d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
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
    
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 10,
  },
  headerBlur: {
    borderRadius: 25,
    padding: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#667eea",
  },
  statLabel: {
    fontSize: 14,
    color: "#666666",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 20,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
    zIndex: 9,
  },
  searchBlur: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1a1a1a",
  },
  clearButton: {
    padding: 5,
  },
  filtersContainer: {
    marginBottom: 20,
    zIndex: 8,
  },
  filtersList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 10,
  },
  filterChipActive: {
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  filterChipGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  contentContainer: {
    flex: 1,
    zIndex: 7,
  },
  eventsList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  eventCard: {
    marginBottom: 20,
    borderRadius: 25,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  eventCardBlur: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  eventCardContent: {
    position: "relative",
  },
  statusBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
    borderRadius: 15,
    overflow: "hidden",
  },
  statusBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  eventImageContainer: {
    position: "relative",
    height: 200,
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  eventImagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryBadge: {
    position: "absolute",
    bottom: 15,
    left: 15,
    borderRadius: 15,
    overflow: "hidden",
  },
  categoryBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  eventTextContent: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
    lineHeight: 26,
  },
  eventDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    color: "#667eea",
    marginLeft: 6,
    fontWeight: "500",
  },
  eventLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  eventLocationText: {
    fontSize: 14,
    color: "#4facfe",
    marginLeft: 6,
    fontWeight: "500",
  },
  viewButton: {
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  viewButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  clearSearchButton: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  clearSearchText: {
    color: "#667eea",
    fontSize: 16,
    fontWeight: "600",
  },
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
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
  },
  errorGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContent: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 20,
  },
  errorDebug: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 5,
  },
  retryButton: {
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 20,
  },
  retryButtonBlur: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#667eea",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default EventsScreen;
