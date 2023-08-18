import React from 'react';
import {useEffect, useState} from 'react';
import {SafeAreaView, useWindowDimensions, Text, View} from 'react-native';
import {User} from '@react-native-google-signin/google-signin';
import useStyles from './LoginStyle';
import {Button} from 'react-native-paper';
import {ActiveUser, AuthService} from '../../Services/AuthService';
import {Platform} from 'react-native';
function Login({navigation}): JSX.Element {
  const {width, height} = useWindowDimensions();
  const authService = new AuthService();
  const styles = useStyles();
  console.log('xxxxx');
  useEffect(() => {
    authService.LoginAgain().then(() => {
      console.log('navigating bro');
      navigation.navigate('OnBoard');
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
          onPress={async () => {
            try {
              await authService.GoogleLogin();
              navigation.navigate('OnBoard');
            } catch {}
          }}>
          Continue With Google
        </Button>
        {Platform.OS === 'ios' && (
          <Button
            style={styles.loginElment}
            icon="apple"
            mode="elevated"
            onPress={async () => await authService.AppleLogin()}>
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
            console.log(ActiveUser.GetActiveUser());
          }}>
          Create Account
        </Button>
      </View>
    </SafeAreaView>
  );
}

export default Login;
