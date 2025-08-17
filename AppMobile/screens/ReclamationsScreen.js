import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { uploadPieceJointe, createReclamation, getReclamations } from '../views/screens/reclamationApi';

const employeId = 'EMP12345'; // À remplacer dynamiquement selon l'utilisateur connecté
const locationId = 'LOC67890';
const departementId = 'DEP54321';

export default function ReclamationsScreen() {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [pieceJointe, setPieceJointe] = useState(null);
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    chargerReclamations();
  }, []);

  const chargerReclamations = async () => {
    setLoading(true);
    try {
      const data = await getReclamations(employeId);
      setReclamations(data);
    } catch (e) {
      alert('Erreur chargement réclamations');
    }
    setLoading(false);
  };

  const choisirFichier = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (res.type === 'success') {
      setPieceJointe(res);
    }
  };

  const envoyerReclamation = async () => {
    if (!titre || !description) {
      alert('Titre et description obligatoires');
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
        employeId,
        locationId,
        departementId,
      });
      setTitre('');
      setDescription('');
      setPieceJointe(null);
      chargerReclamations();
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
});
