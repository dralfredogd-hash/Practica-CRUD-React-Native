import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { ref, push, set } from "firebase/database";
import { db } from "../components/ui/config";

export default function CrudScreen() {
  const [username, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');

  function create() {
    // Genera un ID automático
    const newRef = push(ref(db, "users"));

    set(newRef, {
      username: username,
      email: email,
      contraseña: contraseña
    })
      .then(() => {
        alert("Datos guardados correctamente");
        setName("");
        setEmail("");
        setContraseña("");
      })
      .catch((error) => {
        alert("Error: " + error);
      });
  }

  return (
    <View style={styles.container}>
      <Text>CRUD Screen</Text>

      <TextInput
        value={username}
        onChangeText={setName}
        placeholder="Username"
        style={styles.textBoxes}
      />

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.textBoxes}
      />
      <TextInput
        value={contraseña}
        onChangeText={setContraseña}
        placeholder="Email"
        style={styles.textBoxes}
      />

      <TouchableOpacity style={styles.btn} onPress={create}>
        <Text style={styles.btnText}>Subir los datos</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20
  },
  textBoxes: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#333",
    padding: 10,
    marginVertical: 10,
    borderRadius: 8
  },
  btn: {
    backgroundColor: "#1976d2",
    padding: 12,
    borderRadius: 8,
    marginTop: 15
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold"
  }
});
