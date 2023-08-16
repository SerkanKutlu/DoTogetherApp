import React from 'react';
import {useEffect, useState} from 'react';
import {SafeAreaView, useWindowDimensions, Text, View} from 'react-native';
import {User} from '@react-native-google-signin/google-signin';
import useStyles from './LoginStyle';
import {Button} from 'react-native-paper';
import {GoogleLogin, LoginAgain, AppleLogin} from '../../Services/AuthService';
import {Platform} from 'react-native';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import auth from '@react-native-firebase/auth';
function Login(): JSX.Element {
  const {width, height} = useWindowDimensions();
  const [user, setUser] = useState<User>();
  const styles = useStyles();
  useEffect(() => {
    LoginAgain().then(user => {
      if (user != null) {
        setUser(user);
        //Navigate to rooms page
        console.log(user);
        console.log('navigate simulation');
      }
    });
  }, []);
  return (
    <SafeAreaView style={styles.loginContainer}>
      <View style={styles.headerArea}>
        <Text style={styles.header as any}>Do Together</Text>
      </View>
      <View style={styles.loginOptionsContainer}>
        <Button
          style={styles.loginElment}
          icon="google"
          mode="elevated"
          onPress={async () => await GoogleLogin()}>
          Continue With Google
        </Button>
        {Platform.OS === 'ios' && (
          <Button
            style={styles.loginElment}
            icon="apple"
            mode="elevated"
            onPress={async () => await AppleLogin()}>
            Continue With Apple
          </Button>
        )}

        <View style={[styles.orContainer, styles.loginElment]}>
          <Text style={styles.or as any}>or</Text>
        </View>
        <Button
          style={styles.loginElment}
          mode="elevated"
          onPress={() => {
            console.log('create acc');
          }}>
          Create Account
        </Button>
      </View>
    </SafeAreaView>
  );
}

export default Login;
