import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity, Dimensions, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = 'http://localhost:5000/api';
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
      activeOpacity={0.7}
      onPress={() => navigation.navigate('ActualiteDetail', { actualite: item })}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFD']}
        style={styles.cardGradient}
      >
        {item.photo ? (
          <Image
            source={{ uri: item.photo.startsWith('http') ? item.photo : `${API_URL}/uploads/${item.photo}` }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>Pas d'image</Text>
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>{item.titre}</Text>
          <Text style={styles.desc} numberOfLines={3}>{item.description}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D2D51" />
        <Text style={styles.loadingText}>Chargement des actualités...</Text>
      </View>
    );
  }

  if (!actualites.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.empty}>Aucune actualité à afficher.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={actualites}
      renderItem={renderItem}
      keyExtractor={item => item._id || item.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 20,
    backgroundColor: '#F5F7FB',
    flexGrow: 1,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    maxWidth: width - 40,
    alignSelf: 'center',
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#E8ECEF',
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#E8ECEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D2D51',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  desc: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1D2D51',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
  },
  empty: {
    fontSize: 18,
    color: '#1D2D51',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
});

export default ActualitesScreen;