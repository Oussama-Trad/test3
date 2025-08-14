import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { register, getLocations, getDepartments } from '../../services/api/employeeApi';
import { Picker } from '@react-native-picker/picker';

import { UserContext } from '../../context/UserContext';

const RegisterScreen = ({ navigation }) => {
  const { setUser } = useContext(UserContext);
  const [form, setForm] = useState({
    id: '', nom: '', prenom: '', password: '', adresse1: '', adresse2: '', numTel: '', numTelParentale: '', location: '', departement: '', photoDeProfil: ''
  });
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    getLocations().then(res => setLocations(res.locations || []));
  }, []);

  useEffect(() => {
    if (form.location) {
      getDepartments(form.location).then(res => setDepartments(res.departments || []));
    } else {
      setDepartments([]);
    }
  }, [form.location]);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleRegister = async () => {
    // Validation frontend
    const requiredFields = [
      { key: 'id', label: 'ID' },
      { key: 'nom', label: 'Nom' },
      { key: 'prenom', label: 'Prénom' },
      { key: 'password', label: 'Mot de passe' },
      { key: 'adresse1', label: 'Adresse 1' },
      { key: 'numTel', label: 'Téléphone' },
      { key: 'location', label: 'Location' },
      { key: 'departement', label: 'Département' }
    ];
    for (let field of requiredFields) {
      if (!form[field.key] || form[field.key].trim() === '') {
        Alert.alert('Champ manquant', `Veuillez remplir le champ obligatoire : ${field.label}`);
        return;
      }
    }
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
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Inscription</Text>
        <InputField value={form.id} onChangeText={v => handleChange('id', v)} placeholder="ID (8 chiffres)" />
        <InputField value={form.nom} onChangeText={v => handleChange('nom', v)} placeholder="Nom" />
        <InputField value={form.prenom} onChangeText={v => handleChange('prenom', v)} placeholder="Prénom" />
        <InputField value={form.password} onChangeText={v => handleChange('password', v)} placeholder="Mot de passe" secureTextEntry />
        <InputField value={form.adresse1} onChangeText={v => handleChange('adresse1', v)} placeholder="Adresse 1" />
        <InputField value={form.adresse2} onChangeText={v => handleChange('adresse2', v)} placeholder="Adresse 2" />
        <InputField value={form.numTel} onChangeText={v => handleChange('numTel', v)} placeholder="Téléphone" />
        <InputField value={form.numTelParentale} onChangeText={v => handleChange('numTelParentale', v)} placeholder="Téléphone Parentale" />
        <Text style={styles.label}>Location</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.location}
            style={styles.picker}
            onValueChange={v => handleChange('location', v)}>
            <Picker.Item label="Choisir une location" value="" />
            {locations.map(loc => <Picker.Item key={loc} label={loc} value={loc} />)}
          </Picker>
        </View>
        <Text style={styles.label}>Département</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.departement}
            style={styles.picker}
            onValueChange={v => handleChange('departement', v)}>
            <Picker.Item label="Choisir un département" value="" />
            {departments.map(dep => <Picker.Item key={dep} label={dep} value={dep} />)}
          </Picker>
        </View>
        <CustomButton title="S'inscrire" onPress={handleRegister} />
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Déjà un compte ? Se connecter</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1D2D51',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    width: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    color: '#1D2D51',
    fontSize: 28,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  label: {
    color: '#1D2D51',
    fontSize: 16,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#1D2D51',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    width: 250,
    overflow: 'hidden',
  },
  picker: {
    width: 250,
    height: 44,
    color: '#1D2D51',
    backgroundColor: '#f0f0f0',
  },
  link: {
    color: '#1D2D51',
    marginTop: 20,
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});

export default RegisterScreen;
