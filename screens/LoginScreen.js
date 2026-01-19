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
import { ref, query, orderByChild, equalTo, get } from 'firebase/database';
import bcrypt from 'bcryptjs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LoadingOverlay from '../components/LoadingOverlay';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const logoSize = Math.min(width * 0.36, 180);

export default function LoginScreen({ navigation }) {
  const { palette, setAuthenticated, setUserName, setRegisteredUser, setIsAdmin } = useContext(ThemeContext);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (!identifier.trim()) {
      Alert.alert('Error', 'Proporciona un correo electrónico o nombre');
      return;
    }

    // Mostrar loading
    setLoading(true);

    // Sign in by querying Realtime Database 'clients' by email or by full name
    (async () => {
      try {
        let client = null;
        const id = identifier.trim();
        const pwd = password.trim();

        if (id.includes('@')) {
          const q = query(ref(rdb, 'clients'), orderByChild('email'), equalTo(id));
          const snap = await get(q);
          if (!snap.exists()) {
            setLoading(false);
            Alert.alert('Error', 'Usuario no encontrado');
            return;
          }
          const val = snap.val();
          const firstKey = Object.keys(val)[0];
          client = val[firstKey];
          client.key = firstKey;  // Store the key
        } else {
          const snap = await get(ref(rdb, 'clients'));
          if (!snap.exists()) {
            setLoading(false);
            Alert.alert('Error', 'Usuario no encontrado');
            return;
          }
          const val = snap.val();
          const target = id.toLowerCase();
          for (const k of Object.keys(val)) {
            const c = val[k];
            // Support both new (nombre/apellido) and old (name/lastName) field names
            const full = `${(c.nombre || c.name || '')} ${(c.apellido || c.lastName || '')}`.trim().toLowerCase();
            if (full === target) {
              client = c;
              client.key = k;  // Store the key
              break;
            }
          }
          if (!client) {
            setLoading(false);
            Alert.alert('Error', 'Usuario no encontrado');
            return;
          }
        }

        if (!client.password) {
          setLoading(false);
          Alert.alert('Error', 'Credenciales inválidas');
          return;
        }

        const match = await new Promise((res, rej) => {
          bcrypt.compare(String(pwd), String(client.password), (err, same) => {
            if (err) rej(err);
            else res(same);
          });
        });

        if (!match) {
          setLoading(false);
          Alert.alert('Error', 'Contraseña incorrecta');
          return;
        }

        // Set user name from client record when available
        const fullName = `${client.nombre || client.name || ''} ${client.apellido || client.lastName || ''}`.trim() || id;
        if (typeof setUserName === 'function') setUserName(fullName);
        if (typeof setRegisteredUser === 'function') setRegisteredUser(client);
        if (typeof setIsAdmin === 'function') setIsAdmin(client.rol === 'admin');
        if (typeof setAuthenticated === 'function') setAuthenticated(true);
        
        // Loading se cerrará automáticamente cuando la pantalla cambie
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error('RTDB sign-in error:', err);
        Alert.alert('Error', err.message || 'No se pudo iniciar sesión');
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
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LoadingOverlay 
          visible={loading} 
          message="Iniciando sesión..."
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
            <Text style={styles.welcomeText}>Bienvenido de nuevo</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          </View>

          {/* Form Card */}
          <View style={[styles.card, styles.shadow]}>
            <Text style={styles.title}>Iniciar Sesión</Text>
            
            {/* Identifier (email or full name) */}
            <View style={styles.inputContainer}>
              <Icon name="email" size={22} color={palette.primary} style={styles.inputIcon} />
              <TextInput 
                placeholder="Correo electrónico o Nombre completo" 
                style={styles.input} 
                value={identifier} 
                onChangeText={setIdentifier}
                placeholderTextColor="#999"
                autoCapitalize="none"
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
            
            {/* Remember Me & Forgot Password */}
            <View style={styles.rowBetween}>
              <TouchableOpacity style={styles.checkboxContainer}>
                <View style={[styles.checkbox, { borderColor: palette.primary }]}>
                  <Icon name="check" size={16} color={palette.primary} />
                </View>
                <Text style={styles.checkboxLabel}>Recordarme</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
                <Text style={[styles.forgotText, { color: palette.primary }]}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.button, styles.shadow, { backgroundColor: palette.primary }]} 
              onPress={submit}
            >
              <Icon name="login" size={22} color="#fff" />
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
            
            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>O</Text>
              <View style={styles.dividerLine} />
            </View>
            
            {/* Social Login */}
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
            
            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>¿No tienes una cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.signupLink, { color: palette.primary }]}>
                  Regístrate aquí
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#666',
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '500',
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    color: '#666',
  },
  signupLink: {
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
});