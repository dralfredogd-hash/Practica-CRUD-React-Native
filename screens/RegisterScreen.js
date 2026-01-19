import React, { useState, useContext } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions 
} from 'react-native';
import { Text } from '@gluestack-ui/themed';
import { ThemeContext } from '../context/ThemeContext';
import { rdb } from '../firebase';
import { ref, push, set } from 'firebase/database';
import bcrypt from 'bcryptjs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingOverlay from '../components/LoadingOverlay';

const { width, height } = Dimensions.get('window');
const logoSize = Math.min(width * 0.36, 200);

export default function RegisterScreen({ navigation }) {
  const { palette, setUserName, setRegisteredUser } = useContext(ThemeContext);
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim() || !lastName.trim() || !password.trim()) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    if (password.trim() !== confirm.trim()) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    if (password.trim().length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    setLoading(true);
    try {
      // Create user entry in Realtime Database under 'clients'
      const clientsRef = ref(rdb, 'clients');
      const newRef = push(clientsRef);
      const uid = newRef.key;

      console.log('✅ Generado client key:', uid);

      // Hash the password before saving
      let hashed;
      try {
        // Use synchronous salt/gen to avoid RN async issues with bcryptjs
        const salt = bcrypt.genSaltSync(10);
        hashed = bcrypt.hashSync(String(password), salt);
      } catch (hashErr) {
        console.error('Error hashing password:', hashErr, 'passwordType:', typeof password);
        throw hashErr;
      }

      const user = {
        key: uid,
        id: uid,
        nombre: name.trim(),
        apellido: lastName.trim(),
        email: '',
        // email is optional now; do not require it
        password: hashed,
        rol: 'user',
        fechaRegistro: new Date().toLocaleDateString('es-ES'),
        createdAt: new Date().toISOString(),
        profileImage: null
      };

      try {
        await set(newRef, user);
        console.log('✅ Perfil guardado en Realtime Database');
      } catch (e) {
        console.warn('⚠️ Error saving client record:', e);
      }
      
      if (typeof setRegisteredUser === 'function') setRegisteredUser(user);
      if (typeof setUserName === 'function') setUserName(`${user.nombre} ${user.apellido}`);
      
      setLoading(false);
      Alert.alert(
        'Registro exitoso', 
        'Tu cuenta ha sido creada correctamente.', 
        [
          { 
            text: 'Continuar', 
            onPress: () => navigation.navigate('Login'), 
            style: 'default' 
          }
        ]
      );
    } catch (err) {
      setLoading(false);
      console.error('❌ Error al crear cliente en Realtime DB:', err);
      Alert.alert('Error de registro', err.message || 'No se pudo registrar el usuario');
    }
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFF5E6', '#d68a19']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LoadingOverlay 
          visible={loading} 
          message="Registrando usuario..."
        />
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image 
                source={require('../assets/Induspack-logo.png')} 
                style={styles.logo} 
                resizeMode="contain" 
              />
            </View>
            <Text style={styles.welcomeText}>Crea tu cuenta</Text>
            <Text style={styles.subtitle}>Únete a nuestra plataforma</Text>
          </View>

          {/* Form Card */}
          <View style={[styles.card, styles.shadow]}>
            <Text style={styles.title}>Registro</Text>
            
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Icon name="badge" size={22} color={palette.primary} style={styles.inputIcon} />
              <TextInput 
                placeholder="Nombre" 
                style={styles.input} 
                value={name} 
                onChangeText={setName}
                placeholderTextColor="#999"
              />
            </View>
            
            {/* (Email not required) */}

            {/* Last Name Input */}
            <View style={styles.inputContainer}>
              <Icon name="people" size={22} color={palette.primary} style={styles.inputIcon} />
              <TextInput 
                placeholder="Apellidos" 
                style={styles.input} 
                value={lastName} 
                onChangeText={setLastName}
                placeholderTextColor="#999"
              />
            </View>
            
            {/* Password Input */}
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
            
            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={22} color={palette.primary} style={styles.inputIcon} />
              <TextInput 
                placeholder="Confirmar contraseña" 
                style={styles.input} 
                secureTextEntry={!showConfirmPassword}
                value={confirm} 
                onChangeText={setConfirm}
                placeholderTextColor="#999"
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Icon 
                  name={showConfirmPassword ? "visibility" : "visibility-off"} 
                  size={22} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            
            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>NOTA IMPORTANTE</Text>
              <Text style={styles.requirementText}>La contraseña debe contener:</Text>
              <View style={styles.requirementRow}>
                <Icon name={password.length >= 8 ? "check-circle" : "circle"} 
                  size={16} 
                  color={password.length >= 8 ? '#4CAF50' : '#999'} 
                />
                <Text style={styles.requirementText}>Al menos 8 caracteres</Text>
              </View>
            </View>
            
            {/* Terms & Conditions */}
            <TouchableOpacity style={styles.termsContainer}>
              <View style={[styles.checkbox, { borderColor: palette.primary }]}>
                <Icon name="check" size={16} color={palette.primary} />
              </View>
              <Text style={styles.termsText}>
                Acepto los <Text style={[styles.termsLink, { color: palette.primary }]}>Términos y Condiciones</Text> y la <Text style={[styles.termsLink, { color: palette.primary }]}>Política de Privacidad</Text>
              </Text>
            </TouchableOpacity>
            
            {/* Register Button */}
            <TouchableOpacity 
              style={[styles.button, styles.shadow, { backgroundColor: palette.primary }]} 
              onPress={submit}
            >
              <Icon name="person-add" size={22} color="#fff" />
              <Text style={styles.buttonText}>Crear Cuenta</Text>
            </TouchableOpacity>
            
            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>PROXIMAMENTE...</Text>
              <View style={styles.dividerLine} />
            </View>
            
            {/* Social Register */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={[styles.socialButton, styles.shadow]}>
                <Icon name="google" size={22} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, styles.shadow]}>
                <Icon name="facebook" size={22} color="#4267B2" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, styles.shadow]}>
                <Icon name="apple" size={22} color="#000" />
              </TouchableOpacity>
            </View>
            
            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.loginLink, { color: palette.primary }]}>
                  Inicia sesión
                </Text>
              </TouchableOpacity>
            </View>

            {/* Admin login link */}
            <View style={styles.adminLinkContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('AdminLogin')}>
                <Text style={[styles.adminLink, { color: palette.primary }]}>¿Eres administrador? Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    width: logoSize,
    height: logoSize,
    borderRadius: logoSize / 2,
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
    backgroundColor: '#fff',
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 28,
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
  requirementsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  requirementText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e9ecef',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 28,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    fontSize: 16,
    fontWeight: '600',
  },
  adminLinkContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  adminLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});