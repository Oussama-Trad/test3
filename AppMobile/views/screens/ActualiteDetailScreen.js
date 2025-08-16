import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, SafeAreaView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ActualiteDetailScreen = ({ route }) => {
  const { actualite } = route.params;
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {actualite.photo ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: actualite.photo }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        ) : null}
        <LinearGradient
          colors={['#F5F7FB', '#E8ECEF']}
          style={styles.textContainer}
        >
          <Text style={styles.title}>{actualite.titre}</Text>
          <Text style={styles.desc}>{actualite.description}</Text>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  container: {
    padding: 20,
    flexGrow: 1,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    maxWidth: 450,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 15,
  },
  textContainer: {
    width: '100%',
    maxWidth: 450,
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#F5F7FB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1D2D51',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  desc: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'justify',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
});

export default ActualiteDetailScreen;