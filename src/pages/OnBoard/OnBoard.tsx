import React, {useState, useEffect} from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {Button, TextInput} from 'react-native-paper';
import useStyles from './OnBoardStyle';
import {RoomService} from '../../Services/RoomService';
function OnBoard(): JSX.Element {
  const [createRoomModalVisible, setCreateRoomModalVisible] = useState(false);
  const [isModalIndicatorVisible, setIsModalIndicatorVisible] = useState(false);
  const styles = useStyles();
  const [roomNameInput, setroomNameInput] = React.useState('');
  const roomService = new RoomService();
  function CreateRoomButtonClicked() {
    setCreateRoomModalVisible(true);
  }
  async function ModalCreateButtonClicked() {
    setIsModalIndicatorVisible(true);
    roomService.CreateRoom(roomNameInput).then(() => {
      setCreateRoomModalVisible(false);
      setIsModalIndicatorVisible(false);
    });
  }
  useEffect(() => {
    roomService.GetUserRooms().then(rooms => {
      if (rooms != undefined) {
      }
    });
  }, []);
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
              onPress={async () => await ModalCreateButtonClicked()}>
              Create
            </Button>
            <ActivityIndicator
              animating={isModalIndicatorVisible}
              size="large"
              style={{marginTop: 10}}
            />
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
