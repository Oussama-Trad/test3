import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    try {
      const res = await login(adresse1, password);
      if (res.token) {
        await AsyncStorage.setItem('token', res.token);
        setUser(res.employee);
        navigation.replace('MainTabs');
      } else {
        Alert.alert('Erreur', res.message || 'Adresse ou mot de passe invalide');
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de contacter le serveur');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#1D2D51', '#2A4066']} style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Connexion</Text>
          <InputField
            value={adresse1}
            onChangeText={setAdresse1}
            placeholder="Adresse 1"
            style={styles.input}
            placeholderTextColor="#888"
          />
          <InputField
            value={password}
            onChangeText={setPassword}
            placeholder="Mot de passe"
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#888"
          />
          <CustomButton
            title="Se connecter"
            onPress={handleLogin}
            style={styles.button}
            textStyle={styles.buttonText}
          />
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Register')}
          >
            Créer un compte
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

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
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    color: '#1D2D51',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDE1E6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#F8FAFD',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    color: '#1D2D51',
  },
  button: {
    backgroundColor: '#4f8cff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  link: {
    color: '#4f8cff',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;