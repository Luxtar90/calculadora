import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { RouteProp } from '@react-navigation/native';
import { AppParamList } from '../navigation/AppNavigator';

type ConcentrationParams = {
  molarMass: number;
  equivalents: number;
  equivalentWeight: number;
  compoundType: string;
};

type ConcentrationScreenProps = {
  route: RouteProp<AppParamList, 'Concentration'>;
  // otras propiedades que realmente necesites
};

const ConcentrationScreen: React.FC<ConcentrationScreenProps> = ({ route }) => {
  // Valores por defecto
  const defaultParams = {
    molarMass: 0,
    equivalents: 1,
    equivalentWeight: 0,
    compoundType: ''
  };

  // Usar operador de encadenamiento opcional y valores por defecto
  const { molarMass, equivalents, equivalentWeight, compoundType } = route?.params?.params ?? defaultParams;
  
  const [mass, setMass] = useState('');
  const [volume, setVolume] = useState('');
  const [volumeUnit, setVolumeUnit] = useState('mL');
  const [concentrationType, setConcentrationType] = useState('molar');
  const [calculationType, setCalculationType] = useState('direct');
  const [normalityType, setNormalityType] = useState('acid_base');
  const [dilutionType, setDilutionType] = useState('simple');
  
  // Para diluciones
  const [initialConcentration, setInitialConcentration] = useState('');
  const [aliquotVolume, setAliquotVolume] = useState('');
  const [aliquotVolumeUnit, setAliquotVolumeUnit] = useState('mL');
  const [finalVolume, setFinalVolume] = useState('');
  const [finalVolumeUnit, setFinalVolumeUnit] = useState('mL');
  
  const [result, setResult] = useState<string | null>(null);
  const [formula, setFormula] = useState<string>('');

  // Convertir volumen a litros
  const convertToLiters = (value: number, unit: string): number => {
    switch (unit) {
      case 'L': return value;
      case 'mL': return value / 1000;
      case 'µL': return value / 1000000;
      default: return value;
    }
  };

  // Validación de entrada numérica
  const validateNumber = (value: string): boolean => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  };

  // Mostrar error
  const showError = (message: string) => {
    Alert.alert('Error', message);
    setResult(null);
    setFormula('');
  };

  const calculateConcentration = () => {
    if (calculationType === 'dilution') {
      calculateDilution();
      return;
    }

    // Validaciones para cálculo directo
    if (!validateNumber(mass)) {
      showError('La masa debe ser un número positivo');
      return;
    }
    if (!validateNumber(volume)) {
      showError('El volumen debe ser un número positivo');
      return;
    }
    if (concentrationType === 'molar' && molarMass <= 0) {
      showError('Se requiere una masa molar válida para el cálculo molar');
      return;
    }
    if (concentrationType === 'normal') {
      if (normalityType === 'acid_base' && equivalents <= 0) {
        showError('Se requiere un número válido de equivalentes');
        return;
      }
      if (normalityType === 'mass_eq' && equivalentWeight <= 0) {
        showError('Se requiere un peso equivalente válido');
        return;
      }
    }

    const m = parseFloat(mass);
    const v = convertToLiters(parseFloat(volume), volumeUnit);
    
    try {
      let concentration = 0;
      let unit = '';
      let formulaUsed = '';

      switch (concentrationType) {
        case 'molar':
          if (molarMass === 0) throw new Error('Masa molar no válida');
          concentration = (m / molarMass) / v;
          unit = 'M';
          formulaUsed = 'M = (masa / masa molar) / volumen en L';
          break;
        
        case 'normal':
          switch (normalityType) {
            case 'acid_base':
              if (molarMass === 0) throw new Error('Masa molar no válida');
              concentration = (m / molarMass) * equivalents / v;
              formulaUsed = 'N = M × número de H+ o OH-';
              break;
            case 'mass_eq':
              if (equivalentWeight === 0) throw new Error('Peso equivalente no válido');
              concentration = m / (equivalentWeight * v);
              formulaUsed = 'N = masa / (peso equivalente × volumen)';
              break;
            case 'molar_acid':
            case 'molar_base':
              if (molarMass === 0) throw new Error('Masa molar no válida');
              if (equivalents === 0) throw new Error('Número de equivalentes no válido');
              concentration = (m / molarMass / v) * equivalents;
              formulaUsed = `N = Molaridad × ${normalityType === 'molar_acid' ? 'Acidez' : 'Basicidad'}`;
              break;
          }
          unit = 'N';
          break;
        
        case 'porcentaje_mm':
          const totalMass = m + parseFloat(volume);
          if (totalMass <= 0) throw new Error('Masa total debe ser mayor a 0');
          concentration = (m / totalMass) * 100;
          unit = '% m/m';
          formulaUsed = '% m/m = (masa soluto / masa total) × 100';
          break;
        
        case 'porcentaje_mv':
          concentration = (m / v) * 100;
          unit = '% m/v';
          formulaUsed = '% m/v = (masa / volumen) × 100';
          break;
        
        case 'porcentaje_vv':
          const volumeSolute = parseFloat(volume);
          if (volumeSolute >= v) throw new Error('El volumen del soluto debe ser menor al volumen total');
          concentration = (volumeSolute / v) * 100;
          unit = '% v/v';
          formulaUsed = '% v/v = (volumen soluto / volumen total) × 100';
          break;
      }

      if (!isFinite(concentration)) {
        throw new Error('El resultado es indefinido o infinito');
      }

      setResult(`${concentration.toFixed(4)} ${unit}`);
      setFormula(formulaUsed);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error en el cálculo');
    }
  };

  const calculateDilution = () => {
    // Validaciones para dilución
    if (!validateNumber(initialConcentration)) {
      showError('La concentración inicial debe ser un número positivo');
      return;
    }
    if (!validateNumber(finalVolume)) {
      showError('El volumen final debe ser un número positivo');
      return;
    }

    const c1 = parseFloat(initialConcentration);
    const v2 = convertToLiters(parseFloat(finalVolume), finalVolumeUnit);
    
    try {
      if (dilutionType === 'simple') {
        if (!validateNumber(aliquotVolume)) {
          showError('La concentración deseada debe ser un número positivo');
          return;
        }
        
        const desiredConcentration = parseFloat(aliquotVolume);
        if (desiredConcentration >= c1) {
          throw new Error('La concentración deseada debe ser menor que la concentración inicial');
        }
        
        const v1 = (desiredConcentration * v2) / c1;
        if (!isFinite(v1)) {
          throw new Error('El volumen calculado es indefinido o infinito');
        }
        
        setResult(`Tomar ${v1.toFixed(2)} ${finalVolumeUnit} de la solución inicial`);
        setFormula('C₁V₁ = C₂V₂');
        
      } else { // dilución seriada
        if (!validateNumber(aliquotVolume)) {
          showError('El volumen de alícuota debe ser un número positivo');
          return;
        }
        
        const v1 = convertToLiters(parseFloat(aliquotVolume), aliquotVolumeUnit);
        if (v1 >= v2) {
          throw new Error('El volumen de alícuota debe ser menor al volumen final');
        }
        
        const c2 = (c1 * v1) / v2;
        if (!isFinite(c2)) {
          throw new Error('La concentración calculada es indefinida o infinita');
        }
        
        setResult(`${c2.toFixed(4)} ${concentrationType === 'normal' ? 'N' : 'M'}`);
        setFormula('C₁V₁ = C₂V₂');
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error en el cálculo de dilución');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Calculadora de Concentración</Text>
      
      <View style={styles.infoContainer}>
        {molarMass > 0 && (
          <Text style={styles.info}>Masa Molar: {molarMass.toFixed(2)} g/mol</Text>
        )}
        {equivalents !== 1 && (
          <Text style={styles.info}>Número de Cargas: {equivalents.toFixed(2)}</Text>
        )}
        {equivalentWeight > 0 && (
          <Text style={styles.info}>Peso Equivalente: {equivalentWeight.toFixed(2)} g/eq</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tipo de Cálculo</Text>
        <Picker
          selectedValue={calculationType}
          onValueChange={(value) => setCalculationType(value)}
          style={styles.picker}
        >
          <Picker.Item label="Cálculo Directo" value="direct" />
          <Picker.Item label="Dilución" value="dilution" />
        </Picker>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tipo de Concentración</Text>
        <Picker
          selectedValue={concentrationType}
          onValueChange={(value) => setConcentrationType(value)}
          style={styles.picker}
        >
          <Picker.Item label="Molar (M)" value="molar" />
          <Picker.Item label="Normal (N)" value="normal" />
          <Picker.Item label="Porcentaje masa/masa (% m/m)" value="porcentaje_mm" />
          <Picker.Item label="Porcentaje masa/volumen (% m/v)" value="porcentaje_mv" />
          <Picker.Item label="Porcentaje volumen/volumen (% v/v)" value="porcentaje_vv" />
        </Picker>

        {concentrationType === 'normal' && (
          <>
            <Text style={[styles.cardTitle, { marginTop: 10 }]}>Tipo de Normalidad</Text>
            <Picker
              selectedValue={normalityType}
              onValueChange={(value) => setNormalityType(value)}
              style={styles.picker}
            >
              <Picker.Item label="Por H+ o OH- disponibles" value="acid_base" />
              <Picker.Item label="Por peso equivalente" value="mass_eq" />
              <Picker.Item label="Por Molaridad × Acidez" value="molar_acid" />
              <Picker.Item label="Por Molaridad × Basicidad" value="molar_base" />
            </Picker>
          </>
        )}
      </View>

      {calculationType === 'direct' ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Datos de la Solución</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Masa del soluto (g)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={mass}
              onChangeText={setMass}
              placeholder="Ingrese masa"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Volumen de la solución</Text>
            <View style={styles.rowContainer}>
              <TextInput
                style={[styles.input, { flex: 2, marginRight: 10 }]}
                keyboardType="numeric"
                value={volume}
                onChangeText={setVolume}
                placeholder="Ingrese volumen"
              />
              <Picker
                selectedValue={volumeUnit}
                onValueChange={(value) => setVolumeUnit(value)}
                style={[styles.picker, { flex: 1 }]}
              >
                <Picker.Item label="L" value="L" />
                <Picker.Item label="mL" value="mL" />
                <Picker.Item label="µL" value="µL" />
              </Picker>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Datos de la Dilución</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.cardTitle}>Tipo de Dilución</Text>
            <Picker
              selectedValue={dilutionType}
              onValueChange={(value) => setDilutionType(value)}
              style={styles.picker}
            >
              <Picker.Item label="Dilución Simple" value="simple" />
              <Picker.Item label="Dilución Seriada" value="serial" />
            </Picker>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Concentración Inicial</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={initialConcentration}
              onChangeText={setInitialConcentration}
              placeholder={`Ingrese concentración inicial (${concentrationType === 'normal' ? 'N' : 'M'})`}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {dilutionType === 'simple' ? 'Concentración Deseada' : 'Volumen de Alícuota'}
            </Text>
            <View style={styles.rowContainer}>
              <TextInput
                style={[styles.input, { flex: 2, marginRight: 10 }]}
                keyboardType="numeric"
                value={aliquotVolume}
                onChangeText={setAliquotVolume}
                placeholder={dilutionType === 'simple' ? 
                  `Ingrese concentración deseada (${concentrationType === 'normal' ? 'N' : 'M'})` : 
                  "Ingrese volumen de alícuota"}
              />
              {dilutionType === 'serial' && (
                <Picker
                  selectedValue={aliquotVolumeUnit}
                  onValueChange={(value) => setAliquotVolumeUnit(value)}
                  style={[styles.picker, { flex: 1 }]}
                >
                  <Picker.Item label="L" value="L" />
                  <Picker.Item label="mL" value="mL" />
                  <Picker.Item label="µL" value="µL" />
                </Picker>
              )}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Volumen Final</Text>
            <View style={styles.rowContainer}>
              <TextInput
                style={[styles.input, { flex: 2, marginRight: 10 }]}
                keyboardType="numeric"
                value={finalVolume}
                onChangeText={setFinalVolume}
                placeholder="Ingrese volumen final"
              />
              <Picker
                selectedValue={finalVolumeUnit}
                onValueChange={(value) => setFinalVolumeUnit(value)}
                style={[styles.picker, { flex: 1 }]}
              >
                <Picker.Item label="L" value="L" />
                <Picker.Item label="mL" value="mL" />
                <Picker.Item label="µL" value="µL" />
              </Picker>
            </View>
          </View>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button 
          title="Calcular" 
          onPress={calculateConcentration}
        />
      </View>

      {result && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resultado</Text>
          <Text style={styles.result}>{result}</Text>
          <Text style={styles.formula}>Fórmula utilizada:</Text>
          <Text style={styles.formulaText}>{formula}</Text>
          
          {concentrationType === 'normal' && (
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Fórmulas de Normalidad:</Text>
              <Text style={styles.infoText}>
                • N = M × n (donde n es el número de H+ o OH-){'\n'}
                • N = masa / (peso equivalente × volumen){'\n'}
                • N = Molaridad × Acidez{'\n'}
                • N = Molaridad × Basicidad{'\n'}
                • Para diluciones: N₁V₁ = N₂V₂
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#F5F5F5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#2c3e50'
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2
  },
  info: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#34495e'
  },
  inputContainer: {
    marginBottom: 15
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#7f8c8d'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'white',
    fontSize: 16
  },
  picker: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8
  },
  buttonContainer: {
    marginVertical: 15
  },
  result: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2980b9',
    marginBottom: 10,
    textAlign: 'center'
  },
  formula: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#34495e'
  },
  formulaText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5
  },
  infoBox: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#ebf5fb',
    borderRadius: 8
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2980b9'
  },
  infoText: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20
  }
});

export default ConcentrationScreen;
