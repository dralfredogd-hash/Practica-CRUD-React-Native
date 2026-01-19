import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
  Image,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { Text } from '@gluestack-ui/themed';
import { ThemeContext } from '../context/ThemeContext';
import { rdb } from '../firebase';
import { ref, get, update } from 'firebase/database';
import Icon from 'react-native-vector-icons/MaterialIcons';
import bcrypt from 'bcryptjs';
import Header from '../components/ui/Header';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isLandscape = width > height;

export default function AdminProfileScreen({ navigation }) {
  const { palette, userName } = useContext(ThemeContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const clientsRef = ref(rdb, 'clients');
      const snapshot = await get(clientsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersList = Object.entries(data).map(([key, value]) => ({
          key,
          ...value
        }));
        setUsers(usersList);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const handleChangePassword = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setModalVisible(true);
  };

  const saveNewPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Ingresa una nueva contraseña');
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
      const salt = bcrypt.genSaltSync(10);
      const hashed = bcrypt.hashSync(String(newPassword), salt);

      await update(ref(rdb, `clients/${selectedUser.key}`), {
        password: hashed
      });

      Alert.alert('Éxito', `Contraseña actualizada para ${selectedUser.nombre}`);
      setModalVisible(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', 'No se pudo actualizar la contraseña');
    }
  };

  const filteredUsers = users.filter(user =>
    user.nombre?.toLowerCase().includes(filterText.toLowerCase()) ||
    user.apellido?.toLowerCase().includes(filterText.toLowerCase()) ||
    user.email?.toLowerCase().includes(filterText.toLowerCase())
  );

  const renderUserCard = ({ item, index }) => (
    <View style={[
      styles.userCard,
      { 
        backgroundColor: '#fff',
        shadowColor: palette.primary,
        elevation: 3,
        marginHorizontal: isTablet ? 2 : 0
      }
    ]}>
      <View style={styles.userCardContent}>
        {/* Avatar con indicador de estado */}
        <View style={styles.avatarContainer}>
          <View style={[styles.userAvatar, { backgroundColor: palette.primary }]}>
            {item.profileImage ? (
              <Image
                source={{ uri: item.profileImage }}
                style={styles.userImage}
              />
            ) : (
              <Icon name="person" size={32} color="#fff" />
            )}
          </View>
          {item.rol === 'admin' && (
            <View style={[styles.adminIndicator, { backgroundColor: palette.primary }]}>
              <Icon name="star" size={10} color="#fff" />
            </View>
          )}
        </View>

        {/* Información del usuario */}
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={[styles.userName, { color: '#333' }]}>
              {item.nombre} {item.apellido}
            </Text>
            <View style={[
              styles.roleBadge,
              { 
                backgroundColor: item.rol === 'admin' ? `${palette.primary}20` : '#f1f3f5',
                borderColor: item.rol === 'admin' ? palette.primary : '#dee2e6'
              }
            ]}>
              <Icon 
                name={item.rol === 'admin' ? 'shield' : 'person-outline'} 
                size={12} 
                color={item.rol === 'admin' ? palette.primary : '#666'} 
              />
              <Text style={[
                styles.roleText,
                { color: item.rol === 'admin' ? palette.primary : '#666' }
              ]}>
                {item.rol === 'admin' ? 'Admin' : 'Usuario'}
              </Text>
            </View>
          </View>
          
          <View style={styles.userDetails}>
            <View style={styles.detailRow}>
              <Icon name="email" size={14} color={palette.primary} style={styles.detailIcon} />
              <Text style={[styles.userEmail, { color: '#666' }]} numberOfLines={1}>
                {item.email || 'Sin correo electrónico'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="calendar-today" size={14} color={palette.primary} style={styles.detailIcon} />
              <Text style={[styles.userDate, { color: '#999' }]}>
                {item.fechaRegistro || 'Sin fecha de registro'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Acciones */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.editPasswordButton, { backgroundColor: palette.primary }]}
          onPress={() => handleChangePassword(item)}
        >
          <Icon name="vpn-key" size={18} color="#fff" />
          <Text style={styles.editPasswordButtonText}>Cambiar Contraseña</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.viewButton, { borderColor: palette.primary }]}
          onPress={() => navigation.navigate('UserDetails', { userId: item.key })}
        >
          <Icon name="visibility" size={16} color={palette.primary} />
          <Text style={[styles.viewButtonText, { color: palette.primary }]}>Ver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatsCard = ({ title, value, icon, color }) => (
    <View style={[
      styles.statCard,
      { 
        backgroundColor: '#fff',
        borderColor: color,
        shadowColor: color,
        elevation: 2
      }
    ]}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: '#666' }]}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#f8f9fa' }]}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={[styles.loadingText, { color: palette.primary }]}>
          Cargando usuarios...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: '#f8f9fa' }]}>
      <Header title="Gestión de Usuarios" subtitle="Panel de Administración" />
      
      {/* Recuadro de Bienvenida */}
      <View style={[styles.welcomeCard, { backgroundColor: '#fff', shadowColor: palette.primary }]}>
        <View style={styles.welcomeCardContent}>
          <Image 
            source={require('../assets/Induspack-logo.png')} 
            style={styles.welcomeCardLogo} 
            resizeMode="contain" 
          />
          <View style={styles.welcomeCardText}>
            <Text style={[styles.welcomeTitle, { color: palette.primary }]}>Panel de Admin</Text>
            <Text style={styles.welcomeSubtitle}>Bienvenido, {userName}</Text>
          </View>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: palette.primary }]}
            onPress={() => {
              Alert.alert('Cerrar Sesión', '¿Deseas cerrar sesión?', [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Cerrar Sesión',
                  style: 'destructive',
                  onPress: () => navigation.navigate('Login')
                }
              ]);
            }}
          >
            <Icon name="logout" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[
        styles.searchContainer,
        { 
          backgroundColor: '#fff',
          shadowColor: palette.primary,
          elevation: 2,
          marginHorizontal: 16,
          marginBottom: 16
        }
      ]}>
        <Icon name="search" size={20} color={palette.primary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: palette.text }]}
          placeholder="Buscar por nombre, apellido o correo..."
          placeholderTextColor="#adb5bd"
          value={filterText}
          onChangeText={setFilterText}
        />
        {filterText.length > 0 && (
          <TouchableOpacity 
            onPress={() => setFilterText('')}
            style={styles.clearButton}
          >
            <Icon name="close" size={20} color={palette.primary} />
          </TouchableOpacity>
        )}
      </View>

      {filterText.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsText, { color: palette.primary, marginHorizontal: 16 }]}>
            <Icon name="search" size={14} color={palette.primary} />
            {' '}{filteredUsers.length} resultado{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconContainer, { backgroundColor: `${palette.primary}15` }]}>
            <Icon name="people-alt" size={64} color={palette.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: palette.primary }]}>
            {filterText ? 'No se encontraron resultados' : 'No hay usuarios registrados'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: '#666' }]}>
            {filterText ? 'Intenta con otro término de búsqueda' : 'Agrega nuevos usuarios para comenzar'}
          </Text>
          {!filterText && (
            <TouchableOpacity
              style={[styles.addUserButton, { backgroundColor: palette.primary }]}
              onPress={() => navigation.navigate('AddUser')}
            >
              <Icon name="person-add" size={20} color="#fff" />
              <Text style={styles.addUserButtonText}>Agregar Nuevo Usuario</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.usersList}>
          {filteredUsers.map((item, index) => (
            <React.Fragment key={item.key}>
              {renderUserCard({ item, index })}
              {index < filteredUsers.length - 1 && <View style={styles.separator} />}
            </React.Fragment>
          ))}
        </View>
      )}

      {/* Modal para cambiar contraseña */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { 
              backgroundColor: '#fff',
              shadowColor: '#000',
              elevation: 8
            }
          ]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconContainer, { backgroundColor: `${palette.primary}15` }]}>
                <Icon name="vpn-key" size={28} color={palette.primary} />
              </View>
              <View style={styles.modalTitleContainer}>
                <Text style={[styles.modalTitle, { color: '#333' }]}>
                  Cambiar Contraseña
                </Text>
                {selectedUser && (
                  <Text style={[styles.modalSubtitle, { color: '#666' }]}>
                    {selectedUser.nombre} {selectedUser.apellido}
                  </Text>
                )}
              </View>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordInputsContainer}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: '#333' }]}>Nueva Contraseña</Text>
                <View style={[
                  styles.passwordInputContainer,
                  { borderColor: newPassword ? palette.primary : '#e9ecef' }
                ]}>
                  <Icon name="lock" size={20} color={palette.primary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.passwordInput, { color: '#333' }]}
                    placeholder="Ingresa nueva contraseña"
                    placeholderTextColor="#adb5bd"
                    secureTextEntry={!showPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.visibilityToggle}
                  >
                    <Icon
                      name={showPassword ? 'visibility' : 'visibility-off'}
                      size={20}
                      color={palette.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: '#333' }]}>Confirmar Contraseña</Text>
                <View style={[
                  styles.passwordInputContainer,
                  { borderColor: confirmPassword ? palette.primary : '#e9ecef' }
                ]}>
                  <Icon name="lock-outline" size={20} color={palette.primary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.passwordInput, { color: '#333' }]}
                    placeholder="Confirma la contraseña"
                    placeholderTextColor="#adb5bd"
                    secureTextEntry={!showPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>

            <View style={[styles.passwordRules, { backgroundColor: `${palette.primary}05` }]}>
              <Text style={[styles.rulesTitle, { color: palette.primary }]}>
                <Icon name="info" size={14} color={palette.primary} /> Requisitos:
              </Text>
              <View style={styles.ruleItem}>
                <Icon 
                  name={newPassword.length >= 8 ? 'check-circle' : 'radio-button-unchecked'} 
                  size={14} 
                  color={newPassword.length >= 8 ? '#4CAF50' : '#999'} 
                />
                <Text style={[
                  styles.ruleText,
                  { color: newPassword.length >= 8 ? '#4CAF50' : '#666' }
                ]}>
                  Mínimo 8 caracteres
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Icon 
                  name={newPassword === confirmPassword && newPassword.length > 0 ? 'check-circle' : 'radio-button-unchecked'} 
                  size={14} 
                  color={newPassword === confirmPassword && newPassword.length > 0 ? '#4CAF50' : '#999'} 
                />
                <Text style={[
                  styles.ruleText,
                  { color: newPassword === confirmPassword && newPassword.length > 0 ? '#4CAF50' : '#666' }
                ]}>
                  Las contraseñas coinciden
                </Text>
              </View>
            </View>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: '#666' }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.saveButton,
                  { 
                    backgroundColor: palette.primary,
                    opacity: newPassword && confirmPassword && newPassword === confirmPassword ? 1 : 0.5
                  }
                ]}
                onPress={saveNewPassword}
                disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
              >
                <Icon name="save" size={18} color="#fff" />
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                  Guardar Cambios
                </Text>
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
    paddingBottom: 40,
  },
  welcomeCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  welcomeCardLogo: {
    width: 56,
    height: 42,
  },
  welcomeCardText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  logoutButton: {
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: isTablet ? 24 : 20,
    paddingTop: height * 0.06,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: isTablet ? 24 : 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: isTablet ? 14 : 13,
    fontWeight: '400',
    marginTop: 2,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerStats: {
    marginTop: 8,
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  welcomeName: {
    fontWeight: '700',
    color: '#fff',
  },
  searchContainer: {
    marginHorizontal: isTablet ? 24 : 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: isTablet ? 15 : 14,
    fontWeight: '400',
  },
  clearButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f1f3f5',
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: isTablet ? 24 : 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: isTablet ? 26 : 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: isTablet ? 12 : 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultsHeader: {
    marginHorizontal: isTablet ? 24 : 20,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addUserButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  usersListContainer: {
    marginHorizontal: isTablet ? 24 : 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  userCard: {
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  userCardContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  adminIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userName: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    flex: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  userDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 8,
    width: 16,
  },
  userEmail: {
    fontSize: 13,
    flex: 1,
  },
  userDate: {
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editPasswordButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  editPasswordButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 450,
    maxHeight: '80%',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalCloseButton: {
    padding: 4,
  },
  passwordInputsContainer: {
    gap: 20,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
  },
  inputIcon: {
    marginRight: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '400',
  },
  visibilityToggle: {
    padding: 4,
  },
  passwordRules: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleText: {
    fontSize: 13,
    fontWeight: '400',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#f1f3f5',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  saveButton: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

// Agregar RefreshControl al import
import { RefreshControl } from 'react-native';