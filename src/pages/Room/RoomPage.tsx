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
  const [activeUsersPageNumber, setActiveUsersPageNumber] = useState<number>(0);
  const [Room, setRoom] = useState(route.params.Room);
  const [isKickedFromRoom, setIsKickedFromRoom] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState({x: 0, y: 0});
  //#endregion
  //#region Constants
  const styles = useStyles();
  const User = ActiveUser.GetActiveUser()?.user;
  const activeUserPerPage = 10;
  const fromActiveUsers = activeUsersPageNumber * activeUserPerPage;
  const toActiveUsers = Math.min(
    (activeUsersPageNumber + 1) * activeUserPerPage,
    activeUsers != undefined ? activeUsers.length : 0,
  );
  const {width, height} = useWindowDimensions();

  //#endregion
  //#region Service
  const realTimeService = new RealTimeService();
  const noteService = new NoteService();
  const activityService = new ActivityService();
  const roomService = new RoomService();
  //#endregion
  function GiveControlClicked(newController: string) {
    roomService.UpdateRoomLockedBy(Room.Id, newController);
  }
  function CloseRoomClicked() {
    Alert.alert(
      'Confirmation', // Title of the alert
      'This room and all notes of it will be deleted. Are you sure ?', // Message of the alert
      [
        {
          text: 'YES', // Button text
          onPress: () => {
            // Code to run when the user presses the button
            roomService.DeleteRoom(Room.Id);
            navigation.navigate('OnBoard');
          },
        },
        {
          text: 'NO', // Button text
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
    //#region SUBSCRIBE TO NOTE CHANNEL
    noteService.OnNoteChangeReal(Room.Id).on('value', newVal => {
      if (Room.LockedBy != User?.email) {
        setPageContent(newVal.toJSON()?.Content);
      }
    });
    //#endregion
    //#region SUBSCRIBE TO ACTIVE CHANNEL
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
        if (!isKickedFromRoom && jsonNewItem?.UserEmail == User.email) {
          setIsKickedFromRoom(true);
          console.log('eyvah odadan atıldım : ' + Platform.OS);
          Alert.alert(
            'Sorry', // Title of the alert
            'The founder removed you out of the room.', // Message of the alert
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
    //#endregion
    //#region Sub to Room changes

    roomService.TrackRoomUpdates(
      newResult => {
        if (
          newResult._data == 'undefined' ||
          newResult == undefined ||
          newResult._data == undefined
        ) {
          Alert.alert('Sorry', 'The founder closed the room', [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('OnBoard');
              },
            },
          ]);
        } else {
          console.log(newResult._data);
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
      activityService.DeleteActiveReal(User?.email!, Room.Id);
    };
    //#endregion
  }, []);

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

                {activeUsers
                  ?.slice(fromActiveUsers, toActiveUsers)
                  .map(item => (
                    <DataTable.Row key={item.Id}>
                      {Room.LockedBy == item.UserEmail ? (
                        <DataTable.Cell
                          style={{flex: 5}}
                          textStyle={{fontWeight: 'bold'}}>
                          {item.UserEmail}
                        </DataTable.Cell>
                      ) : (
                        <DataTable.Cell style={{flex: 5}}>
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
                  page={activeUsersPageNumber}
                  numberOfPages={Math.ceil(
                    activeUsers == undefined
                      ? 0
                      : activeUsers.length / activeUserPerPage,
                  )}
                  onPageChange={page => setActiveUsersPageNumber(page)}
                  label={`${fromActiveUsers + 1}-${toActiveUsers} of ${
                    activeUsers == undefined ? 0 : activeUsers.length
                  }`}
                  numberOfItemsPerPage={activeUserPerPage}
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
            {activeUsers == undefined ? 0 : activeUsers.length}
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
