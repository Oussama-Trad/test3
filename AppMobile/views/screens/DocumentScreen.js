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
  Modal,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { UserContext } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createDocumentRequest,
  getDocumentRequests,
} from "../../services/api/documentApi";

const { width, height } = Dimensions.get("window");

const DocumentScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [documentTypes] = useState([
    {
      id: "attestation_travail",
      name: "Attestation de travail",
      icon: "document-text",
    },
    { id: "fiche_paie", name: "Fiche de paie", icon: "receipt" },
    { id: "certificat_medical", name: "Certificat médical", icon: "medical" },
    { id: "conge_annuel", name: "Demande de congé", icon: "calendar" },
    { id: "autre", name: "Autre document", icon: "folder" },
  ]);

  useEffect(() => {
    fetchRequests();

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  }, []);

  const fetchRequests = async () => {
    if (!refreshing) setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await getDocumentRequests(token);
      const reqs = Array.isArray(res?.requests) ? res.requests : [];
      // Normalize into UI shape used by this screen
      const mapped = reqs.map((r) => ({
        id: r.id,
        type: r.documentTypeId,
        name: mapTypeName(r.documentTypeId),
        status: mapStatus(r.status),
        requestDate: r.createdAt ? new Date(r.createdAt) : new Date(),
        description: r.commentaire || "",
      }));
      setDocuments(mapped);
    } catch (e) {
      console.error("Erreur lors du chargement des documents:", e);
      setDocuments([]);
      Alert.alert("Erreur", "Impossible de charger les documents");
    } finally {
      setLoading(false);
    }
  };

  const mapStatus = (status) => {
    // Backend uses: En attente / En cours / Résolue / Refusée
    if (!status) return "pending";
    const s = status.toLowerCase();
    if (s.includes("attente") || s === "pending") return "pending";
    if (s.includes("cours")) return "pending";
    if (s.includes("résol") || s === "approved") return "approved";
    if (s.includes("refus") || s === "rejected") return "rejected";
    return "pending";
  };

  const mapTypeName = (typeId) => {
    const found = documentTypes.find((dt) => dt.id === typeId);
    return found ? found.name : typeId || "Document";
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "approved":
        return { color: "#10B981", text: "Approuvé", icon: "checkmark-circle" };
      case "pending":
        return { color: "#F59E0B", text: "En attente", icon: "time" };
      case "rejected":
        return { color: "#EF4444", text: "Rejeté", icon: "close-circle" };
      default:
        return { color: "#6B7280", text: "Inconnu", icon: "help-circle" };
    }
  };

  const getDocumentIcon = (type) => {
    const docType = documentTypes.find((dt) => dt.id === type);
    return docType ? docType.icon : "document";
  };

  const handleRequestDocument = async () => {
    if (!selectedTypeId) {
      Alert.alert("Erreur", "Veuillez choisir un type de document");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      const payload = {
        documentTypeId: selectedTypeId,
        commentaire: requestText || "",
      };
      const res = await createDocumentRequest(token, payload);
      if (res?.message === "Demande créée") {
        Alert.alert("Succès", "Votre demande a été envoyée avec succès");
        setShowRequestModal(false);
        setRequestText("");
        setSelectedTypeId(null);
        await fetchRequests();
      } else {
        throw new Error(res?.message || "Création échouée");
      }
    } catch (e) {
      Alert.alert("Erreur", e.message || "Impossible d'envoyer la demande");
    }
  };

  const renderDocumentItem = ({ item, index }) => {
    const itemAnimation = new Animated.Value(0);
    const statusInfo = getStatusInfo(item.status);

    Animated.timing(itemAnimation, {
      toValue: 1,
      duration: 600,
      delay: index * 100,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View
        style={[
          styles.documentWrapper,
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
          style={styles.documentItem}
          onPress={() =>
            Alert.alert("Document", `Détails du document: ${item.name}`)
          }
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#FFFFFF", "#FAFBFC"]}
            style={styles.documentGradient}
          >
            <View style={styles.documentHeader}>
              <View style={styles.documentIconContainer}>
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  style={styles.documentIcon}
                >
                  <Ionicons
                    name={getDocumentIcon(item.type)}
                    size={24}
                    color="#FFFFFF"
                  />
                </LinearGradient>
              </View>

              <View style={styles.documentContent}>
                <View style={styles.documentTitleRow}>
                  <Text style={styles.documentName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${statusInfo.color}20` },
                    ]}
                  >
                    <Ionicons
                      name={statusInfo.icon}
                      size={12}
                      color={statusInfo.color}
                    />
                    <Text
                      style={[styles.statusText, { color: statusInfo.color }]}
                    >
                      {statusInfo.text}
                    </Text>
                  </View>
                </View>

                <Text style={styles.documentDescription} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.documentFooter}>
                  <View style={styles.dateContainer}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#9CA3AF"
                    />
                    <Text style={styles.dateText}>
                      {item.requestDate.toLocaleDateString("fr-FR")}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.actionButton}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="download-outline"
                      size={16}
                      color="#667eea"
                    />
                    <Text style={styles.actionText}>Télécharger</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderDocumentTypeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.typeItem}
      onPress={() => {
        setSelectedTypeId(item.id);
        setRequestText(`Demande de ${item.name.toLowerCase()}`);
        setShowRequestModal(true);
      }}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={["rgba(102, 126, 234, 0.1)", "rgba(118, 75, 162, 0.1)"]}
        style={styles.typeGradient}
      >
        <Ionicons name={item.icon} size={24} color="#667eea" />
        <Text style={styles.typeName}>{item.name}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

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
            <Text style={styles.title}>Mes Documents</Text>
            <Text style={styles.subtitle}>
              {documents.length > 0
                ? `${documents.length} document${
                    documents.length > 1 ? "s" : ""
                  }`
                : "Aucun document"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.requestButton}
            onPress={() => setShowRequestModal(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]}
              style={styles.requestGradient}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.requestText}>Demander</Text>
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
          <Text style={styles.loadingText}>Chargement des documents...</Text>
        </Animated.View>
      ) : (
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          <FlatList
            data={documents}
            keyExtractor={(item) => item.id}
            renderItem={renderDocumentItem}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <LinearGradient
                  colors={["#F3F4F6", "#E5E7EB"]}
                  style={styles.emptyIcon}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={64}
                    color="#9CA3AF"
                  />
                </LinearGradient>
                <Text style={styles.emptyTitle}>Aucun document</Text>
                <Text style={styles.emptySubtitle}>
                  Commencez par demander votre premier document
                </Text>

                {/* Types de documents rapides */}
                <View style={styles.quickActionsContainer}>
                  <Text style={styles.quickActionsTitle}>
                    Documents populaires :
                  </Text>
                  <FlatList
                    data={documentTypes.slice(0, 3)}
                    keyExtractor={(item) => item.id}
                    renderItem={renderDocumentTypeItem}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.quickActionsList}
                  />
                </View>
              </View>
            )}
            contentContainerStyle={styles.documentsList}
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
              <View style={styles.documentSeparator} />
            )}
          />
        </Animated.View>
      )}

      {/* Modal de demande de document */}
      <Modal
        visible={showRequestModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRequestModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.modalHeader}
          >
            <TouchableOpacity
              onPress={() => setShowRequestModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Demander un document</Text>
            <View style={styles.modalPlaceholder} />
          </LinearGradient>

          <View style={styles.modalContent}>
            <Text style={styles.modalLabel}>Types de documents disponibles :</Text>
            <FlatList
              data={documentTypes}
              keyExtractor={(item) => item.id}
              renderItem={renderDocumentTypeItem}
              numColumns={2}
              contentContainerStyle={styles.typesGrid}
            />

            <Text style={styles.modalLabel}>
              Description de votre demande :
            </Text>
            {selectedTypeId && (
              <Text style={{ color: "#6B7280", marginBottom: 8 }}>
                Type sélectionné: {mapTypeName(selectedTypeId)}
              </Text>
            )}
            <TextInput
              style={styles.modalInput}
              placeholder="Décrivez votre demande de document..."
              placeholderTextColor="#9CA3AF"
              value={requestText}
              onChangeText={setRequestText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleRequestDocument}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.submitGradient}
              >
                <Ionicons name="send" size={18} color="#FFFFFF" />
                <Text style={styles.submitText}>Envoyer la demande</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
  requestButton: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  requestGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  requestText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  contentContainer: {
    flex: 1,
  },
  documentsList: {
    padding: 20,
    flexGrow: 1,
  },
  documentSeparator: {
    height: 12,
  },
  documentWrapper: {
    marginBottom: 0,
  },
  documentItem: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: "#FFFFFF",
  },
  documentGradient: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  documentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
  },
  documentIconContainer: {
    marginRight: 15,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  documentContent: {
    flex: 1,
  },
  documentTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  documentName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
    marginRight: 10,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  documentDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  documentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 6,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    fontWeight: "500",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    color: "#667eea",
    fontWeight: "600",
    marginLeft: 4,
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
    paddingVertical: 40,
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
  quickActionsContainer: {
    width: "100%",
    marginTop: 20,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  quickActionsList: {
    paddingHorizontal: 10,
  },
  typeItem: {
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  typeGradient: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    minWidth: 100,
  },
  typeName: {
    fontSize: 12,
    color: "#667eea",
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 40,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  modalPlaceholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  typesGrid: {
    marginBottom: 24,
  },
  modalInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    color: "#374151",
    marginBottom: 24,
    height: 120,
  },
  submitButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
});

export default DocumentScreen;
