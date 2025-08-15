import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';

const ActualiteDetailScreen = ({ route }) => {
  const { actualite } = route.params;
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {actualite.photo ? (
        <Image source={{ uri: actualite.photo }} style={styles.image} />
      ) : null}
      <Text style={styles.title}>{actualite.titre}</Text>
      <Text style={styles.desc}>{actualite.description}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F5F7FB',
    flexGrow: 1,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    maxWidth: 400,
    height: 220,
    borderRadius: 10,
    marginBottom: 18,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1D2D51',
    marginBottom: 12,
    textAlign: 'center',
  },
  desc: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
  },
});

export default ActualiteDetailScreen;
