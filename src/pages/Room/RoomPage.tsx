import React, {useState, useEffect} from 'react';
import {View, Text, Modal} from 'react-native';
import {Button, TextInput, IconButton} from 'react-native-paper';
import useStyles from './RoomPageStyle';
import {Room} from '../../Models/Room';
import {SafeAreaView} from 'react-native-safe-area-context';
function RoomPage({navigation, route}): JSX.Element {
  const [inviteRoomVisible, setInviteRoomVisible] = useState(false);
  const [userEmailInput, setUserEmailInput] = useState('');
  const styles = useStyles();
  const Room = route.params.Room;
  function InviteButtonClicked() {
    setInviteRoomVisible(true);
  }
  function ModalInviteButtonClicked() {}

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
              icon="plus"
              mode="elevated"
              style={styles.modalButton}
              onPress={async () => await ModalInviteButtonClicked()}>
              Create
            </Button>
          </View>
        </View>
      </Modal>
      <View style={styles.navbar}>
        <Button
          icon="account-plus"
          mode="elevated"
          onPress={() => InviteButtonClicked()}>
          Invite
        </Button>
      </View>
    </View>
  );
}
export default RoomPage;
