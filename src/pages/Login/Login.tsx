import React from 'react';
import {useEffect, useState} from 'react';
import {SafeAreaView, useWindowDimensions, Text, View} from 'react-native';
import {User} from '@react-native-google-signin/google-signin';
import useStyles from './LoginStyle';
import {Button} from 'react-native-paper';
import {ActiveUser, AuthService} from '../../Services/AuthService';
import {Platform, Alert} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
function createLock() {
  let isLocked = false;
  const queue: [] = [];

  function acquire() {
    return new Promise(resolve => {
      const release = () => {
        if (queue.length > 0) {
          const next = queue.shift();
          next();
        } else {
          isLocked = false;
        }
      };

      if (isLocked) {
        queue.push(release);
      } else {
        isLocked = true;
        resolve(release);
      }
    });
  }

  function release() {
    if (queue.length > 0) {
      const next = queue.shift();
      next();
    } else {
      isLocked = false;
    }
  }

  return {acquire, release};
}
function Login({navigation}): JSX.Element {
  const {width, height} = useWindowDimensions();
  const [showLogin, setShowLogin] = useState(false);
  const authService = new AuthService();
  const styles = useStyles();
  const signInLock = createLock(); // You need to create a lock function (createLock) to ensure mutual exclusion
  useEffect(() => {
    const NetInfoUnsubscribe = NetInfo.addEventListener(async state => {
      const connected = state.isConnected;
      if (connected) {
        try {
          await signInLock.acquire();
          await authService.LoginAgain();
          navigation.navigate('OnBoard');
        } catch (e) {
          setShowLogin(true);
        } finally {
          signInLock.release();
        }
      }
    });

    return () => {
      NetInfoUnsubscribe();
    };
  }, []);

  return (
    <SafeAreaView>
      {showLogin && (
        <SafeAreaView style={styles.loginContainer}>
          <View style={styles.headerArea}>
            <Text style={styles.header as any}>Do Together</Text>
          </View>
          <View style={styles.loginOptionsContainer}>
            <Button
              style={styles.loginElment}
              icon="google"
              mode="elevated"
              onPress={async () => {
                try {
                  var result = await authService.GoogleLogin();
                  if (result) {
                    navigation.navigate('OnBoard');
                  } else {
                    Alert.alert(
                      'Problem Occured',
                      'Try again to login with google.',
                      [
                        {
                          text: 'OK',
                        },
                        {
                          text: 'NO',
                        },
                      ],
                    );
                  }
                } catch {
                  Alert.alert(
                    'Problem Occured',
                    'Try again to login with google.',
                    [
                      {
                        text: 'OK',
                      },
                      {
                        text: 'NO',
                      },
                    ],
                  );
                }
              }}>
              Continue With Google
            </Button>
          </View>
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
}

export default Login;
