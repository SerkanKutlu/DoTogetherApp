import React, {useState, useEffect} from 'react';
import {
  useWindowDimensions,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Modal,
} from 'react-native';
import {Button, TextInput, IconButton, DataTable} from 'react-native-paper';
import useStyles from './OnBoardStyle';
import {RoomService} from '../../Services/RoomService';
import {Room} from '../../Models/Room';
import {ActiveUser, AuthService} from '../../Services/AuthService';
import {RealTimeService} from '../../Services/RealTimeService';
function OnBoard({navigation}): JSX.Element {
  //#region  States
  const [createRoomModalVisible, setCreateRoomModalVisible] = useState(false);
  const [roomNameInput, setroomNameInput] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [invitesModalVisible, setInvitesModalVisible] = useState(false);
  const [invitesPageNumber, setInvitesPageNumber] = React.useState<number>(0);
  //#endregion
  //#region ConstVariables
  const styles = useStyles();
  const User = ActiveUser.GetActiveUser();
  const itemPerPage = 5;
  const fromInvites = invitesPageNumber * itemPerPage;
  const toInvites = Math.min(
    (invitesPageNumber + 1) * itemPerPage,
    invites.length,
  );
  //#endregion
  //#region  Service
  const roomService = new RoomService();
  const authService = new AuthService();
  const realTimeService = new RealTimeService();
  //#endregion

  useEffect(() => {
    if (User != undefined) {
      console.log('on1');
      realTimeService.OnInvite(User.user.email).on('child_added', newVal => {
        console.log('on');
        const inviteId = newVal.val().InviteId;
        const roomId = newVal.val().RoomId;
        console.log(roomId);
        roomService
          .GetRoomById(roomId)
          .then(room => {
            console.log('under rroom');
            if (room != undefined) {
              console.log('defined');
              console.log(room);
              realTimeService.RemoveReadedInvite(inviteId, User.user.email);
              invites.push({
                InviteId: newVal.val().InviteId,
                InvitedBy: newVal.val().InvitedBy,
                Title: room.Title,
              });
              const newInvites = invites.slice();
              setInvites(newInvites);
            }
          })
          .catch(() => {
            console.log('catch');
            return;
          });
      });
    }

    roomService.GetUserRooms().then(rooms => {
      if (rooms != undefined) {
        setRooms(rooms);
      }
    });
  }, []);
  useEffect(() => {}, [invites]);
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={invitesModalVisible}
        onRequestClose={() => {
          setInvitesModalVisible(false);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <IconButton
              icon="close"
              size={20}
              onPress={() => setInvitesModalVisible(false)}
              style={styles.modalCloseBtn}
            />
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Invited By</DataTable.Title>
                <DataTable.Title>Room Title</DataTable.Title>
              </DataTable.Header>

              {invites.slice(fromInvites, toInvites).map(item => (
                <DataTable.Row key={item.InviteId}>
                  <DataTable.Cell>{item.InvitedBy}</DataTable.Cell>
                  <DataTable.Cell>{item.Title}</DataTable.Cell>
                </DataTable.Row>
              ))}

              <DataTable.Pagination
                page={invitesPageNumber}
                numberOfPages={Math.ceil(invites.length / itemPerPage)}
                onPageChange={page => setInvitesPageNumber(page)}
                label={`${fromInvites + 1}-${toInvites} of ${invites.length}`}
                numberOfItemsPerPage={itemPerPage}
                showFastPaginationControls
              />
            </DataTable>
          </View>
        </View>
      </Modal>
      <View style={styles.navbar}>
        <Button
          icon="account-multiple-plus"
          mode="elevated"
          onPress={() => {
            setInvitesModalVisible(true);
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
