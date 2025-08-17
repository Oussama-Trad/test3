import React, { useEffect, useState, useRef, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Animated,
  Dimensions,
  StatusBar,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");

const ChatConversation = ({ route, navigation }) => {
  const { user } = useContext(UserContext);
  const CURRENT_USER_ID = user?.id || "";
  const { admin } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messageAnimations, setMessageAnimations] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);

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

  const fetchMessages = async () => {
    try {
      const url = `http://localhost:5000/api/messages?user1=${CURRENT_USER_ID}&user2=${admin._id}`;
      const res = await fetch(url);
      const data = await res.json();
      setMessages(data);

      // Animer les nouveaux messages
      data.forEach((message, index) => {
        if (!messageAnimations[message._id]) {
          const anim = new Animated.Value(0);
          setMessageAnimations((prev) => ({
            ...prev,
            [message._id]: anim,
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
      console.error("Erreur lors du chargement des messages:", e);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const messageText = input.trim();
    setInput("");
    setIsTyping(true);

    try {
      await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: CURRENT_USER_ID,
          receiverId: admin._id,
          message: messageText,
        }),
      });

      // Animation de succès
      Animated.sequence([
        Animated.timing(new Animated.Value(1), {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(new Animated.Value(1.1), {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      await fetchMessages();
    } catch (e) {
      Alert.alert("Erreur", "Impossible d'envoyer le message");
      setInput(messageText); // Restaurer le texte en cas d'erreur
    } finally {
      setIsTyping(false);
    }
  };

  const handleInputChange = (text) => {
    setInput(text);
    // Simuler l'indicateur de frappe
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1000);
    }
  };

  const renderItem = ({ item, index }) => {
    const sender = item.senderId !== undefined ? item.senderId : item.sender_id;
    const isMine = sender === CURRENT_USER_ID;
    const messageAnim = messageAnimations[item._id] || new Animated.Value(1);

    return (
      <Animated.View
        style={[
          styles.messageRow,
          isMine
            ? { justifyContent: "flex-end" }
            : { justifyContent: "flex-start" },
          {
            opacity: messageAnim,
            transform: [
              {
                scale: messageAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
              {
                translateY: messageAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        {!isMine && (
          <View style={styles.avatar}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>{admin.prenom?.[0] || "A"}</Text>
            </LinearGradient>
          </View>
        )}

        <View
          style={[
            styles.bubble,
            isMine ? styles.bubbleMine : styles.bubbleTheirs,
          ]}
        >
          {isMine ? (
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.bubbleGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.messageText, styles.textMine]}>
                {item.content || item.message}
              </Text>
              <Text style={[styles.timestamp, styles.timestampMine]}>
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </LinearGradient>
          ) : (
            <View style={styles.bubbleContent}>
              <Text style={[styles.messageText, styles.textTheirs]}>
                {item.content || item.message}
              </Text>
              <Text style={[styles.timestamp, styles.timestampTheirs]}>
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          )}
        </View>

        {isMine && (
          <View style={styles.avatarSelf}>
            <LinearGradient
              colors={["#11998e", "#38ef7d"]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>{user?.prenom?.[0] || "M"}</Text>
            </LinearGradient>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header moderne avec glassmorphism */}
        <BlurView intensity={20} tint="light" style={styles.headerBlur}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <View style={styles.headerAvatar}>
                <LinearGradient
                  colors={["#FFFFFF", "#F0F0F0"]}
                  style={styles.headerAvatarGradient}
                >
                  <Text style={styles.headerAvatarText}>
                    {admin.prenom?.[0] || "A"}
                  </Text>
                </LinearGradient>
              </View>

              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>
                  {admin.nom} {admin.prenom}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {isTyping ? (
                    <View style={styles.typingContainer}>
                      <Text style={styles.typingText}>En train d'écrire</Text>
                      <View style={styles.typingDots}>
                        <Animated.View
                          style={[styles.typingDot, { opacity: fadeAnim }]}
                        />
                        <Animated.View
                          style={[styles.typingDot, { opacity: fadeAnim }]}
                        />
                        <Animated.View
                          style={[styles.typingDot, { opacity: fadeAnim }]}
                        />
                      </View>
                    </View>
                  ) : (
                    "En ligne"
                  )}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.moreButton} activeOpacity={0.8}>
              <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>
        </BlurView>

        {/* Messages avec animation */}
        <Animated.View
          style={[
            styles.messagesContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingContent}>
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  style={styles.loadingGradient}
                >
                  <ActivityIndicator size="large" color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.loadingText}>
                  Chargement des messages...
                </Text>
              </View>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => (
                <View style={styles.messageSeparator} />
              )}
            />
          )}
        </Animated.View>

        {/* Input moderne avec glassmorphism */}
        <BlurView intensity={20} tint="light" style={styles.inputBlur}>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Tapez votre message..."
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={input}
                onChangeText={handleInputChange}
                multiline
                maxLength={500}
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { opacity: input.trim().length > 0 ? 1 : 0.5 },
                ]}
                onPress={sendMessage}
                activeOpacity={0.8}
                disabled={!input.trim()}
              >
                <LinearGradient
                  colors={
                    input.trim().length > 0
                      ? ["#11998e", "#38ef7d"]
                      : ["#CCCCCC", "#999999"]
                  }
                  style={styles.sendButtonGradient}
                >
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  headerBlur: {
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 40,
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
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatar: {
    marginRight: 12,
  },
  headerAvatarGradient: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  headerAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#667eea",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    marginRight: 8,
  },
  typingDots: {
    flexDirection: "row",
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginHorizontal: 1,
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  messagesContainer: {
    flex: 1,
  },
  list: {
    padding: 20,
    paddingBottom: 10,
    flexGrow: 1,
  },
  messageSeparator: {
    height: 8,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 4,
  },
  avatar: {
    marginRight: 10,
  },
  avatarSelf: {
    marginLeft: 10,
  },
  avatarGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  bubble: {
    maxWidth: width * 0.75,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  bubbleMine: {
    borderBottomRightRadius: 8,
    alignSelf: "flex-end",
  },
  bubbleTheirs: {
    borderBottomLeftRadius: 8,
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  bubbleGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    fontWeight: "400",
  },
  textMine: {
    color: "#FFFFFF",
  },
  textTheirs: {
    color: "#2D3748",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
    textAlign: "right",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    fontWeight: "500",
  },
  timestampMine: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  timestampTheirs: {
    color: "#A0AEC0",
  },
  inputBlur: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: Platform.OS === "ios" ? 35 : 15,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.2)",
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    color: "#2D3748",
    maxHeight: 100,
    minHeight: 40,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  sendButton: {
    marginLeft: 10,
    marginBottom: 5,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#11998e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingContent: {
    alignItems: "center",
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
});

export default ChatConversation;
