import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ConcentrationScreen from '../screens/ConcentrationScreen';
import PurityScreen from '../screens/PurityScreen';
import DensityScreen from '../screens/DensityScreen';
import DilutionScreen from '../screens/DilutionScreen';
import EnzymeLibraryScreen from '../screens/EnzymeLibraryScreen';
import ConversionScreen from '../screens/ConversionScreen';
import TimerScreen from '../screens/TimerScreen';
import CellCounterScreen from '../screens/CellCounterScreen';
import { RouteProp } from '@react-navigation/native';

// Define el tipo ConcentrationParams si no está importado
type ConcentrationParams = {
  molarMass: number;
  equivalents: number;
  equivalentWeight: number;
  compoundType: string;
};

// Define el tipo de lista de parámetros
export type AppParamList = {
  Home: undefined;
  Search: undefined;
  Concentration: { params: ConcentrationParams };
  Purity: undefined;
  Density: undefined;
  Dilution: undefined;
  EnzymeLibrary: undefined;
  Conversion: undefined;
  Timer: undefined;
  CellCounter: undefined;
};

// Usa el tipo de lista de parámetros en el Drawer.Navigator
const Drawer = createDrawerNavigator<AppParamList>();

const CustomDrawerContent = (props: any) => (
  <View style={{ flex: 1, backgroundColor: '#1a1a1a', paddingTop: 40 }}>
    {props.state.routes.map((route: any, index: number) => (
      <TouchableOpacity
        key={route.key}
        style={{
          padding: 15,
          backgroundColor: props.state.index === index ? '#333' : 'transparent',
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: 10,
          borderRadius: 8,
        }}
        onPress={() => props.navigation.navigate(route.name)}
      >
        <Icon
          name={getIconName(route.name)}
          size={24}
          color={props.state.index === index ? '#4CAF50' : '#fff'}
        />
        <Text
          style={{
            color: props.state.index === index ? '#4CAF50' : '#fff',
            marginLeft: 15,
            fontSize: 16,
          }}
        >
          {route.name}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const getIconName = (routeName: string) => {
  switch (routeName) {
    case 'Home':
      return 'home';
    case 'Search':
      return 'search';
    case 'Concentration':
      return 'science';
    case 'Purity':
      return 'filter-alt';
    case 'Density':
      return 'opacity';
    case 'Dilution':
      return 'water-drop';
    case 'EnzymeLibrary':
      return 'biotech';
    case 'Conversion':
      return 'compare-arrows';
    case 'Timer':
      return 'timer';
    case 'CellCounter':
      return 'grid-on';
    default:
      return 'circle';
  }
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          drawerStyle: {
            backgroundColor: '#1a1a1a',
            width: 280,
          },
          drawerType: 'slide',
        }}
      >
        <Drawer.Screen
          name="Home"
          component={HomeScreen}
          options={{
            drawerIcon: ({ color }) => <Icon name="home" size={24} color={color} />,
          }}
        />
        <Drawer.Screen
          name="Search"
          component={SearchScreen}
          options={{
            drawerIcon: ({ color }) => <Icon name="search" size={24} color={color} />,
          }}
        />
        <Drawer.Screen
          name="Concentration"
          component={ConcentrationScreen}
          options={{
            drawerIcon: ({ color }) => <Icon name="science" size={24} color={color} />,
          }}
        />
        <Drawer.Screen
          name="Purity"
          component={PurityScreen}
          options={{
            drawerIcon: ({ color }) => <Icon name="filter-alt" size={24} color={color} />,
          }}
        />
        <Drawer.Screen
          name="Density"
          component={DensityScreen}
          options={{
            drawerIcon: ({ color }) => <Icon name="opacity" size={24} color={color} />,
          }}
        />
        <Drawer.Screen
          name="Dilution"
          component={DilutionScreen}
          options={{
            drawerIcon: ({ color }) => <Icon name="water-drop" size={24} color={color} />,
          }}
        />
        <Drawer.Screen
          name="EnzymeLibrary"
          component={EnzymeLibraryScreen}
          options={{
            drawerIcon: ({ color }) => <Icon name="biotech" size={24} color={color} />,
          }}
        />
        <Drawer.Screen
          name="Conversion"
          component={ConversionScreen}
          options={{
            drawerIcon: ({ color }) => <Icon name="compare-arrows" size={24} color={color} />,
          }}
        />
        <Drawer.Screen
          name="Timer"
          component={TimerScreen}
          options={{
            drawerIcon: ({ color }) => <Icon name="timer" size={24} color={color} />,
          }}
        />
        <Drawer.Screen
          name="CellCounter"
          component={CellCounterScreen}
          options={{
            drawerIcon: ({ color }) => <Icon name="grid-on" size={24} color={color} />,
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
