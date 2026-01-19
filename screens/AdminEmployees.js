import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal, ScrollView, Dimensions, ActivityIndicator, Image } from 'react-native';
import { Text } from '@gluestack-ui/themed';
import { ThemeContext } from '../context/ThemeContext';
import { rdb } from '../firebase';
import { ref, get, remove } from 'firebase/database';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/ui/Header';

const { width } = Dimensions.get('window');

export default function AdminEmployees() {
  const { palette } = useContext(ThemeContext);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [passwordVisible, setPasswordVisible] = useState({});
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const clientsRef = ref(rdb, 'clients');
      const snapshot = await get(clientsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const employeesList = Object.entries(data).map(([key, value]) => ({
          key,
          ...value
        }));
        setEmployees(employeesList);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      Alert.alert('Error', 'No se pudieron cargar los empleados');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (key) => {
    setPasswordVisible(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDeleteEmployee = (employee) => {
    setSelectedEmployee(employee);
    setDeleteModalVisible(true);
  };

  const confirmDeleteEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      setIsDeleting(true);
      const employeeRef = ref(rdb, `clients/${selectedEmployee.key}`);
      await remove(employeeRef);

      // Actualizar la lista local
      setEmployees(employees.filter(emp => emp.key !== selectedEmployee.key));
      setDeleteModalVisible(false);
      setSelectedEmployee(null);
      Alert.alert('Éxito', `Empleado ${selectedEmployee.nombre} ${selectedEmployee.apellido} ha sido eliminado`);
    } catch (error) {
      console.error('Error deleting employee:', error);
      Alert.alert('Error', 'No se pudo eliminar el empleado');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.nombre?.toLowerCase().includes(filterText.toLowerCase()) ||
    emp.apellido?.toLowerCase().includes(filterText.toLowerCase()) ||
    emp.email?.toLowerCase().includes(filterText.toLowerCase())
  );

  const renderEmployeeRow = ({ item }) => (
    <View style={[styles.tableRow, { borderBottomColor: palette.primary }]}>
      <View style={[styles.tableCell, styles.cellName]}>
        <Text style={styles.cellText} numberOfLines={1}>
          {item.nombre}
        </Text>
      </View>
      <View style={[styles.tableCell, styles.cellLastName]}>
        <Text style={styles.cellText} numberOfLines={1}>
          {item.apellido}
        </Text>
      </View>
      <View style={[styles.tableCell, styles.cellEmail]}>
        <Text style={styles.cellText} numberOfLines={1}>
          {item.email || 'N/A'}
        </Text>
      </View>
      <View style={[styles.tableCell, styles.cellPassword]}>
        <View style={styles.passwordCell}>
          <Text 
            style={styles.cellText}
            numberOfLines={1}
          >
            {passwordVisible[item.key] ? item.password : '••••••••'}
          </Text>
          <TouchableOpacity
            onPress={() => togglePasswordVisibility(item.key)}
            style={styles.eyeButton}
          >
            <Icon 
              name={passwordVisible[item.key] ? 'visibility' : 'visibility-off'} 
              size={16} 
              color={palette.primary} 
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.tableCell, styles.cellRole]}>
        <Text style={[styles.cellText, { color: item.rol === 'admin' ? palette.primary : '#666' }]}>
          {item.rol === 'admin' ? 'Admin' : 'Usuario'}
        </Text>
      </View>
      <View style={[styles.tableCell, styles.cellActions]}>
        <TouchableOpacity
          onPress={() => handleDeleteEmployee(item)}
          style={styles.deleteButton}
        >
          <Icon name="delete" size={18} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: palette.bg }]}>
      <Header title="Gestión de Empleados" subtitle="Administración" />
      
      {/* Recuadro de Bienvenida */}
      <View style={[styles.welcomeCard, { backgroundColor: '#fff', shadowColor: palette.primary }]}>
        <View style={styles.welcomeCardContent}>
          <Image 
            source={require('../assets/Induspack-logo.png')} 
            style={styles.welcomeCardLogo} 
            resizeMode="contain" 
          />
          <View style={styles.welcomeCardText}>
            <Text style={[styles.welcomeTitle, { color: palette.primary }]}>Gestión de Empleados</Text>
            <Text style={styles.welcomeSubtitle}>Total: {filteredEmployees.length} usuario(s)</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={palette.primary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: palette.text }]}
          placeholder="Buscar por nombre, apellido o correo..."
          placeholderTextColor="#bbb"
          value={filterText}
          onChangeText={setFilterText}
        />
        {filterText.length > 0 && (
          <TouchableOpacity onPress={() => setFilterText('')}>
            <Icon name="close" size={20} color={palette.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Table Header */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableScrollView}>
        <View style={[styles.tableHeader, { backgroundColor: palette.primary }]}>
          <View style={[styles.tableCell, styles.cellName]}>
            <Text style={styles.headerCellText}>Nombre</Text>
          </View>
          <View style={[styles.tableCell, styles.cellLastName]}>
            <Text style={styles.headerCellText}>Apellido</Text>
          </View>
          <View style={[styles.tableCell, styles.cellEmail]}>
            <Text style={styles.headerCellText}>Correo</Text>
          </View>
          <View style={[styles.tableCell, styles.cellPassword]}>
            <Text style={styles.headerCellText}>Contraseña</Text>
          </View>
          <View style={[styles.tableCell, styles.cellRole]}>
            <Text style={styles.headerCellText}>Rol</Text>
          </View>
          <View style={[styles.tableCell, styles.cellActions]}>
            <Text style={styles.headerCellText}>Acciones</Text>
          </View>
        </View>
      </ScrollView>

      {/* Table Rows */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Icon name="hourglass-empty" size={48} color={palette.primary} />
          <Text style={styles.loadingText}>Cargando empleados...</Text>
        </View>
      ) : filteredEmployees.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="people-outline" size={48} color={palette.primary} />
          <Text style={styles.emptyText}>
            {filterText ? 'No se encontraron empleados' : 'No hay empleados registrados'}
          </Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <FlatList
            data={filteredEmployees}
            renderItem={renderEmployeeRow}
            keyExtractor={item => item.key}
            contentContainerStyle={styles.tableContent}
            scrollEnabled={false}
          />
        </ScrollView>
      )}

      {/* Delete Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.deleteModalContent, { backgroundColor: palette.bg }]}>
            <View style={styles.deleteModalHeader}>
              <Icon name="warning" size={32} color="#e74c3c" />
              <Text style={styles.deleteModalTitle}>Confirmar eliminación</Text>
            </View>

            <Text style={styles.deleteModalText}>
              ¿Estás seguro de que deseas eliminar a {selectedEmployee?.nombre} {selectedEmployee?.apellido}?
            </Text>

            <Text style={styles.deleteModalWarning}>
              ⚠️ Esta acción no se puede deshacer
            </Text>

            <View style={styles.deleteModalButtonsContainer}>
              <TouchableOpacity
                style={[styles.deleteModalButton, { backgroundColor: '#e9ecef' }]}
                onPress={() => setDeleteModalVisible(false)}
                disabled={isDeleting}
              >
                <Text style={[styles.deleteModalButtonText, { color: '#333' }]}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteModalButton, { backgroundColor: '#e74c3c', opacity: isDeleting ? 0.6 : 1 }]}
                onPress={confirmDeleteEmployee}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={[styles.deleteModalButtonText, { color: '#fff' }]}>Eliminar</Text>
                )}
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
    paddingBottom: 40
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
  },
  welcomeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 40
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13
  },
  searchContainer: {
    marginHorizontal: 20,
    marginVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14
  },
  tableScrollView: {
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginTop: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.84,
    minWidth: width > 600 ? 'auto' : width * 0.95
  },
  headerCellText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center'
  },
  tableContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    minWidth: width > 600 ? 'auto' : width * 0.95
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    marginHorizontal: 10,
    paddingVertical: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.1,
    shadowRadius: 0.5,
    marginBottom: 8,
    borderRadius: 6,
    overflow: 'hidden'
  },
  tableCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    minWidth: 80
  },
  cellName: {
    flex: 1.2,
    alignItems: 'flex-start',
    paddingLeft: 10,
    minWidth: 100
  },
  cellLastName: {
    flex: 1.2,
    alignItems: 'flex-start',
    minWidth: 100
  },
  cellEmail: {
    flex: 1.5,
    alignItems: 'flex-start',
    minWidth: 120
  },
  cellPassword: {
    flex: 1.5,
    alignItems: 'flex-start',
    minWidth: 120
  },
  cellRole: {
    flex: 0.8,
    alignItems: 'center',
    minWidth: 80
  },
  cellActions: {
    flex: 0.8,
    alignItems: 'center',
    minWidth: 80
  },
  cellText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500'
  },
  passwordCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  eyeButton: {
    padding: 4,
    marginLeft: 4
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#ffe9e9'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  deleteModalContent: {
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: 16
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
    textAlign: 'center'
  },
  deleteModalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20
  },
  deleteModalWarning: {
    fontSize: 12,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600'
  },
  deleteModalButtonsContainer: {
    flexDirection: 'row',
    gap: 10
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  deleteModalButtonText: {
    fontSize: 14,
    fontWeight: '600'
  }
});
