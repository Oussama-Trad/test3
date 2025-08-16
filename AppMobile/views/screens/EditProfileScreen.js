import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, SafeAreaView, Platform } from 'react-native';
import { CheckBox } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
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
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#1D2D51', '#2A4066']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <LinearGradient
            colors={['#FFFFFF', '#F9FBFC']}
            style={styles.card}
          >
            <Text style={styles.title}>Modifier le profil</Text>
            {form.photoDeProfil ? (
              <Image source={{ uri: form.photoDeProfil }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>Aucune photo</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.importButton}
              onPress={async () => {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.7,
                });
                if (!result.canceled && result.assets && result.assets.length > 0) {
                  handleChange('photoDeProfil', result.assets[0].uri);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.importButtonText}>Importer une photo</Text>
            </TouchableOpacity>
            <InputField
              value={form.id}
              onChangeText={v => handleChange('id', v)}
              placeholder="ID (8 chiffres)"
              editable={false}
              style={styles.input}
            />
            <InputField
              value={form.nom}
              onChangeText={v => handleChange('nom', v)}
              placeholder="Nom"
              style={styles.input}
            />
            <InputField
              value={form.prenom}
              onChangeText={v => handleChange('prenom', v)}
              placeholder="Prénom"
              style={styles.input}
            />
            <View style={styles.row}>
              <CheckBox
                checked={editPassword}
                onPress={() => setEditPassword(!editPassword)}
                containerStyle={styles.checkbox}
                checkedColor="#4f8cff"
              />
              <Text style={styles.checkboxLabel}>Modifier le mot de passe</Text>
            </View>
            {editPassword && (
              <InputField
                value={form.password}
                onChangeText={v => handleChange('password', v)}
                placeholder="Nouveau mot de passe"
                secureTextEntry
                style={styles.input}
              />
            )}
            <InputField
              value={form.adresse1}
              onChangeText={v => handleChange('adresse1', v)}
              placeholder="Adresse 1"
              style={styles.input}
            />
            <InputField
              value={form.adresse2}
              onChangeText={v => handleChange('adresse2', v)}
              placeholder="Adresse 2"
              style={styles.input}
            />
            <InputField
              value={form.numTel}
              onChangeText={v => handleChange('numTel', v)}
              placeholder="Téléphone"
              style={styles.input}
            />
            <InputField
              value={form.numTelParentale}
              onChangeText={v => handleChange('numTelParentale', v)}
              placeholder="Téléphone Parentale"
              style={styles.input}
            />
            <InputField
              value={form.location}
              onChangeText={v => handleChange('location', v)}
              placeholder="Site"
              style={styles.input}
            />
            <InputField
              value={form.departement}
              onChangeText={v => handleChange('departement', v)}
              placeholder="Département"
              style={styles.input}
            />
            <TouchableOpacity style={styles.button} onPress={handleSave} activeOpacity={0.7}>
              <Text style={styles.buttonText}>Enregistrer</Text>
            </TouchableOpacity>
          </LinearGradient>
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
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    textAlign: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8ECEF',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#DDE1E6',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8ECEF',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DDE1E6',
  },
  avatarPlaceholderText: {
    color: '#888',
    fontSize: 14,
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
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    fontWeight: '500',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  importButton: {
    backgroundColor: '#4f8cff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  importButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  button: {
    backgroundColor: '#1D2D51',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
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
    fontWeight: '600',
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
});

export default EditProfileScreen;