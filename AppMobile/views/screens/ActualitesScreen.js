import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../../context/UserContext';

const API_URL = 'http://localhost:5000/api';

const ActualitesScreen = () => {
  const { user } = useContext(UserContext);
  const [actualites, setActualites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActualites = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`${API_URL}/actualites`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setActualites(data.actualites || []);
      } catch (e) {
        setActualites([]);
      }
      setLoading(false);
    };
    fetchActualites();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.photo && (
        <Image source={{ uri: item.photo }} style={styles.image} />
      )}
      <Text style={styles.title}>{item.titre}</Text>
      <Text style={styles.desc}>{item.description}</Text>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#1D2D51" style={{ marginTop: 40 }} />;
  if (!actualites.length) return <Text style={styles.empty}>Aucune actualité à afficher.</Text>;

  return (
    <FlatList
      data={actualites}
      renderItem={renderItem}
      keyExtractor={item => item._id || item.id}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
    backgroundColor: '#F5F7FB',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D2D51',
    marginBottom: 6,
  },
  desc: {
    fontSize: 15,
    color: '#333',
  },
  empty: {
    color: '#1D2D51',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});

export default ActualitesScreen;
