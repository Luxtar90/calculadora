import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
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

const CustomAlert = ({ type, title, message, visible, onHide }: {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  visible: boolean;
  onHide?: () => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 10,
          useNativeDriver: true,
        })
      ]).start();

      const timer = setTimeout(() => {
        hideAlert();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideAlert = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => onHide?.());
  };

  const getAlertStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#4CAF50', borderColor: '#45A049' };
      case 'error':
        return { backgroundColor: '#FF5252', borderColor: '#FF1744' };
      case 'info':
        return { backgroundColor: '#2196F3', borderColor: '#1976D2' };
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.alertContainer,
        getAlertStyle(),
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.alertTitle}>{title}</Text>
      <Text style={styles.alertMessage}>{message}</Text>
    </Animated.View>
  );
};

const getStepIcon = (step: Step): string => {
  switch (step) {
    case 'molar_mass':
      return 'science';
    case 'purity':
      return 'check-circle';
    case 'concentration':
      return 'opacity';
    case 'dilution':
      return 'water';
    default:
      return 'circle';
  }
};

const StepIndicator = ({ currentStep }: { currentStep: Step }) => {
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;

  const steps: Step[] = ['molar_mass', 'purity', 'concentration', 'dilution'];

  return (
    <View style={styles.stepIndicatorContainer}>
      {steps.map((step, index) => {
        const isActive = steps.indexOf(currentStep) >= index;
        const isCurrentStep = currentStep === step;
        return (
          <View key={step} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              {
                backgroundColor: isActive ? colors.primary : colors.border,
                borderColor: isCurrentStep ? colors.primary : colors.border,
              }
            ]}>
              <Icon
                name={getStepIcon(step)}
                size={20}
                color={isActive ? colors.background : colors.textSecondary}
              />
            </View>
            {index < steps.length - 1 && (
              <View style={[
                styles.stepLine,
                { backgroundColor: isActive ? colors.primary : colors.border }
              ]} />
            )}
          </View>
        );
      })}
    </View>
  );
};

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
      showInfo(
        'Datos Recibidos',
        'Se han cargado los datos del compuesto calculado.\nProceda con el cálculo de pureza.'
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

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    onHide?: () => void;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showCustomAlert = (type: 'success' | 'error' | 'info', title: string, message: string, onConfirm?: () => void) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      onHide: onConfirm,
    });
  };

  const showError = (message: string) => {
    showCustomAlert('error', '⚠️ Error', message);
    setResult(null);
    setFormula('');
  };

  const showSuccess = (title: string, message: string, onConfirm?: () => void) => {
    showCustomAlert('success', '✅ ' + title, message, onConfirm);
  };

  const showInfo = (title: string, message: string) => {
    showCustomAlert('info', 'ℹ️ ' + title, message);
  };

  const resetCalculator = () => {
    setCurrentStep('molar_mass');
    setCompletedSteps(new Set());
    setMass('');
    setVolume('');
    setVolumeUnit('mL');
    setInitialConcentration('');
    setAliquotVolume('');
    setAliquotVolumeUnit('mL');
    setFinalVolume('');
    setFinalVolumeUnit('mL');
    setDesiredConcentration('');
    setDesiredVolume('');
    setPurity('');
    setResult(null);
    setFormula('');
    setDilutionResults(null);
    navigation.navigate('Search');
  };

  // Navegación entre pasos
  const goToNextStep = () => {
    const steps: Step[] = ['molar_mass', 'purity', 'concentration', 'dilution'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else if (currentIndex === steps.length - 1) {
      resetCalculator();
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
      let resultText = '';
      let formulaText = '';

      // Cálculos base
      const molarConc = (m / molarMass) / v;
      const normalConc = molarConc * equivalents;
      const percentMV = (m / (v * 1000)) * 100;
      const percentMM = (m / (m + (v * 1000))) * 100;

      switch (concentrationType) {
        case 'molar':
          resultText = `Concentración Molar: ${molarConc.toFixed(4)} M\n\n` +
                      `Masa teórica del soluto: ${m.toFixed(4)} g\n` +
                      `Volumen de solución: ${(v * 1000).toFixed(2)} mL`;
          formulaText = 'M = (masa teórica / masa molar) / volumen en L';
          break;
        
        case 'normal':
          let normalityExplanation = '';
          switch (normalityType) {
            case 'acid_base':
              normalityExplanation = `\nNormalidad basada en ${equivalents} H+ o OH- disponibles`;
              break;
            case 'mass_eq':
              normalityExplanation = `\nNormalidad basada en peso equivalente de ${equivalentWeight.toFixed(4)} g/eq`;
              break;
            case 'molar_acid':
              normalityExplanation = `\nNormalidad basada en ${equivalents} H+ disponibles`;
              break;
            case 'molar_base':
              normalityExplanation = `\nNormalidad basada en ${equivalents} OH- disponibles`;
              break;
          }
          
          resultText = `Concentración Normal: ${normalConc.toFixed(4)} N${normalityExplanation}\n\n` +
                      `Masa teórica del soluto: ${m.toFixed(4)} g\n` +
                      `Volumen de solución: ${(v * 1000).toFixed(2)} mL`;
          formulaText = 'N = M × equivalentes\n' +
                       'M = (masa teórica / masa molar) / volumen en L';
          break;
        
        case 'porcentaje_mm':
          resultText = `Concentración m/m: ${percentMM.toFixed(4)} %\n\n` +
                      `Masa teórica del soluto: ${m.toFixed(4)} g\n` +
                      `Masa total: ${(m + (v * 1000)).toFixed(4)} g`;
          formulaText = '% m/m = (masa teórica del soluto / masa total) × 100';
          break;
        
        case 'porcentaje_mv':
          resultText = `Concentración m/v: ${percentMV.toFixed(4)} %\n\n` +
                      `Masa teórica del soluto: ${m.toFixed(4)} g\n` +
                      `Volumen de solución: ${(v * 1000).toFixed(2)} mL`;
          formulaText = '% m/v = (masa teórica / volumen) × 100';
          break;
      }

      setResult(resultText);
      setFormula(formulaText);
      
      // Marcar el paso como completado
      setCompletedSteps(prev => new Set([...prev, 'concentration']));
      
    } catch (error) {
      showError('Error en el cálculo');
    }
  };

  const [numberOfDilutions, setNumberOfDilutions] = useState('');

  const [dilutionResults, setDilutionResults] = useState<{
    type: 'simple' | 'serial';
    steps: Array<{
      number?: number;
      aliquotVolume: number;
      solventVolume: number;
      finalVolume: number;
      initialConc: number;
      finalConc: number;
      dilutionFactor: number;
    }>;
    summary?: {
      totalFactor: number;
      initialConc: number;
      finalConc: number;
    };
  } | null>(null);

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
        
        setDilutionResults({
          type: 'simple',
          steps: [{
            aliquotVolume: v1,
            solventVolume: v2 - v1,
            finalVolume: v2,
            initialConc: c1,
            finalConc: desiredConc,
            dilutionFactor: v2/v1
          }]
        });
        
        setFormula('C₁V₁ = C₂V₂');
      } else {
        if (!validateNumber(aliquotVolume)) {
          showError('El volumen de alícuota debe ser un número positivo');
          return;
        }
        if (!validateNumber(numberOfDilutions)) {
          showError('El número de diluciones debe ser un número positivo');
          return;
        }
        
        const v1 = convertToLiters(parseFloat(aliquotVolume), aliquotVolumeUnit);
        const numDilutions = parseInt(numberOfDilutions);
        let currentConc = c1;
        const steps = [];
        
        for (let i = 1; i <= numDilutions; i++) {
          const newConc = (currentConc * v1) / v2;
          steps.push({
            number: i,
            aliquotVolume: v1,
            solventVolume: v2 - v1,
            finalVolume: v2,
            initialConc: currentConc,
            finalConc: newConc,
            dilutionFactor: v2/v1
          });
          currentConc = newConc;
        }

        const totalDilutionFactor = v2/v1;
        const totalDilutionFactorPower = Math.pow(totalDilutionFactor, numDilutions);
        
        setDilutionResults({
          type: 'serial',
          steps,
          summary: {
            totalFactor: totalDilutionFactorPower,
            initialConc: c1,
            finalConc: currentConc
          }
        });
        
        setFormula('Para cada dilución:\nC₁V₁ = C₂V₂\nFactor de dilución = Vfinal:Valícuota');
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

      setMass(theoreticalMass.toFixed(3));
      setVolume(volume.toString());
      setVolumeUnit(volumeUnit);

      showSuccess(
        'Cálculo Completado',
        'Los valores calculados se han guardado automáticamente para el siguiente paso.\nSe utilizará la masa teórica para los cálculos de concentración.',
        () => setCurrentStep('concentration')
      );

      setResult(`Masa teórica: ${theoreticalMass.toFixed(3)} g\nMasa real a pesar: ${actualMassNeeded.toFixed(3)} g`);
      setFormula('Masa real = Masa teórica / (Pureza / 100)');
      
      setCompletedSteps(prev => new Set([...prev, 'purity']));
    } catch (error) {
      showError('Error en el cálculo');
    }
  };

  // Renderizado de pasos
  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicatorContainer}>
        {(['molar_mass', 'purity', 'concentration', 'dilution'] as Step[]).map((step, index) => (
          <View key={step} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              currentStep === step && styles.currentStepCircle,
              completedSteps.has(step) && styles.completedStepCircle
            ]}>
              <Icon 
                name={getStepIcon(step)} 
                size={20} 
                color={currentStep === step || completedSteps.has(step) ? '#fff' : '#666'} 
              />
            </View>
            {index < 3 && (
              <View style={[
                styles.stepLine,
                (completedSteps.has(step) || currentStep === step) && styles.completedStepLine
              ]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  const getStepTitle = (step: Step): string => {
    switch (step) {
      case 'molar_mass':
        return 'Masa Molar';
      case 'purity':
        return 'Pureza';
      case 'concentration':
        return 'Concentración';
      case 'dilution':
        return 'Dilución';
      default:
        return '';
    }
  };

  const getStepDescription = (step: Step): string => {
    switch (step) {
      case 'molar_mass':
        return 'Utilice la calculadora de masa molar para obtener los datos del compuesto.';
      case 'purity':
        return 'Calcule la pureza del reactivo.';
      case 'concentration':
        return 'Calcule la concentración del soluto en la solución.';
      case 'dilution':
        return 'Calcule la dilución de la solución.';
      default:
        return '';
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'molar_mass':
        return (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {molarMass > 0 ? (
              <View style={[styles.resultContainer, { backgroundColor: colors.card }]}>
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
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Search')}
              >
                <Text style={[styles.buttonText, { color: colors.background }]}>Ir a Calculadora de Masa Molar</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 'purity':
        return (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
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

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => {
                calculatePurity();
                if (result) {
                  setCompletedSteps(prev => new Set([...prev, 'purity']));
                }
              }}
            >
              <Text style={styles.buttonText}>Calcular Pureza</Text>
            </TouchableOpacity>
          </View>
        );

      case 'concentration':
        return (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
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

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => {
                calculateConcentration();
                if (result) {
                  setCompletedSteps(prev => new Set([...prev, 'concentration']));
                }
              }}
            >
              <Text style={styles.buttonText}>Calcular Concentración</Text>
            </TouchableOpacity>
          </View>
        );

      case 'dilution':
        return (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
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

            {dilutionType === 'serial' && (
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Número de diluciones
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                  keyboardType="numeric"
                  value={numberOfDilutions}
                  onChangeText={setNumberOfDilutions}
                  placeholder="Número de diluciones seriadas"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => {
                calculateDilution();
                if (result) {
                  setCompletedSteps(prev => new Set([...prev, 'dilution']));
                }
              }}
            >
              <Text style={styles.buttonText}>Calcular Dilución</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  const renderDilutionResults = () => {
    if (!dilutionResults) return null;

    return (
      <View style={styles.dilutionContainer}>
        <View style={styles.dilutionHeader}>
          <Icon name="science" size={24} color="#2196F3" />
          <Text style={styles.dilutionTitle}>
            {dilutionResults.type === 'simple' ? 'Dilución Simple' : 'Diluciones Seriadas'}
          </Text>
        </View>

        {dilutionResults.steps.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            {step.number && (
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{step.number}</Text>
              </View>
            )}
            
            <View style={styles.stepInstructions}>
              <View style={styles.instructionRow}>
                <Icon name="arrow-forward" size={16} color="#666" />
                <Text style={styles.instructionText}>
                  Tomar {(step.aliquotVolume * 1000).toFixed(2)} {aliquotVolumeUnit} de la solución 
                  {dilutionResults.type === 'serial' ? (typeof step.number !== 'undefined' && step.number === 1 ? ' inicial' : ` ${step.number ? step.number - 1 : ''}`) : ' inicial'}
                </Text>
              </View>
              
              <View style={styles.instructionRow}>
                <Icon name="add" size={16} color="#666" />
                <Text style={styles.instructionText}>
                  Agregar {(step.solventVolume * 1000).toFixed(2)} {finalVolumeUnit} de solvente
                </Text>
              </View>
              
              <View style={styles.instructionRow}>
                <Icon name="opacity" size={16} color="#666" />
                <Text style={styles.instructionText}>
                  Volumen final: {(step.finalVolume * 1000).toFixed(2)} {finalVolumeUnit}
                </Text>
              </View>
            </View>
            
            <View style={styles.concentrationPanel}>
              <View style={styles.concentrationValues}>
                <View style={styles.concentrationItem}>
                  <Text style={styles.concentrationLabel}>Inicial:</Text>
                  <Text style={styles.concentrationValue}>
                    {step.initialConc.toFixed(4)} {concentrationType === 'normal' ? 'N' : 
                    concentrationType === 'porcentaje_mm' ? '% m/m' : 
                    concentrationType === 'porcentaje_mv' ? '% m/v' : 'M'}
                  </Text>
                </View>
                <Icon name="arrow-forward" size={20} color="#1976D2" />
                <View style={styles.concentrationItem}>
                  <Text style={styles.concentrationLabel}>Final:</Text>
                  <Text style={styles.concentrationValue}>
                    {step.finalConc.toFixed(4)} {concentrationType === 'normal' ? 'N' : 
                    concentrationType === 'porcentaje_mm' ? '% m/m' : 
                    concentrationType === 'porcentaje_mv' ? '% m/v' : 'M'}
                  </Text>
                </View>
              </View>
              <Text style={styles.dilutionFactor}>
                Factor de dilución: 1:{step.dilutionFactor.toFixed(0)}
              </Text>
            </View>
            
            {dilutionResults.type === 'serial' && index < dilutionResults.steps.length - 1 && (
              <View style={styles.stepDivider} />
            )}
          </View>
        ))}

        {dilutionResults.summary && (
          <View style={styles.summaryPanel}>
            <Text style={styles.summaryTitle}>Resumen Final</Text>
            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Icon name="functions" size={20} color="#2196F3" />
                <Text style={styles.summaryText}>
                  Factor de dilución total: 1:{dilutionResults.summary.totalFactor.toFixed(0)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Icon name="arrow-upward" size={20} color="#4CAF50" />
                <Text style={styles.summaryText}>
                  Concentración inicial: {dilutionResults.summary.initialConc.toFixed(4)} {concentrationType === 'normal' ? 'N' : 
                  concentrationType === 'porcentaje_mm' ? '% m/m' : 
                  concentrationType === 'porcentaje_mv' ? '% m/v' : 'M'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Icon name="arrow-downward" size={20} color="#F44336" />
                <Text style={styles.summaryText}>
                  Concentración final: {dilutionResults.summary.finalConc.toFixed(4)} {concentrationType === 'normal' ? 'N' : 
                  concentrationType === 'porcentaje_mm' ? '% m/m' : 
                  concentrationType === 'porcentaje_mv' ? '% m/v' : 'M'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <StepIndicator currentStep={currentStep} />
        
        <Text style={[styles.mainTitle, { color: colors.text, marginHorizontal: 16 }]}>
          {getStepTitle(currentStep)}
        </Text>
        <Text style={[styles.mainDescription, { color: colors.textSecondary, marginHorizontal: 16 }]}>
          {getStepDescription(currentStep)}
        </Text>

        {renderCurrentStep()}

        {dilutionResults && renderDilutionResults()}

        {result && (
          <View style={[styles.resultSection, { backgroundColor: colors.card }]}>
            <View style={styles.resultHeader}>
              <Icon name="check-circle" size={24} color="#4CAF50" />
              <Text style={[styles.resultTitle, { color: colors.text }]}>Resultado</Text>
            </View>
            <Text style={[styles.resultText, { color: colors.text }]}>{result}</Text>
            {formula && (
              <View style={[styles.formulaBox, { backgroundColor: colors.border }]}>
                <Text style={[styles.formulaTitle, { color: colors.text }]}>
                  Fórmula utilizada:
                </Text>
                <Text style={[styles.formulaContent, { color: colors.textSecondary }]}>
                  {formula}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.card }]}
            onPress={goToPreviousStep}
          >
            <Icon name="arrow-back" size={24} color={colors.primary} />
            <Text style={[styles.navButtonText, { color: colors.primary }]}>Anterior</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.primary }]}
            onPress={goToNextStep}
          >
            <Text style={[styles.navButtonText, { color: colors.background }]}>
              {currentStep === 'dilution' ? 'Finalizar' : 'Siguiente'}
            </Text>
            <Icon 
              name={currentStep === 'dilution' ? 'refresh' : 'arrow-forward'} 
              size={24} 
              color={colors.background} 
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <CustomAlert {...alertConfig} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 4,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    marginHorizontal: 16,
  },
  mainDescription: {
    fontSize: 16,
    marginBottom: 24,
    marginHorizontal: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  unitSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  resultSection: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 15,
  },
  formulaBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
  },
  formulaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  formulaContent: {
    fontSize: 14,
    color: '#666',
  },
  alertContainer: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    transform: [{ translateY: -100 }],
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  alertButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  alertButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContainer: {
    marginTop: 15,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  result: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentStepCircle: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
    transform: [{scale: 1.1}],
  },
  completedStepCircle: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  completedStepLine: {
    backgroundColor: '#4CAF50',
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dilutionContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginTop: 15,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dilutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dilutionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginLeft: 12,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepInstructions: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  concentrationPanel: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 12,
  },
  concentrationValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  concentrationItem: {
    flex: 1,
    alignItems: 'center',
  },
  concentrationLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  concentrationValue: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  dilutionFactor: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  stepDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  summaryPanel: {
    marginTop: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  summaryContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  picker: {
    height: 50,
    marginBottom: 10,
  },
});

export default SolutionsScreen;

