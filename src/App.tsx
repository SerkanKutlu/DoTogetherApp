//DoTogether!
import React, {useEffect} from 'react';
import {SafeAreaView, Text} from 'react-native';
import useStyles from './AppStyle';
import {NavigationContainer} from '@react-navigation/native';
import Login from './pages/Login/Login';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import OnBoard from './pages/OnBoard/OnBoard';
import RoomPage from './pages/Room/RoomPage';
const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  const styles = useStyles();
  return (
    <NavigationContainer>
      <SafeAreaView style={styles.container}>
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="OnBoard"
            component={OnBoard}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="RoomPage"
            component={RoomPage}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}

export default App;
