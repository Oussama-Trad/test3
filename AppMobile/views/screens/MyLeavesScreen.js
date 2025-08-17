import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Dimensions,
  StatusBar,
  Animated,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../../context/UserContext";

const MyLeavesScreen = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const [leaves, setLeaves] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [statistics, setStatistics] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
    totalDays: 0,
  });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;

  // Données simulées enrichies
  const mockLeaves = [
    {
      _id: "1",
      type: "congé annuel",
      startDate: "2024-08-20",
      endDate: "2024-08-25",
      status: "approved",
      reason: "Vacances en famille",
      duration: 6,
      submittedDate: "2024-08-10",
      approvedBy: "Marie Dubois",
      priority: "normal",
    },
    {
      _id: "2",
      type: "congé maladie",
      startDate: "2024-08-15",
      endDate: "2024-08-16",
      status: "pending",
      reason: "Consultation médicale",
      duration: 2,
      submittedDate: "2024-08-14",
      priority: "urgent",
    },
    {
      _id: "3",
      type: "congé sans solde",
      startDate: "2024-09-01",
      endDate: "2024-09-03",
      status: "rejected",
      reason: "Voyage personnel",
      duration: 3,
      submittedDate: "2024-08-05",
      rejectedBy: "Pierre Martin",
      rejectionReason: "Période de forte activité",
      priority: "normal",
    },
    {
      _id: "4",
      type: "congé maternité",
      startDate: "2024-10-01",
      endDate: "2024-12-01",
      status: "approved",
      reason: "Congé maternité réglementaire",
      duration: 60,
      submittedDate: "2024-07-15",
      approvedBy: "Direction RH",
      priority: "high",
    },
  ];

  useEffect(() => {
    initializeScreen();
    fetchLeaves();
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
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(statsAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(fabAnim, {
          toValue: 1,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const fetchLeaves = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      // Simulation de l'API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLeaves(mockLeaves);
      calculateStatistics(mockLeaves);
    } catch (e) {
      setLeaves([]);
      Alert.alert("❌ Erreur", "Impossible de charger vos demandes de congé");
    }
    setRefreshing(false);
    setLoading(false);
  };

  const calculateStatistics = (leavesData) => {
    const stats = {
      pending: leavesData.filter((l) => l.status === "pending").length,
      approved: leavesData.filter((l) => l.status === "approved").length,
      rejected: leavesData.filter((l) => l.status === "rejected").length,
      total: leavesData.length,
      totalDays: leavesData.reduce((sum, l) => sum + (l.duration || 0), 0),
    };
    setStatistics(stats);
  };

  const onRefresh = async () => {
    await fetchLeaves();
  };

  const filteredLeaves = leaves.filter((leave) => {
    const matchesSearch =
      leave.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.status.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === "all") return matchesSearch;
    return matchesSearch && leave.status === selectedFilter;
  });

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return {
          color: "#FF9800",
          icon: "time-outline",
          label: "En attente",
          bgColor: "rgba(255, 152, 0, 0.1)",
        };
      case "approved":
        return {
          color: "#4CAF50",
          icon: "checkmark-circle-outline",
          label: "Approuvé",
          bgColor: "rgba(76, 175, 80, 0.1)",
        };
      case "rejected":
        return {
          color: "#F44336",
          icon: "close-circle-outline",
          label: "Rejeté",
          bgColor: "rgba(244, 67, 54, 0.1)",
        };
      default:
        return {
          color: "#9E9E9E",
          icon: "help-circle-outline",
          label: "Inconnu",
          bgColor: "rgba(158, 158, 158, 0.1)",
        };
    }
  };

  const getTypeInfo = (type) => {
    switch (type) {
      case "congé annuel":
        return { emoji: "🏖️", color: "#2196F3" };
      case "congé maladie":
        return { emoji: "🏥", color: "#F44336" };
      case "congé sans solde":
        return { emoji: "💸", color: "#FF9800" };
      case "congé maternité":
        return { emoji: "👶", color: "#E91E63" };
      default:
        return { emoji: "📅", color: "#9E9E9E" };
    }
  };

  const getPriorityInfo = (priority) => {
    switch (priority) {
      case "urgent":
        return { color: "#F44336", label: "Urgent" };
      case "high":
        return { color: "#FF9800", label: "Élevée" };
      case "normal":
        return { color: "#4CAF50", label: "Normale" };
      default:
        return { color: "#9E9E9E", label: "Non définie" };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleLeavePress = (leave) => {
    setSelectedLeave(leave);
    setModalVisible(true);
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
            <Text style={styles.headerTitle}>📅 Mes Congés</Text>
            <Text style={styles.headerSubtitle}>Gestion de vos demandes</Text>
          </View>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onRefresh}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderStatistics = () => (
    <Animated.View
      style={[
        styles.statisticsContainer,
        {
          opacity: statsAnim,
          transform: [{ scale: statsAnim }],
        },
      ]}
    >
      <BlurView intensity={95} tint="light" style={styles.statisticsBlur}>
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0.6)"]}
          style={styles.statisticsGradient}
        >
          <Text style={styles.statisticsTitle}>📊 Statistiques</Text>
          <View style={styles.statisticsGrid}>
            <View
              style={[
                styles.statItem,
                { backgroundColor: "rgba(255, 152, 0, 0.1)" },
              ]}
            >
              <Text style={styles.statNumber}>{statistics.pending}</Text>
              <Text style={styles.statLabel}>En attente</Text>
            </View>
            <View
              style={[
                styles.statItem,
                { backgroundColor: "rgba(76, 175, 80, 0.1)" },
              ]}
            >
              <Text style={styles.statNumber}>{statistics.approved}</Text>
              <Text style={styles.statLabel}>Approuvées</Text>
            </View>
            <View
              style={[
                styles.statItem,
                { backgroundColor: "rgba(244, 67, 54, 0.1)" },
              ]}
            >
              <Text style={styles.statNumber}>{statistics.rejected}</Text>
              <Text style={styles.statLabel}>Rejetées</Text>
            </View>
            <View
              style={[
                styles.statItem,
                { backgroundColor: "rgba(102, 126, 234, 0.1)" },
              ]}
            >
              <Text style={styles.statNumber}>{statistics.totalDays}</Text>
              <Text style={styles.statLabel}>Jours total</Text>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchFilterContainer}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <BlurView intensity={80} tint="light" style={styles.searchBlur}>
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
              placeholder="Rechercher une demande..."
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
      </View>

      {/* Filtres */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScroll}
      >
        {[
          { key: "all", label: "Toutes", icon: "list-outline" },
          { key: "pending", label: "En attente", icon: "time-outline" },
          {
            key: "approved",
            label: "Approuvées",
            icon: "checkmark-circle-outline",
          },
          { key: "rejected", label: "Rejetées", icon: "close-circle-outline" },
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

  const renderItem = ({ item, index }) => {
    const statusInfo = getStatusInfo(item.status);
    const typeInfo = getTypeInfo(item.type);
    const priorityInfo = getPriorityInfo(item.priority);

    return (
      <Animated.View
        style={[
          styles.leaveContainer,
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
          style={styles.leaveItem}
          onPress={() => handleLeavePress(item)}
          activeOpacity={0.8}
        >
          <BlurView intensity={90} tint="light" style={styles.leaveBlur}>
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0.7)"]}
              style={styles.leaveGradient}
            >
              <View style={styles.leaveContent}>
                {/* Header avec type et statut */}
                <View style={styles.leaveHeader}>
                  <View style={styles.leaveTypeContainer}>
                    <Text style={styles.typeEmoji}>{typeInfo.emoji}</Text>
                    <Text style={[styles.leaveType, { color: typeInfo.color }]}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusInfo.bgColor },
                    ]}
                  >
                    <Ionicons
                      name={statusInfo.icon}
                      size={14}
                      color={statusInfo.color}
                    />
                    <Text
                      style={[styles.statusText, { color: statusInfo.color }]}
                    >
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                {/* Dates */}
                <View style={styles.datesContainer}>
                  <View style={styles.dateItem}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="#667eea"
                    />
                    <Text style={styles.dateText}>
                      {formatDate(item.startDate)} → {formatDate(item.endDate)}
                    </Text>
                  </View>
                  <View style={styles.durationContainer}>
                    <Ionicons name="time-outline" size={14} color="#666666" />
                    <Text style={styles.durationText}>
                      {item.duration} jour{item.duration > 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>

                {/* Raison */}
                {item.reason && (
                  <View style={styles.reasonContainer}>
                    <Text style={styles.reasonLabel}>Motif:</Text>
                    <Text style={styles.reasonText} numberOfLines={2}>
                      {item.reason}
                    </Text>
                  </View>
                )}

                {/* Footer avec priorité et actions */}
                <View style={styles.leaveFooter}>
                  <View style={styles.priorityContainer}>
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: priorityInfo.color },
                      ]}
                    />
                    <Text style={styles.priorityText}>
                      {priorityInfo.label}
                    </Text>
                  </View>
                  <View style={styles.leaveActions}>
                    <Text style={styles.submittedText}>
                      Soumis le {formatDate(item.submittedDate)}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#667eea"
                    />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderDetailModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {selectedLeave && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {getTypeInfo(selectedLeave.type).emoji} Détails de la
                      demande
                    </Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible(false)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close" size={24} color="#666666" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    style={styles.modalBody}
                    showsVerticalScrollIndicator={false}
                  >
                    {/* Type et statut */}
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>
                        📋 Informations générales
                      </Text>
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Type:</Text>
                        <Text style={styles.modalValue}>
                          {selectedLeave.type.charAt(0).toUpperCase() +
                            selectedLeave.type.slice(1)}
                        </Text>
                      </View>
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Statut:</Text>
                        <View style={styles.statusContainer}>
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor: getStatusInfo(
                                  selectedLeave.status
                                ).bgColor,
                              },
                            ]}
                          >
                            <Ionicons
                              name={getStatusInfo(selectedLeave.status).icon}
                              size={14}
                              color={getStatusInfo(selectedLeave.status).color}
                            />
                            <Text
                              style={[
                                styles.statusText,
                                {
                                  color: getStatusInfo(selectedLeave.status)
                                    .color,
                                },
                              ]}
                            >
                              {getStatusInfo(selectedLeave.status).label}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Priorité:</Text>
                        <Text
                          style={[
                            styles.modalValue,
                            {
                              color: getPriorityInfo(selectedLeave.priority)
                                .color,
                            },
                          ]}
                        >
                          {getPriorityInfo(selectedLeave.priority).label}
                        </Text>
                      </View>
                    </View>

                    {/* Dates */}
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>📅 Période</Text>
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Début:</Text>
                        <Text style={styles.modalValue}>
                          {formatDate(selectedLeave.startDate)}
                        </Text>
                      </View>
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Fin:</Text>
                        <Text style={styles.modalValue}>
                          {formatDate(selectedLeave.endDate)}
                        </Text>
                      </View>
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Durée:</Text>
                        <Text style={styles.modalValue}>
                          {selectedLeave.duration} jour
                          {selectedLeave.duration > 1 ? "s" : ""}
                        </Text>
                      </View>
                    </View>

                    {/* Raison */}
                    {selectedLeave.reason && (
                      <View style={styles.modalSection}>
                        <Text style={styles.sectionTitle}>💭 Motif</Text>
                        <Text style={styles.reasonDetail}>
                          {selectedLeave.reason}
                        </Text>
                      </View>
                    )}

                    {/* Informations d'approbation/rejet */}
                    {selectedLeave.approvedBy && (
                      <View style={styles.modalSection}>
                        <Text style={styles.sectionTitle}>✅ Approbation</Text>
                        <View style={styles.modalRow}>
                          <Text style={styles.modalLabel}>Approuvé par:</Text>
                          <Text style={styles.modalValue}>
                            {selectedLeave.approvedBy}
                          </Text>
                        </View>
                      </View>
                    )}

                    {selectedLeave.rejectedBy && (
                      <View style={styles.modalSection}>
                        <Text style={styles.sectionTitle}>❌ Rejet</Text>
                        <View style={styles.modalRow}>
                          <Text style={styles.modalLabel}>Rejeté par:</Text>
                          <Text style={styles.modalValue}>
                            {selectedLeave.rejectedBy}
                          </Text>
                        </View>
                        {selectedLeave.rejectionReason && (
                          <View style={styles.modalRow}>
                            <Text style={styles.modalLabel}>
                              Raison du rejet:
                            </Text>
                            <Text style={styles.modalValue}>
                              {selectedLeave.rejectionReason}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Date de soumission */}
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>📝 Soumission</Text>
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>
                          Date de soumission:
                        </Text>
                        <Text style={styles.modalValue}>
                          {formatDate(selectedLeave.submittedDate)}
                        </Text>
                      </View>
                    </View>
                  </ScrollView>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        setModalVisible(false);
                        navigation.navigate("LeaveRequestForm", {
                          leave: selectedLeave,
                        });
                      }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={["#667eea", "#764ba2"]}
                        style={styles.editButtonGradient}
                      >
                        <Ionicons
                          name="create-outline"
                          size={18}
                          color="#FFFFFF"
                        />
                        <Text style={styles.editButtonText}>Modifier</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );

  const renderEmptyState = () => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>Aucune demande de congé</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? "Aucun résultat pour votre recherche"
          : "Vous n'avez pas encore soumis de demande de congé"}
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate("LeaveRequestForm")}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.emptyButtonGradient}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.emptyButtonText}>Nouvelle demande</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderFAB = () => (
    <Animated.View
      style={[
        styles.fab,
        {
          opacity: fabAnim,
          transform: [{ scale: fabAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => navigation.navigate("LeaveRequest")}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.fabText}>Nouvelle demande</Text>
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
          {renderStatistics()}
          {renderSearchAndFilters()}

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>
                📋 Chargement de vos demandes...
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredLeaves}
              renderItem={renderItem}
              keyExtractor={(item) => item._id}
              style={styles.leavesList}
              contentContainerStyle={styles.leavesContent}
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

        {renderFAB()}
        {renderDetailModal()}
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
  headerButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingTop: 15,
  },
  statisticsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statisticsBlur: {
    borderRadius: 20,
    overflow: "hidden",
  },
  statisticsGradient: {
    padding: 20,
  },
  statisticsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 15,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  statisticsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 3,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    textAlign: "center",
  },
  searchFilterContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchContainer: {
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
  filtersScroll: {
    paddingBottom: 5,
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
  leavesList: {
    flex: 1,
  },
  leavesContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  leaveContainer: {
    marginBottom: 15,
  },
  leaveItem: {
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
  leaveBlur: {
    borderRadius: 20,
    overflow: "hidden",
  },
  leaveGradient: {
    padding: 16,
  },
  leaveContent: {
    // Container principal du contenu
  },
  leaveHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  leaveTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  typeEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  leaveType: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  datesContainer: {
    marginBottom: 10,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  dateText: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    fontWeight: "500",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 6,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  reasonContainer: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: "rgba(102, 126, 234, 0.05)",
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#667eea",
  },
  reasonLabel: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "500",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  reasonText: {
    fontSize: 14,
    color: "#333333",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    lineHeight: 18,
  },
  leaveFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priorityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    color: "#666666",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    fontWeight: "500",
  },
  leaveActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  submittedText: {
    fontSize: 11,
    color: "#888888",
    marginRight: 8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBlur: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    maxHeight: height * 0.85,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: height * 0.85,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    maxHeight: height * 0.6,
  },
  modalSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
  },
  modalLabel: {
    fontSize: 14,
    color: "#666666",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    flex: 1,
  },
  modalValue: {
    fontSize: 14,
    color: "#333333",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  statusContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  reasonDetail: {
    fontSize: 14,
    color: "#333333",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    lineHeight: 20,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
  },
  modalActions: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  editButton: {
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  editButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  editButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  // Empty state
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
  // FAB
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  fabButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  fabGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  fabText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
});

export default MyLeavesScreen;
