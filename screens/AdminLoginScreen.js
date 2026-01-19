import React, { useState, useContext } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Image, Dimensions } from 'react-native';
import { Text } from '@gluestack-ui/themed';
import { ThemeContext } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LoadingOverlay from '../components/LoadingOverlay';
import { rdb } from '../firebase';
import { ref, get } from 'firebase/database';
import bcrypt from 'bcryptjs';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminLoginScreen({ navigation }) {
  const { setAuthenticated, setIsAdmin, setUserName, palette } = useContext(ThemeContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { width } = Dimensions.get('window');
  const logoSize = Math.min(width * 0.36, 180);

  const submit = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor ingresa usuario y contraseña');
      return;
    }

    setLoading(true);

    // Consultar Firebase Realtime Database para validar credenciales del admin
    (async () => {
      try {
        // Obtener los datos de administradores desde Firebase
        const adminRef = ref(rdb, 'admins');
        const snapshot = await get(adminRef);

        if (!snapshot.exists()) {
          setLoading(false);
          Alert.alert('Error', 'No hay administradores registrados en el sistema');
          return;
        }

        // Buscar el admin con el username ingresado
        const adminsData = snapshot.val();
        let adminUser = null;
        const trimmedUsername = username.trim().toLowerCase();
        const trimmedPassword = password.trim();

        for (const adminId in adminsData) {
          const admin = adminsData[adminId];
          if (admin.username && admin.username.toLowerCase() === trimmedUsername) {
            adminUser = admin;
            adminUser.id = adminId;
            break;
          }
        }

        // Si no encuentra el admin
        if (!adminUser) {
          setLoading(false);
          Alert.alert('Acceso denegado', 'Usuario de administrador no encontrado');
          return;
        }

        // Si el admin no tiene contraseña (error de datos)
        if (!adminUser.password) {
          setLoading(false);
          Alert.alert('Error', 'Credenciales de administrador inválidas');
          return;
        }

        // Validar la contraseña usando bcrypt
        const passwordMatch = await new Promise((res, rej) => {
          bcrypt.compare(String(trimmedPassword), String(adminUser.password), (err, same) => {
            if (err) rej(err);
            else res(same);
          });
        });

        if (!passwordMatch) {
          setLoading(false);
          Alert.alert('Acceso denegado', 'Contraseña de administrador incorrecta');
          return;
        }

        // Credenciales válidas - Autenticar
        const adminName = adminUser.nombre || adminUser.username || 'Administrador';
        if (typeof setUserName === 'function') setUserName(adminName);
        if (typeof setIsAdmin === 'function') setIsAdmin(true);
        if (typeof setAuthenticated === 'function') setAuthenticated(true);
        setLoading(false);

      } catch (err) {
        setLoading(false);
        console.error('Admin login error:', err);
        Alert.alert('Error', err.message || 'No se pudo validar las credenciales de administrador');
      }
    })();
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFF5E6', '#d68a19']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <LoadingOverlay 
          visible={loading} 
          message="Verificando credenciales..."
        />
        <View style={styles.inner}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image 
                source={require('../assets/Induspack-logo.png')} 
                style={styles.logo} 
                resizeMode="contain" 
              />
            </View>
            <Text style={styles.welcomeText}>Panel de Administrador</Text>
            <Text style={styles.subtitle}>Acceso restringido</Text>
          </View>

          {/* Form Card */}
          <View style={[styles.card, styles.shadow]}>
            <Text style={styles.title}>Iniciar Sesión - Admin</Text>

            <View style={styles.inputContainer}>
              <Icon name="person" size={22} color={palette.primary} style={styles.inputIcon} />
              <TextInput 
                placeholder="Usuario" 
                style={styles.input} 
                value={username} 
                onChangeText={setUsername} 
                placeholderTextColor="#999" 
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={22} color={palette.primary} style={styles.inputIcon} />
              <TextInput 
                placeholder="Contraseña" 
                style={styles.input} 
                secureTextEntry={!showPassword}
                value={password} 
                onChangeText={setPassword} 
                placeholderTextColor="#999" 
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Icon 
                  name={showPassword ? "visibility" : "visibility-off"} 
                  size={22} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.button, styles.shadow, { backgroundColor: palette.primary || '#d35400' }]} 
              onPress={submit}
            >
              <Icon name="admin-panel-settings" size={22} color="#fff" />
              <Text style={styles.buttonText}>Entrar como Administrador</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={20} color={palette.primary} />
              <Text style={[styles.backText, { color: palette.primary }]}>Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  inner: { 
    width: '100%', 
    alignItems: 'center' 
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    width: Math.min(Dimensions.get('window').width * 0.36, 180),
    height: Math.min(Dimensions.get('window').width * 0.36, 180),
    borderRadius: Math.min(Dimensions.get('window').width * 0.36, 180) / 2,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
  },
  card: { 
    width: '100%', 
    backgroundColor: '#fff', 
    padding: 28, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#f0f0f0',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    marginBottom: 28, 
    textAlign: 'center',
    color: '#1a1a1a',
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f8f9fa', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    marginBottom: 18, 
    borderWidth: 1, 
    borderColor: '#e9ecef',
  },
  inputIcon: { 
    marginRight: 12,
  },
  input: { 
    flex: 1, 
    paddingVertical: 16, 
    fontSize: 16, 
    color: '#333',
  },
  eyeIcon: {
    padding: 8,
  },
  button: { 
    flexDirection: 'row',
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});