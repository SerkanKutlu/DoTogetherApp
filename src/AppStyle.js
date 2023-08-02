import { useWindowDimensions, StyleSheet } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

export default function useStyles(){
    const {width,height} = useWindowDimensions();

    return ScaledSheet.create({
        container : {
            flex : 1,
            backgroundColor : '#F5F5F5'
        }
    })
}