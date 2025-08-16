import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreen = () => (
  <SafeAreaView style={styles.safeArea}>
    <LinearGradient colors={['#1D2D51', '#2A4066']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenue sur LeoinMobApp !</Text>
        <Text style={styles.subtitle}>Découvrez vos actualités, événements et conversations en un seul endroit</Text>
      </View>
    </LinearGradient>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1D2D51',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    textAlign: 'center',
  },
  subtitle: {
    color: '#DDE1E6',
    fontSize: 18,
    lineHeight: 26,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    textAlign: 'center',
  },
});

export default HomeScreen;