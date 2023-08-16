import React from 'react';
import {useState} from 'react';
import {
  useWindowDimensions,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Modal,
} from 'react-native';
import {Button, TextInput} from 'react-native-paper';
import useStyles from './OnBoardStyle';
import {transparent} from 'react-native-paper/lib/typescript/styles/themes/v2/colors';
function OnBoard(): JSX.Element {
  const {width, height} = useWindowDimensions();
  const [createRoomModalVisible, setCreateRoomModalVisible] = useState(false);
  const styles = useStyles();
  const [roomNameInput, setroomNameInput] = React.useState('');
  function CreateRoomButtonClicked() {
    setCreateRoomModalVisible(true);
  }
  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={createRoomModalVisible}
        onRequestClose={() => {
          setCreateRoomModalVisible(!createRoomModalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              label="Room Name"
              value={roomNameInput}
              onChangeText={text => setroomNameInput(text)}
              placeholder="Room Name..."
              style={styles.roomNameInput as any}
            />
            <Button
              icon="plus"
              mode="elevated"
              style={styles.modalButton}
              onPress={() => setCreateRoomModalVisible(false)}>
              Create
            </Button>
          </View>
        </View>
      </Modal>
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
          onPress={() => CreateRoomButtonClicked()}>
          Create
        </Button>
      </View>
      <View style={styles.roomList}>
        <View style={styles.roomListHeaderContainer}>
          <Text style={styles.roomListHeader as any}>Room List</Text>
        </View>
        <ScrollView style={styles.roomListScrool}>
          <View style={styles.roomListEach}>
            <TouchableOpacity style={styles.roomListEachTouchable}>
              <View>
                <Text style={styles.roomListEachTitle as any}>
                  With My Parent
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity></TouchableOpacity>
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
