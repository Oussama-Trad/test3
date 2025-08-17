import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  Animated,
  TextInput,
  RefreshControl,
  Alert,
  ScrollView,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { getAllPartenariats } from "../../services/api/partenariatApi";

const PartenariatsScreen = ({ navigation }) => {
  const [partenariats, setPartenariats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedPartnership, setSelectedPartnership] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [favoritePartnerships, setFavoritePartnerships] = useState([]);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;

  // Données simulées enrichies
  const mockPartenariats = [
    {
      id: "1",
      titre: "Microsoft Partnership",
      type: "Technologie",
      description:
        "Partenariat stratégique avec Microsoft pour les solutions cloud et productivity",
      image: "https://via.placeholder.com/150x100/0078D4/FFFFFF?text=Microsoft",
      benefits: ["Licences Office 365", "Formation Azure", "Support technique"],
      startDate: "2024-01-15",
      endDate: "2025-12-31",
      status: "active",
      priority: "high",
      contact: "marie.dupont@microsoft.com",
      category: "tech",
      rating: 4.8,
    },
    {
      id: "2",
      titre: "Formation Professionnelle Plus",
      type: "Formation",
      description:
        "Organisme de formation pour le développement des compétences des employés",
      image: "https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Formation",
      benefits: [
        "Formations certifiantes",
        "E-learning",
        "Coaching individuel",
      ],
      startDate: "2023-06-01",
      endDate: "2024-12-31",
      status: "active",
      priority: "medium",
      contact: "contact@formationplus.fr",
      category: "education",
      rating: 4.5,
    },
    {
      id: "3",
      titre: "Wellness Corporate",
      type: "Bien-être",
      description: "Programme de bien-être et santé mentale pour les employés",
      image: "https://via.placeholder.com/150x100/4CAF50/FFFFFF?text=Wellness",
      benefits: [
        "Séances de sport",
        "Consultation psychologique",
        "Programmes nutrition",
      ],
      startDate: "2024-03-01",
      endDate: "2025-03-01",
      status: "active",
      priority: "high",
      contact: "info@wellness-corp.com",
      category: "health",
      rating: 4.9,
    },
    {
      id: "4",
      titre: "EcoGreen Solutions",
      type: "Environnement",
      description:
        "Solutions écologiques pour un bureau plus respectueux de l'environnement",
      image: "https://via.placeholder.com/150x100/8BC34A/FFFFFF?text=EcoGreen",
      benefits: ["Audit énergétique", "Fournitures éco", "Recyclage"],
      startDate: "2024-02-01",
      endDate: "2024-08-30",
      status: "expiring",
      priority: "medium",
      contact: "contact@ecogreen.fr",
      category: "environment",
      rating: 4.2,
    },
    {
      id: "5",
      titre: "FlexWork Solutions",
      type: "Mobilité",
      description: "Solutions de télétravail et espaces de coworking flexibles",
      image: "https://via.placeholder.com/150x100/9C27B0/FFFFFF?text=FlexWork",
      benefits: [
        "Espaces coworking",
        "Outils collaboration",
        "Support technique",
      ],
      startDate: "2023-12-01",
      endDate: "2024-06-30",
      status: "expired",
      priority: "low",
      contact: "hello@flexwork.com",
      category: "workspace",
      rating: 3.8,
    },
  ];

  useEffect(() => {
    initializeScreen();
    fetchPartenariats();
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

  const fetchPartenariats = async () => {
    setLoading(true);
    try {
      // Essayer l'API réelle d'abord
      const data = await getAllPartenariats();
      setPartenariats(data && data.length > 0 ? data : mockPartenariats);
    } catch (error) {
      // En cas d'erreur, utiliser les données simulées
      console.log("Using mock data for partnerships");
      setPartenariats(mockPartenariats);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPartenariats();
    setRefreshing(false);
  };

  const filteredPartenariats = partenariats.filter((partnership) => {
    const matchesSearch =
      partnership.titre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partnership.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partnership.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "active")
      return matchesSearch && partnership.status === "active";
    if (selectedFilter === "expiring")
      return matchesSearch && partnership.status === "expiring";
    if (selectedFilter === "favorites")
      return matchesSearch && favoritePartnerships.includes(partnership.id);

    return matchesSearch;
  });

  const getStatusInfo = (status) => {
    switch (status) {
      case "active":
        return {
          color: "#4CAF50",
          icon: "checkmark-circle",
          label: "Actif",
          bgColor: "rgba(76, 175, 80, 0.1)",
        };
      case "expiring":
        return {
          color: "#FF9800",
          icon: "warning",
          label: "Expire bientôt",
          bgColor: "rgba(255, 152, 0, 0.1)",
        };
      case "expired":
        return {
          color: "#F44336",
          icon: "close-circle",
          label: "Expiré",
          bgColor: "rgba(244, 67, 54, 0.1)",
        };
      default:
        return {
          color: "#9E9E9E",
          icon: "help-circle",
          label: "Inconnu",
          bgColor: "rgba(158, 158, 158, 0.1)",
        };
    }
  };

  const getCategoryInfo = (category) => {
    switch (category) {
      case "tech":
        return { emoji: "💻", color: "#2196F3" };
      case "education":
        return { emoji: "📚", color: "#FF9800" };
      case "health":
        return { emoji: "🏥", color: "#4CAF50" };
      case "environment":
        return { emoji: "🌱", color: "#8BC34A" };
      case "workspace":
        return { emoji: "🏢", color: "#9C27B0" };
      default:
        return { emoji: "🤝", color: "#607D8B" };
    }
  };

  const getPriorityInfo = (priority) => {
    switch (priority) {
      case "high":
        return { color: "#F44336", label: "Élevée" };
      case "medium":
        return { color: "#FF9800", label: "Moyenne" };
      case "low":
        return { color: "#4CAF50", label: "Faible" };
      default:
        return { color: "#9E9E9E", label: "Non définie" };
    }
  };

  const toggleFavorite = (partnershipId) => {
    setFavoritePartnerships((prev) => {
      if (prev.includes(partnershipId)) {
        return prev.filter((id) => id !== partnershipId);
      } else {
        return [...prev, partnershipId];
      }
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handlePartnershipPress = (partnership) => {
    setSelectedPartnership(partnership);
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
            <Text style={styles.headerTitle}>🤝 Partenariats</Text>
            <Text style={styles.headerSubtitle}>
              {partenariats.length} partenariat
              {partenariats.length > 1 ? "s" : ""}
            </Text>
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

  const renderSearchAndFilters = () => (
    <View style={styles.searchFilterContainer}>
      {/* Barre de recherche */}
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
              placeholder="Rechercher un partenariat..."
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

      {/* Filtres */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScroll}
      >
        {[
          { key: "all", label: "Tous", icon: "list-outline" },
          { key: "active", label: "Actifs", icon: "checkmark-circle-outline" },
          { key: "expiring", label: "Expire bientôt", icon: "warning-outline" },
          { key: "favorites", label: "Favoris", icon: "heart-outline" },
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

  const renderPartnershipItem = ({ item, index }) => {
    const statusInfo = getStatusInfo(item.status);
    const categoryInfo = getCategoryInfo(item.category);
    const priorityInfo = getPriorityInfo(item.priority);
    const isFavorite = favoritePartnerships.includes(item.id);

    return (
      <Animated.View
        style={[
          styles.partnershipContainer,
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
          style={styles.partnershipItem}
          onPress={() => handlePartnershipPress(item)}
          activeOpacity={0.8}
        >
          <BlurView intensity={90} tint="light" style={styles.partnershipBlur}>
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0.7)"]}
              style={styles.partnershipGradient}
            >
              <View style={styles.partnershipContent}>
                {/* Header avec image et favoris */}
                <View style={styles.partnershipHeader}>
                  <View style={styles.imageContainer}>
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        style={styles.partnershipImage}
                      />
                    ) : (
                      <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>
                          {categoryInfo.emoji}
                        </Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusInfo.bgColor },
                      ]}
                    >
                      <Ionicons
                        name={statusInfo.icon}
                        size={12}
                        color={statusInfo.color}
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isFavorite ? "heart" : "heart-outline"}
                      size={20}
                      color={isFavorite ? "#F44336" : "#999999"}
                    />
                  </TouchableOpacity>
                </View>

                {/* Titre et type */}
                <View style={styles.partnershipInfo}>
                  <Text style={styles.partnershipTitle} numberOfLines={2}>
                    {item.titre}
                  </Text>
                  <View style={styles.typeContainer}>
                    <Text style={styles.categoryEmoji}>
                      {categoryInfo.emoji}
                    </Text>
                    <Text
                      style={[
                        styles.partnershipType,
                        { color: categoryInfo.color },
                      ]}
                    >
                      {item.type}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.partnershipDescription} numberOfLines={3}>
                  {item.description}
                </Text>

                {/* Rating */}
                {item.rating && (
                  <View style={styles.ratingContainer}>
                    <View style={styles.starsContainer}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={
                            star <= Math.floor(item.rating)
                              ? "star"
                              : "star-outline"
                          }
                          size={14}
                          color="#FFD700"
                        />
                      ))}
                    </View>
                    <Text style={styles.ratingText}>{item.rating}/5</Text>
                  </View>
                )}

                {/* Bénéfices */}
                {item.benefits && item.benefits.length > 0 && (
                  <View style={styles.benefitsContainer}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      {item.benefits.slice(0, 3).map((benefit, idx) => (
                        <View key={idx} style={styles.benefitTag}>
                          <Text style={styles.benefitText}>{benefit}</Text>
                        </View>
                      ))}
                      {item.benefits.length > 3 && (
                        <View style={styles.moreBenefitsTag}>
                          <Text style={styles.moreBenefitsText}>
                            +{item.benefits.length - 3}
                          </Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                )}

                {/* Footer avec dates et priorité */}
                <View style={styles.partnershipFooter}>
                  <View style={styles.datesContainer}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#666666"
                    />
                    <Text style={styles.datesText}>
                      {formatDate(item.startDate)} - {formatDate(item.endDate)}
                    </Text>
                  </View>
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
              {selectedPartnership && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {getCategoryInfo(selectedPartnership.category).emoji}{" "}
                      Détails du partenariat
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
                    {/* Image et titre */}
                    <View style={styles.modalImageSection}>
                      {selectedPartnership.image ? (
                        <Image
                          source={{ uri: selectedPartnership.image }}
                          style={styles.modalImage}
                        />
                      ) : (
                        <View style={styles.modalPlaceholderImage}>
                          <Text style={styles.modalPlaceholderText}>
                            {
                              getCategoryInfo(selectedPartnership.category)
                                .emoji
                            }
                          </Text>
                        </View>
                      )}
                      <View style={styles.modalTitleSection}>
                        <Text style={styles.modalPartnershipTitle}>
                          {selectedPartnership.titre}
                        </Text>
                        <Text style={styles.modalPartnershipType}>
                          {selectedPartnership.type}
                        </Text>
                      </View>
                    </View>

                    {/* Statut et priorité */}
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>
                        📊 Informations générales
                      </Text>
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Statut:</Text>
                        <View style={styles.statusContainer}>
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor: getStatusInfo(
                                  selectedPartnership.status
                                ).bgColor,
                              },
                            ]}
                          >
                            <Ionicons
                              name={
                                getStatusInfo(selectedPartnership.status).icon
                              }
                              size={14}
                              color={
                                getStatusInfo(selectedPartnership.status).color
                              }
                            />
                            <Text
                              style={[
                                styles.statusText,
                                {
                                  color: getStatusInfo(
                                    selectedPartnership.status
                                  ).color,
                                },
                              ]}
                            >
                              {getStatusInfo(selectedPartnership.status).label}
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
                              color: getPriorityInfo(
                                selectedPartnership.priority
                              ).color,
                            },
                          ]}
                        >
                          {getPriorityInfo(selectedPartnership.priority).label}
                        </Text>
                      </View>
                      {selectedPartnership.rating && (
                        <View style={styles.modalRow}>
                          <Text style={styles.modalLabel}>Évaluation:</Text>
                          <View style={styles.modalRatingContainer}>
                            <View style={styles.starsContainer}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Ionicons
                                  key={star}
                                  name={
                                    star <=
                                    Math.floor(selectedPartnership.rating)
                                      ? "star"
                                      : "star-outline"
                                  }
                                  size={16}
                                  color="#FFD700"
                                />
                              ))}
                            </View>
                            <Text style={styles.modalRatingText}>
                              {selectedPartnership.rating}/5
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>

                    {/* Description */}
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>📝 Description</Text>
                      <Text style={styles.descriptionDetail}>
                        {selectedPartnership.description}
                      </Text>
                    </View>

                    {/* Bénéfices */}
                    {selectedPartnership.benefits &&
                      selectedPartnership.benefits.length > 0 && (
                        <View style={styles.modalSection}>
                          <Text style={styles.sectionTitle}>✅ Bénéfices</Text>
                          {selectedPartnership.benefits.map(
                            (benefit, index) => (
                              <View key={index} style={styles.benefitItem}>
                                <Ionicons
                                  name="checkmark-circle"
                                  size={16}
                                  color="#4CAF50"
                                />
                                <Text style={styles.benefitDetailText}>
                                  {benefit}
                                </Text>
                              </View>
                            )
                          )}
                        </View>
                      )}

                    {/* Période */}
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>
                        📅 Période du partenariat
                      </Text>
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Début:</Text>
                        <Text style={styles.modalValue}>
                          {formatDate(selectedPartnership.startDate)}
                        </Text>
                      </View>
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Fin:</Text>
                        <Text style={styles.modalValue}>
                          {formatDate(selectedPartnership.endDate)}
                        </Text>
                      </View>
                    </View>

                    {/* Contact */}
                    {selectedPartnership.contact && (
                      <View style={styles.modalSection}>
                        <Text style={styles.sectionTitle}>📞 Contact</Text>
                        <TouchableOpacity
                          style={styles.contactContainer}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="mail-outline"
                            size={16}
                            color="#667eea"
                          />
                          <Text style={styles.contactText}>
                            {selectedPartnership.contact}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </ScrollView>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.favoriteModalButton}
                      onPress={() => toggleFavorite(selectedPartnership.id)}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={
                          favoritePartnerships.includes(selectedPartnership.id)
                            ? ["#F44336", "#D32F2F"]
                            : ["#667eea", "#764ba2"]
                        }
                        style={styles.favoriteModalButtonGradient}
                      >
                        <Ionicons
                          name={
                            favoritePartnerships.includes(
                              selectedPartnership.id
                            )
                              ? "heart"
                              : "heart-outline"
                          }
                          size={18}
                          color="#FFFFFF"
                        />
                        <Text style={styles.favoriteModalButtonText}>
                          {favoritePartnerships.includes(selectedPartnership.id)
                            ? "Retirer des favoris"
                            : "Ajouter aux favoris"}
                        </Text>
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
      <Text style={styles.emptyIcon}>🤝</Text>
      <Text style={styles.emptyTitle}>Aucun partenariat trouvé</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? "Aucun résultat pour votre recherche"
          : "Aucun partenariat disponible pour le moment"}
      </Text>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={["#f8f9fa", "#e9ecef", "#f8f9fa"]}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>
            🤝 Chargement des partenariats...
          </Text>
        </LinearGradient>
      </View>
    );
  }

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
          {renderSearchAndFilters()}

          <FlatList
            data={filteredPartenariats}
            renderItem={renderPartnershipItem}
            keyExtractor={(item) => item.id || item._id}
            style={styles.partnershipsList}
            contentContainerStyle={styles.partnershipsContent}
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
        </View>

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
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#667eea",
    marginTop: 15,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
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
  partnershipsList: {
    flex: 1,
  },
  partnershipsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  partnershipContainer: {
    marginBottom: 15,
  },
  partnershipItem: {
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
  partnershipBlur: {
    borderRadius: 20,
    overflow: "hidden",
  },
  partnershipGradient: {
    padding: 16,
  },
  partnershipContent: {
    // Container principal du contenu
  },
  partnershipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  imageContainer: {
    position: "relative",
  },
  partnershipImage: {
    width: 80,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  placeholderImage: {
    width: 80,
    height: 60,
    borderRadius: 12,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 24,
  },
  statusBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    borderRadius: 10,
    padding: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  favoriteButton: {
    padding: 8,
  },
  partnershipInfo: {
    flex: 1,
    marginLeft: 15,
    marginRight: 10,
  },
  partnershipTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
    marginBottom: 6,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  partnershipType: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  partnershipDescription: {
    fontSize: 14,
    color: "#555555",
    marginBottom: 12,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    color: "#666666",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    fontWeight: "500",
  },
  benefitsContainer: {
    marginBottom: 12,
  },
  benefitTag: {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  benefitText: {
    fontSize: 11,
    color: "#667eea",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  moreBenefitsTag: {
    backgroundColor: "rgba(158, 158, 158, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  moreBenefitsText: {
    fontSize: 11,
    color: "#666666",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  partnershipFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  datesContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  datesText: {
    fontSize: 11,
    color: "#666666",
    marginLeft: 6,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
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
    fontSize: 11,
    color: "#666666",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    fontWeight: "500",
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
    maxHeight: height * 0.9,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: height * 0.9,
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
    maxHeight: height * 0.65,
  },
  modalImageSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalImage: {
    width: 120,
    height: 80,
    borderRadius: 15,
    marginBottom: 15,
  },
  modalPlaceholderImage: {
    width: 120,
    height: 80,
    borderRadius: 15,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  modalPlaceholderText: {
    fontSize: 32,
  },
  modalTitleSection: {
    alignItems: "center",
  },
  modalPartnershipTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
    marginBottom: 5,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  modalPartnershipType: {
    fontSize: 16,
    color: "#667eea",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
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
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  modalRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalRatingText: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    fontWeight: "500",
  },
  descriptionDetail: {
    fontSize: 14,
    color: "#333333",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    lineHeight: 20,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
  },
  benefitDetailText: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 10,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    flex: 1,
  },
  contactContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
  },
  contactText: {
    fontSize: 14,
    color: "#667eea",
    marginLeft: 8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    fontWeight: "500",
  },
  modalActions: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  favoriteModalButton: {
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
  favoriteModalButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  favoriteModalButtonText: {
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
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    lineHeight: 22,
  },
});

export default PartenariatsScreen;
