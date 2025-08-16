import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { register, getLocations, getDepartments } from '../../services/api/employeeApi';
import { UserContext } from '../../context/UserContext';

const RegisterScreen = ({ navigation }) => {
  const { setUser } = useContext(UserContext);
  const [form, setForm] = useState({
    id: '',
    nom: '',
    prenom: '',
    password: '',
    adresse1: '',
    adresse2: '',
    numTel: '',
    numTelParentale: '',
    location: '',
    departement: '',
    photoDeProfil: '',
  });
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    getLocations()
      .then(res => setLocations(res.locations || []))
      .catch(err => {
        console.error('Erreur fetch locations:', err);
        setLocations([]);
      });
  }, []);

  useEffect(() => {
    if (form.location) {
      getDepartments(form.location)
        .then(res => setDepartments(res.departments || []))
        .catch(err => {
          console.error('Erreur fetch départements:', err);
          setDepartments([]);
        });
    } else {
      setDepartments([]);
    }
  }, [form.location]);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleRegister = async () => {
    const requiredFields = [
      { key: 'id', label: 'ID' },
      { key: 'nom', label: 'Nom' },
      { key: 'prenom', label: 'Prénom' },
      { key: 'password', label: 'Mot de passe' },
      { key: 'adresse1', label: 'Adresse 1' },
      { key: 'numTel', label: 'Téléphone' },
      { key: 'location', label: 'Site' },
      { key: 'departement', label: 'Département' },
    ];
    for (let field of requiredFields) {
      if (!form[field.key] || form[field.key].trim() === '') {
        Alert.alert('Champ manquant', `Veuillez remplir le champ obligatoire : ${field.label}`);
        return;
      }
    }
    try {
      const res = await register(form);
      if (res && res.message === 'Employee registered successfully' && res.token && res.user) {
        setUser(res.user);
        Alert.alert('Succès', 'Inscription réussie !');
        navigation.replace('MainTabs');
      } else if (res && res.message === 'Employee registered successfully') {
        Alert.alert('Succès', 'Inscription réussie !');
        navigation.replace('Login');
      } else {
        Alert.alert('Erreur', res.message || "Erreur lors de l'inscription");
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de contacter le serveur');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#1D2D51', '#2A4066']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            <Text style={styles.title}>Inscription</Text>
            <InputField
              value={form.id}
              onChangeText={v => handleChange('id', v)}
              placeholder="ID (8 chiffres)"
              style={styles.input}
              placeholderTextColor="#888"
              keyboardType="numeric"
            />
            <InputField
              value={form.nom}
              onChangeText={v => handleChange('nom', v)}
              placeholder="Nom"
              style={styles.input}
              placeholderTextColor="#888"
            />
            <InputField
              value={form.prenom}
              onChangeText={v => handleChange('prenom', v)}
              placeholder="Prénom"
              style={styles.input}
              placeholderTextColor="#888"
            />
            <InputField
              value={form.password}
              onChangeText={v => handleChange('password', v)}
              placeholder="Mot de passe"
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#888"
            />
            <InputField
              value={form.adresse1}
              onChangeText={v => handleChange('adresse1', v)}
              placeholder="Adresse 1"
              style={styles.input}
              placeholderTextColor="#888"
            />
            <InputField
              value={form.adresse2}
              onChangeText={v => handleChange('adresse2', v)}
              placeholder="Adresse 2"
              style={styles.input}
              placeholderTextColor="#888"
            />
            <InputField
              value={form.numTel}
              onChangeText={v => handleChange('numTel', v)}
              placeholder="Téléphone"
              style={styles.input}
              placeholderTextColor="#888"
              keyboardType="phone-pad"
            />
            <InputField
              value={form.numTelParentale}
              onChangeText={v => handleChange('numTelParentale', v)}
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
                onValueChange={v => handleChange('location', v)}
              >
                <Picker.Item label="Choisir un site" value="" />
                {locations.map(loc => (
                  <Picker.Item key={loc} label={loc} value={loc} />
                ))}
              </Picker>
            </View>
            <Text style={styles.label}>Département</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={form.departement}
                style={styles.picker}
                onValueChange={v => handleChange('departement', v)}
                enabled={departments.length > 0}
              >
                <Picker.Item label="Choisir un département" value="" />
                {departments.map(dep => (
                  <Picker.Item key={dep} label={dep} value={dep} />
                ))}
              </Picker>
            </View>
            <CustomButton
              title="S'inscrire"
              onPress={handleRegister}
              style={styles.button}
              textStyle={styles.buttonText}
            />
            <Text
              style={styles.link}
              onPress={() => navigation.navigate('Login')}
            >
              Déjà un compte ? Se connecter
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1D2D51',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    color: '#1D2D51',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    textAlign: 'center',
  },
  label: {
    color: '#1D2D51',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDE1E6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#F8FAFD',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    color: '#1D2D51',
    width: '100%',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#DDE1E6',
    borderRadius: 12,
    backgroundColor: '#F8FAFD',
    marginBottom: 12,
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  picker: {
    width: '100%',
    height: 44,
    color: '#1D2D51',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  button: {
    backgroundColor: '#4f8cff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  link: {
    color: '#4f8cff',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;