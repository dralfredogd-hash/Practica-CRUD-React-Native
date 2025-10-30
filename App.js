import React, { useState } from 'react';
import { View, StyleSheet, Text, Button, TextInput, Alert, TouchableOpacity } from 'react-native';

const App = () => {
  console.log("========================")
  console.log("Renderizando componentes de la app");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const handleSignIn = () => {
    setAuthenticated(true);
    Alert.alert("Autenticación", "Usuario autenticado correctamente");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alfredo Giacinti Reyes</Text>
        <Text style={styles.headerSubtitle}>React Native- user registration </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Usuario</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu nombre de usuario..."
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
        />
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu contraseña..."
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
          <View style={{ width: '100%', marginTop: 8 }}>
        <TouchableOpacity
        style={[styles.loginButton, authenticated && { backgroundColor: '#ccc' }]}
        onPress={handleSignIn}
        disabled={authenticated}
        >
      <Text style={styles.loginButtonText}>
      {authenticated ? "¡Ya estas logeado!" : "Iniciar sesión"}
      </Text>
      </TouchableOpacity>
    </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 80,
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: 'blue',
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  headerSubtitle: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '500',
  },
  form: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
    paddingTop: 40,
  },
  label: {
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginBottom: 4,
    fontSize: 16,
    color: '#2166c2',
    fontWeight: 'bold',
  },
  input: {
    height: 44,
    width: '100%',
    backgroundColor: '#f2f4f8',
    borderRadius: 22,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#2166c2',
    borderWidth: 0,
  },
  loginButton: {
  backgroundColor: 'blue',
  paddingVertical: 12,
  borderRadius: 25,
  alignItems: 'center',
},

loginButtonText: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
},

});

export default App;