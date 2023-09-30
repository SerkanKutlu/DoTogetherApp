import {useWindowDimensions, StyleSheet} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
// marginTop : "100@s"
export default function useStyles() {
  const {width, height} = useWindowDimensions();

  return ScaledSheet.create({
    container: {
      flex: 1,
    },
    loadingIcon: {
      position: 'absolute',
      bottom: height / 2,
      right: width / 2,
    },
    navbar: {
      flexDirection: 'row',
      marginHorizontal: '20@s',
      marginVertical: '20@s',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    invitesHeader: {
      fontWeight: 'bold',
      fontSize: '25@s',
      color: '#4A4A4A',
    },
  });
}
