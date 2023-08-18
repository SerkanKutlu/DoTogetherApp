import React, {useState, useEffect} from 'react';
import {
  useWindowDimensions,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Modal,
} from 'react-native';
import {Button, TextInput, IconButton} from 'react-native-paper';
import useStyles from './OnBoardStyle';
import {RoomService} from '../../Services/RoomService';
import {Room} from '../../Models/Room';
function OnBoard(): JSX.Element {
  const [createRoomModalVisible, setCreateRoomModalVisible] = useState(false);
  const [roomNameInput, setroomNameInput] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const styles = useStyles();
  const roomService = new RoomService();

  useEffect(() => {
    roomService.GetUserRooms().then(rooms => {
      if (rooms != undefined) {
        setRooms(rooms);
      }
    });
  }, []);
  function CreateRoomButtonClicked() {
    setCreateRoomModalVisible(true);
  }
  async function ModalCreateButtonClicked() {
    setCreateRoomModalVisible(false);
    await roomService.CreateRoom(roomNameInput);
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
            <IconButton
              icon="close"
              size={20}
              onPress={() => setCreateRoomModalVisible(false)}
              style={styles.modalCloseBtn}
            />
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
          {rooms.map(room => {
            return (
              <View id={room.Id} style={styles.roomListEach}>
                <View style={styles.roomListEachDetailBtnContainer}>
                  <IconButton
                    icon="arrow-left-thin"
                    size={30}
                    onPress={() => console.log('Details pressed')}
                    style={styles.roomListEachDeatilsBtn}
                  />
                </View>
                <TouchableOpacity style={styles.roomListEachTouchable}>
                  <Text style={styles.roomListEachTitle as any}>
                    {room.Title}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </View>
      <View style={styles.footer}>
        <Text></Text>
      </View>
    </View>
  );
}
export default OnBoard;
