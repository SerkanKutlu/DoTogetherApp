import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput as TextInputReact,
  Modal,
  useWindowDimensions,
  Text,
  TouchableOpacity,
  Pressable,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  BackHandler,
} from 'react-native';
import {
  Button,
  TextInput,
  IconButton,
  DataTable,
  List,
  PaperProvider,
  Menu,
  Divider,
} from 'react-native-paper';
import useStyles from './RoomPageStyle';
import {RealTimeService} from '../../Services/RealTimeService';
import {ActiveUser} from '../../Services/AuthService';
import {NoteService} from '../../Services/NoteService';
import {ActivityService} from '../../Services/ActivityService';
import {RoomService} from '../../Services/RoomService';
function RoomPage({navigation, route}): JSX.Element {
  //#region States
  const [inviteRoomVisible, setInviteRoomVisible] = useState(false);
  const [activeUsersVisible, setActiveUsersVisible] = useState(false);
  const [userOptionsModalVisible, setUserOptionsModalVisible] = useState(false);
  const [choosenUserOptions, setChoosenUserOptions] = useState('');
  const [userEmailInput, setUserEmailInput] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [Room, setRoom] = useState(route.params.Room);
  const [isKickedFromRoom, setIsKickedFromRoom] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState({x: 0, y: 0});
  const [isRoomDeleted, setIsRoomDeleted] = useState(false);
  //#endregion
  //#region Constants
  const styles = useStyles();
  const User = ActiveUser.GetActiveUser()?.user;

  const {width, height} = useWindowDimensions();

  //#endregion
  //#region Services
  const realTimeService = new RealTimeService();
  const noteService = new NoteService();
  const activityService = new ActivityService();
  const roomService = new RoomService();
  //#endregion
  //#region Paginations
  const [usersPageNumber, setUsersPageNumber] = useState<number>(0);
  const userPerPage = 10;
  const fromUsers = usersPageNumber * userPerPage;
  const toUsers = Math.min(
    (usersPageNumber + 1) * userPerPage,
    users != undefined ? users.length : 0,
  );
  //#endregion
  function GiveControlClicked(newController: string) {
    roomService.UpdateRoomLockedBy(Room.Id, newController);
  }
  function CloseRoomClicked() {
    Alert.alert(
      'Confirmation',
      'This room and all notes of it will be deleted. Are you sure ?',
      [
        {
          text: 'YES',
          onPress: () => {
            setIsRoomDeleted(true);
            roomService.DeleteRoom(Room.Id).then(() => {
              navigation.navigate('OnBoard');
            });
          },
        },
        {
          text: 'NO',
        },
      ],
    );
  }
  const [visible, setVisible] = React.useState(false);

  function OpenMenu(event) {
    event.target.measure((x, y, width, height, pageX, pageY) => {
      setAnchorPosition({x: pageX, y: pageY + height});
      setVisible(true);
    });
  }

  const closeMenu = () => setVisible(false);
  function RemoveFromRoomClicked(removedEmail: string) {
    activityService.DeleteActiveReal(removedEmail, Room.Id);
  }
  useEffect(() => {
    //Get ALL Users
    roomService.GetRoomUsers(Room.Id).then(us => {
      if (us != undefined) {
        setUsers(prev => {
          return us;
        });
        activityService.OnActivityChangeReal(Room.Id).on('child_added', e => {
          var jsonNewItem = e.toJSON();
          setActiveUsers(prevActiveUsers => {
            // Use the previous state to ensure you have the latest data
            var result = prevActiveUsers.find(au => au.Id == jsonNewItem?.Id);
            if (result == undefined) {
              if (prevActiveUsers.length == 0 && Room.LockedBy == '') {
                roomService.UpdateRoomLockedBy(Room.Id, jsonNewItem?.UserEmail);
                Room.LockedBy = jsonNewItem?.UserEmail;
              }
              return [...prevActiveUsers, jsonNewItem];
            }
            return prevActiveUsers;
          });
        });

        activityService.OnActivityChangeReal(Room.Id).on('child_removed', e => {
          var jsonNewItem = e.toJSON();
          setActiveUsers(prevActiveUsers => {
            // Use the previous state to ensure you have the latest data
            var result = prevActiveUsers.filter(au => au.Id != jsonNewItem?.Id);
            if (
              !isKickedFromRoom &&
              jsonNewItem?.UserEmail == User.email &&
              !isRoomDeleted
            ) {
              setIsKickedFromRoom(true);
              Alert.alert(
                'Sorry', // Title of the alert
                'The founder removed you out of the room or room is deleted.', // Message of the alert
                [
                  {
                    text: 'OK', // Button text
                    onPress: () => {
                      // Code to run when the user presses the button
                      roomService.DeleteUserFromRoomUser(Room.Id, User?.id);
                      navigation.navigate('OnBoard');
                    },
                  },
                ],
              );
            }
            if (jsonNewItem?.UserEmail == Room.LockedBy) {
              // Kitli olan kişi çıktı
              if (result.length == 0) {
                Room.LockedBy = '';
                roomService.UpdateRoomLockedBy(Room.Id, Room.LockedBy);
              } else {
                Room.LockedBy = result[0].UserEmail;
                roomService.UpdateRoomLockedBy(Room.Id, Room.LockedBy);
              }
            }
            return result;
          });
        });
      }
    });
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.navigate('OnBoard');
        return true;
      },
    );
    //#region SUBSCRIBE TO ACCEPTEDINVITES CHANNEL
    realTimeService.OnInviteAccepttedChanged(Room.Id).on('child_added', e => {
      roomService.GetRoomUsers(Room.Id).then(us => {
        if (us != undefined) {
          setUsers(us);
        }
      });
    });
    //#endregion
    //#region SUBSCRIBE TO NOTE CHANNEL
    noteService.OnNoteChangeReal(Room.Id).on('value', newVal => {
      if (Room.LockedBy != User?.email) {
        setPageContent(newVal.toJSON()?.Content);
      }
    });
    //#endregion
    //#region SUBSCRIBE TO ACTIVE CHANNEL

    //#endregion
    //#region Sub to Room changes

    roomService.TrackRoomUpdates(
      newResult => {
        if (
          newResult._data == 'undefined' ||
          newResult == undefined ||
          newResult._data == undefined
        ) {
          if (Room.CreatedUserEmail == User?.email) {
            navigation.navigate('OnBoard');
          } else {
            Alert.alert(
              'Sorry',
              'The founder removed you out of the room or room is deleted.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.navigate('OnBoard');
                  },
                },
              ],
            );
          }
        } else {
          Room.LockedBy = newResult._data.LockedBy;
          let newRoom = {...Room};
          setRoom(newRoom);
        }
      },
      null,
      Room.Id,
    );

    //#endregion
    //#region MAKE USER ACTIVE AT RELATED ROOM IF NOT EXIST
    if (User != undefined) {
      activityService.ReadActivesOnceReal(Room.Id).then(actives => {
        var isRegistered = false;
        actives.forEach(eachActive => {
          if (eachActive?.toJSON()?.UserEmail == User.email) {
            isRegistered = true;
          }
        });
        if (!isRegistered) {
          activityService.MakeActiveReal(User.email, Room.Id);
        }
      });
    }
    //#endregion
    //#region Return
    return () => {
      activityService.OnActivityChangeReal(Room.Id).off('child_added');
      activityService.OnActivityChangeReal(Room.Id).off('child_removed');
      realTimeService.OnInviteAccepttedChanged(Room.Id).off('child_added');
      noteService.OnNoteChangeReal(Room.Id).off('value');
      activityService.DeleteActiveReal(User?.email!, Room.Id);
      backHandler.remove();
    };
    //#endregion
  }, []);

  useEffect(() => {
    console.log('activeusers efftectede +  ' + Platform.OS);
    console.log(activeUsers);
    let updatedUsers = [...users];
    for (let j = 0; j < updatedUsers.length; j++) {
      for (let i = 0; i < activeUsers.length; i++) {
        if (updatedUsers[j].UserEmail == activeUsers[i].UserEmail) {
          let updatedUsers = [...users];
          updatedUsers[j].IsOnline = true;
          break;
        } else {
          updatedUsers[j].IsOnline = false;
        }
      }
    }
    setUsers(updatedUsers);
    console.log('for bitti updated users' + Platform.OS);
    console.log(updatedUsers);
    console.log('for bitti  users' + Platform.OS);
    console.log(users);
  }, [activeUsers]);

  function compareUsers(a, b) {
    if (a.IsOnline === b.IsOnline) {
      // If IsOnline is the same, compare by UserEmail
      return a.UserEmail.localeCompare(b.UserEmail);
    } else {
      // Sort by IsOnline in descending order (true comes before false)
      return b.IsOnline - a.IsOnline;
    }
  }
  useEffect(() => {
    console.log('users efftectede +  ' + Platform.OS);
    users.sort(compareUsers);
    console.log(users);
  }, [users]);
  function UpdatePageContent(newVal: any) {
    if (Room.LockedBy == User?.email) noteService.SaveNoteReal(newVal, Room.Id);
  }

  function InviteButtonClicked() {
    setInviteRoomVisible(true);
  }
  function ModalInviteButtonClicked() {
    if (User != undefined) {
      realTimeService.SendInvite(
        User.email.toLocaleLowerCase(),
        userEmailInput.toLocaleLowerCase(),
        Room.Id,
      );
      setInviteRoomVisible(false);
    }
  }
  function GoBackButtonPressed() {
    navigation.navigate('OnBoard');
  }

  useEffect(() => {}, [users]);
  function ShowActiveUsers() {
    setActiveUsersVisible(true);
  }
  return (
    <PaperProvider>
      <View style={styles.container}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={inviteRoomVisible}
          onRequestClose={() => {
            setInviteRoomVisible(!inviteRoomVisible);
          }}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => setInviteRoomVisible(false)}
                  style={styles.modalCloseBtn}
                />
                <TextInput
                  label="User Email"
                  value={userEmailInput}
                  onChangeText={text => setUserEmailInput(text)}
                  placeholder="Email..."
                  style={styles.userEmailInput as any}
                />
                <Button
                  style={styles.modalButton}
                  onPress={async () => await ModalInviteButtonClicked()}>
                  Send
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={activeUsersVisible}
          onRequestClose={() => {
            setActiveUsersVisible(false);
          }}
          style={{width: '100%'}}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={userOptionsModalVisible}
            onRequestClose={() => {
              setUserOptionsModalVisible(false);
            }}
            style={{width: '100%'}}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => setUserOptionsModalVisible(false)}
                  style={styles.modalCloseBtn}
                />
                <View>
                  <List.Subheader>{choosenUserOptions}</List.Subheader>
                  {Room.LockedBy == User?.email ? (
                    <List.Item
                      onPressOut={() =>
                        Alert.alert(
                          'Confirm',
                          'Are you sure to give control to another person?', // Message of the alert
                          [
                            {
                              text: 'YES',
                              onPress: () => {
                                GiveControlClicked(choosenUserOptions);
                                setUserOptionsModalVisible(false);
                              },
                            },
                            {
                              text: 'NO',
                              onPress: () => {},
                            },
                          ],
                        )
                      }
                      title="Give Control"
                      left={props => (
                        <List.Icon
                          {...props}
                          icon="circle-small"
                          style={{marginRight: 0, paddingRight: 0}}
                        />
                      )}
                      style={{width: '90%'}}
                    />
                  ) : (
                    ''
                  )}
                  {Room.CreatedUserEmail == User?.email ? (
                    <List.Item
                      onPressOut={() =>
                        Alert.alert(
                          'Confirm',
                          'Are you sure to remove this person from the room ?', // Message of the alert
                          [
                            {
                              text: 'YES',
                              onPress: () => {
                                RemoveFromRoomClicked(choosenUserOptions);
                                setUserOptionsModalVisible(false);
                              },
                            },
                            {
                              text: 'NO',
                              onPress: () => {},
                            },
                          ],
                        )
                      }
                      title="Remove From The Room"
                      left={props => (
                        <List.Icon
                          {...props}
                          icon="circle-small"
                          style={{marginRight: 0, paddingRight: 0}}
                        />
                      )}
                      style={{width: '90%'}}
                    />
                  ) : (
                    ''
                  )}
                </View>
              </View>
            </View>
          </Modal>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <IconButton
                icon="close"
                size={20}
                onPress={() => setActiveUsersVisible(false)}
                style={styles.modalCloseBtn}
              />
              <DataTable style={{flex: 1, width: '100%'}}>
                <DataTable.Header>
                  <DataTable.Title style={{flex: 5}}>User</DataTable.Title>
                  <DataTable.Title style={{flex: 1}}> </DataTable.Title>
                </DataTable.Header>
                {users?.slice(fromUsers, toUsers).map(item => (
                  <DataTable.Row key={item.Id}>
                    {Room.LockedBy == item.UserEmail ? (
                      <DataTable.Cell
                        style={{flex: 5}}
                        textStyle={{
                          fontWeight: 'bold',
                          color: item.IsOnline ? 'green' : 'black',
                        }}>
                        {item.UserEmail}
                      </DataTable.Cell>
                    ) : (
                      <DataTable.Cell
                        style={{flex: 5}}
                        textStyle={{
                          color: item.IsOnline ? 'green' : 'black',
                        }}>
                        {item.UserEmail}
                      </DataTable.Cell>
                    )}

                    <DataTable.Cell style={{flex: 1}}>
                      {item.UserEmail != User?.email ? (
                        <IconButton
                          size={width / 25}
                          icon="cog"
                          onPress={() => {
                            setUserOptionsModalVisible(true);
                            setChoosenUserOptions(item.UserEmail);
                          }}
                        />
                      ) : (
                        ''
                      )}
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}

                <DataTable.Pagination
                  page={usersPageNumber}
                  numberOfPages={Math.ceil(
                    users == undefined ? 0 : users.length / userPerPage,
                  )}
                  onPageChange={page => setUsersPageNumber(page)}
                  label={`${fromUsers + 1}-${toUsers} of ${
                    users == undefined ? 0 : users.length
                  }`}
                  numberOfItemsPerPage={userPerPage}
                  showFastPaginationControls
                />
              </DataTable>
            </View>
          </View>
        </Modal>

        <View style={styles.navbar}>
          <IconButton
            icon="arrow-left-thin"
            size={30}
            onPress={() => GoBackButtonPressed()}
          />
          <Button icon="account" onPress={() => ShowActiveUsers()}>
            {users == undefined ? 0 : users.length}
          </Button>

          <View>
            <Menu
              style={{
                ...(Platform.OS === 'android'
                  ? {position: 'absolute', top: anchorPosition.y + 5}
                  : {}),
              }}
              visible={visible}
              onDismiss={closeMenu}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={event => OpenMenu(event)}
                />
              }>
              <Menu.Item
                onPress={() => {
                  InviteButtonClicked();
                }}
                title="Invite"
                leadingIcon={'account-plus'}
              />
              <Divider />
              {Room.CreatedUserEmail == User?.email ? (
                <Menu.Item
                  onPress={() => {
                    CloseRoomClicked();
                  }}
                  title="Close Room"
                  leadingIcon={'delete'}
                />
              ) : (
                ''
              )}
            </Menu>
          </View>
        </View>

        <View style={styles.TextAreaContainer}>
          <Text style={styles.roomListHeader as any}>{Room.Title}</Text>
          <TextInputReact
            multiline
            editable={Room.LockedBy == User?.email ? true : false}
            placeholder="Start Note Together"
            value={pageContent}
            onChangeText={val => {
              UpdatePageContent(val);
              setPageContent(val);
            }}
          />
        </View>
      </View>
    </PaperProvider>
  );
}
export default RoomPage;
