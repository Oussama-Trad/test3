import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
  RefreshControl,
  Alert,
  Dimensions,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { UserContext } from "../../context/UserContext";

const MessagesScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useContext(UserContext);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;

  // Données simulées pour les conversations
  const mockConversations = [
    {
      id: "1",
      name: "Support RH",
      avatar: "👨‍💼",
      lastMessage: "Votre demande de congé a été approuvée",
      timestamp: "14:30",
      unread: 2,
      status: "online",
      type: "support",
      priority: "high",
    },
    {
      id: "2",
      name: "Équipe IT",
      avatar: "💻",
      lastMessage: "Le nouveau système sera déployé demain",
      timestamp: "13:15",
      unread: 0,
      status: "away",
      type: "team",
      priority: "medium",
    },
    {
      id: "3",
      name: "Direction",
      avatar: "🏢",
      lastMessage: "Réunion prévue pour vendredi",
      timestamp: "11:45",
      unread: 1,
      status: "online",
      type: "management",
      priority: "high",
    },
    {
      id: "4",
      name: "Service Comptabilité",
      avatar: "📊",
      lastMessage: "Documents reçus, merci",
      timestamp: "10:20",
      unread: 0,
      status: "offline",
      type: "finance",
      priority: "low",
    },
    {
      id: "5",
      name: "Maintenance",
      avatar: "🔧",
      lastMessage: "Intervention programmée",
      timestamp: "Hier",
      unread: 3,
      status: "busy",
      type: "maintenance",
      priority: "medium",
    },
  ];

  useEffect(() => {
    initializeScreen();
    loadConversations();
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
      Animated.stagger(100, [
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
      ]),
    ]).start();
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      // Simulation du chargement
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setConversations(mockConversations);
      calculateUnreadCount(mockConversations);
    } catch (error) {
      Alert.alert("❌ Erreur", "Impossible de charger les conversations");
    } finally {
      setLoading(false);
    }
  };

  const calculateUnreadCount = (convs) => {
    const total = convs.reduce((sum, conv) => sum + conv.unread, 0);
    setUnreadCount(total);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "unread") return matchesSearch && conv.unread > 0;
    if (selectedFilter === "important")
      return matchesSearch && conv.priority === "high";

    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "#4CAF50";
      case "away":
        return "#FF9800";
      case "busy":
        return "#F44336";
      case "offline":
        return "#9E9E9E";
      default:
        return "#9E9E9E";
    }
  };

  const getPriorityIndicator = (priority) => {
    switch (priority) {
      case "high":
        return { color: "#F44336", icon: "alert-circle" };
      case "medium":
        return { color: "#FF9800", icon: "alert" };
      case "low":
        return { color: "#4CAF50", icon: "checkmark-circle" };
      default:
        return { color: "#9E9E9E", icon: "ellipse" };
    }
  };

  const handleConversationPress = (conversation) => {
    // Animation de sélection
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: -5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    navigation.navigate("ChatConversation", {
      conversationId: conversation.id,
      conversationName: conversation.name,
      avatar: conversation.avatar,
    });
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
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>💬 Messages</Text>
              <Text style={styles.headerSubtitle}>
                {unreadCount > 0
                  ? `${unreadCount} non lu${unreadCount > 1 ? "s" : ""}`
                  : "Tous lus"}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate("ChatServiceScreen")}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
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

  const renderSearchBar = () => (
    <Animated.View
      style={[
        styles.searchContainer,
        {
          opacity: searchAnim,
          transform: [{ scale: searchAnim }],
        },
      ]}
    >
      <BlurView intensity={95} tint="light" style={styles.searchBlur}>
        <View style={styles.searchContent}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#667eea"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher une conversation..."
            placeholderTextColor="#999999"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery("")}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={20} color="#999999" />
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
    </Animated.View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScroll}
      >
        {[
          { key: "all", label: "Toutes", icon: "chatbubbles-outline" },
          { key: "unread", label: "Non lues", icon: "mail-unread-outline" },
          { key: "important", label: "Importantes", icon: "star-outline" },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter.key)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={
                selectedFilter === filter.key
                  ? ["#667eea", "#764ba2"]
                  : ["transparent", "transparent"]
              }
              style={styles.filterGradient}
            >
              <Ionicons
                name={filter.icon}
                size={16}
                color={selectedFilter === filter.key ? "#FFFFFF" : "#667eea"}
              />
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter.key && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderConversationItem = ({ item, index }) => {
    const priority = getPriorityIndicator(item.priority);

    return (
      <Animated.View
        style={[
          styles.conversationContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50 * (index + 1), 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.conversationItem}
          onPress={() => handleConversationPress(item)}
          activeOpacity={0.8}
        >
          <BlurView
            intensity={item.unread > 0 ? 100 : 80}
            tint="light"
            style={styles.conversationBlur}
          >
            <LinearGradient
              colors={
                item.unread > 0
                  ? ["rgba(102, 126, 234, 0.1)", "rgba(118, 75, 162, 0.1)"]
                  : ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"]
              }
              style={styles.conversationGradient}
            >
              <View style={styles.conversationContent}>
                {/* Avatar et statut */}
                <View style={styles.avatarContainer}>
                  <View style={styles.avatarWrapper}>
                    <Text style={styles.avatarText}>{item.avatar}</Text>
                    <View
                      style={[
                        styles.statusIndicator,
                        { backgroundColor: getStatusColor(item.status) },
                      ]}
                    />
                  </View>
                </View>

                {/* Contenu de la conversation */}
                <View style={styles.conversationInfo}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.conversationName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.conversationMeta}>
                      <Ionicons
                        name={priority.icon}
                        size={12}
                        color={priority.color}
                        style={styles.priorityIcon}
                      />
                      <Text style={styles.conversationTime}>
                        {item.timestamp}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.conversationMessage} numberOfLines={2}>
                    {item.lastMessage}
                  </Text>
                  <View style={styles.conversationFooter}>
                    <Text style={styles.conversationType}>
                      {item.type === "support" && "🎧 Support"}
                      {item.type === "team" && "👥 Équipe"}
                      {item.type === "management" && "🏢 Direction"}
                      {item.type === "finance" && "💰 Finance"}
                      {item.type === "maintenance" && "🔧 Maintenance"}
                    </Text>
                    {item.unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>
                          {item.unread > 99 ? "99+" : item.unread}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Flèche */}
                <View style={styles.arrowContainer}>
                  <Ionicons name="chevron-forward" size={20} color="#667eea" />
                </View>
              </View>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyTitle}>Aucune conversation</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? "Aucun résultat pour votre recherche"
          : "Commencez une nouvelle conversation"}
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate("ChatServiceScreen")}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.emptyButtonGradient}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.emptyButtonText}>Nouvelle conversation</Text>
        </LinearGradient>
      </TouchableOpacity>
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
        colors={["#f8f9fa", "#e9ecef", "#f8f9fa"]}
        style={styles.backgroundGradient}
      >
        {renderHeader()}

        <View style={styles.content}>
          {renderSearchBar()}
          {renderFilters()}

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>
                📱 Chargement des conversations...
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredConversations}
              renderItem={renderConversationItem}
              keyExtractor={(item) => item.id}
              style={styles.conversationsList}
              contentContainerStyle={styles.conversationsContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#667eea"
                  colors={["#667eea", "#764ba2"]}
                />
              }
              ListEmptyComponent={renderEmptyState}
            />
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  backgroundGradient: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 15,
    padding: 5,
  },
  content: {
    flex: 1,
    paddingTop: 15,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchBlur: {
    borderRadius: 15,
    overflow: "hidden",
  },
  searchContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  clearButton: {
    padding: 5,
    marginLeft: 10,
  },
  filtersContainer: {
    marginBottom: 15,
  },
  filtersScroll: {
    paddingHorizontal: 20,
  },
  filterButton: {
    marginRight: 10,
    borderRadius: 20,
    overflow: "hidden",
  },
  filterButtonActive: {
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  filterGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.3)",
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    color: "#667eea",
    marginLeft: 6,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#667eea",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  conversationsList: {
    flex: 1,
  },
  conversationsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  conversationContainer: {
    marginBottom: 12,
  },
  conversationItem: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  conversationBlur: {
    borderRadius: 20,
    overflow: "hidden",
  },
  conversationGradient: {
    padding: 16,
  },
  conversationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarText: {
    fontSize: 32,
    textAlign: "center",
    width: 50,
    height: 50,
    lineHeight: 50,
    borderRadius: 25,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  conversationInfo: {
    flex: 1,
    marginRight: 10,
  },
  conversationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
    flex: 1,
  },
  conversationMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityIcon: {
    marginRight: 4,
  },
  conversationTime: {
    fontSize: 12,
    color: "#666666",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  conversationMessage: {
    fontSize: 14,
    color: "#555555",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    lineHeight: 18,
  },
  conversationFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  conversationType: {
    fontSize: 12,
    color: "#888888",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    fontWeight: "500",
  },
  unreadBadge: {
    backgroundColor: "#F44336",
    borderRadius: 10,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  arrowContainer: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  emptyText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 30,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    lineHeight: 22,
  },
  emptyButton: {
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  emptyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
});

export default MessagesScreen;
