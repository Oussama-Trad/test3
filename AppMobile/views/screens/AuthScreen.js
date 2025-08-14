import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CustomButton from '../../components/CustomButton';

const AuthScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue</Text>
      <CustomButton title="Connexion" onPress={() => navigation.navigate('Login')} />
      <CustomButton title="Inscription" onPress={() => navigation.navigate('Register')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1D2D51',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    marginBottom: 40,
    fontWeight: 'bold',
  },
});

export default AuthScreen;
