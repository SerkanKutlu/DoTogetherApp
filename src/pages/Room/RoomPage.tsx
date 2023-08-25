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
function RoomPage({navigation, route}): JSX.Element {
  //#region States
  const [inviteRoomVisible, setInviteRoomVisible] = useState(false);
  const [activeUsersVisible, setActiveUsersVisible] = useState(false);
  const [userEmailInput, setUserEmailInput] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [activeUsersPageNumber, setActiveUsersPageNumber] = useState<number>(0);
  const [Room, setRoom] = useState(route.params.Room);
  const [isFirstEntry, setIsFirstEntry] = useState(true);
  const [deneme, setDeneme] = useState('sek');
  //#endregion
  //#region Constants
  const styles = useStyles();
  const User = ActiveUser.GetActiveUser();
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
  let i = 0;

  useEffect(() => {
    console.log('useeffect workted at : ' + Platform.OS);
    roomService.GetRoomById(Room.Id).then(roomUpdated => {
      console.log('room updated geliyor');
      console.log(roomUpdated);
      if (roomUpdated != undefined) {
        setRoom(roomUpdated);
        roomService.TrackRoomUpdates(
          (snapshot: any) => {
            console.log('room changed lo');
            if (snapshot != undefined) {
              setRoom(snapshot.data());
            }
          },
          null,
          Room.Id,
        );
      }
    });

    // activityService.OnActivityChange(Room.Id).on('child_added', newVal => {
    //   setDeneme('serkan');
    //   if (isFirstEntry) {
    //     console.log('first entry, reading once');
    //     activityService.ReadActivesOnce(Room.Id).then(newActives => {
    //       var result: any[] = new Array();
    //       newActives.forEach(each => {
    //         console.log('each');
    //         result.push(each.toJSON());
    //       });
    //       if (result.length != 0) {
    //         setActiveUsers(result);
    //       }
    //       setIsFirstEntry(false);
    //       return;
    //     });
    //   }
    //   console.log('new addedd');
    //   if (
    //     activeUsers == undefined ||
    //     (activeUsers != undefined && activeUsers.length == 0)
    //   ) {
    //     console.log('aktif yok çünkü actives: ' + activeUsers);
    //     setActiveUsers([newVal.toJSON()]);
    //     console.log('ilk user geldi. Locking');
    //     roomService.UpdateRoomLockedBy(Room.Id, newVal.toJSON().UserEmail);
    //   } else {
    //     console.log('aktif var. yenisi Ekleniyor');
    //     setActiveUsers([...activeUsers, [newVal.toJSON()]]);
    //   }
    // });
    // activityService.OnActivityChange(Room.Id).on('child_removed', newVal => {
    //   console.log('new deleted');
    //   console.log(deneme);
    //   console.log(setActiveUsers([{UserEmail: 'fuck'}]));
    //   console.log(newVal); //BURADA HEP 1 KERE GELİYOR DÜZGÜN ÇALIŞIYOR. BURDA EKLENİNCE YADA ÇIKARTINCA STATE'İ GÜNCELLEYEREK DEVAM EDELİM. SADECE SAYFA İLK YÜKLENDİĞİNDE ONCE ÇALIŞSIN
    //   if (activeUsers != undefined && activeUsers.length == 1) {
    //     setActiveUsers([]);
    //     console.log('locking sıfırlanıyor');
    //     roomService.UpdateRoomLockedBy(Room.Id, '');
    //     return;
    //   }
    //   const newValObj = newVal.toJSON();
    //   console.log('newValObj');
    //   console.log(newValObj);
    //   console.log('filtering');
    //   console.log(activeUsers);
    //   const newActives = activeUsers?.filter(
    //     au => au.UserEmail !== newValObj?.UserEmail,
    //   );
    //   console.log(newActives);
    //   setActiveUsers(newActives);
    //   if (Room.LockedBy == newValObj?.UserEmail) {
    //     if (newActives != undefined) {
    //       console.log('locked person leaved. Yenisi lockluyor');
    //       roomService.UpdateRoomLockedBy(Room.Id, newActives[0].UserEmail);
    //     }
    //   }
    // });
    activityService.OnActivityChange(Room.Id).on('value', newVal => {
      activityService.ReadActivesOnce(Room.Id).then(newActives => {
        console.log('readActivesOkunuyor');
        console.log(newActives);
        var result: any[] = new Array();
        newActives.forEach(each => {
          result.push(each.toJSON());
        });
        if (result.length != 0) {
          if (result.length == 1) {
            console.log(result);
            console.log('1. kişi girdi');
            roomService.UpdateRoomLockedBy(Room.Id, result[0].UserEmail);
          }

          setActiveUsers(result);
        }
      });
    });

    realTimeService.OnRoomTextChanged(Room.Id).on('child_changed', newVal => {
      const newText = newVal.val();
      setPageContent(newText);
    });
    noteService.GetNoteByRoomId(Room.Id).then(content => {
      if (content != undefined) {
        setPageContent(content);
      }
    });
    if (User != undefined) {
      activityService.MakeActiveReal(User?.user.email, Room.Id);
    }
    return () => {
      if (User != undefined) {
        activityService.DeleteActive(
          User.user.email != undefined ? User.user.email : '',
          Room.Id,
        );
        console.log('kontrol');
        console.log(Room.LockedBy);
        console.log(User.user.email);
        if (Room.LockedBy == User.user.email) {
          console.log('locking person çıkmaya karar vermiş');
          console.log(activeUsers);
          if (activeUsers.length > 0) {
            console.log('yenisi lockluyor');
            var newLockingPerson = activeUsers.find(
              au => au.UserEmail != Room.LockedBy,
            );
            console.log(newLockingPerson);
            if (newLockingPerson != undefined) {
              roomService.UpdateRoomLockedBy(
                Room.Id,
                newLockingPerson.UserEmail,
              );
            }
          }
        }
        activityService.OnActivityChange(Room.Id).off('child_added');
        activityService.OnActivityChange(Room.Id).off('child_removed');
        activityService.OnActivityChange(Room.Id).off('value');
      }
    };
  }, []);
  useEffect(() => {
    if (pageContent != undefined && pageContent.length > 0) {
      realTimeService.SetRoomText(Room.Id, pageContent);
      noteService.SaveNote(pageContent, Room.Id);
    }
  }, [pageContent]);

  useEffect(() => {}, [Room]);
  function InviteButtonClicked() {
    setInviteRoomVisible(true);
  }
  function ModalInviteButtonClicked() {
    if (User != undefined) {
      realTimeService.SendInvite(
        User.user.email.toLocaleLowerCase(),
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
          editable={Room.LockedBy == User?.user.email ? true : false}
          placeholder="Start Note Together"
          value={pageContent}
          onChangeText={val => {
            setPageContent(val);
          }}
        />
      </View>
    </View>
  );
}
export default RoomPage;
