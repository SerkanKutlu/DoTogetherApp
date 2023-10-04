import {firebase} from '@react-native-firebase/database';
import {Sockets} from '../Constants/Sockets';
import uuid from 'react-native-uuid';
import {Alert} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {Collections} from '../Constants/Collections';
export class RealTimeService {
  OnInvite(activeUserEmail: string) {
    return firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.Invite}/${activeUserEmail.replace('.', '')}`);
  }

  async SendInvite(invitedby: string, invited: string, roomId: string) {
    // //Check if invite exist :
    const invitesSnapshot = await firestore()
      .collection(Collections.Invites)
      .where('RoomId', '==', roomId)
      .where('InvitedUserEmail', '==', invited)
      .get();
    console.log(invitesSnapshot.docs);
    if (invitesSnapshot.docs.length > 0) return false;
    const inviteId = uuid.v4().toString();
    await firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.Invite}/${invited.replace('.', '')}/${inviteId}`)
      .set({
        InviteId: inviteId,
        InvitedBy: invitedby,
        RoomId: roomId,
      })
      .then(() => {
        console.log('added');
      })
      .catch(e => {
        console.log('added2');
        console.log(e);
      });
  }
  RemoveReadedInvite(inviteId: string, invited: string) {
    firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.Invite}/${invited.replace('.', '')}/${inviteId}`)
      .remove();
  }
  SetRoomText(roomId: string, newText: string) {
    firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.RoomText}/${roomId}`)
      .set({
        Text: newText,
      })
      .then(() => {})
      .catch(e => {
        console.log('text yazılamadı ' + e);
      });
  }
  OnRoomTextChanged(roomId: string) {
    return firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.RoomText}/${roomId}`);
  }
  InviteAccepted(roomId: string) {
    firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.AcceptedInvites}/${roomId}`)
      .set({
        Id: uuid.v4().toString(),
        RoomId: roomId,
      })
      .then(() => {})
      .catch(e => {
        console.log('invite accepted gönderilemedi.' + e);
      });
  }
  OnInviteAccepttedChanged() {
    return firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.AcceptedInvites}`);
  }
  RemoveInvitedAppcedted() {
    return firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.AcceptedInvites}`)
      .remove();
  }
  SomeoneKicked(roomId: string, kickedUserEmail: string, roomTitle: string) {
    firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.SomeoneKicked}/${roomId}`)
      .set({
        Id: uuid.v4().toString(),
        RoomId: roomId,
        UserEmail: kickedUserEmail,
        RoomTitle: roomTitle,
      })
      .then(() => {})
      .catch(e => {
        console.log('someonekicked gönderilemedi.' + e);
      });
  }
  OnSomeoneKicked(roomId: string) {
    return firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.SomeoneKicked}`);
  }
  RemoveReadedSomeoneKicked(roomId: string) {
    firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.SomeoneKicked}/${roomId}`)
      .remove();
  }
}
