//DoTogether!
import React, {useEffect} from 'react';
import {SafeAreaView, Text} from 'react-native';
import useStyles from './AppStyle';
import OnBoard from './pages/OnBoard/OnBoard';
function App(): JSX.Element {
  const styles = useStyles();
  return (
    <SafeAreaView style={styles.container}>
      <OnBoard />
    </SafeAreaView>
  );
}

export default App;
