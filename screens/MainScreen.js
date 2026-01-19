import React, { useContext } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Linking, Image, Animated, Dimensions } from 'react-native';
import { Text } from '@gluestack-ui/themed';
import { ThemeContext } from '../context/ThemeContext';
import Header from '../components/ui/Header';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

export default function MainScreen({ navigation }) {
  const { palette } = useContext(ThemeContext);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    fadeAnim.setValue(0.3);
    slideAnim.setValue(20);
    
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleContact = () => {
    navigation.navigate('Contacto');
  };

  const features = [
    { icon: 'check-circle', text: 'Empresa 100% mexicana' },
    { icon: 'history', text: 'Más de 30 años de experiencia' },
    { icon: 'verified', text: 'Certificaciones de calidad' },
    { icon: 'support-agent', text: 'Atención personalizada' }
  ];

  return (
    <ScrollView 
      contentContainerStyle={styles.container} 
      showsVerticalScrollIndicator={false}
    >
      <Header title="Bienvenido a Induspack" subtitle="Soluciones integrales en empaque y embalaje" />

      {/* Hero Section */}
      <Animated.View style={[styles.heroCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.heroHeader}>
          <View style={[styles.logoContainer, { backgroundColor: `${palette.primary}10` }]}>
            <Image 
              source={require('../assets/Induspack-logo.png')} 
              style={styles.logoLarge} 
              resizeMode="contain" 
            />
          </View>
          <Text style={styles.heroTitle}>Induspack México</Text>
          <Text style={styles.heroSubtitle}>
            Líder en soluciones de empaque flexible desde 1990
          </Text>
        </View>
        
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={[styles.featureIconContainer, { backgroundColor: `${palette.primary}15` }]}>
                <Icon name={feature.icon} size={20} color={palette.primary} />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Galería de productos */}
      <Animated.View style={[styles.galleryCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.sectionHeader}>
          <Icon name="collections" size={24} color={palette.primary} />
          <Text style={styles.sectionTitle}>Nuestros productos</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
          <View style={styles.productItem}>
            <View style={styles.imageContainer}>
              <Image source={require('../assets/Induspack-logo.png')} style={[styles.galleryImage]} />
            </View>
            <Text style={styles.productName}>Induspack</Text>
          </View>
          <View style={styles.productItem}>
            <View style={styles.imageContainer}>
              <Image source={require('../assets/Bolsa.jpg')} style={styles.galleryImage} />
            </View>
            <Text style={styles.productName}>Bolsas</Text>
          </View>
          <View style={styles.productItem}>
            <View style={styles.imageContainer}>
              <Image source={require('../assets/cintas.jpg')} style={styles.galleryImage} />
            </View>
            <Text style={styles.productName}>Cintas con o sin impresión</Text>
          </View>
          <View style={styles.productItem}>
            <View style={styles.imageContainer}>
              <Image source={require('../assets/esquineros.jpg')} style={styles.galleryImage} />
            </View>
            <Text style={styles.productName}>Esquineros</Text>
          </View>
          <View style={styles.productItem}>
            <View style={styles.imageContainer}>
              <Image source={require('../assets/foam.jpg')} style={styles.galleryImage} />
            </View>
            <Text style={styles.productName}>Foam ESD</Text>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Sección Quiénes somos */}
      <Animated.View style={[styles.infoCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconContainer, { backgroundColor: `${palette.primary}15` }]}>
            <Icon name="business" size={24} color={palette.primary} />
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>¿Quiénes somos?</Text>
            <Text style={styles.cardSubtitle}>Nuestra historia y valores</Text>
          </View>
        </View>
        <Text style={styles.cardText}>
          Somos una empresa 100% mexicana dedicada a la fabricación y distribución de productos para empaque, embalaje y envasado. Desde 1990 brindamos asesoría personalizada y empaques especializados.
        </Text>
      </Animated.View>

      {/* Misión y Visión */}
      <View style={styles.missionVisionContainer}>
        <Animated.View style={[styles.missionCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconContainer, { backgroundColor: '#e8f5e8' }]}>
              <Icon name="target" size={24} color="#27ae60" />
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>Misión</Text>
              <Text style={styles.cardSubtitle}>Nuestro propósito</Text>
            </View>
          </View>
          <Text style={styles.cardText}>
            Proveer experiencias individuales a través de atención personalizada, impulsando el potencial de nuestros colaboradores.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.visionCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconContainer, { backgroundColor: '#e8f4fd' }]}>
              <Icon name="visibility" size={24} color="#2980b9" />
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>Visión</Text>
              <Text style={styles.cardSubtitle}>Nuestro futuro</Text>
            </View>
          </View>
          <Text style={styles.cardText}>
            Un mundo donde nuestros empaques proporcionen el mayor beneficio minimizando el impacto ambiental.
          </Text>
        </Animated.View>
      </View>

      {/* Certificaciones */}
      <Animated.View style={[styles.certCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconContainer, { backgroundColor: '#fff4e5' }]}>
            <Icon name="verified" size={24} color="#f39c12" />
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>Certificaciones y calidad</Text>
            <Text style={styles.cardSubtitle}>Estándares internacionales</Text>
          </View>
        </View>
        <Text style={styles.cardText}>
          Nuestros productos cumplen con estándares internacionales y código SQF para la industria alimenticia. Seguimos Buenas Prácticas de Manufactura y programas de calidad.
        </Text>
        <View style={styles.certBadges}>
          <View style={[styles.certBadge, { backgroundColor: '#e8f5e8' }]}>
            <MaterialCommunityIcons name="certificate" size={20} color="#27ae60" />
            <Text style={[styles.certBadgeText, { color: '#27ae60' }]}>SQF</Text>
          </View>
          <View style={[styles.certBadge, { backgroundColor: '#e8f4fd' }]}>
            <MaterialCommunityIcons name="clipboard-check" size={20} color="#2980b9" />
            <Text style={[styles.certBadgeText, { color: '#2980b9' }]}>BPM</Text>
          </View>
          <View style={[styles.certBadge, { backgroundColor: '#fff4e5' }]}>
            <MaterialCommunityIcons name="shield-check" size={20} color="#f39c12" />
            <Text style={[styles.certBadgeText, { color: '#f39c12' }]}>ISO</Text>
          </View>
        </View>
      </Animated.View>

      {/* Call to Action */}
      <Animated.View style={[styles.ctaSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={[styles.ctaCard, { backgroundColor: `${palette.primary}10` }]}>
          <View style={styles.ctaIconContainer}>
            <Icon name="contact-support" size={40} color={palette.primary} />
          </View>
          <Text style={styles.ctaTitle}>¿Necesitas una cotización?</Text>
          <Text style={styles.ctaSubtitle}>Nuestro equipo está listo para ayudarte</Text>
          
          <TouchableOpacity 
            style={[styles.contactButton, { backgroundColor: palette.primary }]} 
            onPress={handleContact}
          >
            <Icon name="chat" size={22} color="#fff" />
            <Text style={styles.contactText}>Contacta con nosotros</Text>
            <Icon name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.contactSubtext}>Respuesta en menos de 24 horas</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    paddingBottom: 40,
    backgroundColor: '#f8f9fa'
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  heroHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    width: width * 0.8,
    alignItems: 'center',
  },
  logoLarge: {
    width: width * 0.7,
    height: width * 0.25,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },
  featuresContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 15,
    color: '#444',
    flex: 1,
    fontWeight: '500',
  },

  // Gallery Section
  galleryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: 12,
  },
  gallery: {
    marginTop: 8,
  },
  productItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 8,
  },
  galleryImage: {
    width: 200,
    height: 140,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    maxWidth: 200,
    lineHeight: 18,
  },
  logoImage: {
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },

  // Cards Generales
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  cardText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
    fontWeight: '400',
  },

  // Misión y Visión
  missionVisionContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  missionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  visionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },

  // Certificaciones
  certCard: {
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
  certBadges: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    justifyContent: 'center',
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  certBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Call to Action
  ctaSection: {
    alignItems: 'center',
  },
  ctaCard: {
    width: '100%',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  ctaIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '400',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    minWidth: width * 0.7,
  },
  contactText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  contactSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '400',
  },
});