import React, {useState, useEffect} from 'react';
import {View, TextInput as TextInputReact, Modal} from 'react-native';
import {Button, TextInput, IconButton} from 'react-native-paper';
import useStyles from './RoomPageStyle';
import {Room} from '../../Models/Room';
import {RealTimeService} from '../../Services/RealTimeService';
import {ActiveUser} from '../../Services/AuthService';
import {NoteService} from '../../Services/NoteService';
import {ActivityService} from '../../Services/ActivityService';
import {act} from 'react-test-renderer';
function RoomPage({navigation, route}): JSX.Element {
  //#region States
  const [inviteRoomVisible, setInviteRoomVisible] = useState(false);
  const [userEmailInput, setUserEmailInput] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  //#endregion
  //#region Constants
  const styles = useStyles();
  const Room: Room = route.params.Room;
  const User = ActiveUser.GetActiveUser();
  //#endregion
  //#region Service
  const realTimeService = new RealTimeService();
  const noteService = new NoteService();
  const activityService = new ActivityService();
  //#endregion

  useEffect(() => {
    return () => {
      if (User != undefined)
        activityService.DeleteActive(
          User.user.email != undefined ? User.user.email : '',
          Room.Id,
        );
    };
  }, []);
  useEffect(() => {
    realTimeService.OnRoomTextChanged(Room.Id).on('child_changed', newVal => {
      const newText = newVal.val();
      setPageContent(newText);
    });
    noteService.GetNoteByRoomId(Room.Id).then(content => {
      if (content != undefined) {
        setPageContent(content);
      }
    });
    if (User != undefined)
      activityService.MakeActive(
        User.user.email != undefined ? User.user.email : '',
        Room.Id,
      );
    activityService.TrackActivityChange(
      (snapshot: any) => {
        var result: any[] = new Array();
        for (let i = 0; i < snapshot.docs.length; i++) {
          result.push(snapshot.docs[i].data());
        }
        setActiveUsers(result);
      },
      null,
      Room.Id,
    );
  }, []);
  useEffect(() => {
    if (pageContent != undefined && pageContent.length > 0) {
      realTimeService.SetRoomText(Room.Id, pageContent);
      noteService.SaveNote(pageContent, Room.Id);
    }
  }, [pageContent]);
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
    }
  }
  function GoBackButtonPressed() {
    navigation.navigate('OnBoard');
  }

  function ShowActiveUsers() {}
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
      <View style={styles.navbar}>
        <IconButton
          icon="arrow-left-thin"
          size={30}
          onPress={() => GoBackButtonPressed()}
        />
        <Button icon="account" onPress={() => ShowActiveUsers()}>
          {activeUsers.length}
        </Button>
        <Button icon="account-plus" onPress={() => InviteButtonClicked()}>
          Invite
        </Button>
      </View>
      <View style={styles.TextAreaContainer}>
        <TextInputReact
          multiline
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
