import {useWindowDimensions, StyleSheet} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
// marginTop : "100@s"
export default function useStyles() {
  const {width, height} = useWindowDimensions();

  return ScaledSheet.create({
    container: {
      flex: 1,
    },
    navbar: {
      flexDirection: 'row',
      marginHorizontal: '20@s',
      marginVertical: '20@s',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
    },
    modalView: {
      margin: 20,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 22,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    userEmailInput: {
      marginTop: '25@s',
      width: '200@s',
      height: '40@s',
    },
    modalButton: {
      marginTop: '20@s',
    },
    modalCloseBtn: {
      position: 'absolute',
      right: 0,
    },
    TextAreaContainer: {},
  });
}
