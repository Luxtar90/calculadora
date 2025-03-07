import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Definición del tipo para una enzima
type Enzyme = {
  name: string;
  activity: string;
  substrate: string;
  product: string;
  optimalTemp: string;
  optimalPH: string;
  cofactors?: string;
};

// Base de datos de enzimas
const enzymes: Enzyme[] = [
  {
    name: 'Catalasa',
    activity: '40,000,000 moléculas/segundo',
    substrate: 'Peróxido de hidrógeno (H₂O₂)',
    product: 'Agua (H₂O) + Oxígeno (O₂)',
    optimalTemp: '37°C',
    optimalPH: '7.0',
  },
  {
    name: 'Amilasa',
    activity: '10,000 enlaces/minuto',
    substrate: 'Almidón',
    product: 'Maltosa',
    optimalTemp: '37°C',
    optimalPH: '6.7-7.0',
    cofactors: 'Ca²⁺',
  },
  {
    name: 'Lipasa',
    activity: '1,000 enlaces/minuto',
    substrate: 'Triglicéridos',
    product: 'Ácidos grasos + Glicerol',
    optimalTemp: '37°C',
    optimalPH: '7.0',
    cofactors: 'Ca²⁺',
  },
];

const EnzymeLibraryScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEnzyme, setExpandedEnzyme] = useState<string | null>(null);

  // Filtrar enzimas basado en la búsqueda
  const filteredEnzymes = enzymes.filter(enzyme =>
    enzyme.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Biblioteca de Enzimas</Text>
      
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar enzima..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.enzymeList}>
        {filteredEnzymes.map((enzyme, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.enzymeCard,
              expandedEnzyme === enzyme.name && styles.enzymeCardExpanded
            ]}
            onPress={() => setExpandedEnzyme(
              expandedEnzyme === enzyme.name ? null : enzyme.name
            )}
          >
            <View style={styles.enzymeHeader}>
              <Text style={styles.enzymeName}>{enzyme.name}</Text>
              <Icon
                name={expandedEnzyme === enzyme.name ? 'expand-less' : 'expand-more'}
                size={24}
                color="#666"
              />
            </View>

            {expandedEnzyme === enzyme.name && (
              <View style={styles.enzymeDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Actividad:</Text>
                  <Text style={styles.detailValue}>{enzyme.activity}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Sustrato:</Text>
                  <Text style={styles.detailValue}>{enzyme.substrate}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Producto:</Text>
                  <Text style={styles.detailValue}>{enzyme.product}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Temperatura óptima:</Text>
                  <Text style={styles.detailValue}>{enzyme.optimalTemp}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>pH óptimo:</Text>
                  <Text style={styles.detailValue}>{enzyme.optimalPH}</Text>
                </View>
                {enzyme.cofactors && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Cofactores:</Text>
                    <Text style={styles.detailValue}>{enzyme.cofactors}</Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  enzymeList: {
    flex: 1,
  },
  enzymeCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  enzymeCardExpanded: {
    backgroundColor: '#f8f9fa',
  },
  enzymeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  enzymeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  enzymeDetails: {
    marginTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    width: 120,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
});

export default EnzymeLibraryScreen;
