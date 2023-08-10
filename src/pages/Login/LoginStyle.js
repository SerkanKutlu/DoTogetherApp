import {useWindowDimensions, StyleSheet} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
// marginTop : "100@s"
export default function useStyles() {
  const {width, height} = useWindowDimensions();
  return ScaledSheet.create({
    loginContainer: {
      marginTop: height / 7,
    },
    headerArea: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: '50@s',
    },
    header: {
      fontWeight: 'bold',
      fontSize: '30@s',
      color: 'black',
      margin: '10@s',
    },
    loginOptionsContainer: {
      padding: '30@s',
    },
    orContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    or: {
      fontWeight: 'bold',
    },
    loginElment: {
      marginBottom: '10@s',
    },
  });
}
