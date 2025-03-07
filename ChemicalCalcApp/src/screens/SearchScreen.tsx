import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

// Define navegación
type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  Concentration: { molarMass: number; equivalents: number; equivalentWeight: number; compoundType: string };
};

type NavigationProp = DrawerNavigationProp<RootStackParamList>;

// 🔹 Tabla periódica con masas molares
const periodicTable: { [key: string]: number } = {
  H: 1.008, He: 4.003, Li: 6.941, Be: 9.012, B: 10.811, C: 12.011, N: 14.007, O: 16.000,
  F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.086, P: 30.974, S: 32.065,
  Cl: 35.453, Ar: 39.948, K: 39.098, Ca: 40.078, Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996,
  Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.380, Ga: 69.723, Ge: 72.640,
  As: 74.922, Se: 78.960, Br: 79.904, Kr: 83.798, Rb: 85.468, Sr: 87.620, Y: 88.906, Zr: 91.224,
  Nb: 92.906, Mo: 95.960, Tc: 98.000, Ru: 101.070, Rh: 102.906, Pd: 106.420, Ag: 107.868, Cd: 112.411,
  In: 114.818, Sn: 118.710, Sb: 121.760, Te: 127.600, I: 126.904, Xe: 131.293, Cs: 132.905, Ba: 137.327,
  La: 138.905, Ce: 140.116, Pr: 140.908, Nd: 144.242, Pm: 145.000, Sm: 150.360, Eu: 151.964, Gd: 157.250,
  Tb: 158.925, Dy: 162.500, Ho: 164.930, Er: 167.259, Tm: 168.934, Yb: 173.054, Lu: 174.967, Hf: 178.490,
  Ta: 180.948, W: 183.840, Re: 186.207, Os: 190.230, Ir: 192.217, Pt: 195.084, Au: 196.967, Hg: 200.590,
  Tl: 204.383, Pb: 207.200, Bi: 208.980, Po: 209.000, At: 210.000, Rn: 222.000, Fr: 223.000, Ra: 226.000,
  Ac: 227.000, Th: 232.038, Pa: 231.036, U: 238.029, Np: 237.000, Pu: 244.000
};

// 🔹 Base de datos de densidades de compuestos comunes (g/mL a 20°C)
const densityDatabase: { [key: string]: number } = {
  'H2O': 1.000,
  'H2SO4': 1.840,
  'HCl': 1.190,
  'HNO3': 1.513,
  'NaOH': 2.130,
  'KOH': 2.120,
  'CH3OH': 0.792,
  'C2H5OH': 0.789,
  'CH3COOH': 1.049,
  'NH3': 0.769,
  'CCl4': 1.594,
  'CHCl3': 1.489,
  'C6H6': 0.879,
  'C6H12': 0.779,
  'C7H8': 0.867,
  'NaCl': 2.165,
  'KCl': 1.984,
  'CaCl2': 2.150,
  'FeCl3': 2.804,
  'CuSO4': 3.603,
  'ZnSO4': 3.540,
  'Al2(SO4)3': 2.672,
  'Na2CO3': 2.540,
  'K2CO3': 2.430,
  'CaCO3': 2.711,
  'Fe2O3': 5.242,
  'CuO': 6.315,
  'ZnO': 5.606,
  'SiO2': 2.648,
  'TiO2': 4.230
};

// 🔹 Tipos de compuestos y sus reglas para calcular equivalentes
type CompoundType = 'acid' | 'base' | 'salt' | 'oxidation' | 'biomass';

interface CompoundInfo {
  type: CompoundType;
  valence?: number;    // Para metales y no metales
  hydrogens?: number;  // Para ácidos
  oxidation?: number;  // Para reacciones redox
  isBiomass?: boolean; // Para fórmulas empíricas de biomasa
}

// 🔹 Base de datos de compuestos comunes y sus características
const compoundDatabase: { [key: string]: CompoundInfo } = {
  // Ácidos comunes
  'H2SO4': { type: 'acid', hydrogens: 2 },
  'HCl': { type: 'acid', hydrogens: 1 },
  'H3PO4': { type: 'acid', hydrogens: 3 },
  'HNO3': { type: 'acid', hydrogens: 1 },
  'H2CO3': { type: 'acid', hydrogens: 2 },
  'CH3COOH': { type: 'acid', hydrogens: 1 },
  
  // Bases comunes
  'NaOH': { type: 'base', valence: 1 },
  'KOH': { type: 'base', valence: 1 },
  'Ca(OH)2': { type: 'base', valence: 2 },
  'Al(OH)3': { type: 'base', valence: 3 },
  'NH4OH': { type: 'base', valence: 1 },
  
  // Sales comunes
  'FeCl3': { type: 'salt', valence: 3 },
  'CuSO4': { type: 'salt', valence: 2 },
  'Al2(SO4)3': { type: 'salt', valence: 3 },
  'NaCl': { type: 'salt', valence: 1 },
  'KCl': { type: 'salt', valence: 1 },
  
  // Compuestos especiales
  'H2O': { type: 'acid', hydrogens: 2 },  // Agua como compuesto especial
  'O2': { type: 'oxidation', oxidation: 2 },
  'H2': { type: 'oxidation', oxidation: 2 },
  
  // Metales comunes
  'Al': { type: 'oxidation', valence: 3 },
  'Fe': { type: 'oxidation', valence: 3 },
  'Cu': { type: 'oxidation', valence: 2 },
  'Zn': { type: 'oxidation', valence: 2 }
};

// 🔹 Función para analizar la fórmula química y obtener información
const analyzeCompound = (compound: string): CompoundInfo | null => {
  // Verificar si es una fórmula de biomasa
  const biomassRegex = /^CH([\d.]+)O([\d.]+)N([\d.]+)$/;
  if (biomassRegex.test(compound)) {
    return {
      type: 'biomass',
      isBiomass: true
    };
  }

  // Si está en la base de datos, usar esa información
  if (compoundDatabase[compound]) {
    return compoundDatabase[compound];
  }

  // Analizar la fórmula química
  let hydrogens = 0;
  let oxygens = 0;
  let metals = 0;
  let nonMetals = 0;
  let metalValence = 0;
  let nonMetalValence = 0;

  const regex = /([A-Z][a-z]?)(\d*\.?\d*)/g;
  let match;

  // Valencias típicas de elementos
  const valences: { [key: string]: number } = {
    'H': 1, 'Na': 1, 'K': 1, 'Li': 1, 'Ag': 1,
    'Mg': 2, 'Ca': 2, 'Ba': 2, 'Zn': 2, 'Cu': 2,
    'Al': 3, 'Fe': 3, 'Cr': 3,
    'C': 4, 'Si': 4,
    'N': 3, 'P': 3,
    'O': 2, 'S': 2
  };

  while ((match = regex.exec(compound)) !== null) {
    const element = match[1];
    const count = match[2] ? parseFloat(match[2]) : 1;

    if (element === 'H') {
      hydrogens += count;
    } else if (element === 'O') {
      oxygens += count;
      nonMetals += count;
      nonMetalValence = Math.max(nonMetalValence, valences[element] || 2);
    } else if (['Na', 'K', 'Ca', 'Mg', 'Al', 'Fe', 'Cu', 'Zn', 'Ag', 'Ba', 'Li'].includes(element)) {
      metals += count;
      metalValence = Math.max(metalValence, valences[element] || 1);
    } else {
      nonMetals += count;
      nonMetalValence = Math.max(nonMetalValence, valences[element] || 1);
    }
  }

  // Reglas para determinar el tipo y factor equivalente
  if (hydrogens > 0) {
    if (oxygens > 0) {
      // Oxácidos (H2SO4, H3PO4, etc.)
      return { type: 'acid', hydrogens };
    } else {
      // Hidrácidos (HCl, HBr, etc.)
      return { type: 'acid', hydrogens };
    }
  } else if (metals > 0) {
    if (oxygens > 0) {
      if (hydrogens > 0) {
        // Hidróxidos (NaOH, Ca(OH)2, etc.)
        return { type: 'base', valence: metalValence };
      } else {
        // Óxidos metálicos o sales (Na2O, CuSO4, etc.)
        return { type: 'salt', valence: metalValence };
      }
    } else {
      // Metales puros (Fe, Cu, etc.)
      return { type: 'oxidation', valence: metalValence };
    }
  } else if (oxygens > 0) {
    // Óxidos no metálicos (CO2, SO2, etc.)
    return { type: 'oxidation', oxidation: oxygens };
  } else if (nonMetals > 0) {
    // No metales puros (Cl2, N2, etc.)
    return { type: 'oxidation', valence: nonMetalValence };
  }

  // Si no se puede determinar, usar el valor más alto encontrado
  const maxValence = Math.max(metalValence, nonMetalValence, hydrogens);
  return { type: 'oxidation', valence: maxValence || 1 };
};

// 🔹 Función para validar la fórmula química
const validateFormula = (formula: string): boolean => {
  // Verificar si es una fórmula de biomasa
  const biomassRegex = /^CH[\d.]+O[\d.]+N[\d.]+$/;
  if (biomassRegex.test(formula)) {
    return true;
  }

  // Verificar caracteres válidos para fórmulas químicas normales
  if (!/^[A-Za-z0-9().]+$/.test(formula)) {
    return false;
  }

  // Verificar paréntesis balanceados
  let parenthesesCount = 0;
  for (const char of formula) {
    if (char === '(') parenthesesCount++;
    if (char === ')') parenthesesCount--;
    if (parenthesesCount < 0) return false;
  }
  if (parenthesesCount !== 0) return false;

  // Verificar formato de elementos
  const elementRegex = /([A-Z][a-z]?)(\d*\.?\d*)/g;
  let match;
  let hasValidElements = false;

  while ((match = elementRegex.exec(formula)) !== null) {
    const element = match[1];
    if (!periodicTable[element]) {
      return false;
    }
    hasValidElements = true;
  }

  return hasValidElements;
};

// 🔹 Función para calcular la masa molar de un compuesto
const parseCompound = (compound: string): number | null => {
  try {
    // Verificar si es una fórmula de biomasa
    const biomassRegex = /^CH([\d.]+)O([\d.]+)N([\d.]+)$/;
    const bioMatch = compound.match(biomassRegex);
    
    if (bioMatch) {
      // Calcular masa molar para fórmula de biomasa
      const [, h, o, n] = bioMatch;
      const molarMass = 
        periodicTable['C'] * 1 +
        periodicTable['H'] * parseFloat(h) +
        periodicTable['O'] * parseFloat(o) +
        periodicTable['N'] * parseFloat(n);
      return Number.isFinite(molarMass) ? molarMass : null;
    }

    // Para fórmulas químicas normales
    let expandedCompound = compound;
    const parenthesesRegex = /\(([^()]+)\)(\d*\.?\d*)/g;
    
    while (parenthesesRegex.test(expandedCompound)) {
      expandedCompound = expandedCompound.replace(parenthesesRegex, (match, group, multiplier) => {
        const mult = multiplier ? parseFloat(multiplier) : 1;
        const elements = group.match(/[A-Z][a-z]?\d*\.?\d*/g) || [];
        return elements.map((el: string) => {
          const [, element, count = '1'] = el.match(/([A-Z][a-z]?)(\d*\.?\d*)/) || [];
          return `${element}${parseFloat(count) * mult}`;
        }).join('');
      });
    }

    const regex = /([A-Z][a-z]?)(\d*\.?\d*)/g;
    let match;
    let molarMass = 0;

    while ((match = regex.exec(expandedCompound)) !== null) {
      const element = match[1];
      const count = match[2] ? parseFloat(match[2]) : 1;

      if (!periodicTable[element]) {
        throw new Error(`Elemento desconocido: ${element}`);
      }
      molarMass += periodicTable[element] * count;
    }

    return Number.isFinite(molarMass) ? molarMass : null;
  } catch (error) {
    console.error('Error al calcular masa molar:', error);
    return null;
  }
};

// 🔹 Función para calcular el peso equivalente
const calculateEquivalentWeight = (compound: string, molarMass: number): number | null => {
  const compoundInfo = analyzeCompound(compound);
  if (!compoundInfo) return null;

  switch (compoundInfo.type) {
    case 'acid':
      return compoundInfo.hydrogens ? molarMass / compoundInfo.hydrogens : molarMass;
    case 'base':
      return compoundInfo.valence ? molarMass / compoundInfo.valence : molarMass;
    case 'salt':
      return compoundInfo.valence ? molarMass / compoundInfo.valence : molarMass;
    case 'oxidation':
      return compoundInfo.oxidation ? molarMass / compoundInfo.oxidation : 
             compoundInfo.valence ? molarMass / compoundInfo.valence : molarMass;
    case 'biomass':
      return molarMass;
    default:
      return molarMass;
  }
};

// 🔹 Función para calcular el volumen molecular aproximado en cm³/mol
const calculateMolecularVolume = (compound: string): number => {
  // Volúmenes atómicos aproximados en cm³/mol
  const atomicVolumes: { [key: string]: number } = {
    'H': 1.2,
    'C': 14.0,
    'N': 15.6,
    'O': 14.0,
    'F': 13.8,
    'Cl': 22.7,
    'Br': 27.0,
    'I': 32.0,
    'S': 25.2,
    'P': 24.3,
    'Na': 23.7,
    'K': 45.3,
    'Ca': 29.9,
    'Mg': 13.9,
    'Al': 10.0,
    'Si': 12.1,
    'Fe': 7.1,
    'Cu': 7.1,
    'Zn': 9.2,
    'Ag': 10.3,
    'Au': 10.2,
    'Pt': 9.1,
    'Hg': 14.8
  };

  let totalVolume = 0;
  let currentElement = '';
  let currentNumber = '';

  for (let i = 0; i < compound.length; i++) {
    const char = compound[i];
    
    if (char >= 'A' && char <= 'Z') {
      // Procesar el elemento anterior si existe
      if (currentElement) {
        const count = currentNumber ? parseInt(currentNumber) : 1;
        totalVolume += (atomicVolumes[currentElement] || 15.0) * count;
      }
      currentElement = char;
      currentNumber = '';
    } else if (char >= 'a' && char <= 'z') {
      currentElement += char;
    } else if (char >= '0' && char <= '9' || char === '.') {
      currentNumber += char;
    }
  }

  // Procesar el último elemento
  if (currentElement) {
    const count = currentNumber ? parseFloat(currentNumber) : 1;
    totalVolume += (atomicVolumes[currentElement] || 15.0) * count;
  }

  return totalVolume;
};

// 🔹 Función para calcular la densidad aproximada
const calculateApproximateDensity = (compound: string, molarMass: number): number => {
  const molecularVolume = calculateMolecularVolume(compound);
  // Convertir volumen de cm³/mol a mL/mol y calcular densidad en g/mL
  const density = molarMass / molecularVolume;
  return parseFloat(density.toFixed(3));
};

const SearchScreen = () => {
  const [compound, setCompound] = useState('');
  const [molarMass, setMolarMass] = useState<number | null>(null);
  const [equivalentWeight, setEquivalentWeight] = useState<number | null>(null);
  const [equivalents, setEquivalents] = useState<number | null>(null);
  const [compoundType, setCompoundType] = useState<string>('');
  const [density, setDensity] = useState<number | null>(null);
  const [showDensityInput, setShowDensityInput] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation<NavigationProp>();

  // Limpiar estados
  const clearResults = () => {
    setMolarMass(null);
    setEquivalentWeight(null);
    setEquivalents(null);
    setCompoundType('');
    setDensity(null);
    setError('');
  };

  // 📌 Calcular Masa Molar y Peso Equivalente
  const calculateMolarMass = () => {
    clearResults();
    
    if (!compound.trim()) {
      setError('Por favor ingrese una fórmula química');
      return;
    }

    if (!validateFormula(compound)) {
      setError('Fórmula química no válida. Verifique la sintaxis.');
      return;
    }

    const mass = parseCompound(compound);
    if (!mass) {
      setError('No se pudo calcular la masa molar. Verifique la fórmula.');
      return;
    }

    setMolarMass(mass);

    try {
      const compoundInfo = analyzeCompound(compound);
      const eqWeight = calculateEquivalentWeight(compound, mass);
      
      if (!compoundInfo) {
        throw new Error('No se pudo determinar el tipo de compuesto');
      }
      
      setCompoundType(compoundInfo.type);
      
      if (!eqWeight) {
        throw new Error('No se pudo calcular el peso equivalente');
      }
      
      setEquivalentWeight(eqWeight);
      setEquivalents(mass / eqWeight);

      // Primero buscar en la base de datos
      if (densityDatabase[compound]) {
        setDensity(densityDatabase[compound]);
      } else {
        // Si no está en la base de datos, calcular aproximación
        const approximateDensity = calculateApproximateDensity(compound, mass);
        setDensity(approximateDensity);
      }
      
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Error al analizar el compuesto'
      );
    }
  };

  // Navegar a la pantalla de concentración
  const navigateToConcentration = () => {
    if (molarMass && equivalents !== null && equivalentWeight !== null) {
      navigation.navigate('Concentration', { 
        molarMass,
        equivalents,
        equivalentWeight,
        compoundType 
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Calculadora de Masa Molar</Text>
        <TextInput
          style={styles.input}
          value={compound}
          onChangeText={(text) => {
            setCompound(text.trim());
            if (error) setError('');
          }}
          placeholder="Ingrese fórmula química (ej: H2O, CH1.8O0.5N0.2)"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <Text style={styles.hint}>
            Soporta fórmulas químicas normales y modelos de biomasa
          </Text>
        )}

        <TouchableOpacity 
          style={styles.calculateButton}
          onPress={calculateMolarMass}
        >
          <Text style={styles.calculateButtonText}>Calcular</Text>
        </TouchableOpacity>
      </View>

      {molarMass !== null && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Resultados:</Text>
          
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Masa Molar:</Text>
            <Text style={styles.resultValue}>{molarMass.toFixed(3)} g/mol</Text>
          </View>

          <View style={styles.densitySection}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>
                Densidad {densityDatabase[compound] ? '(20°C)' : '(aproximada)'}:
              </Text>
              <Text style={styles.resultValue}>{density?.toFixed(3)} g/mL</Text>
            </View>
            <TouchableOpacity
              style={styles.editDensityButton}
              onPress={() => setDensity(null)}
            >
              <Text style={styles.editDensityText}>Editar densidad</Text>
            </TouchableOpacity>
            {!densityDatabase[compound] && density !== null && (
              <Text style={styles.densityNote}>
                * Densidad calculada usando volúmenes atómicos aproximados
              </Text>
            )}
          </View>

          {equivalentWeight !== null && (
            <>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Peso Equivalente:</Text>
                <Text style={styles.resultValue}>{equivalentWeight.toFixed(3)} g/eq</Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Número de Cargas:</Text>
                <Text style={styles.resultValue}>{equivalents?.toFixed(3)}</Text>
              </View>
              
              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>
                  {compoundType === 'acid' && '⚗️ Ácido'}
                  {compoundType === 'base' && '🧪 Base'}
                  {compoundType === 'salt' && '🧂 Sal'}
                  {compoundType === 'oxidation' && '⚛️ Óxido/Metal'}
                  {compoundType === 'biomass' && '🦠 Biomasa'}
                </Text>
                <Text style={styles.infoText}>
                  {compoundType === 'acid' && 'Número de H+ disponibles\nN = Molaridad × Acidez'}
                  {compoundType === 'base' && 'Número de OH- o cargas del metal\nN = Molaridad × Basicidad'}
                  {compoundType === 'salt' && 'Número de cargas del metal\nN = Molaridad × Cargas'}
                  {compoundType === 'oxidation' && 'Número de cargas o estado de oxidación\nN = Molaridad × Estado de oxidación'}
                  {compoundType === 'biomass' && 'Fórmula empírica de biomasa\nRepresenta la composición elemental promedio'}
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.useButton}
                onPress={navigateToConcentration}
              >
                <Text style={styles.useButtonText}>
                  Usar en Cálculo de Concentración →
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 8
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
    fontStyle: 'italic'
  },
  error: {
    color: '#e74c3c',
    marginBottom: 16,
    textAlign: 'center'
  },
  calculateButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center'
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center'
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  resultLabel: {
    fontSize: 16,
    color: '#666'
  },
  resultValue: {
    fontSize: 16,
    color: '#2980b9',
    fontWeight: 'bold'
  },
  densitySection: {
    marginVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 8,
  },
  densityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  densityInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    width: 120,
    textAlign: 'right',
  },
  editDensityButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editDensityText: {
    color: '#2980b9',
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    marginBottom: 16
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 8,
    textAlign: 'center'
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20
  },
  useButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8
  },
  useButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  densityNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default SearchScreen;
