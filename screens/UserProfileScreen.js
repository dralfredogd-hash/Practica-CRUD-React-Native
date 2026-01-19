import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
  TextInput
} from 'react-native';
import { Text } from '@gluestack-ui/themed';
import { ThemeContext } from '../context/ThemeContext';
import { rdb } from '../firebase';
import { ref, get, update } from 'firebase/database';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

const { width } = Dimensions.get('window');

export default function UserProfileScreen({ navigation }) {
  const { palette, registeredUser, userName } = useContext(ThemeContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      if (registeredUser && registeredUser.key) {
        const userRef = ref(rdb, `clients/${registeredUser.key}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUserData(snapshot.val());
          if (snapshot.val().profileImage) {
            setProfileImage(snapshot.val().profileImage);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'No se pudo cargar los datos del perfil');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la galería de fotos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });

      if (!result.canceled) {
        const file = result.assets[0];
        try {
          const base64 = await FileSystem.readAsStringAsync(file.uri, {
            encoding: 'base64'
          });

          if (!base64 || base64.length === 0) {
            throw new Error('Base64 encoding failed');
          }

          const imageData = `data:image/jpeg;base64,${base64}`;
          setProfileImage(imageData);

          // Save to Firebase
          if (registeredUser && registeredUser.key) {
            await update(ref(rdb, `clients/${registeredUser.key}`), {
              profileImage: imageData
            });
            Alert.alert('Éxito', 'Foto de perfil actualizada correctamente');
          }
        } catch (base64Error) {
          console.error('Error processing image:', base64Error);
          Alert.alert('Error', 'No se pudo procesar la imagen. Intenta con otra foto.');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleEditField = (field, value) => {
    setEditField(field);
    setEditValue(value || '');
    setModalVisible(true);
  };

  const saveFieldChange = async () => {
    try {
      if (registeredUser && registeredUser.key && editField) {
        await update(ref(rdb, `clients/${registeredUser.key}`), {
          [editField]: editValue
        });
        setUserData({ ...userData, [editField]: editValue });
        setModalVisible(false);
        Alert.alert('Éxito', 'Datos actualizados correctamente');
      }
    } catch (error) {
      console.error('Error saving field:', error);
      Alert.alert('Error', 'No se pudo actualizar los datos');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: palette.bg }]}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: palette.bg }]}>
      {/* Header con gradiente azul */}
      <View style={[styles.headerBg, { backgroundColor: palette.primary }]}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Icon name="close" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Foto de perfil */}
      <View style={styles.profileImageContainer}>
        <TouchableOpacity
          onPress={pickImage}
          style={[
            styles.profileImageCircle,
            { borderColor: palette.primary }
          ]}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Icon name="person" size={80} color={palette.primary} />
            </View>
          )}
          <View style={[styles.cameraButton, { backgroundColor: palette.primary }]}>
            <Icon name="camera-alt" size={18} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Información del usuario */}
      <View style={styles.infoContainer}>
        <View style={styles.nameContainer}>
          <Text style={[styles.nameText, { color: palette.text }]}>
            {userData?.nombre} {userData?.apellido}
          </Text>
          {userData?.rol === 'admin' && (
            <View style={[styles.adminBadge, { backgroundColor: palette.primary }]}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>

        {/* Datos personales */}
        <View style={styles.dataSection}>
          <Text style={[styles.sectionTitle, { color: palette.primary }]}>
            Información Personal
          </Text>

          <TouchableOpacity
            style={styles.dataField}
            onPress={() => handleEditField('nombre', userData?.nombre)}
          >
            <View style={styles.dataFieldContent}>
              <Icon name="person" size={20} color={palette.primary} style={styles.fieldIcon} />
              <View style={styles.fieldText}>
                <Text style={[styles.fieldLabel, { color: '#999' }]}>Nombre</Text>
                <Text style={[styles.fieldValue, { color: palette.text }]}>
                  {userData?.nombre || 'No disponible'}
                </Text>
              </View>
            </View>
            <Icon name="edit" size={20} color={palette.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dataField}
            onPress={() => handleEditField('apellido', userData?.apellido)}
          >
            <View style={styles.dataFieldContent}>
              <Icon name="person" size={20} color={palette.primary} style={styles.fieldIcon} />
              <View style={styles.fieldText}>
                <Text style={[styles.fieldLabel, { color: '#999' }]}>Apellido</Text>
                <Text style={[styles.fieldValue, { color: palette.text }]}>
                  {userData?.apellido || 'No disponible'}
                </Text>
              </View>
            </View>
            <Icon name="edit" size={20} color={palette.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dataField}
            onPress={() => handleEditField('email', userData?.email)}
          >
            <View style={styles.dataFieldContent}>
              <Icon name="email" size={20} color={palette.primary} style={styles.fieldIcon} />
              <View style={styles.fieldText}>
                <Text style={[styles.fieldLabel, { color: '#999' }]}>Correo Electrónico</Text>
                <Text style={[styles.fieldValue, { color: palette.text }]}>
                  {userData?.email || 'No disponible'}
                </Text>
              </View>
            </View>
            <Icon name="edit" size={20} color={palette.primary} />
          </TouchableOpacity>

          <View style={styles.dataField}>
            <View style={styles.dataFieldContent}>
              <Icon name="calendar-today" size={20} color={palette.primary} style={styles.fieldIcon} />
              <View style={styles.fieldText}>
                <Text style={[styles.fieldLabel, { color: '#999' }]}>Fecha de Registro</Text>
                <Text style={[styles.fieldValue, { color: palette.text }]}>
                  {userData?.fechaRegistro || 'No disponible'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.dataField}>
            <View style={styles.dataFieldContent}>
              <Icon name="verified-user" size={20} color={palette.primary} style={styles.fieldIcon} />
              <View style={styles.fieldText}>
                <Text style={[styles.fieldLabel, { color: '#999' }]}>Rol</Text>
                <Text style={[styles.fieldValue, { color: palette.text }]}>
                  {userData?.rol === 'admin' ? 'Administrador' : 'Usuario'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Estadísticas de Reportes */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: palette.primary }]}>
            Resumen de Reportes
          </Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderColor: palette.primary }]}>
              <Text style={[styles.statNumber, { color: palette.primary }]}>0</Text>
              <Text style={[styles.statLabel, { color: palette.text }]}>Reportes</Text>
            </View>
            <View style={[styles.statCard, { borderColor: palette.primary }]}>
              <Text style={[styles.statNumber, { color: palette.primary }]}>0</Text>
              <Text style={[styles.statLabel, { color: palette.text }]}>Hoy</Text>
            </View>
            <View style={[styles.statCard, { borderColor: palette.primary }]}>
              <Text style={[styles.statNumber, { color: palette.primary }]}>0</Text>
              <Text style={[styles.statLabel, { color: palette.text }]}>Esta Semana</Text>
            </View>
          </View>
        </View>

        {/* Botón de cierre de sesión */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: palette.primary }]}
          onPress={() => {
            Alert.alert('Cerrar Sesión', '¿Deseas cerrar sesión?', [
              { text: 'Cancelar', onPress: () => {} },
              {
                text: 'Aceptar',
                onPress: () => navigation.navigate('Login')
              }
            ]);
          }}
        >
          <Icon name="logout" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para editar campos */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: palette.bg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.text }]}>
                Editar Campo
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color={palette.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.modalInput, { color: palette.text, borderColor: palette.primary }]}
              value={editValue}
              onChangeText={setEditValue}
              placeholder="Ingresa el nuevo valor"
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#e9ecef' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: palette.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: palette.primary }]}
                onPress={saveFieldChange}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerBg: {
    height: 140,
    paddingTop: 40,
    paddingHorizontal: 20,
    justifyContent: 'flex-start'
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: -70,
    marginBottom: 30,
    zIndex: 10
  },
  profileImageCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70
  },
  placeholderImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700'
  },
  adminBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 8
  },
  adminBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  dataSection: {
    marginBottom: 30
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    marginTop: 10
  },
  dataField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  dataFieldContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  fieldIcon: {
    marginRight: 12
  },
  fieldText: {
    flex: 1
  },
  fieldLabel: {
    fontSize: 12,
    marginBottom: 4
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '500'
  },
  statsSection: {
    marginBottom: 30
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  statCard: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9'
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500'
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700'
  },
  modalInput: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 14
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    gap: 10
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600'
  }
});
