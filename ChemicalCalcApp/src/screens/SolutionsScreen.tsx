import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { AppParamList } from '../navigation/AppNavigator';
import { useTheme, lightTheme, darkTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

type SolutionsParams = {
  molarMass?: number;
  equivalents?: number;
  equivalentWeight?: number;
  compoundType?: string;
};

type Props = {
  route?: RouteProp<AppParamList, 'Solutions'>;
};

type Step = 'molar_mass' | 'purity' | 'concentration' | 'dilution';

const SolutionsScreen: React.FC<Props> = ({ route }) => {
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;
  const navigation = useNavigation<DrawerNavigationProp<AppParamList>>();

  // Control de pasos
  const [currentStep, setCurrentStep] = useState<Step>('molar_mass');
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());

  // Estados principales
  const [calculationType, setCalculationType] = useState('direct');
  const [concentrationType, setConcentrationType] = useState('molar');
  const [normalityType, setNormalityType] = useState('acid_base');
  const [dilutionType, setDilutionType] = useState('simple');

  // Estados para cálculo directo
  const [mass, setMass] = useState('');
  const [volume, setVolume] = useState('');
  const [volumeUnit, setVolumeUnit] = useState('mL');

  // Estados para dilución
  const [initialConcentration, setInitialConcentration] = useState('');
  const [aliquotVolume, setAliquotVolume] = useState('');
  const [aliquotVolumeUnit, setAliquotVolumeUnit] = useState('mL');
  const [finalVolume, setFinalVolume] = useState('');
  const [finalVolumeUnit, setFinalVolumeUnit] = useState('mL');

  // Estados para pureza
  const [desiredConcentration, setDesiredConcentration] = useState('');
  const [desiredVolume, setDesiredVolume] = useState('');
  const [purity, setPurity] = useState('');

  // Estados para resultados
  const [result, setResult] = useState<string | null>(null);
  const [formula, setFormula] = useState('');

  // Parámetros de la ruta
  const defaultParams: SolutionsParams = {
    molarMass: 0,
    equivalents: 1,
    equivalentWeight: 0,
    compoundType: ''
  };

  const params = route?.params?.params ?? defaultParams;
  const { molarMass = 0, equivalents = 1, equivalentWeight = 0, compoundType = '' } = params;

  // Efecto para manejar datos recibidos
  useEffect(() => {
    if (molarMass > 0) {
      Alert.alert(
        'Datos Recibidos',
        'Se han cargado los datos del compuesto calculado.\nProceda con el cálculo de pureza.',
        [{ text: 'OK' }]
      );

      if (compoundType === 'acid' || compoundType === 'base') {
        setConcentrationType('normal');
        setNormalityType(compoundType === 'acid' ? 'molar_acid' : 'molar_base');
      }
      
      setCompletedSteps(prev => new Set([...prev, 'molar_mass']));
      setCurrentStep('purity');
    }
  }, [molarMass, compoundType]);

  // Funciones auxiliares
  const convertToLiters = (value: number, unit: string): number => {
    switch (unit) {
      case 'L': return value;
      case 'mL': return value / 1000;
      case 'µL': return value / 1000000;
      default: return value;
    }
  };

  const validateNumber = (value: string): boolean => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  };

  const showError = (message: string) => {
    Alert.alert('Error', message);
    setResult(null);
    setFormula('');
  };

  // Navegación entre pasos
  const goToNextStep = () => {
    const steps: Step[] = ['molar_mass', 'purity', 'concentration', 'dilution'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    const steps: Step[] = ['molar_mass', 'purity', 'concentration', 'dilution'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  // Funciones de cálculo
  const calculateConcentration = () => {
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

    const m = parseFloat(mass);
    const v = convertToLiters(parseFloat(volume), volumeUnit);
    
    try {
      let concentration = 0;
      let unit = '';
      let formulaUsed = '';

      switch (concentrationType) {
        case 'molar':
          concentration = (m / molarMass) / v;
          unit = 'M';
          formulaUsed = 'M = (masa / masa molar) / volumen en L';
          break;
        
        case 'normal':
          switch (normalityType) {
            case 'acid_base':
              concentration = (m / molarMass) * equivalents / v;
              formulaUsed = 'N = M × número de H+ o OH-';
              break;
            case 'mass_eq':
              concentration = m / (equivalentWeight * v);
              formulaUsed = 'N = masa / (peso equivalente × volumen)';
              break;
            case 'molar_acid':
            case 'molar_base':
              concentration = (m / molarMass / v) * equivalents;
              formulaUsed = `N = Molaridad × ${normalityType === 'molar_acid' ? 'Acidez' : 'Basicidad'}`;
              break;
          }
          unit = 'N';
          break;
        
        case 'porcentaje_mm':
          concentration = (m / (m + parseFloat(volume))) * 100;
          unit = '% m/m';
          formulaUsed = '% m/m = (masa soluto / masa total) × 100';
          break;
        
        case 'porcentaje_mv':
          concentration = (m / v) * 100;
          unit = '% m/v';
          formulaUsed = '% m/v = (masa / volumen) × 100';
          break;
      }

      setResult(`${concentration.toFixed(4)} ${unit}`);
      setFormula(formulaUsed);
    } catch (error) {
      showError('Error en el cálculo');
    }
  };

  const calculateDilution = () => {
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
        
        const desiredConc = parseFloat(aliquotVolume);
        const v1 = (desiredConc * v2) / c1;
        
        setResult(`Tomar ${v1.toFixed(2)} ${finalVolumeUnit} de la solución inicial`);
        setFormula('C₁V₁ = C₂V₂');
      } else {
        if (!validateNumber(aliquotVolume)) {
          showError('El volumen de alícuota debe ser un número positivo');
          return;
        }
        
        const v1 = convertToLiters(parseFloat(aliquotVolume), aliquotVolumeUnit);
        const c2 = (c1 * v1) / v2;
        
        setResult(`${c2.toFixed(4)} ${concentrationType === 'normal' ? 'N' : 'M'}`);
        setFormula('C₁V₁ = C₂V₂');
      }
    } catch (error) {
      showError('Error en el cálculo de dilución');
    }
  };

  const calculatePurity = () => {
    if (!validateNumber(desiredConcentration) || !validateNumber(desiredVolume) || !validateNumber(purity)) {
      showError('Todos los campos deben ser números positivos');
      return;
    }

    const concentration = parseFloat(desiredConcentration);
    const volume = parseFloat(desiredVolume);
    const purityValue = parseFloat(purity);

    if (concentration > 100 || purityValue > 100) {
      showError('Los porcentajes deben ser menores o iguales a 100');
      return;
    }

    try {
      const volumeInML = convertToLiters(volume, volumeUnit) * 1000;
      const theoreticalMass = (concentration * volumeInML) / 100;
      const actualMassNeeded = theoreticalMass / (purityValue / 100);

      // Guardar los valores calculados para su uso posterior
      setMass(actualMassNeeded.toFixed(3));
      setVolume(volume.toString());
      setVolumeUnit(volumeUnit);

      setResult(`Masa teórica: ${theoreticalMass.toFixed(3)} g\nMasa real a pesar: ${actualMassNeeded.toFixed(3)} g`);
      setFormula('Masa real = Masa teórica / (Pureza / 100)');
      
      // Marcar el paso como completado y avanzar al siguiente
      setCompletedSteps(prev => new Set([...prev, 'purity']));
      Alert.alert(
        'Cálculo Completado',
        'Los valores calculados se han guardado automáticamente para el siguiente paso.',
        [
          {
            text: 'Continuar',
            onPress: () => setCurrentStep('concentration')
          }
        ]
      );
    } catch (error) {
      showError('Error en el cálculo');
    }
  };

  // Renderizado de pasos
  const renderStepIndicator = () => {
    const steps = [
      { key: 'molar_mass', title: 'Masa Molar', icon: 'science' },
      { key: 'purity', title: 'Pureza', icon: 'opacity' },
      { key: 'concentration', title: 'Concentración', icon: 'water' },
      { key: 'dilution', title: 'Dilución', icon: 'mix' }
    ];

    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <View key={step.key} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              currentStep === step.key && styles.activeStep,
              completedSteps.has(step.key as Step) && styles.completedStep
            ]}>
              <Icon 
                name={step.icon} 
                size={24} 
                color={currentStep === step.key ? colors.primary : 
                      completedSteps.has(step.key as Step) ? colors.text : colors.textSecondary} 
              />
            </View>
            <Text style={[
              styles.stepText,
              { color: currentStep === step.key ? colors.primary : colors.textSecondary }
            ]}>
              {step.title}
            </Text>
            {index < steps.length - 1 && (
              <View style={[styles.stepLine, { backgroundColor: colors.textSecondary }]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'molar_mass':
        return (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Cálculo de Masa Molar</Text>
            <Text style={[styles.info, { color: colors.textSecondary }]}>
              Utilice la calculadora de masa molar para obtener los datos del compuesto.
            </Text>
            {molarMass > 0 ? (
              <View style={styles.resultContainer}>
                <Text style={[styles.result, { color: colors.text }]}>
                  Masa Molar: {molarMass.toFixed(2)} g/mol
                </Text>
                {equivalents !== 1 && (
                  <Text style={[styles.info, { color: colors.textSecondary }]}>
                    Número de Cargas: {equivalents.toFixed(2)}
                  </Text>
                )}
              </View>
            ) : (
              <Button
                title="Ir a Calculadora de Masa Molar"
                onPress={() => navigation.navigate('Search')}
              />
            )}
          </View>
        );

      case 'purity':
        return (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Cálculo de Pureza</Text>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Concentración deseada (%)
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                keyboardType="numeric"
                value={desiredConcentration}
                onChangeText={setDesiredConcentration}
                placeholder="Ej: 2"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Volumen deseado
              </Text>
              <View style={styles.rowContainer}>
                <TextInput
                  style={[styles.input, { flex: 2, marginRight: 10, backgroundColor: colors.card, color: colors.text }]}
                  keyboardType="numeric"
                  value={desiredVolume}
                  onChangeText={setDesiredVolume}
                  placeholder="Ej: 100"
                  placeholderTextColor={colors.textSecondary}
                />
                <Picker
                  selectedValue={volumeUnit}
                  onValueChange={setVolumeUnit}
                  style={[styles.picker, { flex: 1 }]}
                >
                  <Picker.Item label="L" value="L" />
                  <Picker.Item label="mL" value="mL" />
                  <Picker.Item label="µL" value="µL" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Pureza del reactivo (%)
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                keyboardType="numeric"
                value={purity}
                onChangeText={setPurity}
                placeholder="Ej: 90"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <Button
              title="Calcular Pureza"
              onPress={() => {
                calculatePurity();
                if (result) {
                  setCompletedSteps(prev => new Set([...prev, 'purity']));
                }
              }}
            />
          </View>
        );

      case 'concentration':
        return (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Cálculo de Concentración
            </Text>
            <Picker
              selectedValue={concentrationType}
              onValueChange={setConcentrationType}
              style={styles.picker}
            >
              <Picker.Item label="Molar (M)" value="molar" />
              <Picker.Item label="Normal (N)" value="normal" />
              <Picker.Item label="Porcentaje m/m" value="porcentaje_mm" />
              <Picker.Item label="Porcentaje m/v" value="porcentaje_mv" />
            </Picker>

            {concentrationType === 'normal' && (
              <Picker
                selectedValue={normalityType}
                onValueChange={setNormalityType}
                style={styles.picker}
              >
                <Picker.Item label="Por H+ o OH-" value="acid_base" />
                <Picker.Item label="Por peso equivalente" value="mass_eq" />
                <Picker.Item label="Por Acidez" value="molar_acid" />
                <Picker.Item label="Por Basicidad" value="molar_base" />
              </Picker>
            )}

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Masa del soluto (g)
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                keyboardType="numeric"
                value={mass}
                onChangeText={setMass}
                placeholder="Ingrese masa"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Volumen de la solución
              </Text>
              <View style={styles.rowContainer}>
                <TextInput
                  style={[styles.input, { flex: 2, marginRight: 10, backgroundColor: colors.card, color: colors.text }]}
                  keyboardType="numeric"
                  value={volume}
                  onChangeText={setVolume}
                  placeholder="Ingrese volumen"
                  placeholderTextColor={colors.textSecondary}
                />
                <Picker
                  selectedValue={volumeUnit}
                  onValueChange={setVolumeUnit}
                  style={[styles.picker, { flex: 1 }]}
                >
                  <Picker.Item label="L" value="L" />
                  <Picker.Item label="mL" value="mL" />
                  <Picker.Item label="µL" value="µL" />
                </Picker>
              </View>
            </View>

            <Button
              title="Calcular Concentración"
              onPress={() => {
                calculateConcentration();
                if (result) {
                  setCompletedSteps(prev => new Set([...prev, 'concentration']));
                }
              }}
            />
          </View>
        );

      case 'dilution':
        return (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Cálculo de Dilución
            </Text>
            <Picker
              selectedValue={dilutionType}
              onValueChange={setDilutionType}
              style={styles.picker}
            >
              <Picker.Item label="Dilución Simple" value="simple" />
              <Picker.Item label="Dilución Seriada" value="serial" />
            </Picker>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Concentración Inicial
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                keyboardType="numeric"
                value={initialConcentration}
                onChangeText={setInitialConcentration}
                placeholder={`Concentración inicial (${concentrationType === 'normal' ? 'N' : 'M'})`}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {dilutionType === 'simple' ? 'Concentración Deseada' : 'Volumen de Alícuota'}
              </Text>
              <View style={styles.rowContainer}>
                <TextInput
                  style={[styles.input, { flex: 2, marginRight: 10, backgroundColor: colors.card, color: colors.text }]}
                  keyboardType="numeric"
                  value={aliquotVolume}
                  onChangeText={setAliquotVolume}
                  placeholder={dilutionType === 'simple' ? 
                    `Concentración deseada (${concentrationType === 'normal' ? 'N' : 'M'})` : 
                    "Volumen de alícuota"}
                  placeholderTextColor={colors.textSecondary}
                />
                {dilutionType === 'serial' && (
                  <Picker
                    selectedValue={aliquotVolumeUnit}
                    onValueChange={setAliquotVolumeUnit}
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
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Volumen Final
              </Text>
              <View style={styles.rowContainer}>
                <TextInput
                  style={[styles.input, { flex: 2, marginRight: 10, backgroundColor: colors.card, color: colors.text }]}
                  keyboardType="numeric"
                  value={finalVolume}
                  onChangeText={setFinalVolume}
                  placeholder="Volumen final"
                  placeholderTextColor={colors.textSecondary}
                />
                <Picker
                  selectedValue={finalVolumeUnit}
                  onValueChange={setFinalVolumeUnit}
                  style={[styles.picker, { flex: 1 }]}
                >
                  <Picker.Item label="L" value="L" />
                  <Picker.Item label="mL" value="mL" />
                  <Picker.Item label="µL" value="µL" />
                </Picker>
              </View>
            </View>

            <Button
              title="Calcular Dilución"
              onPress={() => {
                calculateDilution();
                if (result) {
                  setCompletedSteps(prev => new Set([...prev, 'dilution']));
                }
              }}
            />
          </View>
        );
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderStepIndicator()}
      
      {renderCurrentStep()}

      {result && (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Resultado</Text>
          <Text style={[styles.result, { color: colors.text }]}>{result}</Text>
          <Text style={[styles.formula, { color: colors.textSecondary }]}>
            Fórmula utilizada:
          </Text>
          <Text style={[styles.formulaText, { color: colors.textSecondary }]}>
            {formula}
          </Text>
        </View>
      )}

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[
            styles.navButton,
            { opacity: currentStep === 'molar_mass' ? 0.5 : 1 }
          ]}
          onPress={goToPreviousStep}
          disabled={currentStep === 'molar_mass'}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
          <Text style={[styles.navButtonText, { color: colors.text }]}>Anterior</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            { opacity: currentStep === 'dilution' ? 0.5 : 1 }
          ]}
          onPress={goToNextStep}
          disabled={currentStep === 'dilution'}
        >
          <Text style={[styles.navButtonText, { color: colors.text }]}>Siguiente</Text>
          <Icon name="arrow-forward" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  activeStep: {
    backgroundColor: '#2196F3',
  },
  completedStep: {
    backgroundColor: '#4CAF50',
  },
  stepText: {
    fontSize: 12,
    textAlign: 'center',
  },
  stepLine: {
    position: 'absolute',
    top: 20,
    right: -50,
    width: 100,
    height: 2,
    backgroundColor: '#e0e0e0',
  },
  card: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  picker: {
    height: 50,
    marginBottom: 10,
  },
  result: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  formula: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  formulaText: {
    fontSize: 14,
    marginTop: 5,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  navButtonText: {
    fontSize: 16,
    marginHorizontal: 5,
  },
  resultContainer: {
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  info: {
    fontSize: 14,
    marginBottom: 10,
  },
});

export default SolutionsScreen;
