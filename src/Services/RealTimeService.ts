import {firebase} from '@react-native-firebase/database';
import {Sockets} from '../Constants/Sockets';
import uuid from 'react-native-uuid';
export class RealTimeService {
  OnInvite(activeUserEmail: string) {
    return firebase
      .app()
      .database(
        'https://react-native-8802d-default-rtdb.europe-west1.firebasedatabase.app/',
      )
      .ref(`${Sockets.Invite}/${activeUserEmail.replace('.', '')}`);
  }

  SendInvite(invitedby: string, invited: string, roomId: string) {
    const inviteId = uuid.v4().toString();
    firebase
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
