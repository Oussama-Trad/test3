import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import InputField from '../../components/InputField';
import { updateProfile } from '../../services/api/employeeApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfileScreen = ({ route, navigation }) => {
  const { profile } = route.params;
  const [form, setForm] = useState({ ...profile });

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSave = async () => {
    const token = await AsyncStorage.getItem('token');
    const res = await updateProfile(token, form);
    if (res && res.success) {
      Alert.alert('Succès', 'Profil mis à jour !');
      navigation.goBack();
    } else {
      Alert.alert('Erreur', res.message || 'Erreur lors de la mise à jour');
    }
  };

  return (
    <View style={styles.container}>
      <InputField value={form.nom} onChangeText={v => handleChange('nom', v)} placeholder="Nom" />
      <InputField value={form.prenom} onChangeText={v => handleChange('prenom', v)} placeholder="Prénom" />
      <InputField value={form.numTel} onChangeText={v => handleChange('numTel', v)} placeholder="Téléphone" />
      {/* Ajoute d'autres champs si besoin */}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Enregistrer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#1D2D51',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditProfileScreen;
