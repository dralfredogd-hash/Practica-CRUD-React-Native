import React, { useContext, useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, TextInput, Alert, Animated, Dimensions } from 'react-native';
import { Text } from '@gluestack-ui/themed';
import { ThemeContext } from '../context/ThemeContext';
import Header from '../components/ui/Header';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

export default function ContactScreen() {
  const { palette } = useContext(ThemeContext);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    fadeAnim.setValue(0.3);
    slideAnim.setValue(20);
    
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, [fadeAnim, slideAnim]);

  const phone = '(449) 162 0949';
  const phone2 = '(449) 162 0950';
  const email = 'contacto@induspack.mx';
  const address = 'Av. Aguascalientes Pte. 401, Col. España, Aguascalientes, Ags.';
  const hours = 'Lun - Vie: 9:00 - 18:00';

  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [industry, setIndustry] = useState('');
  const [products, setProducts] = useState('');
  const [accepted, setAccepted] = useState(false);

  const openPhone = () => {
    const telFormat = phone.replace(/\D/g, '');
    Linking.openURL(`tel:+52${telFormat}`).catch(() => {});
  };

  const openPhone2 = () => {
    const telFormat = phone2.replace(/\D/g, '');
    Linking.openURL(`tel:+52${telFormat}`).catch(() => {});
  };
  const openMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url).catch(() => {});
  };

  const submit = () => {
    if (!name.trim() || !contactEmail.trim() || !products.trim()) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos obligatorios.');
      return;
    }
    if (!accepted) {
      Alert.alert('Términos y condiciones', 'Debes aceptar los términos y condiciones.');
      return;
    }
    const subject = encodeURIComponent('Solicitud de contacto - Induspack');
    const body = encodeURIComponent(
      `Nombre: ${name}\nCorreo: ${contactEmail}\nIndustria: ${industry}\nProductos requeridos: ${products}`
    );
    const mailto = `mailto:${email}?subject=${subject}&body=${body}`;
    Linking.openURL(mailto).catch(() => {
      Alert.alert('Error', 'No se pudo abrir el cliente de correo.');
    });
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container} 
      showsVerticalScrollIndicator={false}
    >
      <Header title="Contacto" subtitle="Conecta con nosotros" />

      {/* Hero Section */}
      <Animated.View style={[styles.heroCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={[styles.heroIconContainer, { backgroundColor: `${palette.primary}15` }]}>
          <Icon name="contact-support" size={40} color={palette.primary} />
        </View>
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroTitle}>Induspack México</Text>
          <Text style={styles.heroSubtitle}>Soluciones en empaque desde 1990</Text>
        </View>
        <Text style={styles.heroDescription}>
          Estamos aquí para ayudarte. Contáctanos para cotizaciones, soporte técnico o cualquier consulta.
        </Text>
      </Animated.View>

      {/* Información de contacto */}
      <Animated.View style={[styles.contactCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.sectionHeader}>
          <Icon name="contact-page" size={24} color={palette.primary} />
          <Text style={styles.sectionTitle}>Información de contacto</Text>
        </View>
        
        <TouchableOpacity style={styles.contactItem} onPress={openMaps}>
          <View style={[styles.contactIconContainer, { backgroundColor: '#e8f5e8' }]}>
            <Icon name="place" size={22} color="#27ae60" />
          </View>
          <View style={styles.contactTextContainer}>
            <Text style={styles.contactLabel}>Dirección</Text>
            <Text style={styles.contactValue}>{address}</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={openPhone}>
          <View style={[styles.contactIconContainer, { backgroundColor: '#e8f4fd' }]}>
            <Icon name="phone" size={22} color="#2980b9" />
          </View>
          <View style={styles.contactTextContainer}>
            <Text style={styles.contactLabel}>Teléfono</Text>
            <Text style={[styles.contactValue, styles.linkText]}>{phone}</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#666" />
        </TouchableOpacity>

         <TouchableOpacity style={styles.contactItem} onPress={openPhone2}>
          <View style={[styles.contactIconContainer, { backgroundColor: '#e8f4fd' }]}>
            <Icon name="phone" size={22} color="#2980b9" />
          </View>
          <View style={styles.contactTextContainer}>
            <Text style={styles.contactLabel}>Teléfono "Opcion 2"</Text>
            <Text style={[styles.contactValue, styles.linkText]}>{phone2}</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={() => {
          const mailto = `mailto:${email}`;
          Linking.openURL(mailto).catch(() => {
            Alert.alert('Error', 'No se pudo abrir el cliente de correo.');
          });
        }}>
          <View style={[styles.contactIconContainer, { backgroundColor: '#fff4e5' }]}>
            <Icon name="email" size={22} color="#f39c12" />
          </View>
          <View style={styles.contactTextContainer}>
            <Text style={styles.contactLabel}>Correo electrónico</Text>
            <Text style={[styles.contactValue, styles.linkText]}>{email}</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#666" />
        </TouchableOpacity>

        <View style={styles.contactItem}>
          <View style={[styles.contactIconContainer, { backgroundColor: '#f5e8ff' }]}>
            <Icon name="access-time" size={22} color="#8e44ad" />
          </View>
          <View style={styles.contactTextContainer}>
            <Text style={styles.contactLabel}>Horarios de atención</Text>
            <Text style={styles.contactValue}>{hours}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Formulario de contacto */}
      <Animated.View style={[styles.formCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.sectionHeader}>
          <Icon name="message" size={24} color={palette.primary} />
          <View style={styles.formTitleContainer}>
            <Text style={styles.sectionTitle}>Envíanos un mensaje</Text>
            <Text style={styles.sectionSubtitle}>Nos pondremos en contacto contigo pronto</Text>
          </View>
        </View>
        
        <View style={styles.formFields}>
          {/* Nombre */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Nombre completo *</Text>
            <View style={styles.inputContainer}>
              <Icon name="person" size={22} color={palette.primary} style={styles.inputIcon} />
              <TextInput 
                placeholder="Ingresa tu nombre" 
                style={styles.input} 
                value={name} 
                onChangeText={setName}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Correo electrónico *</Text>
            <View style={styles.inputContainer}>
              <Icon name="alternate-email" size={22} color={palette.primary} style={styles.inputIcon} />
              <TextInput 
                placeholder="correo@ejemplo.com" 
                style={styles.input} 
                value={contactEmail} 
                onChangeText={setContactEmail} 
                keyboardType="email-address"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Industria */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Industria</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="factory" size={22} color={palette.primary} style={styles.inputIcon} />
              <TextInput 
                placeholder="Ej: Alimenticia, Farmacéutica, etc." 
                style={styles.input} 
                value={industry} 
                onChangeText={setIndustry}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Productos */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>¿Qué productos necesitas? *</Text>
            <View style={styles.textAreaContainer}>
              <TextInput 
                placeholder="Describe los productos que necesitas..." 
                style={[styles.textArea]} 
                value={products} 
                onChangeText={setProducts} 
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#999"
              />
              <View style={styles.textAreaIcon}>
                <MaterialCommunityIcons name="package-variant" size={22} color={palette.primary} />
              </View>
            </View>
          </View>

          {/* Términos y condiciones */}
          <TouchableOpacity 
            style={styles.checkboxContainer} 
            onPress={() => setAccepted(!accepted)}
          >
            <View style={[styles.checkbox, accepted && { backgroundColor: palette.primary, borderColor: palette.primary }]}>
              {accepted && <Icon name="check" size={16} color="#fff" />}
            </View>
            <Text style={styles.checkboxText}>
              Acepto los <Text style={[styles.termsLink, { color: palette.primary }]}>términos y condiciones</Text> y la <Text style={[styles.termsLink, { color: palette.primary }]}>política de privacidad</Text>
            </Text>
          </TouchableOpacity>

          {/* Botón de envío */}
          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: palette.primary }]} 
            onPress={submit}
          >
            <Icon name="send" size={22} color="#fff" />
            <Text style={styles.submitText}>Enviar mensaje</Text>
          </TouchableOpacity>

          {/* Información adicional */}
          <View style={styles.infoBox}>
            <Icon name="info" size={18} color="#666" />
            <Text style={styles.infoText}>
              Te responderemos en menos de 24 horas hábiles. Los campos marcados con * son obligatorios.
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Sección de emergencia */}
      <Animated.View style={[styles.emergencyCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={[styles.emergencyIconContainer, { backgroundColor: `${palette.primary}15` }]}>
          <Icon name="priority-high" size={28} color={palette.primary} />
        </View>
        <Text style={styles.emergencyTitle}>¿Necesitas ayuda urgente?</Text>
        <Text style={styles.emergencyText}>
          Para soporte técnico inmediato o emergencias, llama directamente a nuestro número.
        </Text>
        <TouchableOpacity style={[styles.emergencyButton, { backgroundColor: palette.primary }]} onPress={openPhone}>
          <Icon name="phone-in-talk" size={20} color="#fff" />
          <Text style={styles.emergencyButtonText}>Llamar ahora</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    paddingBottom: 60,
    backgroundColor: '#f8f9fa'
  },
  
  // Hero Card
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroTextContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '400',
  },
  heroDescription: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },

  // Contact Card
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  linkText: {
    color: '#2980b9',
    fontWeight: '500',
  },

  // Form Card
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  formTitleContainer: {
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    marginTop: 4,
    fontWeight: '400',
  },
  formFields: {
    marginTop: 8,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputIcon: {
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#333',
    paddingLeft: 0,
  },
  textAreaContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    position: 'relative',
  },
  textArea: {
    minHeight: 120,
    padding: 16,
    fontSize: 16,
    color: '#333',
    paddingTop: 16,
    paddingBottom: 16,
  },
  textAreaIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#dee2e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    fontWeight: '400',
  },
  termsLink: {
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    lineHeight: 20,
    fontWeight: '400',
  },

  // Emergency Card
  emergencyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#ffeaea',
  },
  emergencyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    fontWeight: '400',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});