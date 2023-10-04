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
    loadingIconAtModal: {
      marginTop: '10@s',
    },
    navbar: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: '20@s',
    },
    roomList: {
      flex: 8,
    },
    footer: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    roomListHeaderContainer: {
      height: '10%',
    },
    roomListHeader: {
      fontWeight: 'bold',
      fontSize: '30@s',
      color: '#4A4A4A',
      margin: '10@s',
    },
    roomListScrool: {
      height: '85%',
    },
    roomListEach: {
      height: '50@s',
      margin: '10@s',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginLeft: '20@s',
    },
    roomListEachTitle: {
      fontWeight: 'bold',
    },
    roomListEachTouchable: {
      height: '100%',
      justifyContent: 'center',
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
    roomNameInput: {
      marginTop: '25@s',
      width: '200@s',
      height: '40@s',
    },
    modalButton: {
      marginTop: '20@s',
    },
    roomListEachDetailBtnContainer: {},
    roomListEachDeatilsBtn: {
      transform: [{rotate: '180deg'}],
    },
    modalCloseBtn: {
      position: 'absolute',
      right: 0,
    },
  });
}
