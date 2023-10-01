import React, {useState, useEffect} from 'react';
import {
  useWindowDimensions,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  Platform,
} from 'react-native';
import {
  Button,
  TextInput,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import useStyles from './OnBoardStyle';
import {RoomService} from '../../Services/RoomService';
import {Room} from '../../Models/Room';
import {ActiveUser, AuthService} from '../../Services/AuthService';
import {RealTimeService} from '../../Services/RealTimeService';
import {ActivityService} from '../../Services/ActivityService';
function OnBoard({navigation}): JSX.Element {
  //#region  States
  const [createRoomModalVisible, setCreateRoomModalVisible] = useState(false);
  const [roomNameInput, setroomNameInput] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [isLoadingVisible, setIsLoadingVisible] = useState(false);
  const [isRoomNameErrorMessageDisabled, setIsRoomNameErrorMessageDisabled] =
    useState('none');
  //#endregion
  //#region ConstVariables
  const styles = useStyles();
  const User = ActiveUser.GetActiveUser();
  const {width, height} = useWindowDimensions();
  //#endregion
  //#region  Service
  const roomService = new RoomService();
  const authService = new AuthService();
  const realTimeService = new RealTimeService();
  const activityService = new ActivityService();
  //#endregion

  useEffect(() => {
    navigation.addListener('focus', async () => {
      setIsLoadingVisible(true);
      await SetRooms();
      await RefreshInvites();
      setIsLoadingVisible(false);
    });

    if (User != undefined) {
      realTimeService.OnInvite(User.user.email).on('child_added', newVal => {
        const inviteId = newVal.val().InviteId;
        const roomId = newVal.val().RoomId;
        roomService
          .GetRoomById(roomId)
          .then(room => {
            if (room != undefined) {
              realTimeService.RemoveReadedInvite(inviteId, User.user.email);

              roomService
                .CreateRoomInvite({
                  InviteId: newVal.val().InviteId,
                  InvitedBy: newVal.val().InvitedBy,
                  Title: room.Title,
                  RoomId: room.Id,
                  InvitedId: User.user.id,
                })
                .then(async () => {
                  await RefreshInvites();
                })
                .catch(() => {
                  console.log('invite olusmaadi');
                });
            }
          })
          .catch(() => {
            console.log('catch');
            return;
          });
      });
    } else {
      navigation.navigate('Login');
    }
  }, []);
  async function SetRooms() {
    var rooms = await roomService.GetUserRooms();
    if (rooms != undefined) {
      setRooms(rooms);
    }
  }
  async function RefreshInvites() {
    try {
      var invitesFromDb = await roomService.GetRoomInvites();
      if (invitesFromDb != undefined) {
        setInvites(invitesFromDb);
      }
    } catch (error) {
      console.log('refresh olmadi');
    }
  }
  function CreateRoomButtonClicked() {
    setCreateRoomModalVisible(true);
  }
  useEffect(() => {
    const regex = /[a-zA-Z]/;
    if (roomNameInput.length > 0 && regex.test(roomNameInput)) {
      setIsRoomNameErrorMessageDisabled('none');
    } else {
      setIsRoomNameErrorMessageDisabled('flex');
    }
    if (roomNameInput.length == 0) setIsRoomNameErrorMessageDisabled('none');
  }, [roomNameInput]);
  async function ModalCreateButtonClicked() {
    const regex = /[a-zA-Z]/;
    if (roomNameInput.length > 0 && regex.test(roomNameInput)) {
      setIsLoadingVisible(true);
      setCreateRoomModalVisible(false);
      await roomService.CreateRoom(roomNameInput);
      await SetRooms();
      setIsLoadingVisible(false);
    }
  }
  function RoomTitlePressed(room: Room) {
    setIsLoadingVisible(true);
    roomService.GetRoomById(room.Id).then(roomupdated => {
      navigation.navigate('RoomPage', {Room: roomupdated});
      setIsLoadingVisible(false);
    });
  }
  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator
        animating={isLoadingVisible}
        style={styles.loadingIcon}
        size={'small'}
      />
      <TouchableWithoutFeedback
        onPress={() => console.log('x')}
        style={{width: '100%', height: '100%'}}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={createRoomModalVisible}
          onRequestClose={() => {
            setCreateRoomModalVisible(!createRoomModalVisible);
          }}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
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
                <Text
                  style={{
                    color: 'red',
                    marginTop: 10,
                    display: isRoomNameErrorMessageDisabled as any,
                  }}>
                  Invalid Room Name
                </Text>
                <Button
                  icon="plus"
                  mode="elevated"
                  style={styles.modalButton}
                  onPress={async () => await ModalCreateButtonClicked()}>
                  Create
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </TouchableWithoutFeedback>
      <View style={styles.navbar}>
        <Button
          icon="account-multiple-plus"
          mode="elevated"
          onPress={() => {
            navigation.navigate('Invites', {Invites: invites});
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
    </SafeAreaView>
  );
}
export default OnBoard;
