import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { CheckBox } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import InputField from '../../components/InputField';
import { updateProfile } from '../../services/api/employeeApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfileScreen = ({ route, navigation }) => {
  const { profile } = route.params;
  const [form, setForm] = useState({ ...profile });
  const [editPassword, setEditPassword] = useState(false);

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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Modifier le profil</Text>
        <InputField value={form.id} onChangeText={v => handleChange('id', v)} placeholder="ID (8 chiffres)" editable={false} />
        <InputField value={form.nom} onChangeText={v => handleChange('nom', v)} placeholder="Nom" />
        <InputField value={form.prenom} onChangeText={v => handleChange('prenom', v)} placeholder="Prénom" />
        <View style={styles.row}>
          <CheckBox
            checked={editPassword}
            onPress={() => setEditPassword(!editPassword)}
            containerStyle={styles.checkbox}
          />
          <Text style={styles.checkboxLabel}>Modifier le mot de passe</Text>
        </View>
        {editPassword && (
          <InputField value={form.password} onChangeText={v => handleChange('password', v)} placeholder="Nouveau mot de passe" secureTextEntry />
        )}
        <InputField value={form.adresse1} onChangeText={v => handleChange('adresse1', v)} placeholder="Adresse 1" />
        <InputField value={form.adresse2} onChangeText={v => handleChange('adresse2', v)} placeholder="Adresse 2" />
        <InputField value={form.numTel} onChangeText={v => handleChange('numTel', v)} placeholder="Téléphone" />
        <InputField value={form.numTelParentale} onChangeText={v => handleChange('numTelParentale', v)} placeholder="Téléphone Parentale" />
        <InputField value={form.location} onChangeText={v => handleChange('location', v)} placeholder="Location" />
        <InputField value={form.departement} onChangeText={v => handleChange('departement', v)} placeholder="Département" />
        <TouchableOpacity style={styles.importButton} onPress={async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!result.canceled && result.assets && result.assets.length > 0) {
            handleChange('photoDeProfil', result.assets[0].uri);
          }
        }}>
          <Text style={styles.importButtonText}>Importer une photo de profil</Text>
        </TouchableOpacity>
        {form.photoDeProfil ? (
          <Image source={{ uri: form.photoDeProfil }} style={styles.avatar} />
        ) : null}
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1D2D51',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  checkbox: {
    padding: 0,
    margin: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  checkboxLabel: {
    color: '#1D2D51',
    fontSize: 16,
    marginLeft: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eee',
    marginTop: 10,
    marginBottom: 10,
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
  importButton: {
    backgroundColor: '#1D2D51',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
    width: 220,
  },
  importButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default EditProfileScreen;
