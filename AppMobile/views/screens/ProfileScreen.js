import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile } from '../../services/api/employeeApi';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const res = await getProfile(token);
        setProfile(res.employee);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Auth');
  };

  if (!profile) return <Text style={{ color: '#1D2D51', marginTop: 50 }}>Chargement...</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={profile.photoDeProfil ? { uri: profile.photoDeProfil } : require('../../assets/icon.png')} style={styles.avatar} />
        <Text style={styles.name}>{profile.nom} {profile.prenom}</Text>
        <Text style={styles.infoLabel}>ID:</Text>
        <Text style={styles.infoValue}>{profile.id}</Text>
        <Text style={styles.infoLabel}>Adresse 1:</Text>
        <Text style={styles.infoValue}>{profile.adresse1}</Text>
        <Text style={styles.infoLabel}>Adresse 2:</Text>
        <Text style={styles.infoValue}>{profile.adresse2}</Text>
        <Text style={styles.infoLabel}>Téléphone:</Text>
        <Text style={styles.infoValue}>{profile.numTel}</Text>
        <Text style={styles.infoLabel}>Téléphone Parentale:</Text>
        <Text style={styles.infoValue}>{profile.numTelParentale}</Text>
        <Text style={styles.infoLabel}>Location:</Text>
        <Text style={styles.infoValue}>{profile.location}</Text>
        <Text style={styles.infoLabel}>Département:</Text>
        <Text style={styles.infoValue}>{profile.departement}</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditProfile', { profile })}>
            <Text style={styles.buttonText}>Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={[styles.buttonText, { color: '#1D2D51' }]}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
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
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    marginBottom: 20,
  },
  name: {
    color: '#1D2D51',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#1D2D51',
    fontWeight: 'bold',
    fontSize: 16,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  infoValue: {
    color: '#1D2D51',
    fontSize: 16,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#1D2D51',
    padding: 12,
    borderRadius: 8,
    width: 140,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderColor: '#1D2D51',
    borderWidth: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileScreen;
