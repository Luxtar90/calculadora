import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

type VolumeUnit = 'L' | 'mL' | 'µL';

const PurityScreen = () => {
  const [desiredConcentration, setDesiredConcentration] = useState('');
  const [desiredVolume, setDesiredVolume] = useState('');
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('mL');
  const [purity, setPurity] = useState('');
  const [neededMass, setNeededMass] = useState<string | null>(null);
  const [actualMass, setActualMass] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Convertir volumen a mL para cálculos
  const convertToML = (volume: number, unit: VolumeUnit): number => {
    switch (unit) {
      case 'L':
        return volume * 1000;
      case 'mL':
        return volume;
      case 'µL':
        return volume / 1000;
      default:
        return volume;
    }
  };

  const calculateMass = () => {
    setError('');
    setNeededMass(null);
    setActualMass(null);

    // Validar entradas
    const concentration = parseFloat(desiredConcentration);
    const volume = parseFloat(desiredVolume);
    const purityValue = parseFloat(purity);

    if (!concentration || !volume || !purityValue) {
      setError('Por favor complete todos los campos');
      return;
    }

    if (concentration <= 0 || concentration > 100) {
      setError('La concentración debe estar entre 0 y 100%');
      return;
    }

    if (volume <= 0) {
      setError('El volumen debe ser mayor a 0');
      return;
    }

    if (purityValue <= 0 || purityValue > 100) {
      setError('La pureza debe estar entre 0 y 100%');
      return;
    }

    try {
      // Convertir volumen a mL para el cálculo
      const volumeInML = convertToML(volume, volumeUnit);
      
      // Calcular masa teórica necesaria (g) = (concentración deseada * volumen) / 100
      const theoreticalMass = (concentration * volumeInML) / 100;
      
      // Calcular masa real necesaria considerando la pureza
      const actualMassNeeded = theoreticalMass / (purityValue / 100);

      setNeededMass(theoreticalMass.toFixed(3));
      setActualMass(actualMassNeeded.toFixed(3));
    } catch (err) {
      setError('Error en el cálculo');
    }
  };

  const formatVolume = (volume: string, unit: VolumeUnit) => {
    if (!volume) return '';
    return `${volume} ${unit}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Calculadora de Pureza</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Concentración deseada (%)</Text>
          <TextInput
            style={styles.input}
            value={desiredConcentration}
            onChangeText={setDesiredConcentration}
            keyboardType="numeric"
            placeholder="Ej: 2"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Volumen deseado</Text>
          <View style={styles.volumeContainer}>
            <TextInput
              style={styles.volumeInput}
              value={desiredVolume}
              onChangeText={setDesiredVolume}
              keyboardType="numeric"
              placeholder="Ej: 100"
            />
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={volumeUnit}
                onValueChange={(itemValue: VolumeUnit) => setVolumeUnit(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="L" value="L" />
                <Picker.Item label="mL" value="mL" />
                <Picker.Item label="µL" value="µL" />
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pureza del reactivo (%)</Text>
          <TextInput
            style={styles.input}
            value={purity}
            onChangeText={setPurity}
            keyboardType="numeric"
            placeholder="Ej: 90"
          />
        </View>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        <TouchableOpacity 
          style={styles.calculateButton}
          onPress={calculateMass}
        >
          <Text style={styles.calculateButtonText}>Calcular</Text>
        </TouchableOpacity>

        {neededMass && actualMass && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Resultados:</Text>
            
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Masa teórica necesaria:</Text>
              <Text style={styles.resultValue}>{neededMass} g</Text>
            </View>

            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Masa real a pesar:</Text>
              <Text style={styles.resultValue}>{actualMass} g</Text>
            </View>

            <Text style={styles.explanation}>
              Debido a que la pureza es {purity}%, necesitas pesar {actualMass} g 
              para obtener una solución al {desiredConcentration}% en {formatVolume(desiredVolume, volumeUnit)}
            </Text>
          </View>
        )}
      </View>
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
    marginBottom: 20,
    textAlign: 'center'
  },
  inputGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  volumeInput: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginRight: 8
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden'
  },
  picker: {
    height: 50
  },
  calculateButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  error: {
    color: '#e74c3c',
    marginBottom: 16,
    textAlign: 'center'
  },
  resultCard: {
    marginTop: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center'
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  resultLabel: {
    fontSize: 14,
    color: '#7f8c8d'
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2980b9'
  },
  explanation: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20
  }
});

export default PurityScreen;
