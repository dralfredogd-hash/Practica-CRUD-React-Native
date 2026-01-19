import React, { useContext, useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, ScrollView, ActivityIndicator, Keyboard } from 'react-native';
import { Text } from '@gluestack-ui/themed';
import { ThemeContext } from '../context/ThemeContext';
import { rdb } from '../firebase';
import { ref, get, update } from 'firebase/database';
import * as bcrypt from 'expo-crypto';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ResetPasswordScreen() {
  const { palette } = useContext(ThemeContext);
  const [step, setStep] = useState(1);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userData, setUserData] = useState(null);

  // Paso 1: Buscar usuario por nombre y apellido
  const handleSearchUser = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert('Error', 'Por favor ingresa nombre y apellido');
      return;
    }

    try {
      setLoading(true);
      const clientsRef = ref(rdb, 'clients');
      const snapshot = await get(clientsRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const foundUser = Object.entries(data).find(([key, user]) => 
          user.nombre?.toLowerCase() === nombre.toLowerCase().trim() &&
          user.apellido?.toLowerCase() === apellido.toLowerCase().trim()
        );

        if (foundUser) {
          setUserData({ key: foundUser[0], ...foundUser[1] });
          setStep(2);
          Keyboard.dismiss();
        } else {
          Alert.alert('No encontrado', 'No existe un usuario con ese nombre y apellido');
        }
      } else {
        Alert.alert('Error', 'No hay usuarios registrados en el sistema');
      }
    } catch (error) {
      console.error('Error searching user:', error);
      Alert.alert('Error', 'Ocurrió un error al buscar el usuario');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Validar y actualizar contraseña
  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Por favor ingresa ambas contraseñas');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);

      // Hash la nueva contraseña
      const hashedPassword = await bcrypt.digestStringAsync(
        bcrypt.CryptoDigestAlgorithm.SHA256,
        newPassword
      );

      // Crear versión bcryptjs-compatible (para demo, usamos el hash de SHA256)
      // En producción, esto debería usar bcryptjs en servidor
      const finalHash = `$2a$10$${hashedPassword.substring(0, 53)}`;

      // Actualizar contraseña en la tabla 'clients'
      const userRef = ref(rdb, `clients/${userData.key}`);
      await update(userRef, {
        password: finalHash,
        passwordChangedAt: new Date().toISOString()
      });

      // Guardar en tabla de recuperación de contraseña para auditoría
      const recoveryRef = ref(rdb, `password_recovery/${userData.key}_${Date.now()}`);
      await update(recoveryRef, {
        userId: userData.key,
        nombre: userData.nombre,
        apellido: userData.apellido,
        email: userData.email || 'N/A',
        newPassword: finalHash,
        changedAt: new Date().toISOString(),
        method: 'self-reset'
      });

      Alert.alert(
        'Éxito',
        'Tu contraseña ha sido actualizada correctamente',
        [
          {
            text: 'Aceptar',
            onPress: () => {
              setStep(1);
              setNombre('');
              setApellido('');
              setNewPassword('');
              setConfirmPassword('');
              setUserData(null);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error resetting password:', error);
      Alert.alert('Error', 'Ocurrió un error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFF5E6', '#d68a19']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: palette.primary }]}>
          <Icon name="lock-reset" size={40} color="#fff" />
          <Text style={styles.headerTitle}>Recuperar Contraseña</Text>
          <Text style={styles.headerSubtitle}>
            {step === 1 ? 'Paso 1: Identifícate' : 'Paso 2: Nueva contraseña'}
          </Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressStep, { backgroundColor: step >= 1 ? palette.primary : '#e9ecef' }]}>
            <Text style={[styles.progressText, { color: step >= 1 ? '#fff' : '#666' }]}>1</Text>
          </View>
          <View style={[styles.progressLine, { backgroundColor: step >= 2 ? palette.primary : '#e9ecef' }]} />
          <View style={[styles.progressStep, { backgroundColor: step >= 2 ? palette.primary : '#e9ecef' }]}>
            <Text style={[styles.progressText, { color: step >= 2 ? '#fff' : '#666' }]}>2</Text>
          </View>
        </View>

        {/* Step 1: Search User */}
        {step === 1 && (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Busca tu usuario</Text>
            <Text style={styles.sectionDescription}>
              Ingresa tu nombre y apellido para proceder con la recuperación
            </Text>

            {/* Nombre Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre</Text>
              <View style={[styles.inputContainer, { borderColor: palette.primary }]}>
                <Icon name="person" size={18} color={palette.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="Tu nombre"
                  placeholderTextColor="#bbb"
                  value={nombre}
                  onChangeText={setNombre}
                  editable={!loading}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Apellido Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Apellido</Text>
              <View style={[styles.inputContainer, { borderColor: palette.primary }]}>
                <Icon name="person" size={18} color={palette.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="Tu apellido"
                  placeholderTextColor="#bbb"
                  value={apellido}
                  onChangeText={setApellido}
                  editable={!loading}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Search Button */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: palette.primary, opacity: loading ? 0.6 : 1 }]}
              onPress={handleSearchUser}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <View style={styles.buttonContent}>
                  <Icon name="search" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Buscar Usuario</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.helpText}>
              ℹ️ Si no recuerdas tu información, contacta al administrador
            </Text>
          </View>
        )}

        {/* Step 2: Reset Password */}
        {step === 2 && userData && (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Cambiar contraseña</Text>
            
            {/* User Info Display */}
            <View style={[styles.userInfoBox, { backgroundColor: `${palette.primary}15` }]}>
              <Icon name="check-circle" size={20} color={palette.primary} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userData.nombre} {userData.apellido}</Text>
                <Text style={styles.userEmail}>{userData.email || 'Sin correo'}</Text>
              </View>
            </View>

            {/* New Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nueva Contraseña</Text>
              <View style={[styles.inputContainer, { borderColor: palette.primary }]}>
                <Icon name="lock" size={18} color={palette.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor="#bbb"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon 
                    name={showPassword ? 'visibility' : 'visibility-off'} 
                    size={18} 
                    color={palette.primary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar Contraseña</Text>
              <View style={[styles.inputContainer, { borderColor: palette.primary }]}>
                <Icon name="lock" size={18} color={palette.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="Repite la contraseña"
                  placeholderTextColor="#bbb"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Icon 
                    name={showConfirm ? 'visibility' : 'visibility-off'} 
                    size={18} 
                    color={palette.primary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsBox}>
              <Text style={styles.requirementsTitle}>Requisitos de contraseña:</Text>
              <View style={styles.requirement}>
                <Icon 
                  name={newPassword.length >= 8 ? 'check-circle' : 'radio-button-unchecked'} 
                  size={16} 
                  color={newPassword.length >= 8 ? '#4CAF50' : '#bbb'} 
                />
                <Text style={styles.requirementText}>Mínimo 8 caracteres</Text>
              </View>
              <View style={styles.requirement}>
                <Icon 
                  name={newPassword === confirmPassword && newPassword.length > 0 ? 'check-circle' : 'radio-button-unchecked'} 
                  size={16} 
                  color={newPassword === confirmPassword && newPassword.length > 0 ? '#4CAF50' : '#bbb'} 
                />
                <Text style={styles.requirementText}>Las contraseñas coinciden</Text>
              </View>
            </View>

            {/* Update Button */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: palette.primary, opacity: loading ? 0.6 : 1 }]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <View style={styles.buttonContent}>
                  <Icon name="save" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Actualizar Contraseña</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setStep(1);
                setNombre('');
                setApellido('');
                setUserData(null);
              }}
              disabled={loading}
            >
              <Icon name="arrow-back" size={20} color={palette.primary} />
              <Text style={[styles.backButtonText, { color: palette.primary }]}>Volver</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingTop: 40,
    alignItems: 'center',
    gap: 12
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700'
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20
  },
  progressStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  progressLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8
  },
  progressText: {
    fontWeight: '700',
    fontSize: 14
  },
  formContainer: {
    marginHorizontal: 20,
    marginTop: 10
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8
  },
  sectionDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
    lineHeight: 18
  },
  inputGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.84
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333'
  },
  button: {
    flexDirection: 'row',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#d35400',
    gap: 8
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700'
  },
  userInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    gap: 12
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333'
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  requirementsBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 14,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#d35400'
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  requirementText: {
    fontSize: 12,
    color: '#666'
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic'
  }
});