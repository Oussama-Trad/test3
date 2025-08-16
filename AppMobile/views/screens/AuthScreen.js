import React from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../../components/CustomButton';

const AuthScreen = ({ navigation }) => {
  return (
    <LinearGradient
      colors={['#1D2D51', '#2A4066']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Bienvenue</Text>
          <Text style={styles.subtitle}>
            Connectez-vous ou inscrivez-vous pour découvrir les actualités
          </Text>
          <CustomButton
            title="Connexion"
            onPress={() => navigation.navigate('Login')}
            style={styles.button}
            textStyle={styles.buttonText}
          />
          <CustomButton
            title="Inscription"
            onPress={() => navigation.navigate('Register')}
            style={[styles.button, styles.registerButton]}
            textStyle={styles.buttonText}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
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
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#3B5998',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  registerButton: {
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
});

export default AuthScreen;