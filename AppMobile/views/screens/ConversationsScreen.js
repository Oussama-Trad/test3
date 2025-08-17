import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
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
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { UserContext } from "../../context/UserContext";

const { width, height } = Dimensions.get("window");

const ConversationsScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [messageAnimations, setMessageAnimations] = useState({});

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);

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

    return () => clearInterval(interval);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  }, []);

  const fetchConversations = async () => {
    if (!refreshing) setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/conversations?employeeId=${user.id}`
      );
      const data = await res.json();
      setConversations(data);

      // Animer les nouvelles conversations
      data.forEach((conversation, index) => {
        const id = conversation.admin._id;
        if (!messageAnimations[id]) {
          const anim = new Animated.Value(0);
          setMessageAnimations((prev) => ({
            ...prev,
            [id]: anim,
          }));

          setTimeout(() => {
            Animated.spring(anim, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }).start();
          }, index * 100);
        }
      });
    } catch (e) {
      console.error("Erreur lors du chargement des conversations:", e);
      setConversations([]);
      Alert.alert("Erreur", "Impossible de charger les conversations");
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return messageDate.toLocaleDateString("fr-FR");
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return "Aucun message";
    return message.length > maxLength
      ? `${message.substring(0, maxLength)}...`
      : message;
  };

  const renderItem = ({ item, index }) => {
    const conversationAnim =
      messageAnimations[item.admin._id] || new Animated.Value(1);
    const isRecent = new Date() - new Date(item.lastDate) < 60000; // Moins d'1 minute

    return (
      <Animated.View
        style={[
          styles.itemWrapper,
          {
            opacity: conversationAnim,
            transform: [
              {
                scale: conversationAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
              {
                translateY: conversationAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            navigation.navigate("ChatConversation", { admin: item.admin })
          }
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#FFFFFF", "#FAFBFC"]}
            style={styles.itemGradient}
          >
            <View style={styles.conversationHeader}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {item.admin.prenom?.[0]?.toUpperCase() || "A"}
                  </Text>
                </LinearGradient>
                {isRecent && <View style={styles.newMessageIndicator} />}
              </View>

              <View style={styles.conversationContent}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>
                    {item.admin.prenom} {item.admin.nom}
                  </Text>
                  <View style={styles.timeContainer}>
                    <Text style={styles.time}>{getTimeAgo(item.lastDate)}</Text>
                    {isRecent && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>•</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.messageRow}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={14}
                    color="#9CA3AF"
                    style={styles.messageIcon}
                  />
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {truncateMessage(item.lastMessage)}
                  </Text>
                </View>

                <View style={styles.statusRow}>
                  <View style={styles.statusIndicator}>
                    <View style={styles.onlineStatus} />
                    <Text style={styles.statusText}>En ligne</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                </View>
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
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Messages</Text>
            <Text style={styles.subtitle}>
              {conversations.length > 0
                ? `${conversations.length} conversation${
                    conversations.length > 1 ? "s" : ""
                  }`
                : "Aucune conversation"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.newMessageButton}
            onPress={() => navigation.navigate("ChatService")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]}
              style={styles.newMessageGradient}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.newMessageText}>Nouveau</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      {/* Contenu principal */}
      {loading && !refreshing ? (
        <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.loadingGradient}
          >
            <ActivityIndicator size="large" color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.loadingText}>
            Chargement des conversations...
          </Text>
        </Animated.View>
      ) : (
        <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.admin._id}
            renderItem={renderItem}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <LinearGradient
                  colors={["#F3F4F6", "#E5E7EB"]}
                  style={styles.emptyIcon}
                >
                  <Ionicons
                    name="chatbubbles-outline"
                    size={64}
                    color="#9CA3AF"
                  />
                </LinearGradient>
                <Text style={styles.emptyTitle}>Aucune conversation</Text>
                <Text style={styles.emptySubtitle}>
                  Commencez une nouvelle conversation avec un administrateur
                </Text>
                <TouchableOpacity
                  style={styles.startChatButton}
                  onPress={() => navigation.navigate("ChatService")}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#667eea", "#764ba2"]}
                    style={styles.startChatGradient}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.startChatText}>Démarrer un chat</Text>
                  </LinearGradient>
                </TouchableOpacity>
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
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          />
        </Animated.View>
      )}
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 25,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 28,
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
  newMessageButton: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  newMessageGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  newMessageText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  listContainer: {
    flex: 1,
  },
  list: {
    padding: 20,
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
  conversationHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 15,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  newMessageIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  conversationContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  unreadBadge: {
    marginLeft: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: {
    fontSize: 6,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  messageIcon: {
    marginRight: 6,
  },
  lastMessage: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    fontWeight: "400",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  onlineStatus: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
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
    paddingVertical: 80,
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
    marginBottom: 32,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  startChatButton: {
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startChatGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  startChatText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
});

export default ConversationsScreen;
