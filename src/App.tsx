//DoTogether!
import React, {useEffect} from 'react';
import {SafeAreaView, Text} from 'react-native';
import {Button} from 'react-native-paper';
function App(): JSX.Element {
  return (
    <SafeAreaView>
      <Text>Serkan</Text>
      <Button mode="contained" onPress={() => console.log('Pressed')}>
        Press me
      </Button>
    </SafeAreaView>
  );
}

export default App;
