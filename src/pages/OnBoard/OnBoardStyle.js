import { useWindowDimensions, StyleSheet } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
// marginTop : "100@s"
export default function useStyles(){
    const {width,height} = useWindowDimensions();

    return ScaledSheet.create({
        container : {
            flex : 1,
        },
        navbar:{
            flex:1,
            flexDirection:'row',
            justifyContent:'space-between',
            alignItems : 'center',
            marginHorizontal :'20@s'
        },
        roomList:{
            flex:8
        },
        footer:{
            flex :1,
            justifyContent:'flex-end'
        },
        roomListHeaderContainer:{
            height: '10%'
        },
        roomListHeader:{
            fontWeight:'bold',
            fontSize : '30@s',
            color :'#4A4A4A',
            margin : '10@s',
        },
        roomListScrool:{
            height: '85%'
        },
        roomListEach:{
            height:'50@s',
            margin : '10@s',
            flexDirection:'row',
            justifyContent :'space-between',
            alignItems: 'center'
        },
        roomListEachTitle:{
            fontWeight : 'bold'
        },
        roomListEachTouchable:{
            height:'100%',
            justifyContent:'center'
        }
    })
}