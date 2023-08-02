import React from 'react';
import {
  useWindowDimensions,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
} from 'react-native';
import {Button} from 'react-native-paper';
import useStyles from './OnBoardStyle';
import Icon from 'react-native-vector-icons/MaterialIcons';
function OnBoard(): JSX.Element {
  const {width, height} = useWindowDimensions();
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <Button
          icon="account-multiple-plus"
          mode="elevated"
          onPress={() => {
            console.log('join');
          }}>
          Join
        </Button>
        <Button
          icon="plus"
          mode="elevated"
          onPress={() => console.log('Pressed')}>
          Create Fuck Me
        </Button>
      </View>
      <View style={styles.roomList}>
        <View style={styles.roomListHeaderContainer}>
          <Text style={styles.roomListHeader}>Room List</Text>
        </View>
        <ScrollView style={styles.roomListScrool}>
          <View style={styles.roomListEach}>
            <TouchableOpacity style={styles.roomListEachTouchable}>
              <View>
                <Text style={styles.roomListEachTitle}>With My Parent</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="close" size={width * 0.07} color="#4A4A4A" />
            </TouchableOpacity>
          </View>
          <View style={styles.roomListEach}>
            <TouchableOpacity style={styles.roomListEachTouchable}>
              <View>
                <Text style={styles.roomListEachTitle}>With My Parent</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="close" size={width * 0.07} color="#4A4A4A" />
            </TouchableOpacity>
          </View>
          <View style={styles.roomListEach}>
            <TouchableOpacity style={styles.roomListEachTouchable}>
              <View>
                <Text style={styles.roomListEachTitle}>With My Parent</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="close" size={width * 0.07} color="#4A4A4A" />
            </TouchableOpacity>
          </View>
          <View style={styles.roomListEach}>
            <TouchableOpacity style={styles.roomListEachTouchable}>
              <View>
                <Text style={styles.roomListEachTitle}>With My Parent</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="close" size={width * 0.07} color="#4A4A4A" />
            </TouchableOpacity>
          </View>
          <View style={styles.roomListEach}>
            <TouchableOpacity style={styles.roomListEachTouchable}>
              <View>
                <Text style={styles.roomListEachTitle}>With My Parent</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="close" size={width * 0.07} color="#4A4A4A" />
            </TouchableOpacity>
          </View>
          <View style={styles.roomListEach}>
            <TouchableOpacity style={styles.roomListEachTouchable}>
              <View>
                <Text style={styles.roomListEachTitle}>With My Parent</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="close" size={width * 0.07} color="#4A4A4A" />
            </TouchableOpacity>
          </View>
          <View style={styles.roomListEach}>
            <TouchableOpacity style={styles.roomListEachTouchable}>
              <View>
                <Text style={styles.roomListEachTitle}>With My Parent</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="close" size={width * 0.07} color="#4A4A4A" />
            </TouchableOpacity>
          </View>
          <View style={styles.roomListEach}>
            <TouchableOpacity style={styles.roomListEachTouchable}>
              <View>
                <Text style={styles.roomListEachTitle}>With My Parent</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="close" size={width * 0.07} color="#4A4A4A" />
            </TouchableOpacity>
          </View>
          <View style={styles.roomListEach}>
            <TouchableOpacity style={styles.roomListEachTouchable}>
              <View>
                <Text style={styles.roomListEachTitle}>With My Parent</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="close" size={width * 0.07} color="#4A4A4A" />
            </TouchableOpacity>
          </View>
          <View style={styles.roomListEach}>
            <TouchableOpacity style={styles.roomListEachTouchable}>
              <View>
                <Text style={styles.roomListEachTitle}>With My Parent</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="close" size={width * 0.07} color="#4A4A4A" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      <View style={styles.footer}>
        <Text></Text>
      </View>
    </View>
  );
}
export default OnBoard;
