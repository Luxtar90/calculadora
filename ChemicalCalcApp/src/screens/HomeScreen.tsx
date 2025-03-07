import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';

type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  Concentration: undefined;
  Purity: undefined;
  Density: undefined;
  Dilution: undefined;
  EnzymeLibrary: undefined;
  Conversion: undefined;
  Timer: undefined;
  CellCounter: undefined;
};

type NavigationProp = DrawerNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const menuItems = [
    { name: 'Search', icon: 'search', title: 'Buscar Compuesto' },
    { name: 'Concentration', icon: 'science', title: 'Calcular Concentración' },
    { name: 'Purity', icon: 'filter-alt', title: 'Calcular Pureza' },
    { name: 'Density', icon: 'opacity', title: 'Calcular Densidad' },
    { name: 'Dilution', icon: 'water-drop', title: 'Calcular Dilución' },
    { name: 'EnzymeLibrary', icon: 'biotech', title: 'Biblioteca de Enzimas' },
    { name: 'Conversion', icon: 'compare-arrows', title: 'Conversiones' },
    { name: 'Timer', icon: 'timer', title: 'Temporizador' },
    { name: 'CellCounter', icon: 'grid-on', title: 'Contador de Células' },
  ] as const;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calculadora Química</Text>
        <Text style={styles.subtitle}>Selecciona una herramienta</Text>
      </View>
      
      <View style={styles.grid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => navigation.navigate(item.name)}
          >
            <Icon name={item.icon} size={32} color="#4CAF50" />
            <Text style={styles.cardText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
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
    backgroundColor: '#1E1E1E',
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
  cardText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HomeScreen;
