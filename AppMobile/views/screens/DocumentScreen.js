import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDocumentTypes, createDocumentRequest, getDocumentRequests } from '../../services/api/documentApi';

const DocumentScreen = () => {
  const [documentTypes, setDocumentTypes] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const token = await AsyncStorage.getItem('token');
    const typesRes = await getDocumentTypes(token);
    setDocumentTypes(typesRes.documentTypes || []);
    const reqRes = await getDocumentRequests(token);
    setRequests(reqRes.requests || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequest = async () => {
    if (!selectedType) {
      Alert.alert('Erreur', 'Veuillez sélectionner un type de document.');
      return;
    }
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    const res = await createDocumentRequest(token, {
      documentTypeId: selectedType.id,
      commentaire
    });
    setLoading(false);
    if (res && res.message === 'Demande créée') {
      Alert.alert('Succès', 'Votre demande a été envoyée.');
      setCommentaire('');
      setSelectedType(null);
      fetchData();
    } else {
      Alert.alert('Erreur', res.message || 'Erreur lors de la demande');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Demander un document</Text>
      <FlatList
        data={documentTypes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.typeItem, selectedType && selectedType.id === item.id && styles.selectedType]}
            onPress={() => setSelectedType(item)}>
            <Text style={styles.typeTitle}>{item.titre}</Text>
            <Text style={styles.typeDesc}>{item.description}</Text>
          </TouchableOpacity>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 10 }}
      />
      <TextInput
        style={styles.input}
        placeholder="Commentaire (optionnel)"
        value={commentaire}
        onChangeText={setCommentaire}
      />
      <TouchableOpacity style={styles.button} onPress={handleRequest} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Envoi...' : 'Faire la demande'}</Text>
      </TouchableOpacity>
      <Text style={styles.subtitle}>Mes demandes</Text>
      <FlatList
        data={requests}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.requestItem}>
            <Text style={styles.reqType}>{item.documentTypeId}</Text>
            <Text style={styles.reqStatus}>Statut : {item.status}</Text>
            <Text style={styles.reqDate}>Date : {new Date(item.createdAt).toLocaleString()}</Text>
            {item.commentaire ? <Text style={styles.reqComment}>Commentaire : {item.commentaire}</Text> : null}
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#1D2D51', marginTop: 10 }}>Aucune demande pour l'instant.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 16,
  },
  title: {
    color: '#1D2D51',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#1D2D51',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  typeItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#1D2D51',
    minWidth: 180,
  },
  selectedType: {
    backgroundColor: '#1D2D51',
  },
  typeTitle: {
    color: '#1D2D51',
    fontWeight: 'bold',
    fontSize: 16,
  },
  typeDesc: {
    color: '#1D2D51',
    fontSize: 13,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1D2D51',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    color: '#1D2D51',
  },
  button: {
    backgroundColor: '#1D2D51',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  requestItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1D2D51',
  },
  reqType: {
    color: '#1D2D51',
    fontWeight: 'bold',
    fontSize: 15,
  },
  reqStatus: {
    color: '#1D2D51',
    fontSize: 14,
    marginTop: 2,
  },
  reqDate: {
    color: '#1D2D51',
    fontSize: 13,
    marginTop: 2,
  },
  reqComment: {
    color: '#1D2D51',
    fontSize: 13,
    marginTop: 2,
    fontStyle: 'italic',
  },
});

export default DocumentScreen;
