import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { login } from '../../services/api/employeeApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { UserContext } from '../../context/UserContext';

const LoginScreen = ({ navigation }) => {
  const [adresse1, setAdresse1] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(UserContext);

  const handleLogin = async () => {
    const res = await login(adresse1, password);
    if (res.token) {
      await AsyncStorage.setItem('token', res.token);
      setUser(res.employee); // stocke l'utilisateur dans le contexte
      navigation.replace('MainTabs');
    } else {
      Alert.alert('Erreur', res.message || 'Adresse ou mot de passe invalide');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Connexion</Text>
        <InputField value={adresse1} onChangeText={setAdresse1} placeholder="Adresse 1" />
        <InputField value={password} onChangeText={setPassword} placeholder="Mot de passe" secureTextEntry />
        <CustomButton title="Se connecter" onPress={handleLogin} />
        <Text style={styles.link} onPress={() => navigation.navigate('Register')}>Créer un compte</Text>
      </View>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    width: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    color: '#1D2D51',
    fontSize: 28,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  link: {
    color: '#1D2D51',
    marginTop: 20,
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});

export default LoginScreen;
