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
        <Image source={{ uri: profile.photoDeProfil || undefined }} style={styles.avatar} />
        <Text style={styles.name}>{profile.nom} {profile.prenom}</Text>
        <Text style={styles.info}>{profile.location} - {profile.departement}</Text>
        <Text style={styles.info}>{profile.numTel}</Text>
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
  info: {
    color: '#1D2D51',
    fontSize: 18,
    marginBottom: 8,
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
