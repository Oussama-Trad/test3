import React, { useState, useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  ScrollView,
  Animated,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Modal,
} from "react-native";
// Conditional import for DateTimePicker (not supported on web)
let DateTimePicker;
if (Platform.OS !== "web") {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
}
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { UserContext } from "../../context/UserContext";

const { width, height } = Dimensions.get("window");

const LeaveRequestForm = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [type, setType] = useState("annuel");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({});

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const formAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const leaveTypes = [
    {
      key: "annuel",
      label: "Congé annuel",
      icon: "calendar",
      color: "#4facfe",
      description: "Congés payés annuels",
    },
    {
      key: "maladie",
      label: "Congé maladie",
      icon: "medical",
      color: "#ff6b6b",
      description: "Arrêt maladie avec justificatif",
    },
    {
      key: "maternite",
      label: "Congé maternité",
      icon: "heart",
      color: "#f093fb",
      description: "Congé maternité/paternité",
    },
    {
      key: "formation",
      label: "Formation",
      icon: "school",
      color: "#667eea",
      description: "Formation professionnelle",
    },
    {
      key: "personnel",
      label: "Congé personnel",
      icon: "person",
      color: "#764ba2",
      description: "Congé exceptionnel personnel",
    },
    {
      key: "autre",
      label: "Autre",
      icon: "ellipsis-horizontal",
      color: "#888888",
      description: "Autre type de congé",
    },
  ];

  useEffect(() => {
    // Animations d'entrée séquentielles
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
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Animation des champs en cascade
      Animated.stagger(
        100,
        formAnimations.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!type) {
      newErrors.type = "Veuillez sélectionner un type de congé";
    }

    if (startDate >= endDate) {
      newErrors.dates = "La date de fin doit être après la date de début";
    }

    if (!reason.trim()) {
      newErrors.reason = "Veuillez préciser la raison de votre demande";
    }

    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (type === "annuel" && diffDays > 30) {
      newErrors.duration =
        "Les congés annuels ne peuvent pas excéder 30 jours consécutifs";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateDuration = () => {
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Platform-specific date picker renderer
  const renderDatePicker = (show, value, onChange, minimumDate = null) => {
    if (Platform.OS === "web") {
      return show ? (
        <input
          type="date"
          value={value.toISOString().split("T")[0]}
          min={
            minimumDate ? minimumDate.toISOString().split("T")[0] : undefined
          }
          onChange={(e) => {
            const selectedDate = new Date(e.target.value);
            onChange(null, selectedDate);
          }}
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ddd",
            fontSize: 16,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          }}
        />
      ) : null;
    } else {
      return show && DateTimePicker ? (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          onChange={onChange}
        />
      ) : null;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        "Formulaire incomplet",
        "Veuillez corriger les erreurs signalées"
      );
      return;
    }

    setLoading(true);

    // Animation de feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const res = await fetch("http://172.20.10.2:5000/api/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: user.id,
          employeeNom: user.nom,
          employeePrenom: user.prenom,
          locationId: user.locationId,
          locationNom: user.locationNom,
          departementId: user.departementId,
          departementNom: user.departementNom,
          type,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          reason: reason.trim(),
          duration: calculateDuration(),
        }),
      });

      if (res.ok) {
        // Animation de succès
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();

        Alert.alert(
          "✅ Demande envoyée",
          "Votre demande de congé a été transmise avec succès !",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        const err = await res.json();
        Alert.alert("❌ Erreur", err.error || "Erreur lors de la demande");
      }
    } catch (e) {
      Alert.alert("❌ Erreur", "Impossible de contacter le serveur");
    }
    setLoading(false);
  };

  const getSelectedLeaveType = () => {
    return leaveTypes.find((t) => t.key === type) || leaveTypes[0];
  };

  const renderHeader = () => (
    <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
      <BlurView intensity={95} tint="light" style={styles.headerBlur}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Demande de congé</Text>
        <View style={styles.headerRight} />
      </BlurView>
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

  const renderTypeModal = () => (
    <Modal
      visible={showTypeModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowTypeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={95} tint="dark" style={styles.modalBlur}>
          <Animated.View
            style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}
          >
            <Text style={styles.modalTitle}>Choisir le type de congé</Text>
            <ScrollView
              style={styles.typesList}
              showsVerticalScrollIndicator={false}
            >
              {leaveTypes.map((leaveType) => (
                <TouchableOpacity
                  key={leaveType.key}
                  style={[
                    styles.typeOption,
                    type === leaveType.key && styles.typeOptionSelected,
                  ]}
                  onPress={() => {
                    setType(leaveType.key);
                    setShowTypeModal(false);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.typeOptionContent}>
                    <View
                      style={[
                        styles.typeIcon,
                        { backgroundColor: `${leaveType.color}20` },
                      ]}
                    >
                      <Ionicons
                        name={leaveType.icon}
                        size={24}
                        color={leaveType.color}
                      />
                    </View>
                    <View style={styles.typeInfo}>
                      <Text style={styles.typeLabel}>{leaveType.label}</Text>
                      <Text style={styles.typeDescription}>
                        {leaveType.description}
                      </Text>
                    </View>
                    {type === leaveType.key && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={leaveType.color}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTypeModal(false)}
            >
              <Text style={styles.modalCloseText}>Fermer</Text>
            </TouchableOpacity>
          </Animated.View>
        </BlurView>
      </View>
    </Modal>
  );

  const renderFormField = (index, content) => (
    <Animated.View
      style={[
        styles.fieldContainer,
        {
          opacity: formAnimations[index],
          transform: [
            {
              translateY: formAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      {content}
      {errors[Object.keys(errors)[index]] && (
        <Text style={styles.errorText}>
          {errors[Object.keys(errors)[index]]}
        </Text>
      )}
    </Animated.View>
  );

  const renderSummaryCard = () => {
    const selectedType = getSelectedLeaveType();
    const duration = calculateDuration();

    return (
      <View style={styles.summaryCard}>
        <BlurView intensity={90} tint="light" style={styles.summaryBlur}>
          <Text style={styles.summaryTitle}>📋 Résumé de la demande</Text>
          <View style={styles.summaryItem}>
            <Ionicons name="person-outline" size={16} color="#667eea" />
            <Text style={styles.summaryLabel}>Demandeur</Text>
            <Text style={styles.summaryValue}>
              {user?.prenom} {user?.nom}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons
              name={selectedType.icon}
              size={16}
              color={selectedType.color}
            />
            <Text style={styles.summaryLabel}>Type</Text>
            <Text style={styles.summaryValue}>{selectedType.label}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="time-outline" size={16} color="#4facfe" />
            <Text style={styles.summaryLabel}>Durée</Text>
            <Text style={styles.summaryValue}>
              {duration} jour{duration > 1 ? "s" : ""}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="location-outline" size={16} color="#764ba2" />
            <Text style={styles.summaryLabel}>Service</Text>
            <Text style={styles.summaryValue}>
              {user?.departement || "N/A"}
            </Text>
          </View>
        </BlurView>
      </View>
    );
  };

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
        {renderTypeModal()}

        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            <BlurView intensity={95} tint="light" style={styles.formCard}>
              <View style={styles.formContent}>
                <Text style={styles.formTitle}>🏖️ Nouvelle demande</Text>
                <Text style={styles.formSubtitle}>
                  Remplissez ce formulaire pour soumettre votre demande de congé
                </Text>

                {renderFormField(
                  0,
                  <View>
                    <Text style={styles.fieldLabel}>Type de congé *</Text>
                    <TouchableOpacity
                      style={[
                        styles.typeSelector,
                        errors.type && styles.fieldError,
                      ]}
                      onPress={() => setShowTypeModal(true)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.typeSelectorContent}>
                        <View
                          style={[
                            styles.typeIconSmall,
                            {
                              backgroundColor: `${
                                getSelectedLeaveType().color
                              }20`,
                            },
                          ]}
                        >
                          <Ionicons
                            name={getSelectedLeaveType().icon}
                            size={20}
                            color={getSelectedLeaveType().color}
                          />
                        </View>
                        <Text style={styles.typeSelectorText}>
                          {getSelectedLeaveType().label}
                        </Text>
                        <Ionicons
                          name="chevron-down"
                          size={20}
                          color="#666666"
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                {renderFormField(
                  1,
                  <View>
                    <Text style={styles.fieldLabel}>Date de début *</Text>
                    <TouchableOpacity
                      style={[
                        styles.dateSelector,
                        errors.dates && styles.fieldError,
                      ]}
                      onPress={() => setShowStart(true)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#4facfe"
                      />
                      <Text style={styles.dateSelectorText}>
                        {startDate.toLocaleDateString("fr-FR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Text>
                    </TouchableOpacity>
                    {renderDatePicker(
                      showStart,
                      startDate,
                      (e, d) => {
                        setShowStart(false);
                        if (d) {
                          setStartDate(d);
                          if (d >= endDate) {
                            const newEndDate = new Date(d);
                            newEndDate.setDate(newEndDate.getDate() + 1);
                            setEndDate(newEndDate);
                          }
                        }
                      },
                      new Date()
                    )}
                  </View>
                )}

                {renderFormField(
                  2,
                  <View>
                    <Text style={styles.fieldLabel}>Date de fin *</Text>
                    <TouchableOpacity
                      style={[
                        styles.dateSelector,
                        errors.dates && styles.fieldError,
                      ]}
                      onPress={() => setShowEnd(true)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#4facfe"
                      />
                      <Text style={styles.dateSelectorText}>
                        {endDate.toLocaleDateString("fr-FR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Text>
                    </TouchableOpacity>
                    {renderDatePicker(
                      showEnd,
                      endDate,
                      (e, d) => {
                        setShowEnd(false);
                        if (d) setEndDate(d);
                      },
                      startDate
                    )}
                  </View>
                )}

                {renderFormField(
                  3,
                  <View>
                    <Text style={styles.fieldLabel}>Motif de la demande *</Text>
                    <TextInput
                      style={[
                        styles.reasonInput,
                        errors.reason && styles.fieldError,
                      ]}
                      value={reason}
                      onChangeText={setReason}
                      placeholder="Précisez la raison de votre demande..."
                      placeholderTextColor="#999999"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                )}

                {renderFormField(4, renderSummaryCard())}

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    loading && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      loading ? ["#cccccc", "#aaaaaa"] : ["#667eea", "#764ba2"]
                    }
                    style={styles.submitButtonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="send" size={20} color="#FFFFFF" />
                        <Text style={styles.submitButtonText}>
                          Soumettre la demande
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </BlurView>
          </ScrollView>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 24,
  },
  headerBlur: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  headerRight: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 100 : 80,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formCard: {
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  formContent: {
    padding: 25,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  formSubtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 10,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  fieldError: {
    borderColor: "#ff6b6b",
    borderWidth: 2,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    marginTop: 5,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  typeSelector: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  typeSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  typeSelectorText: {
    flex: 1,
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  dateSelector: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  dateSelectorText: {
    fontSize: 16,
    color: "#1a1a1a",
    marginLeft: 10,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  reasonInput: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: "#1a1a1a",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    minHeight: 100,
  },
  summaryCard: {
    marginTop: 10,
    borderRadius: 20,
    overflow: "hidden",
  },
  summaryBlur: {
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 15,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 10,
    width: 80,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  summaryValue: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "600",
    flex: 1,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  submitButton: {
    marginTop: 25,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    elevation: 2,
    shadowOpacity: 0.1,
  },
  submitButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 10,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBlur: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 25,
    padding: 25,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  typesList: {
    maxHeight: 400,
  },
  typeOption: {
    borderRadius: 15,
    marginBottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  typeOptionSelected: {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    borderColor: "#667eea",
    borderWidth: 2,
  },
  typeOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  typeInfo: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  typeDescription: {
    fontSize: 14,
    color: "#666666",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  modalCloseButton: {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#667eea",
  },
  modalCloseText: {
    color: "#667eea",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
});

export default LeaveRequestForm;
