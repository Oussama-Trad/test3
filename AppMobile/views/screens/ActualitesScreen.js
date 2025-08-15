
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../../context/UserContext';

const API_URL = 'http://localhost:5000/api';


import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ActualitesScreen = () => {
  const { user } = useContext(UserContext);
  const [actualites, setActualites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

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
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ActualiteDetail', { actualite: item })}
    >
      {item.photo ? (
        <Image source={{ uri: item.photo.startsWith('http') ? item.photo : `${API_URL}/uploads/${item.photo}` }} style={styles.image} />
      ) : null}
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={2}>{item.titre}</Text>
        <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
      </View>
    </TouchableOpacity>
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
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
    minHeight: 80,
    maxWidth: width - 32,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1D2D51',
    marginBottom: 2,
  },
  desc: {
    fontSize: 13,
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
