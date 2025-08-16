import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const EventDetailScreen = ({ route }) => {
  const { event } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#F5F7FA', '#E9EDF0']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {event.photo ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: event.photo }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>Aucune image</Text>
            </View>
          )}
          <LinearGradient
            colors={['#FFFFFF', '#F9FBFC']}
            style={styles.card}
          >
            <Text style={styles.title}>{event.title}</Text>
            <Text style={styles.date}>{formatDate(event.startDate)} - {formatDate(event.endDate)}</Text>
            <Text style={styles.desc}>{event.description}</Text>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Lieu :</Text>
              <Text style={styles.value}>{event.locationId || 'Non spécifié'}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Département :</Text>
              <Text style={styles.value}>{event.departementId || 'Non spécifié'}</Text>
            </View>
          </LinearGradient>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { dateStyle: 'medium' }) + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    flexGrow: 1,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    maxWidth: 450,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 240,
    borderRadius: 16,
  },
  imagePlaceholder: {
    width: '100%',
    maxWidth: 450,
    height: 240,
    borderRadius: 16,
    backgroundColor: '#E8ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 20,
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  card: {
    width: '100%',
    maxWidth: 450,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1D2D51',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    textAlign: 'center',
  },
  date: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    textAlign: 'center',
  },
  desc: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    textAlign: 'justify',
  },
  infoBlock: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D2D51',
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
});

export default EventDetailScreen;