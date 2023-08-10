import React from 'react';
import {SafeAreaView, useWindowDimensions, Text, View} from 'react-native';

import useStyles from './LoginStyle';
import {Button} from 'react-native-paper';
function Login(): JSX.Element {
  const {width, height} = useWindowDimensions();
  const styles = useStyles();

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
          onPress={() => {
            console.log('Login google');
          }}>
          Continue With Google
        </Button>
        <Button
          style={styles.loginElment}
          icon="apple"
          mode="elevated"
          onPress={() => {
            console.log('Login Apple');
          }}>
          Continue With Apple
        </Button>
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
