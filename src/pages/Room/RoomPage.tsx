import React, {useState, useEffect} from 'react';
import {View, TextInput as TextInputReact, Modal, Platform} from 'react-native';
import {Button, TextInput, IconButton, DataTable} from 'react-native-paper';
import useStyles from './RoomPageStyle';
import {RealTimeService} from '../../Services/RealTimeService';
import {ActiveUser} from '../../Services/AuthService';
import {NoteService} from '../../Services/NoteService';
import {ActivityService} from '../../Services/ActivityService';
import {RoomService} from '../../Services/RoomService';
import {Consumer} from 'react-native-paper/lib/typescript/core/settings';
import {act} from 'react-test-renderer';
function RoomPage({navigation, route}): JSX.Element {
  //#region States
  const [inviteRoomVisible, setInviteRoomVisible] = useState(false);
  const [activeUsersVisible, setActiveUsersVisible] = useState(false);
  const [userEmailInput, setUserEmailInput] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [activeUsersPageNumber, setActiveUsersPageNumber] = useState<number>(0);
  const [Room, setRoom] = useState(route.params.Room);
  //#endregion
  //#region Constants
  const styles = useStyles();
  const User = ActiveUser.GetActiveUser()?.user;
  const activeUserPerPage = 5;
  const fromActiveUsers = activeUsersPageNumber * activeUserPerPage;
  const toActiveUsers = Math.min(
    (activeUsersPageNumber + 1) * activeUserPerPage,
    activeUsers != undefined ? activeUsers.length : 0,
  );

  //#endregion
  //#region Service
  const realTimeService = new RealTimeService();
  const noteService = new NoteService();
  const activityService = new ActivityService();
  const roomService = new RoomService();
  //#endregion

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
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <IconButton
              icon="close"
              size={20}
              onPress={() => setActiveUsersVisible(false)}
              style={styles.modalCloseBtn}
            />
            <DataTable>
              <DataTable.Header>
                <DataTable.Title style={{flex: 5}}>User</DataTable.Title>
                <DataTable.Title style={{flex: 1}}> </DataTable.Title>
              </DataTable.Header>

              {activeUsers?.slice(fromActiveUsers, toActiveUsers).map(item => (
                <DataTable.Row key={item.Id}>
                  <DataTable.Cell style={{flex: 5}}>
                    {item.UserEmail}
                  </DataTable.Cell>
                  <DataTable.Cell style={{flex: 1}}>
                    {Room.LockedBy == item.UserEmail ? (
                      <IconButton
                        icon="chat-processing-outline"
                        onPress={() => {}}
                        disabled
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
        <Button icon="account-plus" onPress={() => InviteButtonClicked()}>
          Invite
        </Button>
      </View>
      <View style={styles.TextAreaContainer}>
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
  );
}
export default RoomPage;
