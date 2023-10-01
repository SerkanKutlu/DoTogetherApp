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
  ActivityIndicator,
} from 'react-native-paper';
import useStyles from './RoomPageStyle';
import {RealTimeService} from '../../Services/RealTimeService';
import {ActiveUser} from '../../Services/AuthService';
import {NoteService} from '../../Services/NoteService';
import {ActivityService} from '../../Services/ActivityService';
import {RoomService} from '../../Services/RoomService';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import '../../assets/i18n';
function RoomPage({navigation, route}): JSX.Element {
  //#region States
  const [inviteRoomVisible, setInviteRoomVisible] = useState(false);
  const [activeUsersVisible, setActiveUsersVisible] = useState(false);
  const [userOptionsModalVisible, setUserOptionsModalVisible] = useState(false);
  const [choosenUserOptions, setChoosenUserOptions] = useState<any>({});
  const [userEmailInput, setUserEmailInput] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [Room, setRoom] = useState(route.params.Room);
  const [isKickedFromRoom, setIsKickedFromRoom] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState({x: 0, y: 0});
  const [isRoomDeleted, setIsRoomDeleted] = useState(false);
  const [userExistAtThisRoom, setUserExistAtThisRoom] = useState(false);
  const [isLoadingVisible, setIsLoadingVisible] = useState(false);
  const [isUserEmailErrorMessageDisplay, setIsUserEmailErrorMessageDisplay] =
    useState('none');
  //#endregion
  //#region Constants
  const styles = useStyles();
  const User = ActiveUser.GetActiveUser()?.user;

  const {width, height} = useWindowDimensions();
  const {t, i18n} = useTranslation();
  const changeLanguage = (value: any) => {
    i18n.changeLanguage(value);
  };
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
  async function GiveControlClicked(newController: string) {
    setIsLoadingVisible(true);
    await roomService.UpdateRoomLockedBy(Room.Id, newController.UserEmail);
    Alert.alert(
      t('success'),
      t('controlReleasedAlert'), // Message of the alert
      [
        {
          text: t('ok'),
          onPress: () => {},
        },
      ],
    );
    setIsLoadingVisible(false);
  }
  function CloseRoomClicked() {
    Alert.alert(t('confirmation'), t('closeRoomAskAlert'), [
      {
        text: t('yes'),
        onPress: () => {
          setIsLoadingVisible(true);
          setIsRoomDeleted(true);
          roomService.DeleteRoom(Room.Id).then(() => {
            setIsRoomDeleted(false);
            navigation.navigate('OnBoard');
          });
        },
      },
      {
        text: t('no'),
      },
    ]);
  }
  const [visible, setVisible] = React.useState(false);

  function OpenMenu(event) {
    event.target.measure((x, y, width, height, pageX, pageY) => {
      setAnchorPosition({x: pageX, y: pageY + height});
      setVisible(true);
    });
  }

  const closeMenu = () => setVisible(false);
  async function RemoveFromRoomClicked(removedEmail: string) {
    setIsLoadingVisible(true);
    await activityService.DeleteActiveReal(removedEmail.UserEmail, Room.Id);
    await roomService.DeleteUserFromRoomUser(Room.Id, removedEmail.UserId);
    realTimeService.SomeoneKicked(Room.Id, removedEmail.UserEmail, Room.Title);
    Alert.alert(
      t('success'),
      t('userKickedAlert'), // Message of the alert
      [
        {
          text: t('ok'),
          onPress: () => {},
        },
      ],
    );
    setIsLoadingVisible(false);
  }
  useEffect(() => {
    const preferredLanguage = RNLocalize.getLocales()[0].languageTag;
    if (preferredLanguage.includes('tr')) {
      changeLanguage('tr');
    }
    //Get ALL Users
    if (Room == undefined) {
      Alert.alert(t('sorry'), t('kickedFroomRoomAlert'), [
        {
          text: t('ok'),
          onPress: () => {},
        },
      ]);
      navigation.navigate('OnBoard');
      return;
    }
    roomService.GetRoomUsers(Room.Id).then(us => {
      if (us != undefined) {
        let userExistAtThisRoom = us.some(u => u.UserEmail == User?.email);
        if (!userExistAtThisRoom) {
          Alert.alert(t('sorry'), t('kickedFroomRoomAlert'), [
            {
              text: t('ok'),
              onPress: () => {
                navigation.navigate('OnBoard');
              },
            },
          ]);
        } else {
          setUserExistAtThisRoom(prev => {
            return true;
          });
        }
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
              Alert.alert(t('sorry'), t('kickedFroomRoomAlert'), [
                {
                  text: t('ok'),
                  onPress: () => {
                    navigation.navigate('OnBoard');
                  },
                },
              ]);
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

        realTimeService.OnSomeoneKicked(Room.Id).on('child_added', e => {
          console.log('someonekicked');
          console.log(e);
          let kickedUserEmail = e.toJSON()?.UserEmail;
          let kickedUserAtRoomId = e.toJSON()?.RoomId;
          if (Room.Id == kickedUserAtRoomId) {
            console.log('bu odada atım olmuş');
            setUsers(prevUsers => {
              let updatedUsers = prevUsers;
              var newUpdatedUsers = updatedUsers.filter(
                uu => uu.UserEmail != kickedUserEmail,
              );

              realTimeService.RemoveReadedSomeoneKicked(Room.Id);
              return newUpdatedUsers;
            });
          }
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
    realTimeService.OnInviteAccepttedChanged().on('child_added', async e => {
      console.log('invite accepted child added');
      console.log(e.toJSON());
      if (e.toJSON()?.RoomId == Room.Id) {
        var us = await roomService.GetRoomUsers(Room.Id);
        setUsers(prevUsers => {
          if (us != undefined) {
            for (let i = 0; i < prevUsers.length; i++) {
              for (let j = 0; j < us.length; j++) {
                if (
                  prevUsers[i].UserEmail == us[j].UserEmail &&
                  prevUsers[i].IsOnline
                ) {
                  us[j].IsOnline = true;
                }
              }
            }
            return us;
          }
          return prevUsers;
        });
        realTimeService.RemoveInvitedAppcedted();
      }
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
            Alert.alert(t('sorry'), t('kickedFroomRoomAlert'), [
              {
                text: t('ok'),
                onPress: () => {
                  navigation.navigate('OnBoard');
                },
              },
            ]);
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
      realTimeService.OnInviteAccepttedChanged().off('child_added');
      realTimeService.OnSomeoneKicked(Room.Id).off('child_added');
      noteService.OnNoteChangeReal(Room.Id).off('value');
      activityService.DeleteActiveReal(User?.email!, Room.Id);
      backHandler.remove();
    };
    //#endregion
  }, []);

  useEffect(() => {
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
  }, [activeUsers]);

  useEffect(() => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailPattern.test(userEmailInput)) {
      setIsUserEmailErrorMessageDisplay('none');
    } else {
      setIsUserEmailErrorMessageDisplay('flex');
    }
    if (userEmailInput.length == 0) setIsUserEmailErrorMessageDisplay('none');
  }, [userEmailInput]);
  function compareUsers(a, b) {
    if (a.IsOnline === b.IsOnline) {
      // If IsOnline is the same, compare by UserEmail
      return a.UserEmail.localeCompare(b.UserEmail);
    } else {
      // Sort by IsOnline in descending order (true comes before false)
      return b.IsOnline - a.IsOnline;
    }
  }

  function UpdatePageContent(newVal: any) {
    if (Room.LockedBy == User?.email) noteService.SaveNoteReal(newVal, Room.Id);
  }

  function InviteButtonClicked() {
    setInviteRoomVisible(true);
  }
  async function ModalInviteButtonClicked() {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailPattern.test(userEmailInput) && User != undefined) {
      try {
        setIsLoadingVisible(true);
        await realTimeService.SendInvite(
          User.email.toLocaleLowerCase(),
          userEmailInput.toLocaleLowerCase(),
          Room.Id,
        );
        setIsLoadingVisible(false);

        Alert.alert(t('success'), t('inviteSentAlert'), [
          {
            text: t('ok'),
            onPress: () => {
              setInviteRoomVisible(false);
            },
          },
        ]);
      } catch {
        setIsLoadingVisible(false);
        Alert.alert(t('sorry'), t('tryAgainAlert'), [
          {
            text: t('ok'),
            onPress: () => {
              setInviteRoomVisible(false);
            },
          },
        ]);
      }
    }
  }
  function GoBackButtonPressed() {
    navigation.navigate('OnBoard');
  }

  useEffect(() => {}, [users]);
  function ShowActiveUsers() {
    setActiveUsersVisible(true);
  }
  if (userExistAtThisRoom) {
    return (
      <PaperProvider>
        <View style={styles.container}>
          <ActivityIndicator
            animating={isLoadingVisible}
            style={styles.loadingIcon}
            size={'small'}
          />
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
                    label={t('userEmail')}
                    value={userEmailInput}
                    onChangeText={text => setUserEmailInput(text)}
                    placeholder={t('userEmail')}
                    style={styles.userEmailInput as any}
                  />
                  <Text
                    style={{
                      color: 'red',
                      marginTop: 10,
                      display: isUserEmailErrorMessageDisplay as any,
                    }}>
                    {t('invalidEmail')}
                  </Text>
                  <Button
                    style={styles.modalButton}
                    onPress={async () => await ModalInviteButtonClicked()}>
                    {t('send')}
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
                    <List.Subheader>
                      {choosenUserOptions.UserEmail}
                    </List.Subheader>
                    {Room.LockedBy == User?.email &&
                    choosenUserOptions.IsOnline ? (
                      <List.Item
                        onPressOut={() =>
                          Alert.alert(
                            t('confirmation'),
                            t('giveControlAskAlert'),
                            [
                              {
                                text: t('yes'),
                                onPress: async () => {
                                  GiveControlClicked(choosenUserOptions);
                                  setUserOptionsModalVisible(false);
                                },
                              },
                              {
                                text: t('no'),
                                onPress: () => {},
                              },
                            ],
                          )
                        }
                        title={t('giveControl')}
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
                            t('confirmation'),
                            t('removeUserAskAlert'),
                            [
                              {
                                text: t('yes'),
                                onPress: async () => {
                                  await RemoveFromRoomClicked(
                                    choosenUserOptions,
                                  );
                                  setUserOptionsModalVisible(false);
                                },
                              },
                              {
                                text: t('no'),
                                onPress: () => {},
                              },
                            ],
                          )
                        }
                        title={t('removeFromTheRoom')}
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
                    <DataTable.Title style={{flex: 1}}> </DataTable.Title>
                    <DataTable.Title style={{flex: 5}}>
                      {t('user')}
                    </DataTable.Title>
                  </DataTable.Header>
                  {users
                    ?.sort(compareUsers)
                    .slice(fromUsers, toUsers)
                    .map(item => (
                      <DataTable.Row key={item.Id}>
                        <DataTable.Cell style={{flex: 1}}>
                          {item.UserEmail != User?.email ? (
                            <IconButton
                              iconColor={item.IsOnline ? 'green' : 'gray'}
                              size={width / 20}
                              icon={
                                item.IsOnline
                                  ? 'account-circle'
                                  : 'account-cancel'
                              }
                              onPress={() => {
                                setUserOptionsModalVisible(true);
                                setChoosenUserOptions(item);
                              }}
                            />
                          ) : (
                            <IconButton
                              iconColor={item.IsOnline ? 'green' : 'gray'}
                              size={width / 20}
                              icon={
                                item.IsOnline
                                  ? 'account-circle'
                                  : 'account-cancel'
                              }
                            />
                          )}
                        </DataTable.Cell>
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
                  title={t('invite')}
                  leadingIcon={'account-plus'}
                />
                <Divider />
                {Room.CreatedUserEmail == User?.email ? (
                  <Menu.Item
                    onPress={() => {
                      CloseRoomClicked();
                    }}
                    title={t('closeRoom')}
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
              placeholder={t('noteAreaPlaceholder')}
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
  } else {
    return <SafeAreaView></SafeAreaView>;
  }
}
export default RoomPage;
