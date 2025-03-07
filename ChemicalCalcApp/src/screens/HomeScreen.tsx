import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme, lightTheme, darkTheme } from '../context/ThemeContext';

type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  Solutions: undefined;
  EnzymeLibrary: undefined;
  Conversion: undefined;
  Timer: undefined;
  CellCounter: undefined;
  Settings: undefined;
};

type NavigationProp = DrawerNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;

  const menuItems = [
    { 
      name: 'Search', 
      icon: 'calculate', 
      title: 'Calculadora de Masa Molar',
      description: 'Calcula la masa molar de compuestos químicos'
    },
    { 
      name: 'Solutions', 
      icon: 'science', 
      title: 'Cálculo de Soluciones',
      description: 'Concentraciones, diluciones y pureza'
    },
    { 
      name: 'EnzymeLibrary', 
      icon: 'biotech', 
      title: 'Biblioteca de Enzimas',
      description: 'Información sobre enzimas comunes'
    },
    { 
      name: 'Conversion', 
      icon: 'compare-arrows', 
      title: 'Conversiones',
      description: 'Conversión entre unidades'
    },
    { 
      name: 'Timer', 
      icon: 'timer', 
      title: 'Temporizador',
      description: 'Control de tiempo para experimentos'
    },
    { 
      name: 'CellCounter', 
      icon: 'grid-on', 
      title: 'Contador de Células',
      description: 'Conteo de células en laboratorio'
    },
    { 
      name: 'Settings', 
      icon: 'settings', 
      title: 'Configuración',
      description: 'Ajustes de la aplicación'
    },
  ] as const;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Calculadora Química</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Herramientas para el laboratorio
        </Text>
      </View>
      
      <View style={styles.grid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate(item.name)}
          >
            <Icon name={item.icon} size={32} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              {item.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardTitle: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardDescription: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});

export default HomeScreen;
