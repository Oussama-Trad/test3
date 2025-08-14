import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

const InputField = ({ value, onChangeText, placeholder, secureTextEntry }) => (
  <View style={styles.container}>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#aaa"
      secureTextEntry={secureTextEntry}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
    alignItems: 'center',
  },
  input: {
    width: 250,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1D2D51',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#1D2D51',
    fontSize: 16,
  },
});

export default InputField;
