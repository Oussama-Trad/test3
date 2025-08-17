import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Picker } from "@react-native-picker/picker";
import InputField from "../../components/InputField";
import CustomButton from "../../components/CustomButton";
import {
  register,
  getLocations,
  getDepartments,
} from "../../services/api/employeeApi";
import { UserContext } from "../../context/UserContext";

const { width: screenWidth } = Dimensions.get("window");

const RegisterScreen = ({ navigation }) => {
  const { setUser } = useContext(UserContext);
  const [form, setForm] = useState({
    id: "",
    nom: "",
    prenom: "",
    password: "",
    adresse1: "",
    adresse2: "",
    numTel: "",
    numTelParentale: "",
    location: "",
    departement: "",
    photoDeProfil: "",
  });
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    getLocations()
      .then((res) => setLocations(res.locations || []))
      .catch((err) => {
        console.error("Erreur fetch locations:", err);
        setLocations([]);
      });
  }, []);

  useEffect(() => {
    if (form.location) {
      getDepartments(form.location)
        .then((res) => setDepartments(res.departments || []))
        .catch((err) => {
          console.error("Erreur fetch départements:", err);
          setDepartments([]);
        });
    } else {
      setDepartments([]);
    }
  }, [form.location]);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleRegister = async () => {
    const requiredFields = [
      { key: "id", label: "ID" },
      { key: "nom", label: "Nom" },
      { key: "prenom", label: "Prénom" },
      { key: "password", label: "Mot de passe" },
      { key: "adresse1", label: "Adresse 1" },
      { key: "numTel", label: "Téléphone" },
      { key: "location", label: "Site" },
      { key: "departement", label: "Département" },
    ];
    for (let field of requiredFields) {
      if (!form[field.key] || form[field.key].trim() === "") {
        Alert.alert(
          "Champ manquant",
          `Veuillez remplir le champ obligatoire : ${field.label}`
        );
        return;
      }
    }
    try {
      const res = await register(form);
      if (
        res &&
        res.message === "Employee registered successfully" &&
        res.token &&
        res.user
      ) {
        setUser(res.user);
        Alert.alert("Succès", "Inscription réussie !");
        navigation.replace("MainTabs");
      } else if (res && res.message === "Employee registered successfully") {
        Alert.alert("Succès", "Inscription réussie !");
        navigation.replace("Login");
      } else {
        Alert.alert("Erreur", res.message || "Erreur lors de l'inscription");
      }
    } catch (e) {
      Alert.alert("Erreur", "Impossible de contacter le serveur");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <BlurView intensity={20} style={styles.cardBlur}>
            <LinearGradient
              colors={[
                "rgba(255, 255, 255, 0.95)",
                "rgba(255, 255, 255, 0.85)",
              ]}
              style={styles.card}
            >
              <View style={styles.titleContainer}>
                <Text style={styles.title}>✨ Inscription</Text>
                <Text style={styles.subtitle}>Rejoignez notre équipe</Text>
              </View>
              <InputField
                value={form.id}
                onChangeText={(v) => handleChange("id", v)}
                placeholder="ID (8 chiffres)"
                style={styles.input}
                placeholderTextColor="#888"
                keyboardType="numeric"
              />
              <InputField
                value={form.nom}
                onChangeText={(v) => handleChange("nom", v)}
                placeholder="Nom"
                style={styles.input}
                placeholderTextColor="#888"
              />
              <InputField
                value={form.prenom}
                onChangeText={(v) => handleChange("prenom", v)}
                placeholder="Prénom"
                style={styles.input}
                placeholderTextColor="#888"
              />
              <InputField
                value={form.password}
                onChangeText={(v) => handleChange("password", v)}
                placeholder="Mot de passe"
                secureTextEntry
                style={styles.input}
                placeholderTextColor="#888"
              />
              <InputField
                value={form.adresse1}
                onChangeText={(v) => handleChange("adresse1", v)}
                placeholder="Adresse 1"
                style={styles.input}
                placeholderTextColor="#888"
              />
              <InputField
                value={form.adresse2}
                onChangeText={(v) => handleChange("adresse2", v)}
                placeholder="Adresse 2"
                style={styles.input}
                placeholderTextColor="#888"
              />
              <InputField
                value={form.numTel}
                onChangeText={(v) => handleChange("numTel", v)}
                placeholder="Téléphone"
                style={styles.input}
                placeholderTextColor="#888"
                keyboardType="phone-pad"
              />
              <InputField
                value={form.numTelParentale}
                onChangeText={(v) => handleChange("numTelParentale", v)}
                placeholder="Téléphone Parentale"
                style={styles.input}
                placeholderTextColor="#888"
                keyboardType="phone-pad"
              />
              <Text style={styles.label}>Site</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={form.location}
                  style={styles.picker}
                  onValueChange={(v) => handleChange("location", v)}
                >
                  <Picker.Item label="Choisir un site" value="" />
                  {locations.map((loc) => (
                    <Picker.Item key={loc} label={loc} value={loc} />
                  ))}
                </Picker>
              </View>
              <Text style={styles.label}>Département</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={form.departement}
                  style={styles.picker}
                  onValueChange={(v) => handleChange("departement", v)}
                  enabled={departments.length > 0}
                >
                  <Picker.Item label="Choisir un département" value="" />
                  {departments.map((dep) => (
                    <Picker.Item key={dep} label={dep} value={dep} />
                  ))}
                </Picker>
              </View>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <CustomButton
                  title="✨ S'inscrire"
                  onPress={handleRegister}
                  style={styles.buttonInner}
                  textStyle={styles.buttonText}
                />
              </LinearGradient>
              <Text
                style={styles.link}
                onPress={() => navigation.navigate("Login")}
              >
                Déjà un compte ? Se connecter
              </Text>
            </LinearGradient>
          </BlurView>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
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
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  cardBlur: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
  },
  card: {
    padding: 32,
    alignItems: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    color: "#2c3e50",
    fontSize: 32,
    fontWeight: "800",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    color: "#7f8c8d",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    textAlign: "center",
  },
  label: {
    color: "#2c3e50",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    alignSelf: "flex-start",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  input: {
    borderWidth: 2,
    borderColor: "rgba(102, 126, 234, 0.2)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    color: "#2c3e50",
    width: "100%",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pickerWrapper: {
    borderWidth: 2,
    borderColor: "rgba(102, 126, 234, 0.2)",
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginBottom: 16,
    width: "100%",
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  picker: {
    width: "100%",
    height: 50,
    color: "#2c3e50",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    fontWeight: "500",
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: "100%",
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  buttonInner: {
    backgroundColor: "transparent",
    borderRadius: 0,
    width: "100%",
    paddingVertical: 0,
    paddingHorizontal: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    letterSpacing: 0.5,
  },
  link: {
    color: "#667eea",
    marginTop: 24,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    textAlign: "center",
    textShadowColor: "rgba(102, 126, 234, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default RegisterScreen;
