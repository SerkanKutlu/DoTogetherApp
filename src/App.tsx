//DoTogether!
import React, {useEffect, useState} from 'react';
import {SafeAreaView, BackHandler} from 'react-native';
import useStyles from './AppStyle';
import {NavigationContainer} from '@react-navigation/native';
import Login from './pages/Login/Login';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import OnBoard from './pages/OnBoard/OnBoard';
import RoomPage from './pages/Room/RoomPage';
import Invites from './pages/Invites/Invites';
import AwesomeAlert from 'react-native-awesome-alerts';
import {useTranslation} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import NetInfo from '@react-native-community/netinfo';
const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  const [connectionAlertShow, setConnectionAlertShow] = useState(false);
  const {t, i18n} = useTranslation();
  const changeLanguage = (value: any) => {
    i18n.changeLanguage(value);
  };
  const styles = useStyles();
  useEffect(() => {
    const preferredLanguage = RNLocalize.getLocales()[0].languageTag;
    if (preferredLanguage.includes('tr')) {
      changeLanguage('tr');
    }
    const NetInfoUnsubscribe = NetInfo.addEventListener(state => {
      // Check if the device is connected to the internet
      const connected = state.isConnected;
      // If not connected, show an alert
      if (!connected) {
        setConnectionAlertShow(true);
      } else {
        setConnectionAlertShow(false);
      }
    });
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        return true;
      },
    );

    return () => {
      // Clean up the event listener when the component is unmounted
      backHandler.remove();
      NetInfoUnsubscribe();
    };
  }, []);
  return (
    <NavigationContainer>
      <AwesomeAlert
        show={connectionAlertShow}
        showProgress={false}
        title={t('connectionLostAlertTitle')}
        message={t('connectionLostAlertMessage')}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={false}
      />
      <SafeAreaView style={styles.container}>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{gestureEnabled: false}}>
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
            options={{headerShown: false, gestureEnabled: true}}
          />
          <Stack.Screen
            name="Invites"
            component={Invites}
            options={{headerShown: false, gestureEnabled: true}}
          />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}

export default App;
