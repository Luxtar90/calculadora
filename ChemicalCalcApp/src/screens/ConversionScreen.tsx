import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, lightTheme, darkTheme } from '../context/ThemeContext';

interface ConversionCategory {
  name: string;
  icon: string;
  units: string[];
  conversions: { [key: string]: number };
}

const conversionCategories: ConversionCategory[] = [
  {
    name: "Masa",
    icon: "weight",
    units: ["kg", "g", "mg", "µg", "ng"],
    conversions: {
      "kg": 1000,
      "g": 1,
      "mg": 0.001,
      "µg": 0.000001,
      "ng": 0.000000001
    }
  },
  {
    name: "Volumen",
    icon: "beaker",
    units: ["L", "mL", "µL", "dL", "cm³"],
    conversions: {
      "L": 1000,
      "mL": 1,
      "µL": 0.001,
      "dL": 100,
      "cm³": 1
    }
  },
  {
    name: "Molaridad",
    icon: "flask",
    units: ["M", "mM", "µM", "nM", "pM"],
    conversions: {
      "M": 1,
      "mM": 0.001,
      "µM": 0.000001,
      "nM": 0.000000001,
      "pM": 0.000000000001
    }
  },
  {
    name: "Temperatura",
    icon: "thermometer",
    units: ["°C", "°F", "K"],
    conversions: {
      "°C": 1,
      "°F": 33.8,
      "K": 274.15
    }
  },
  {
    name: "Presión",
    icon: "gauge",
    units: ["atm", "mmHg", "kPa", "bar", "psi"],
    conversions: {
      "atm": 1,
      "mmHg": 760,
      "kPa": 101.325,
      "bar": 1.01325,
      "psi": 14.6959
    }
  },
  {
    name: "Tiempo",
    icon: "clock-outline",
    units: ["h", "min", "s", "ms"],
    conversions: {
      "h": 3600,
      "min": 60,
      "s": 1,
      "ms": 0.001
    }
  }
];

const ConversionScreen = () => {
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [fromUnit, setFromUnit] = useState(conversionCategories[0].units[0]);
  const [toUnit, setToUnit] = useState(conversionCategories[0].units[1]);
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');

  const formatResult = (value: number, category: string): string => {
    if (Number.isInteger(value)) {
      return value.toString();
    }

    const absValue = Math.abs(value);
    
    if (category === "Temperatura") {
      return Number(value.toFixed(2)).toString();
    }
    
    if (absValue < 0.0001 || absValue > 1000000) {
      return value.toExponential(2);
    }

    let result = '';
    if (absValue < 0.01) {
      result = value.toFixed(4);
    } else if (absValue < 1) {
      result = value.toFixed(3);
    } else if (absValue < 100) {
      result = value.toFixed(2);
    } else {
      result = value.toFixed(1);
    }
    
    return Number(result).toString();
  };

  const superscriptNumber = (num: number): string => {
    const superscripts = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '⁻'];
    return num.toString()
      .split('')
      .map(char => char === '-' ? superscripts[10] : superscripts[parseInt(char)])
      .join('');
  };

  const convert = (value: string, from: string, to: string) => {
    const category = conversionCategories[selectedCategory];
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return '';
    }

    if (category.name === "Temperatura") {
      let resultValue: number;
      if (from === "°C" && to === "°F") {
        resultValue = (numValue * 9/5) + 32;
      } else if (from === "°F" && to === "°C") {
        resultValue = (numValue - 32) * 5/9;
      } else if (from === "°C" && to === "K") {
        resultValue = numValue + 273.15;
      } else if (from === "K" && to === "°C") {
        resultValue = numValue - 273.15;
      } else if (from === "°F" && to === "K") {
        resultValue = (numValue - 32) * 5/9 + 273.15;
      } else if (from === "K" && to === "°F") {
        resultValue = (numValue - 273.15) * 9/5 + 32;
      } else {
        resultValue = numValue;
      }
      return formatResult(resultValue, category.name);
    } else {
      const fromValue = category.conversions[from];
      const toValue = category.conversions[to];
      const result = (numValue * fromValue) / toValue;
      return formatResult(result, category.name);
    }
  };

  useEffect(() => {
    if (fromValue) {
      const result = convert(fromValue, fromUnit, toUnit);
      setToValue(result);
    } else {
      setToValue('');
    }
  }, [fromValue, fromUnit, toUnit, selectedCategory]);

  const handleCategoryChange = (index: number) => {
    setSelectedCategory(index);
    setFromUnit(conversionCategories[index].units[0]);
    setToUnit(conversionCategories[index].units[1]);
    if (fromValue) {
      const result = convert(fromValue, conversionCategories[index].units[0], conversionCategories[index].units[1]);
      setToValue(result);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.categoriesContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {conversionCategories.map((category, index) => (
            <TouchableOpacity
              key={category.name}
              style={[
                styles.categoryButton,
                { backgroundColor: selectedCategory === index ? colors.primary : colors.card }
              ]}
              onPress={() => handleCategoryChange(index)}
            >
              <MaterialCommunityIcons
                name={category.icon as any}
                size={28}
                color={selectedCategory === index ? colors.background : colors.primary}
              />
              <Text style={[
                styles.categoryText,
                { color: selectedCategory === index ? colors.background : colors.primary }
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.conversionGroup}>
          <Text style={[styles.groupTitle, { color: colors.text }]}>Unidad de origen</Text>
          <View style={styles.unitSelector}>
            {conversionCategories[selectedCategory].units.map(unit => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.unitButton,
                  { backgroundColor: fromUnit === unit ? colors.primary : colors.border },
                ]}
                onPress={() => setFromUnit(unit)}
              >
                <Text style={[
                  styles.unitText,
                  { color: fromUnit === unit ? colors.background : colors.text }
                ]}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.inputContainer, { backgroundColor: colors.border }]}>
            <MaterialCommunityIcons
              name={conversionCategories[selectedCategory].icon as any}
              size={24}
              color={colors.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={fromValue}
              onChangeText={setFromValue}
              keyboardType="numeric"
              placeholder="Ingrese valor"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.arrowContainer}>
          <MaterialCommunityIcons
            name="arrow-down"
            size={32}
            color={colors.primary}
          />
        </View>

        <View style={styles.conversionGroup}>
          <Text style={[styles.groupTitle, { color: colors.text }]}>Unidad de destino</Text>
          <View style={styles.unitSelector}>
            {conversionCategories[selectedCategory].units.map(unit => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.unitButton,
                  { backgroundColor: toUnit === unit ? colors.primary : colors.border },
                ]}
                onPress={() => setToUnit(unit)}
              >
                <Text style={[
                  styles.unitText,
                  { color: toUnit === unit ? colors.background : colors.text }
                ]}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.resultContainer, { backgroundColor: colors.border }]}>
            <MaterialCommunityIcons
              name="equal"
              size={24}
              color={colors.primary}
              style={styles.resultIcon}
            />
            <Text style={[styles.resultText, { color: colors.text }]}>
              {toValue || '0'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoriesContainer: {
    paddingVertical: 15,
    marginBottom: 20,
    borderBottomWidth: 1,
  },
  categoriesContent: {
    paddingHorizontal: 15,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  categoryText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  conversionGroup: {
    marginBottom: 25,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  unitSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    gap: 8,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  unitText: {
    fontSize: 15,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 24,
    height: '100%',
  },
  arrowContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 56,
  },
  resultIcon: {
    marginRight: 10,
  },
  resultText: {
    flex: 1,
    fontSize: 24,
  },
});

export default ConversionScreen;
