import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MessagesScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Messagerie</Text>
    <Text style={styles.subtitle}>Fonctionnalité à venir...</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1D2D51',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
  },
});

export default MessagesScreen;
