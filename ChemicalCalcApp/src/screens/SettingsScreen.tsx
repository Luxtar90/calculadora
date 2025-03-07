import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme, lightTheme, darkTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SettingsScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>Configuración</Text>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Apariencia</Text>
          
          <TouchableOpacity 
            style={[styles.option, { backgroundColor: colors.card }]} 
            onPress={toggleTheme}
          >
            <View style={styles.optionContent}>
              <Icon 
                name={theme === 'light' ? 'light-mode' : 'dark-mode'} 
                size={24} 
                color={colors.text} 
              />
              <Text style={[styles.optionText, { color: colors.text }]}>
                Modo {theme === 'light' ? 'Claro' : 'Oscuro'}
              </Text>
            </View>
            <Text style={[styles.optionValue, { color: colors.textSecondary }]}>
              {theme === 'light' ? 'Activado' : 'Desactivado'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Información</Text>
          
          <View style={[styles.option, { backgroundColor: colors.card }]}>
            <View style={styles.optionContent}>
              <Icon name="info" size={24} color={colors.text} />
              <Text style={[styles.optionText, { color: colors.text }]}>Versión</Text>
            </View>
            <Text style={[styles.optionValue, { color: colors.textSecondary }]}>1.0.0</Text>
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
  card: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  optionValue: {
    fontSize: 14,
  },
});

export default SettingsScreen; 