import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile } from '../../services/api/employeeApi';
import { getLocationsFull, getDepartmentsFull } from '../../services/api/locationsApi';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [departementName, setDepartementName] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const res = await getProfile(token);
          if (res.employee) {
            setProfile(res.employee);
          } else {
            console.error('Erreur: Aucun employé dans la réponse', res);
            setProfile(null);
          }
        }
      } catch (e) {
        console.error('Erreur fetch profile:', e);
        setProfile(null);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchNames = async () => {
      if (!profile) return;
      try {
        const [locationsRaw, departementsRaw] = await Promise.all([
          getLocationsFull(),
          getDepartmentsFull(),
        ]);
        const locations = Array.isArray(locationsRaw) ? locationsRaw : (locationsRaw.locations || []);
        const departements = Array.isArray(departementsRaw) ? departementsRaw : (departementsRaw.departements || []);
        const loc = locations.find(l => String(l.id) === String(profile.locationId));
        const dep = departements.find(d => String(d.id) === String(profile.departementId));
        setLocationName(loc ? loc.nom : 'Non défini');
        setDepartementName(dep ? dep.nom : 'Non défini');
      } catch (e) {
        console.error('Erreur fetch locations/departements:', e);
        setLocationName('Erreur API');
        setDepartementName('Erreur API');
      }
    };
    fetchNames();
  }, [profile]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.replace('Auth');
    } catch (e) {
      console.error('Erreur lors de la déconnexion:', e);
    }
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#1D2D51', '#2A4066']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement du profil...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#1D2D51', '#2A4066']} style={styles.container}>
        <View style={styles.card}>
          {profile.photoDeProfil ? (
            <Image
              source={{ uri: profile.photoDeProfil }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>Aucune photo</Text>
            </View>
          )}
          <Text style={styles.name}>{profile.nom} {profile.prenom}</Text>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>ID :</Text>
            <Text style={styles.infoValue}>{profile.id || 'Non défini'}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Adresse 1 :</Text>
            <Text style={styles.infoValue}>{profile.adresse1 || 'Non défini'}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Adresse 2 :</Text>
            <Text style={styles.infoValue}>{profile.adresse2 || 'Non défini'}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Téléphone :</Text>
            <Text style={styles.infoValue}>{profile.numTel || 'Non défini'}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Téléphone Parentale :</Text>
            <Text style={styles.infoValue}>{profile.numTelParentale || 'Non défini'}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Site :</Text>
            <Text style={styles.infoValue}>{locationName}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Département :</Text>
            <Text style={styles.infoValue}>{departementName}</Text>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('EditProfile', { profile })}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, styles.logoutButtonText]}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
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
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8ECEF',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#DDE1E6',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8ECEF',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DDE1E6',
  },
  avatarPlaceholderText: {
    color: '#888',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  name: {
    color: '#1D2D51',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    textAlign: 'center',
  },
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  infoLabel: {
    color: '#1D2D51',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    width: 120,
  },
  infoValue: {
    color: '#333',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
  },
  button: {
    backgroundColor: '#4f8cff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderColor: '#1D2D51',
    borderWidth: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  logoutButtonText: {
    color: '#1D2D51',
  },
});

export default ProfileScreen;