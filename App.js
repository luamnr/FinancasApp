import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './src/pages/Home';
import Despesa from './src/pages/Despesa';
import { initDB, resetDB } from './src/utils/db';


const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    
    initDB();
    

  }, []);


  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} options={{ title: 'Finanças' }} />
        <Stack.Screen name="Despesa" component={Despesa} options={{ title: 'Adicionar / Editar' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}