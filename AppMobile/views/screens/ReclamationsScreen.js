import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { uploadPieceJointe, createReclamation, getReclamations, getLocations, getDepartments } from './reclamationApi';
import { UserContext } from '../../context/UserContext';

export default function ReclamationsScreen() {
  const { user } = useContext(UserContext);
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [pieceJointe, setPieceJointe] = useState(null);
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    if (user && user.id) {
      chargerReclamations(user.id);
    }
    chargerLocations();
  }, [user]);

  const chargerReclamations = async (employeId) => {
    if (!employeId) return;
    setLoading(true);
    try {
      const data = await getReclamations(employeId);
      setReclamations(data);
    } catch (e) {
      alert('Erreur chargement réclamations');
    }
    setLoading(false);
  };

  const chargerLocations = async () => {
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (e) {
      setLocations([]);
    }
  };

  const chargerDepartments = async (locationId) => {
    try {
      const data = await getDepartments();
      const keyCandidates = ['locationId', 'location_id', 'siteId', 'site_id'];
      const hasRelationKey = Array.isArray(data) && data.length > 0 && keyCandidates.some(k => k in data[0]);
      const filtered = hasRelationKey ? data.filter(dep => keyCandidates.some(k => dep[k] === locationId)) : data;
      setDepartments(filtered);
    } catch (e) {
      setDepartments([]);
    }
  };

  const choisirFichier = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (res?.canceled === false && Array.isArray(res.assets) && res.assets[0]) {
      setPieceJointe(res.assets[0]);
    }
    if (res && res.type === 'success') {
      setPieceJointe(res);
    }
  };

  const onLocationChange = async (locationId) => {
    setSelectedLocation(locationId);
    setSelectedDepartment('');
    await chargerDepartments(locationId);
  };

  const envoyerReclamation = async () => {
    if (!titre || !description || !selectedLocation || !selectedDepartment) {
      alert('Tous les champs sont obligatoires');
      return;
    }
    if (!user || !user.id) {
      alert('Utilisateur non connecté');
      return;
    }
    let cheminPieceJointe = '';
    if (pieceJointe) {
      setUploading(true);
      try {
        cheminPieceJointe = await uploadPieceJointe(pieceJointe);
      } catch (e) {
        alert('Erreur upload pièce jointe');
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    try {
      await createReclamation({
        titre,
        description,
        piece_jointe: cheminPieceJointe,
        employeId: user.id,
        locationId: selectedLocation,
        departementId: selectedDepartment,
      });
      setTitre('');
      setDescription('');
      setPieceJointe(null);
      setSelectedLocation('');
      setSelectedDepartment('');
      chargerReclamations(user.id);
      alert('Réclamation envoyée');
    } catch (e) {
      alert('Erreur création réclamation');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Nouvelle réclamation</Text>
      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="Titre"
          value={titre}
          onChangeText={setTitre}
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Text style={styles.label}>Site :</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedLocation}
            onValueChange={(value) => onLocationChange(value)}
            style={styles.nativePicker}
          >
            <Picker.Item label="Choisir un site" value="" />
            {locations.map((loc) => (
              <Picker.Item key={loc.id?.toString?.() || String(loc.nom)} label={String(loc.nom)} value={loc.id} />
            ))}
          </Picker>
        </View>
        <Text style={styles.label}>Département :</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedDepartment}
            onValueChange={(value) => setSelectedDepartment(value)}
            enabled={departments.length > 0}
            style={styles.nativePicker}
          >
            <Picker.Item label={departments.length ? 'Choisir un département' : 'Aucun département disponible'} value="" />
            {departments.map((dep) => (
              <Picker.Item key={dep.id?.toString?.() || String(dep.nom)} label={String(dep.nom)} value={dep.id} />
            ))}
          </Picker>
        </View>
        <TouchableOpacity style={styles.boutonFichier} onPress={choisirFichier}>
          <Text style={styles.boutonFichierText}>{pieceJointe ? pieceJointe.name : 'Ajouter une pièce jointe'}</Text>
        </TouchableOpacity>
        {uploading && <ActivityIndicator size="small" color="#3B82F6" />}
        <View style={styles.submitWrapper}>
          <Button title="Envoyer la réclamation" onPress={envoyerReclamation} color="#1D4ED8" />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Mes réclamations</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : (
        <FlatList
          data={reclamations}
          keyExtractor={(item) => (item._id?.toString?.()) || (item.id?.toString?.()) || `${item.titre}-${item.date}`}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitre}>{item.titre}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
              {item.piece_jointe ? (
                <Text style={styles.pj}>📎 {item.piece_jointe}</Text>
              ) : null}
              <View style={styles.cardFooter}>
                <View style={styles.badge}><Text style={styles.badgeText}>{item.statut}</Text></View>
                <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8FAFF' },
  titre: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginVertical: 16 },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  label: { marginTop: 8, marginBottom: 6, color: '#374151', fontWeight: '600' },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 12,
    marginBottom: 10,
    color: '#111827'
  },
  textarea: { height: 100, textAlignVertical: 'top' },
  pickerContainer: { marginVertical: 6, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, backgroundColor: '#F9FAFB', overflow: 'hidden' },
  nativePicker: { width: '100%' },
  boutonFichier: { backgroundColor: '#EEF2FF', padding: 12, borderRadius: 10, marginTop: 8, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E0E7FF' },
  boutonFichierText: { color: '#1D4ED8', fontWeight: '600' },
  submitWrapper: { marginTop: 4, marginBottom: 4, borderRadius: 10, overflow: 'hidden' },
  card: {
    backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitre: { fontWeight: '800', fontSize: 16, color: '#111827', marginBottom: 6 },
  cardDesc: { color: '#4B5563', marginBottom: 8 },
  pj: { color: '#1D4ED8', marginTop: 4, marginBottom: 8, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 },
  badgeText: { color: '#166534', fontWeight: '700', fontSize: 12 },
  date: { color: '#6B7280', fontSize: 12 },
});
