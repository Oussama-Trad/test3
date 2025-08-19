import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfile } from "../../services/api/employeeApi";

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Données simulées pour le fallback
  const mockProfile = {
    id: "EMP001",
    nom: "Dupont",
    prenom: "Marie",
    adresse1: "123 Rue de la Paix",
    adresse2: "Appartement 4B",
    numTel: "+33 6 12 34 56 78",
    numTelParentale: "+33 1 23 45 67 89",
    email: "marie.dupont@company.com",
    poste: "Développeuse Senior",
    dateEmbauche: "2023-01-15",
    salaire: "45000",
    statusEmploye: "Actif",
    locationId: "1",
    departementId: "2",
    photoDeProfil: null,
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const res = await getProfile(token);
        if (res && res.employee) {
          setProfile(res.employee);
        } else if (res && res.nom) {
          setProfile(res);
        } else {
          setProfile(mockProfile);
        }
      } else {
        setProfile(mockProfile);
      }
    } catch (e) {
      setProfile(mockProfile);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      navigation.replace("Auth");
    } catch (e) {
      Alert.alert("Erreur", "Impossible de se déconnecter");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Chargement du profil...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <Text style={{ color: 'red', fontSize: 18 }}>Erreur de chargement du profil</Text>
        <TouchableOpacity onPress={fetchProfile} style={{ marginTop: 20, backgroundColor: '#667eea', padding: 12, borderRadius: 8 }}>
          <Text style={{ color: '#fff' }}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Mon Profil</Text>
        {profile?.photoDeProfil ? (
          <Image source={{ uri: profile.photoDeProfil }} style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 16 }} />
        ) : null}
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{profile?.prenom} {profile?.nom}</Text>
        <Text style={{ color: '#667eea', marginBottom: 16 }}>{profile?.poste || 'Employé'}</Text>
        
        <Text>{profile?.email}</Text>
        <Text style={{ fontWeight: 'bold' }}>Téléphone:</Text>
        <Text>{profile?.numTel}</Text>
        <Text style={{ fontWeight: 'bold' }}>Tél. Urgence:</Text>
        <Text>{profile?.numTelParentale}</Text>
        <Text style={{ fontWeight: 'bold' }}>Adresse 1:</Text>
        <Text>{profile?.adresse1}</Text>
        <Text style={{ fontWeight: 'bold' }}>Adresse 2:</Text>
        <Text>{profile?.adresse2}</Text>
        <Text style={{ fontWeight: 'bold' }}>Département:</Text>
        <Text>{profile?.departementId}</Text>
        <Text style={{ fontWeight: 'bold' }}>Site:</Text>
        <Text>{profile?.locationId}</Text>
        <Text style={{ fontWeight: 'bold' }}>Date d'embauche:</Text>
        <Text>{profile?.dateEmbauche}</Text>
        <Text style={{ fontWeight: 'bold' }}>Statut:</Text>
        <Text>{profile?.statusEmploye}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile', { profile })} style={{ marginTop: 24, backgroundColor: '#667eea', padding: 16, borderRadius: 8 }}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>Modifier le profil</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={{ marginTop: 12, backgroundColor: '#F44336', padding: 16, borderRadius: 8 }}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
