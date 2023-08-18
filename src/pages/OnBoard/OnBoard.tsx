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
import {ActiveUser, AuthService} from '../../Services/AuthService';
import {RealTimeService} from '../../Services/RealTimeService';
function OnBoard({navigation}): JSX.Element {
  const [createRoomModalVisible, setCreateRoomModalVisible] = useState(false);
  const [roomNameInput, setroomNameInput] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const styles = useStyles();
  const User = ActiveUser.GetActiveUser();
  console.log('xx');
  //#region  Service
  const roomService = new RoomService();
  const authService = new AuthService();
  const realTimeService = new RealTimeService();
  //#endregion

  useEffect(() => {
    console.log('use effect onboard');
    console.log(invites);
    if (User != undefined) {
      realTimeService.OnInvite(User.user.email).on('child_added', newVal => {
        const inviteId = newVal.val().InviteId;
        realTimeService.RemoveReadedInvite(inviteId, User.user.email);
        invites.push(newVal.val());
        const newInvites = invites.slice();
        setInvites(newInvites);
        console.log('invite geldi yeni invites: ');
        console.log(invites);
      });
    }

    roomService.GetUserRooms().then(rooms => {
      if (rooms != undefined) {
        setRooms(rooms);
      }
    });
  }, []);
  useEffect(() => {
    console.log('invites changed');
    console.log(invites);
  }, [invites]);
  function CreateRoomButtonClicked() {
    setCreateRoomModalVisible(true);
  }
  async function ModalCreateButtonClicked() {
    setCreateRoomModalVisible(false);
    await roomService.CreateRoom(roomNameInput);
  }
  function RoomTitlePressed(room: Room) {
    navigation.navigate('RoomPage', {Room: room});
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
          {invites.length > 0 ? `Join (${invites.length})` : 'Join (0)'}
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
              <View key={room.Id} style={styles.roomListEach}>
                <View style={styles.roomListEachDetailBtnContainer}>
                  <IconButton
                    icon="arrow-left-thin"
                    size={30}
                    onPress={() => RoomTitlePressed(room)}
                    style={styles.roomListEachDeatilsBtn}
                  />
                </View>
                <TouchableOpacity
                  style={styles.roomListEachTouchable}
                  onPress={() => RoomTitlePressed(room)}>
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
