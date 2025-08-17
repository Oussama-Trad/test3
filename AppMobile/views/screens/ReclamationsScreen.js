import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
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
      setDepartments(data.filter(dep => dep.locationId === locationId));
    } catch (e) {
      setDepartments([]);
    }
  };

  const choisirFichier = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (res.type === 'success') {
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
      alert("Utilisateur non connecté");
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
      <TextInput
        style={styles.input}
        placeholder="Titre"
        value={titre}
        onChangeText={setTitre}
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Text style={{ marginTop: 8 }}>Site :</Text>
      <View style={styles.pickerContainer}>
        <select
          style={styles.picker}
          value={selectedLocation}
          onChange={e => onLocationChange(e.target.value)}
        >
          <option value="">Choisir un site</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.nom}</option>
          ))}
        </select>
      </View>
      <Text style={{ marginTop: 8 }}>Département :</Text>
      <View style={styles.pickerContainer}>
        <select
          style={styles.picker}
          value={selectedDepartment}
          onChange={e => setSelectedDepartment(e.target.value)}
        >
          <option value="">Choisir un département</option>
          {departments.map(dep => (
            <option key={dep.id} value={dep.id}>{dep.nom}</option>
          ))}
        </select>
      </View>
      <TouchableOpacity style={styles.boutonFichier} onPress={choisirFichier}>
        <Text>{pieceJointe ? pieceJointe.name : 'Ajouter une pièce jointe'}</Text>
      </TouchableOpacity>
      {uploading && <ActivityIndicator size="small" color="#007AFF" />}
      <Button title="Envoyer la réclamation" onPress={envoyerReclamation} />
      <Text style={styles.titre}>Mes réclamations</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={reclamations}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitre}>{item.titre}</Text>
              <Text>{item.description}</Text>
              {item.piece_jointe ? (
                <Text style={styles.pj}>📎 {item.piece_jointe}</Text>
              ) : null}
              <Text style={styles.statut}>Statut : {item.statut}</Text>
              <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  titre: { fontSize: 20, fontWeight: 'bold', marginVertical: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 10 },
  boutonFichier: { backgroundColor: '#eee', padding: 10, borderRadius: 6, marginBottom: 10, alignItems: 'center' },
  card: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, marginBottom: 10 },
  cardTitre: { fontWeight: 'bold', fontSize: 16 },
  pj: { color: '#007AFF', marginTop: 4 },
  statut: { marginTop: 6, fontWeight: 'bold' },
  date: { color: '#888', fontSize: 12, marginTop: 2 },
  pickerContainer: { marginVertical: 6 },
  picker: { width: '100%', padding: 8, borderRadius: 6, borderColor: '#ccc', borderWidth: 1 },
});
