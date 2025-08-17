import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  SafeAreaView,
  Platform,
  Animated,
  StatusBar,
  Dimensions,
} from "react-native";
import { CheckBox } from "react-native-elements";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import InputField from "../../components/InputField";
import { updateProfile } from "../../services/api/employeeApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const EditProfileScreen = ({ route, navigation }) => {
  const { profile } = route.params;
  const [form, setForm] = useState({ ...profile });
  const [editPassword, setEditPassword] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSave = async () => {
    const token = await AsyncStorage.getItem("token");
    const res = await updateProfile(token, form);
    if (res && res.success) {
      Alert.alert("Succès", "Profil mis à jour !");
      navigation.goBack();
    } else {
      Alert.alert("Erreur", res.message || "Erreur lors de la mise à jour");
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={["#667eea", "#764ba2", "#f093fb"]}
          style={styles.container}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View
            style={[
              styles.header,
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
              <BlurView intensity={20} style={styles.backButtonBlur}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </BlurView>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Modifier le profil</Text>
            <View style={styles.headerSpacer} />
          </Animated.View>

          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.cardContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
                },
              ]}
            >
              <BlurView intensity={25} style={styles.card}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.1)"]}
                  style={styles.cardGradient}
                >
                  <View style={styles.avatarSection}>
                    {form.photoDeProfil ? (
                      <Image
                        source={{ uri: form.photoDeProfil }}
                        style={styles.avatar}
                      />
                    ) : (
                      <LinearGradient
                        colors={[
                          "rgba(255,255,255,0.3)",
                          "rgba(255,255,255,0.1)",
                        ]}
                        style={styles.avatarPlaceholder}
                      >
                        <Ionicons
                          name="person"
                          size={40}
                          color="rgba(255,255,255,0.8)"
                        />
                      </LinearGradient>
                    )}
                    <TouchableOpacity
                      style={styles.importButton}
                      onPress={async () => {
                        const result =
                          await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.7,
                          });
                        if (
                          !result.canceled &&
                          result.assets &&
                          result.assets.length > 0
                        ) {
                          handleChange("photoDeProfil", result.assets[0].uri);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(255,255,255,0.3)",
                          "rgba(255,255,255,0.15)",
                        ]}
                        style={styles.importButtonGradient}
                      >
                        <Ionicons
                          name="camera"
                          size={20}
                          color="#fff"
                          style={styles.importIcon}
                        />
                        <Text style={styles.importButtonText}>
                          Changer photo
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formSection}>
                    <View style={styles.inputContainer}>
                      <InputField
                        value={form.id}
                        onChangeText={(v) => handleChange("id", v)}
                        placeholder="ID (8 chiffres)"
                        editable={false}
                        style={styles.input}
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <InputField
                        value={form.nom}
                        onChangeText={(v) => handleChange("nom", v)}
                        placeholder="Nom"
                        style={styles.input}
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <InputField
                        value={form.prenom}
                        onChangeText={(v) => handleChange("prenom", v)}
                        placeholder="Prénom"
                        style={styles.input}
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => setEditPassword(!editPassword)}
                      activeOpacity={0.8}
                    >
                      <BlurView intensity={15} style={styles.checkboxBlur}>
                        <CheckBox
                          checked={editPassword}
                          onPress={() => setEditPassword(!editPassword)}
                          containerStyle={styles.checkbox}
                          checkedColor="#fff"
                          uncheckedColor="rgba(255,255,255,0.7)"
                        />
                        <Text style={styles.checkboxLabel}>
                          Modifier le mot de passe
                        </Text>
                      </BlurView>
                    </TouchableOpacity>

                    {editPassword && (
                      <View style={styles.inputContainer}>
                        <InputField
                          value={form.password}
                          onChangeText={(v) => handleChange("password", v)}
                          placeholder="Nouveau mot de passe"
                          secureTextEntry
                          style={styles.input}
                        />
                      </View>
                    )}

                    <View style={styles.inputContainer}>
                      <InputField
                        value={form.adresse1}
                        onChangeText={(v) => handleChange("adresse1", v)}
                        placeholder="Adresse 1"
                        style={styles.input}
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <InputField
                        value={form.adresse2}
                        onChangeText={(v) => handleChange("adresse2", v)}
                        placeholder="Adresse 2"
                        style={styles.input}
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <InputField
                        value={form.numTel}
                        onChangeText={(v) => handleChange("numTel", v)}
                        placeholder="Téléphone"
                        style={styles.input}
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <InputField
                        value={form.numTelParentale}
                        onChangeText={(v) => handleChange("numTelParentale", v)}
                        placeholder="Téléphone Parentale"
                        style={styles.input}
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <InputField
                        value={form.location}
                        onChangeText={(v) => handleChange("location", v)}
                        placeholder="Site"
                        style={styles.input}
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <InputField
                        value={form.departement}
                        onChangeText={(v) => handleChange("departement", v)}
                        placeholder="Département"
                        style={styles.input}
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleSave}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(255,255,255,0.3)",
                          "rgba(255,255,255,0.15)",
                        ]}
                        style={styles.saveButtonGradient}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#fff"
                          style={styles.saveIcon}
                        />
                        <Text style={styles.saveButtonText}>Enregistrer</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </BlurView>
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#667eea",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: Platform.OS === "ios" ? 15 : 25,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    overflow: "hidden",
  },
  backButtonBlur: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "Roboto",
  },
  headerSpacer: {
    width: 45,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  cardContainer: {
    flex: 1,
    marginTop: 20,
  },
  card: {
    flex: 1,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  cardGradient: {
    flex: 1,
    padding: 25,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  importButton: {
    borderRadius: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  importButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  importIcon: {
    marginRight: 8,
  },
  importButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "Roboto",
  },
  formSection: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: "#fff",
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "Roboto",
    placeholderTextColor: "rgba(255,255,255,0.7)",
  },
  checkboxContainer: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: "hidden",
  },
  checkboxBlur: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  checkbox: {
    padding: 0,
    margin: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    marginRight: 10,
  },
  checkboxLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "Roboto",
  },
  saveButton: {
    marginTop: 20,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
  saveIcon: {
    marginRight: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "Roboto",
  },
});

export default EditProfileScreen;
