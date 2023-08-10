//DoTogether!
import React, {useEffect} from 'react';
import {SafeAreaView, Text} from 'react-native';
import useStyles from './AppStyle';
import OnBoard from './pages/OnBoard/OnBoard';
import Login from './pages/Login/Login';
function App(): JSX.Element {
  const styles = useStyles();
  return (
    <SafeAreaView style={styles.container}>
      <Login />
    </SafeAreaView>
  );
}

export default App;
